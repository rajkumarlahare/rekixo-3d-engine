# Rekixo AR3D Engine Deployment

Deployment is GitHub-Actions-first. Existing D1, R2, Worker and route names are stable production identifiers and are intentionally not renamed.

## Production resources

Only isolated 3D resources are targeted:

- D1: `rekixo-3d-production`
- R2: `rekixo-3d-assets`
- Admin Worker: `rekixo-3d-admin`
- Public Worker: `rekixo-3d-public`

The sibling Platform resources `tiyansh-production`, `tiyansh-gallery-production`, `/admin`, and `/projects/*` are not Engine deployment targets.

## Production routes

Admin:

- `https://admin.rekixo.com/3Dprojects`
- `https://admin.rekixo.com/3Dprojects/*`

Public:

- `https://ar3dstudio.in/3Dprojects`
- `https://ar3dstudio.in/3Dprojects/*`

These are path-specific Worker Routes; there is no host-wide takeover.

## Deployment workflow

On every push to `main`:

1. checkout repository
2. use Node.js 22
3. install dependencies
4. run `npm test` (typecheck, both builds and regression tests)
5. apply checked-in D1 migrations
6. ensure `rekixo-3d-assets` exists
7. deploy admin/public Workers
8. verify the generic admin project registry
9. verify the existing Jyoti public/admin production fixture

The Jyoti checks are compatibility smoke tests only. Application code contains no first-project/default tenant.

## New project provisioning

Do not add a customer project through a new schema migration.

Run the manual GitHub Actions workflow `Provision Rekixo AR3D Project` with:

- `slug` — lowercase letters/numbers/hyphens
- `name` — display name
- `location` — optional

The workflow writes a project-scoped **draft** row to isolated Engine D1. Re-running the same slug is safe and does not overwrite an existing project.

## Cloudflare secret

The repository requires `CLOUDFLARE_API_TOKEN` with the existing D1/R2/Workers deployment permissions and route access for `rekixo.com` and `ar3dstudio.in`.

## Admin security

Stage 4 keeps the Admin HTTP surface read-only. Project discovery and status reads are allowed, but privileged upload/edit/publish APIs are not exposed.

Authenticated privileged handoff belongs to Stage 5. Do not add POST/PUT/PATCH/DELETE admin APIs before that security boundary exists.
