import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("rollback removes the V10 reference shell runtime", () => {
  const experience = read("apps/public/src/viewer/projectExperience.ts");
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.doesNotMatch(experience, /makeReferenceFacadeBuilding|referenceShellRoot|usesReferenceShell/);
  assert.doesNotMatch(viewer, /setPresentationView\(view\)|usesReferenceShell\(\)/);
});

test("rollback migration restores V9 presentation metadata", () => {
  const migration = read("database/migrations/0018_jyoti_rollback_v10_to_v9.sql");
  assert.match(migration, /sourceFidelity', 'v9'/);
  assert.match(migration, /source-model-material-first/);
  assert.match(migration, /heroExterior', 'source-model'/);
  assert.match(migration, /rollback-to-v9/);
  assert.match(migration, /No Platform\/customer website resources are modified/);
});
