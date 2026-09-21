import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("V8 reference palette is isolated from generic engine projects", () => {
  const realism = read("apps/public/src/viewer/realism.ts");
  assert.match(realism, /referenceVisual = false/);
  assert.match(realism, /referenceVisual\s*\?\s*referenceFacadeTint\[normalized\]/);
  assert.match(realism, /: sourceMaterialTint\[normalized\]/);
  assert.match(realism, /frontcolor: 0xffffff/);
  assert.match(realism, /frontcolor: 0xe3ddd5/);
});

test("V8 adds the facade structures visible in the exterior reference", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /addReferenceFacadeAccents/);
  assert.match(source, /charcoal/);
  assert.match(source, /timber/);
  assert.match(source, /mint/);
  assert.match(source, /railGlass/);
  assert.match(source, /Vertical privacy fins/);
  assert.match(source, /Warm concealed strip/);
  assert.match(source, /Roof crown/);
});

test("V8 restores reference landscaping and brick context on mobile", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /mobile\s*\?\s*\[/);
  assert.match(source, /addBrickFacing/);
  assert.match(source, /referenceVisual \? 0xa69c92/);
  assert.match(source, /referenceVisual \? 0x716c67/);
});

test("V8 mobile camera is closer and reference mode keeps quality shadows", () => {
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.match(viewer, /antialias: referenceVisual \|\| !mobile/);
  assert.match(viewer, /renderer\.shadowMap\.enabled = referenceVisual \|\| !mobile/);
  assert.match(viewer, /mobile \? 0\.92 : 1\.08/);
  assert.match(viewer, /mobile \? 1\.08 : 1\.28/);
  assert.match(viewer, /fov: mobile \? 29 : 31/);
  assert.match(viewer, /createProjectExperience\(bounds, mobile, referenceVisual\)/);
});

test("V8 migration records the zoomed visual match pass", () => {
  const migration = read("database/migrations/0015_jyoti_visual_match_v8.sql");
  assert.match(migration, /visual-match-v8/);
  assert.match(migration, /zoomed visual comparison/i);
  assert.match(migration, /glass-balcony-rails/);
  assert.match(migration, /trees-on-mobile/);
  assert.match(migration, /No Platform\/customer website resources are modified/);
});
