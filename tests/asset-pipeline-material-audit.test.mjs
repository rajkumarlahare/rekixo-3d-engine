import assert from "node:assert/strict";
import test from "node:test";
import { auditAsciiFbxMaterials } from "../scripts/asset-pipeline/ascii-fbx-material-audit.mjs";

const sample = `
Material: 1, "Material::Translucent_Glass_Blue", "" {
}
Material: 2, "Material::Metal_Panel", "" {
}
Material: 3, "Material::Concrete_Pavers_Block_Multi", "" {
}
Texture: 4, "Texture::Metal_Panel_texture", "" {
  RelativeFilename: "..\\textures\\Metal_Panel.jpg"
}
`;

test("audits FBX material and texture categories without project hardcoding", () => {
  const audit = auditAsciiFbxMaterials(sample);
  assert.equal(audit.materialCount, 3);
  assert.equal(audit.textureCount, 1);
  assert.deepEqual(audit.categories.glass, ["Translucent_Glass_Blue"]);
  assert.deepEqual(audit.categories.metal, ["Metal_Panel"]);
  assert.deepEqual(audit.categories.concretePaving, ["Concrete_Pavers_Block_Multi"]);
  assert.deepEqual(audit.externalTextureFiles, ["..\\textures\\Metal_Panel.jpg"]);
});
