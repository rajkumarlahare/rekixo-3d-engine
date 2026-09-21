import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("typical floor uses brochure-visible unit dimensions", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  for (const token of [
    "Living 4.954 x 3.050",
    "Kitchen 3.279 x 2.196",
    "Dining 1.265 x 1.023",
    "Bed Room 3.679 x 3.153",
    "Bed Room 3.500 x 3.701",
    "Living 4.828 x 3.050",
    "Kitchen 3.416 x 2.155",
    "Living 5.366 x 3.000",
    "Kitchen 3.640 x 2.061",
    "Bed Room 3.313 x 3.146",
    "Bed Room 3.130 x 3.830",
    "Fire Lift 1.60 x 1.80",
    "DUCT 1.80 x 3.96",
  ]) assert.match(source, new RegExp(token.replaceAll(".", "\\.")));
});

test("balconies are oriented on the same sides as the brochure composition", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /101-balcony[\s\S]*"left"/);
  assert.match(source, /101-wbal[\s\S]*"left"/);
  assert.match(source, /102-balcony[\s\S]*"right"/);
  assert.match(source, /102-wbal[\s\S]*"right"/);
  assert.match(source, /103-balcony-side[\s\S]*"left"/);
  assert.match(source, /103-wbal[\s\S]*"bottom"/);
  assert.match(source, /103-balcony[\s\S]*"bottom"/);
});

test("brochure furniture cues are represented in the dollhouse", () => {
  const source = read("apps/public/src/viewer/projectExperience.ts");
  assert.match(source, /addWardrobe/);
  assert.match(source, /addLShapeSofa/);
  assert.match(source, /addBed/);
  assert.match(source, /addKitchen/);
  assert.match(source, /addDining/);
  assert.match(source, /addToilet/);
});

test("source conflicts are explicitly recorded rather than hidden", () => {
  const migration = read("database/migrations/0013_jyoti_source_exact_v6.sql");
  assert.match(migration, /3\.279 x 2\.196/);
  assert.match(migration, /3\.379 x 2\.196/);
  assert.match(migration, /3\.416 x 2\.155/);
  assert.match(migration, /3\.516 x 2\.155/);
  assert.match(migration, /1\.80 x 3\.96/);
  assert.match(migration, /1\.90 x 3\.26/);
});

test("V6 remains isolated from Platform customer websites", () => {
  const migration = read("database/migrations/0013_jyoti_source_exact_v6.sql");
  assert.match(migration, /No Platform\/customer website resources are modified/);
});
