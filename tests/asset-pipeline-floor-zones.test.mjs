import assert from "node:assert/strict";
import test from "node:test";
import { analyzeAsciiFbx } from "../scripts/asset-pipeline/ascii-fbx-floor-zones.mjs";

const sample = `
Geometry: 1, "Geometry::Ground", "Mesh" {
  Vertices: *9 {
    a: 0,0,0, 1,1,0, 2,2,0
  }
}
Geometry: 2, "Geometry::Floor1", "Mesh" {
  Vertices: *9 {
    a: 0,3.2,0, 1,4.2,0, 2,5.2,0
  }
}
Geometry: 3, "Geometry::Roof", "Mesh" {
  Vertices: *9 {
    a: 0,18.1,0, 1,19,0, 2,20,0
  }
}
`;

test("zones geometry by vertical center without tenant-specific names", () => {
  const report = analyzeAsciiFbx(sample, {
    floorHeight: 3,
    floorCount: 6,
    roofTop: 21.5,
  });

  assert.equal(report.geometries[0].zone, "GROUND_STILT");
  assert.equal(report.geometries[1].zone, "FLOOR_01");
  assert.equal(report.geometries[2].zone, "TERRACE_ROOF");
  assert.equal(report.zones.find((zone) => zone.name === "FLOOR_01").geometryCount, 1);
});

test("rejects invalid zoning configuration", () => {
  assert.throws(() => analyzeAsciiFbx(sample, { floorHeight: 0 }), /positive/);
});
