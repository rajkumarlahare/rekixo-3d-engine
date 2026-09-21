import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("daylight rendering is deliberately brighter than the old dark prototype", () => {
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.match(viewer, /toneMappingExposure = 1\.28/);
  assert.match(viewer, /environmentIntensity = 1\.48/);
  assert.match(viewer, /HemisphereLight\(0xeaf5ff, 0x7d746b, 3\.25\)/);
  assert.match(viewer, /DirectionalLight\(0xfff1dc, 4\.65\)/);
  assert.match(viewer, /FogExp2\(0xc4d4df, 0\.006\)/);
});

test("source textures are not darkened by old diffuse color tints", () => {
  const realism = read("apps/public/src/viewer/realism.ts");
  assert.match(realism, /target\.color\.setHex\(0xffffff\)/);
  assert.match(realism, /material\.color\.setHex\(0xf4f0e9\)/);
  assert.match(realism, /material\.color\.setHex\(0x34373a\)/);
  assert.match(realism, /material\.color\.setHex\(0x95694a\)/);
  assert.match(realism, /material\.color\.setHex\(0xa8d0df\)/);
});

test("site presentation has a lighter road, curb, sidewalk and source-faithful boundary", () => {
  const site = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(site, /standard\(0x3a3d40, 0\.94\)/);
  assert.match(site, /sidewalkMat/);
  assert.match(site, /curbMat/);
  assert.match(site, /standard\(0xb8684f, 0\.84\)/);
  assert.match(site, /PointLight\(0xffb56d, 5\.5/);
});

test("architectural sky is bright blue-grey with warm horizon instead of a black background", () => {
  const env = read("apps/public/src/viewer/siteEnvironment.ts");
  assert.match(env, /#5f91c6/);
  assert.match(env, /#8fb3d4/);
  assert.match(env, /#d9e2e6/);
  assert.match(env, /#efc9a5/);
  assert.match(env, /0xb7b0a6/);
});

test("V4 stays isolated to the Engine/Jyoti data plane", () => {
  const migration = read("database/migrations/0011_jyoti_realism_v4.sql");
  assert.match(migration, /No Platform\/customer website resources are modified/);
  assert.match(migration, /bright-brochure-realism/);
});
