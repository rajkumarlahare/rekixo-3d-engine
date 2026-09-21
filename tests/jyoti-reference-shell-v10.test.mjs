import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("V10 ships a coherent reference facade building", () => {
  const source = read("apps/public/src/viewer/referenceFacade.ts");
  assert.match(source, /reference-facade-building/);
  assert.match(source, /addBalcony/);
  assert.match(source, /charcoal/);
  assert.match(source, /timber/);
  assert.match(source, /railGlass/);
  assert.match(source, /privacy|fins/i);
  assert.match(source, /warmGlow/);
  assert.match(source, /roofY/);
});

test("hero views use the facade shell while analytical views keep source model", () => {
  const experience = read("apps/public/src/viewer/projectExperience.ts");
  const viewer = read("apps/public/src/viewer/Viewer3D.tsx");
  assert.match(experience, /makeReferenceFacadeBuilding/);
  assert.match(experience, /presentationView === "aerial"/);
  assert.match(experience, /presentationView === "building"/);
  assert.match(experience, /presentationView === "balcony"/);
  assert.match(experience, /usesReferenceShell/);
  assert.match(viewer, /projectExperience\?\.setPresentationView\(view\)/);
  assert.match(viewer, /projectExperience\?\.usesReferenceShell\(\)/);
});

test("V10 keeps shell generic and tenant-safe in runtime code", () => {
  const source = read("apps/public/src/viewer/referenceFacade.ts");
  assert.doesNotMatch(source, /Jyoti Paradise|jyoti-paradise|project_jyoti|scene_jyoti/i);
});

test("V10 release metadata records shell/source split", () => {
  const migration = read("database/migrations/0017_jyoti_reference_shell_v10.sql");
  assert.match(migration, /reference-shell-v10/);
  assert.match(migration, /integrated-reference-facade-shell/);
  assert.match(migration, /project\+building\+balcony/);
  assert.match(migration, /floors\+units\+top\+context\+interior\+walk/);
  assert.match(migration, /No Platform\/customer website resources are modified/);
});
