import { PUBLIC_BASE_PATH } from "@rekixo/3d-contracts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeProjectSlug(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

export function validProjectSlug(value: string | null | undefined) {
  const slug = normalizeProjectSlug(value);
  return slug.length >= 2 && slug.length <= 80 && SLUG_PATTERN.test(slug);
}

export function projectSlugFromPathname(pathname: string) {
  const prefix = `${PUBLIC_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return "";
  const segment = pathname.slice(prefix.length).split("/")[0] || "";
  try {
    const slug = normalizeProjectSlug(decodeURIComponent(segment));
    return validProjectSlug(slug) ? slug : "";
  } catch {
    return "";
  }
}

export function publicProjectPath(slug: string) {
  const normalized = normalizeProjectSlug(slug);
  if (!validProjectSlug(normalized)) throw new Error("Invalid 3D project slug.");
  return `${PUBLIC_BASE_PATH}/${encodeURIComponent(normalized)}`;
}

export function projectAssetPrefix(slug: string) {
  const normalized = normalizeProjectSlug(slug);
  if (!validProjectSlug(normalized)) throw new Error("Invalid 3D project slug.");
  return `projects/${normalized}`;
}

export function recommendedExteriorModelKey(slug: string, version = 1) {
  if (!Number.isInteger(version) || version < 1) throw new Error("Invalid model version.");
  return `${projectAssetPrefix(slug)}/models/exterior-v${version}.glb`;
}
