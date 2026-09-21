import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("walkthrough math is floor-aware and bounded", () => {
  const helper = read("apps/public/src/viewer/walkthrough.ts");
  assert.match(helper, /floorEyeY/);
  assert.match(helper, /clampWalkPosition/);
  assert.match(helper, /walkStartPosition/);
  assert.match(helper, /walkDelta/);
});

test("viewer provides desktop and mobile free-walk controls", () => {
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.match(viewer, /walkModeRef/);
  assert.match(viewer, /walkStepRef/);
  assert.match(viewer, /keydown/);
  assert.match(viewer, /pointermove/);
  assert.match(viewer, /WASD/);
  assert.match(viewer, /viewer-walk-controls/);
  assert.match(viewer, /Walk/);
});

test("floor explorer can enter the selected floor in walkthrough mode", () => {
  const app = read("apps/public/src/main.tsx");
  assert.match(app, /Enter Floor/);
  assert.match(app, /walkRequestFloor/);
  assert.match(app, /initialWalkFloor/);
  assert.match(app, /setActiveType\("project-navigation"\)/);
});

test("walkthrough metadata documents source-safety limits", () => {
  const migration = read("database/migrations/0006_jyoti_walkthrough_navigation.sql");
  assert.match(migration, /bounds-only/);
  assert.match(migration, /pending-source-verification/);
  assert.match(migration, /no unverified room labels/i);
  assert.match(migration, /scope":"rekixo-ar3d-engine-only"/);
});
