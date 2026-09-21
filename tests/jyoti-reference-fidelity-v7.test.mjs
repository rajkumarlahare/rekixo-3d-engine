import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("V7 keeps original FBX audit tints and adds separate reference calibration", () => {
  const realism = read("apps/public/src/viewer/realism.ts");
  for (const token of ["frontcolor: 0xffffff","color_a06: 0xc29b7a","color_m06: 0x565656","color_j08: 0x330066","metal_panel: 0x8f9d9e"]) {
    assert.match(realism, new RegExp(token));
  }
  assert.match(realism, /const referenceFacadeTint/);
  for (const token of ["frontcolor: 0xeee9e2","color_m06: 0x343a3f","metal_panel: 0x77513f","color_a06: 0xa06d51","color_j08: 0xb8c9bd"]) {
    assert.match(realism, new RegExp(token));
  }
  assert.match(realism, /referenceFacadeTint\[normalized\] \?\? sourceMaterialTint\[normalized\]/);
});

test("V7 removes large floating facade light spheres", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /fixtureRadius = Math\.min\(Math\.max\(size\.x \* 0\.0018, 0\.022\), 0\.042\)/);
  assert.doesNotMatch(source, /size\.x \* 0\.008/);
});

test("premium shell exposes touch and desktop room walkthrough", () => {
  const app = read("apps/public/src/main.tsx");
  assert.match(app, /Room Walkthrough/);
  assert.match(app, /initialWalk=\{mode === "walk"\}/);
  assert.match(app, /visualPreset="reference-render"/);
  assert.match(app, /WASD or arrow keys/);
});

test("walk mode uses interior bounds", () => {
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.match(viewer, /visualPreset\?: "default" \| "reference-render"/);
  assert.match(viewer, /experienceMode === "interior" \? projectExperience : undefined/);
  assert.match(viewer, /interiorExperience\.focus\("interior"\)\.box\.clone\(\)/);
  assert.match(viewer, /activeWalkBounds/);
  assert.match(viewer, /clampWalkPosition\(camera\.position, activeWalkBounds\)/);
});

test("V7 migration records source-safe release policy", () => {
  const migration = read("database/migrations/0014_jyoti_reference_fidelity_v7.sql");
  assert.match(migration, /reference-fidelity-v7/);
  assert.match(migration, /reference-render-calibrated-digital-twin/);
  assert.match(migration, /pointer-drag\+touch-drag\+WASD\+arrow-keys\+onscreen-arrows/);
  assert.match(migration, /No Platform\/customer website resources are modified/);
});
