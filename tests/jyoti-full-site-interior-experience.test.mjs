import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("project environment includes colorful site amenities", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /Swimming Pool/);
  assert.match(source, /Garden/);
  assert.match(source, /Flower Garden/);
  assert.match(source, /Road & Entry/);
  assert.match(source, /Main Gate/);
  assert.match(source, /Project Plot/);
  assert.match(source, /MeshPhysicalMaterial/);
});

test("furnished interior includes clickable living, bedroom, kitchen, dining, bath and balcony", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  for (const label of ["Living Room", "Bedroom", "Kitchen", "Dining Area", "Bathroom", "Balcony"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /wardrobe/);
  assert.match(source, /mattress/);
  assert.match(source, /sofa/);
});

test("roof terrace is a dedicated experience layer", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /Roof Terrace/);
  assert.match(source, /pergola/i);
  assert.match(source, /terraceRoot/);
});

test("viewer raycasts project features and supports experience modes", () => {
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.match(viewer, /createProjectExperience/);
  assert.match(viewer, /experienceMode/);
  assert.match(viewer, /Raycaster/);
  assert.match(viewer, /intersectObject\(projectExperience\.root, true\)/);
  assert.match(viewer, /onFeatureSelect/);
});

test("digital twin navigation exposes interior and terrace modes", () => {
  const app = read("apps/public/src/main.tsx");
  assert.match(app, /Furnished Interior/);
  assert.match(app, /Roof Terrace/);
  assert.match(app, /experienceMode=\{experienceMode\}/);
  assert.match(app, /onFeatureSelect=\{setSelectedFeature\}/);
  assert.match(app, /twin-feature-card/);
});
