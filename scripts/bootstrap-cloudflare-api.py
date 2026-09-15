#!/data/data/com.termux/files/usr/bin/python
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ACCOUNT_ID = "8f31060fbcfee2b3e9309138cad7f12f"
D1_DATABASE_ID = "43423a10-66b2-4460-af5f-f6ab9f2947dc"
D1_DATABASE_NAME = "rekixo-3d-production"
R2_BUCKET_NAME = "rekixo-3d-assets"

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "database" / "migrations" / "0001_core.sql"
RESOURCES = ROOT / "cloudflare" / "resources.json"

TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
if not TOKEN:
    print("ERROR: CLOUDFLARE_API_TOKEN is not set.", file=sys.stderr)
    print('Run: read -s -p "Cloudflare API token: " CLOUDFLARE_API_TOKEN; echo', file=sys.stderr)
    print("Then: export CLOUDFLARE_API_TOKEN && npm run cf:bootstrap", file=sys.stderr)
    raise SystemExit(2)

BASE = "https://api.cloudflare.com/client/v4"


def request(method, path, payload=None):
    data = None
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/json",
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        print(f"Cloudflare API HTTP {exc.code}: {raw}", file=sys.stderr)
        raise SystemExit(1)
    except urllib.error.URLError as exc:
        print(f"Cloudflare API network error: {exc}", file=sys.stderr)
        raise SystemExit(1)

    result = json.loads(raw) if raw else {}
    if not result.get("success", False):
        print(json.dumps(result, indent=2), file=sys.stderr)
        raise SystemExit(1)
    return result


print("== Rekixo 3D Cloudflare API bootstrap ==")

print("[1/4] Applying D1 core schema...")
sql = MIGRATION.read_text(encoding="utf-8")
request(
    "POST",
    f"/accounts/{ACCOUNT_ID}/d1/database/{D1_DATABASE_ID}/query",
    {"sql": sql},
)

print("[2/4] Verifying Jyoti Paradise...")
check = request(
    "POST",
    f"/accounts/{ACCOUNT_ID}/d1/database/{D1_DATABASE_ID}/query",
    {
        "sql": "SELECT id, slug, name, status FROM projects_3d WHERE slug = ? LIMIT 1;",
        "params": ["jyoti-paradise"],
    },
)
rows = []
for block in check.get("result", []):
    rows.extend(block.get("results") or [])
if not rows:
    raise SystemExit("ERROR: Jyoti Paradise seed not found.")
print("Verified:", rows[0])

print("[3/4] Ensuring R2 bucket...")
listing = request("GET", f"/accounts/{ACCOUNT_ID}/r2/buckets")
items = listing.get("result", {}).get("buckets", [])
if any(item.get("name") == R2_BUCKET_NAME for item in items):
    print("R2 bucket already exists:", R2_BUCKET_NAME)
else:
    request("POST", f"/accounts/{ACCOUNT_ID}/r2/buckets", {"name": R2_BUCKET_NAME})
    print("Created R2 bucket:", R2_BUCKET_NAME)

print("[4/4] Recording resource state...")
resources = json.loads(RESOURCES.read_text(encoding="utf-8"))
if resources.get("d1", {}).get("database_id") != D1_DATABASE_ID:
    raise SystemExit("ERROR: D1 ID mismatch in resources.json")
if resources.get("r2", {}).get("bucket_name") != R2_BUCKET_NAME:
    raise SystemExit("ERROR: R2 name mismatch in resources.json")
resources["d1"]["status"] = "created"
resources["r2"]["status"] = "created"
resources["bootstrap"] = {
    "status": "termux-api-applied",
    "method": "cloudflare-rest-api",
}
RESOURCES.write_text(json.dumps(resources, indent=2) + "\n", encoding="utf-8")

print()
print("BOOTSTRAP COMPLETE")
print("D1:", D1_DATABASE_NAME)
print("R2:", R2_BUCKET_NAME)
print("Existing Tiyansh/Rekixo production resources were not targeted.")
