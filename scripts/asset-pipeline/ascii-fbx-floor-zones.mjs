import fs from "node:fs";

function parseNumberArray(block, key) {
  const expression = new RegExp(
    key + ":\\s*\\*(\\d+)\\s*\\{\\s*a:\\s*([^}]*)\\}",
    "s",
  );
  const match = block.match(expression);
  if (!match) return [];
  return match[2]
    .replaceAll("\n", "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number);
}

function geometryBlocks(source) {
  const results = [];
  const expression = /Geometry:\s*(\d+),\s*"Geometry::([^"]*)",\s*"Mesh"\s*\{/g;
  let match;
  while ((match = expression.exec(source))) {
    let index = expression.lastIndex;
    let depth = 1;
    while (index < source.length && depth > 0) {
      if (source[index] === "{") depth += 1;
      if (source[index] === "}") depth -= 1;
      index += 1;
    }
    results.push({
      id: Number(match[1]),
      name: match[2],
      block: source.slice(expression.lastIndex, index - 1),
    });
    expression.lastIndex = index;
  }
  return results;
}

function boundsOf(vertices) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let index = 0; index + 2 < vertices.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = vertices[index + axis];
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
    }
  }
  return { min, max };
}

export function analyzeAsciiFbx(source, options = {}) {
  const floorHeight = Number(options.floorHeight ?? 3);
  const baseY = Number(options.baseY ?? 0);
  const floorCount = Number(options.floorCount ?? 6);
  const roofTop = Number(options.roofTop ?? baseY + floorHeight * floorCount + floorHeight);

  if (!(floorHeight > 0) || !(floorCount >= 1)) {
    throw new Error("floorHeight and floorCount must be positive.");
  }

  const zones = [];
  for (let index = 0; index < floorCount; index += 1) {
    zones.push({
      name: index === 0 ? "GROUND_STILT" : `FLOOR_${String(index).padStart(2, "0")}`,
      minY: baseY + index * floorHeight,
      maxY: baseY + (index + 1) * floorHeight,
    });
  }
  zones.push({
    name: "TERRACE_ROOF",
    minY: baseY + floorCount * floorHeight,
    maxY: roofTop,
  });

  const geometries = geometryBlocks(source)
    .map(({ id, name, block }) => {
      const vertices = parseNumberArray(block, "Vertices");
      if (vertices.length < 3) return null;
      const bounds = boundsOf(vertices);
      const centerY = (bounds.min[1] + bounds.max[1]) / 2;
      const zone =
        zones.find(({ minY, maxY }) => centerY >= minY && centerY < maxY)?.name ??
        "UNASSIGNED";
      return {
        id,
        name,
        vertexCount: Math.floor(vertices.length / 3),
        bounds,
        centerY,
        zone,
      };
    })
    .filter(Boolean);

  const overall = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };
  for (const geometry of geometries) {
    for (let axis = 0; axis < 3; axis += 1) {
      overall.min[axis] = Math.min(overall.min[axis], geometry.bounds.min[axis]);
      overall.max[axis] = Math.max(overall.max[axis], geometry.bounds.max[axis]);
    }
  }

  return {
    floorHeight,
    baseY,
    floorCount,
    roofTop,
    zones: zones.map((zone) => ({
      ...zone,
      geometryCount: geometries.filter((geometry) => geometry.zone === zone.name).length,
    })),
    overallBounds: overall,
    geometries,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, floorHeightArg, floorCountArg, roofTopArg] = process.argv.slice(2);
  if (!file) {
    throw new Error(
      "Usage: node scripts/asset-pipeline/ascii-fbx-floor-zones.mjs <file.fbx> [floorHeight] [floorCount] [roofTop]",
    );
  }

  const source = fs.readFileSync(file, "utf8");
  const report = analyzeAsciiFbx(source, {
    floorHeight: floorHeightArg ? Number(floorHeightArg) : 3,
    floorCount: floorCountArg ? Number(floorCountArg) : 6,
    roofTop: roofTopArg ? Number(roofTopArg) : undefined,
  });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
