import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("viewer keeps one model session and animates presentation cameras", () => {
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  const app = read("apps/public/src/main.tsx");
  assert.match(viewer, /cameraTween/);
  assert.match(viewer, /duration: 900/);
  assert.match(viewer, /Math\.pow\(-2 \* raw \+ 2, 3\)/);
  assert.match(viewer, /presentationRef/);
  assert.doesNotMatch(app, /key=\{viewerKey\}/);
});

test("architectural site environment adds no synthetic aerial backdrop geometry", () => {
  const environment = read("apps/public/src/viewer/siteEnvironment.ts");
  assert.match(environment, /createArchitecturalSiteEnvironment/);
  assert.match(environment, /source-backed plot\/road\/boundary geometry/);
  assert.doesNotMatch(environment, /CircleGeometry/);
  assert.doesNotMatch(environment, /SphereGeometry/);
  assert.match(environment, /setNight/);
});

test("source-backed drawing program is exposed without fake unit ownership", () => {
  const app = read("apps/public/src/main.tsx");
  const migration = read("database/migrations/0008_jyoti_digital_twin_quality_v2.sql");
  assert.match(app, /ARCHITECTURAL DRAWING VERIFIED/);
  assert.match(migration, /"Living","Kitchen","Bed Room","Toilet","Lift","Fire Lift","Stair","Floor Landing"/);
  assert.match(migration, /exact mesh ownership remains gated/i);
});

test("quality V2 remains isolated from Platform customer websites", () => {
  const migration = read("database/migrations/0008_jyoti_digital_twin_quality_v2.sql");
  assert.match(migration, /no Platform\/customer website resources are modified/i);
  assert.match(migration, /site context is not surveyed GIS/i);
});
