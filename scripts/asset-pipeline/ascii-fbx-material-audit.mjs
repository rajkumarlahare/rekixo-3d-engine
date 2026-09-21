import fs from "node:fs";

export function auditAsciiFbxMaterials(source) {
  const materials = [
    ...source.matchAll(/Material:\s*\d+,\s*"Material::([^"]*)"/g),
  ].map((match) => match[1]);

  const textures = [
    ...source.matchAll(/Texture:\s*\d+,\s*"Texture::([^"]*)"/g),
  ].map((match) => match[1]);

  const relativeFiles = [
    ...source.matchAll(/RelativeFilename:\s*"([^"]*)"/g),
  ].map((match) => match[1]);

  const unique = (values) => [...new Set(values)];

  const categories = {
    glass: materials.filter((name) => /glass|translucent/i.test(name)),
    metal: materials.filter((name) => /metal|steel|aluminium|aluminum/i.test(name)),
    stoneTile: materials.filter((name) => /marble|granite|slate|tile/i.test(name)),
    concretePaving: materials.filter((name) => /concrete|paver/i.test(name)),
  };

  return {
    materialCount: unique(materials).length,
    textureCount: unique(textures).length,
    externalTextureFiles: unique(relativeFiles),
    materials: unique(materials),
    textures: unique(textures),
    categories,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file] = process.argv.slice(2);
  if (!file) throw new Error("Usage: node scripts/asset-pipeline/ascii-fbx-material-audit.mjs <file.fbx>");
  const source = fs.readFileSync(file, "utf8");
  process.stdout.write(`${JSON.stringify(auditAsciiFbxMaterials(source), null, 2)}\n`);
}
