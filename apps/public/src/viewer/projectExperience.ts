import * as THREE from "three";

export type ExperienceMode = "site" | "interior" | "terrace";

export type ExperienceFeature = {
  id: string;
  label: string;
  category: string;
  description: string;
  object: THREE.Object3D;
};

function standard(color: number, roughness = 0.72, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function glass(color = 0x9fc8d9, opacity = 0.58) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.12,
    metalness: 0.02,
    transmission: 0.16,
    transparent: true,
    opacity,
    depthWrite: false,
    clearcoat: 0.5,
  });
}

function box(
  size: [number, number, number],
  material: THREE.Material,
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function tagFeature(
  features: ExperienceFeature[],
  object: THREE.Object3D,
  id: string,
  label: string,
  category: string,
  description: string,
) {
  object.userData.experienceFeatureId = id;
  object.userData.experienceLabel = label;
  object.userData.experienceCategory = category;
  features.push({ id, label, category, description, object });
  return object;
}

function addFeature(
  root: THREE.Object3D,
  features: ExperienceFeature[],
  object: THREE.Object3D,
  id: string,
  label: string,
  category: string,
  description: string,
) {
  tagFeature(features, object, id, label, category, description);
  root.add(object);
}

function makeConifer(height: number) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(height * 0.045, height * 0.065, height * 0.34, 9),
    standard(0x6c4932, 0.94),
  );
  trunk.position.y = height * 0.17;
  trunk.castShadow = true;
  group.add(trunk);

  const leaf = standard(0x315e35, 0.96);
  for (const [y, radius] of [
    [0.34, 0.22],
    [0.49, 0.26],
    [0.64, 0.22],
    [0.78, 0.16],
  ] as Array<[number, number]>) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(height * radius, height * 0.32, 12),
      leaf,
    );
    crown.position.y = height * y;
    crown.castShadow = true;
    group.add(crown);
  }
  return group;
}

function makeFlowerStrip(width: number) {
  const root = new THREE.Group();
  root.add(box([width, 0.16, 0.55], standard(0x5b3a28, 0.96), [0, 0.08, 0]));
  const colors = [0xea4f73, 0xf6c54b, 0xf07c49, 0xbf5ce8, 0xffffff];
  for (let i = 0; i < 18; i += 1) {
    const x = -width * 0.47 + (width * 0.94 * i) / 17;
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 8, 7),
      standard(colors[i % colors.length], 0.7),
    );
    flower.position.set(x, 0.26 + (i % 2) * 0.025, ((i % 3) - 1) * 0.12);
    root.add(flower);
  }
  return root;
}

function makeRoad(width: number, depth: number) {
  const group = new THREE.Group();
  const asphalt = box([width, 0.09, depth], standard(0x3a3d40, 0.94), [0, 0.045, 0]);
  group.add(asphalt);

  const sidewalkMat = standard(0xb8afa2, 0.86);
  const curbMat = standard(0xd8d2c8, 0.78);
  for (const side of [-1, 1]) {
    const z = side * (depth / 2 + 0.58);
    group.add(
      box([width, 0.13, 0.9], sidewalkMat, [0, 0.075, z]),
      box([width, 0.22, 0.14], curbMat, [0, 0.11, side * (depth / 2 + 0.08)]),
    );
  }

  const markingMat = standard(0xf0ede7, 0.72);
  for (let x = -width * 0.4; x <= width * 0.4; x += Math.max(width * 0.12, 2.4)) {
    const stripe = box([Math.max(width * 0.055, 1.2), 0.018, 0.075], markingMat, [x, 0.105, 0]);
    group.add(stripe);
  }
  return group;
}

function makeGate(width: number, height: number) {
  const root = new THREE.Group();
  const metal = standard(0x55483f, 0.38, 0.34);
  for (const side of [-1, 1]) {
    const panel = box([width * 0.47, height, 0.1], metal, [side * width * 0.245, height / 2, 0]);
    root.add(panel);
    for (let i = -3; i <= 3; i += 1) {
      root.add(
        box(
          [0.035, height * 0.76, 0.03],
          standard(0xc5a67b, 0.38, 0.42),
          [side * width * 0.245 + i * width * 0.055, height * 0.52, 0.07],
        ),
      );
    }
  }
  return root;
}

function addLowRoom(
  root: THREE.Object3D,
  features: ExperienceFeature[],
  id: string,
  label: string,
  unit: string,
  size: [number, number],
  pos: [number, number],
  floorMat: THREE.Material,
  description: string,
  wallHeight = 0.55,
) {
  const [w, d] = size;
  const [x, z] = pos;
  const group = new THREE.Group();
  const floor = box([w, 0.12, d], floorMat, [x, 0.06, z]);
  tagFeature(features, floor, id, label, `Flat ${unit}`, description);
  group.add(floor);

  const wallMat = standard(0xe8e5de, 0.86);
  group.add(
    box([w, wallHeight, 0.12], wallMat, [x, wallHeight / 2, z - d / 2]),
    box([w, wallHeight, 0.12], wallMat, [x, wallHeight / 2, z + d / 2]),
    box([0.12, wallHeight, d], wallMat, [x - w / 2, wallHeight / 2, z]),
    box([0.12, wallHeight, d], wallMat, [x + w / 2, wallHeight / 2, z]),
  );
  root.add(group);
  return { root: group, x, z, w, d };
}

function addBed(root: THREE.Object3D, x: number, z: number, rotate = 0) {
  const group = new THREE.Group();
  const wood = standard(0x6f503d, 0.58);
  const linen = standard(0xf4eee7, 0.88);
  const accent = standard(0xb47a82, 0.86);
  group.add(
    box([1.75, 0.25, 2.0], wood, [0, 0.18, 0]),
    box([1.62, 0.22, 1.86], linen, [0, 0.42, 0]),
    box([1.62, 0.07, 0.62], accent, [0, 0.56, -0.15]),
    box([0.64, 0.16, 0.38], linen, [-0.42, 0.62, 0.58]),
    box([0.64, 0.16, 0.38], linen, [0.42, 0.62, 0.58]),
  );
  group.position.set(x, 0, z);
  group.rotation.y = rotate;
  root.add(group);
}

function addSofa(root: THREE.Object3D, x: number, z: number, width: number, rotate = 0) {
  const group = new THREE.Group();
  const fabric = standard(0xc8b5a0, 0.88);
  group.add(
    box([width, 0.42, 0.75], fabric, [0, 0.26, 0]),
    box([width, 0.52, 0.16], fabric, [0, 0.58, 0.28]),
    box([0.18, 0.52, 0.72], fabric, [-width / 2 + 0.09, 0.48, 0]),
    box([0.18, 0.52, 0.72], fabric, [width / 2 - 0.09, 0.48, 0]),
  );
  group.position.set(x, 0, z);
  group.rotation.y = rotate;
  root.add(group);
}

function addKitchen(root: THREE.Object3D, x: number, z: number, width: number, rotate = 0) {
  const group = new THREE.Group();
  const cabinet = standard(0x805d43, 0.58);
  const counter = standard(0x2e3032, 0.28);
  group.add(
    box([width, 0.82, 0.55], cabinet, [0, 0.44, 0]),
    box([width, 0.08, 0.62], counter, [0, 0.89, 0]),
  );
  for (const off of [-width * 0.25, width * 0.22]) {
    const sink = box([0.5, 0.025, 0.34], standard(0xc4c9cc, 0.2, 0.45), [off, 0.94, 0]);
    group.add(sink);
  }
  group.position.set(x, 0, z);
  group.rotation.y = rotate;
  root.add(group);
}

function addDining(root: THREE.Object3D, x: number, z: number, rotate = 0) {
  const group = new THREE.Group();
  const wood = standard(0x9a6d4d, 0.58);
  group.add(box([1.15, 0.12, 0.72], wood, [0, 0.66, 0]));
  for (const [cx, cz] of [[-0.72, 0], [0.72, 0], [0, -0.52], [0, 0.52]] as Array<[number, number]>) {
    group.add(box([0.38, 0.58, 0.38], standard(0xc2a17f, 0.78), [cx, 0.3, cz]));
  }
  group.position.set(x, 0, z);
  group.rotation.y = rotate;
  root.add(group);
}

function addToilet(root: THREE.Object3D, x: number, z: number, rotate = 0) {
  const group = new THREE.Group();
  const porcelain = standard(0xf4f6f5, 0.32);
  const toilet = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.48, 16), porcelain);
  toilet.position.set(0.2, 0.27, 0);
  group.add(toilet);
  group.add(box([0.42, 0.18, 0.34], porcelain, [-0.35, 0.46, 0]));
  group.position.set(x, 0, z);
  group.rotation.y = rotate;
  root.add(group);
}

function addBalcony(
  root: THREE.Object3D,
  features: ExperienceFeature[],
  id: string,
  label: string,
  unit: string,
  size: [number, number],
  pos: [number, number],
) {
  const [w, d] = size;
  const [x, z] = pos;
  const deck = box([w, 0.12, d], standard(0xc8b392, 0.72), [x, 0.06, z]);
  tagFeature(features, deck, id, label, `Flat ${unit}`, `${label} shown from the brochure-backed unit layout.`);
  root.add(deck);
  const rail = glass(0xa9cfdd, 0.66);
  root.add(box([w, 0.66, 0.055], rail, [x, 0.38, z + d / 2]));
}

function makeBrochureTypicalFloor(features: ExperienceFeature[]) {
  const root = new THREE.Group();
  root.name = "brochure-backed-typical-floor";

  const cream = standard(0xe6dfd1, 0.62);
  const bath = standard(0x73777b, 0.7);
  const kitchenFloor = standard(0xd3c7b2, 0.7);
  const lobbyFloor = standard(0xdad4c9, 0.72);

  // FLAT 101 - brochure: Living 4.954x3.050, Kitchen 3.279x2.196,
  // Dining 1.265x1.023, bedrooms 3.679x3.153 and 3.500x3.701.
  addLowRoom(root, features, "101-living", "Living 4.954 x 3.050", "101-501", [4.95, 3.05], [-3.25, 0.6], cream, "Brochure-backed Flat 101-501 living room.");
  addLowRoom(root, features, "101-kitchen", "Kitchen 3.379 x 2.196", "101-501", [3.38, 2.2], [-4.25, 3.18], kitchenFloor, "Brochure-backed modular kitchen.");
  addLowRoom(root, features, "101-dining", "Dining 1.265 x 1.023", "101-501", [1.27, 1.03], [-1.78, 3.12], cream, "Brochure-backed dining space.");
  addLowRoom(root, features, "101-bed-a", "Bed Room 3.679 x 3.153", "101-501", [3.68, 3.15], [-4.15, 5.92], cream, "Brochure-backed bedroom.");
  addLowRoom(root, features, "101-bed-b", "Bed Room 3.506 x 3.761", "101-501", [3.51, 3.76], [-0.65, 6.05], cream, "Brochure-backed bedroom.");
  addLowRoom(root, features, "101-toilet-a", "Toilet 1.20 x 2.13", "101-501", [1.2, 2.13], [-1.25, 4.25], bath, "Brochure-backed toilet.");
  addLowRoom(root, features, "101-toilet-b", "Toilet 2.542 x 1.565", "101-501", [2.54, 1.57], [-4.45, 8.35], bath, "Brochure-backed toilet.");
  addBalcony(root, features, "101-balcony", "Balcony 1.416", "101-501", [1.42, 2.85], [-6.45, 0.72]);
  addBalcony(root, features, "101-wbal", "W. Bal 1.065", "101-501", [1.07, 2.0], [-6.38, 3.33]);

  addSofa(root, -3.05, 0.4, 2.35, 0);
  addKitchen(root, -4.45, 3.1, 2.65, 0);
  addDining(root, -1.8, 3.1);
  addBed(root, -4.25, 5.95, 0);
  addBed(root, -0.7, 6.05, 0);
  addToilet(root, -1.25, 4.25);
  addToilet(root, -4.45, 8.35);

  // FLAT 102 - brochure: Living 4.828x3.050, Kitchen 3.416x2.155,
  // Dining 1.415x1.023, toilet 1.30x2.132. Mirrored around the central duct.
  addLowRoom(root, features, "102-living", "Living 4.828 x 3.050", "102-502", [4.83, 3.05], [3.25, 0.6], cream, "Brochure-backed Flat 102-502 living room.");
  addLowRoom(root, features, "102-kitchen", "Kitchen 3.516 x 2.155", "102-502", [3.52, 2.16], [4.25, 3.2], kitchenFloor, "Brochure-backed modular kitchen.");
  addLowRoom(root, features, "102-dining", "Dining 1.415 x 1.023", "102-502", [1.42, 1.03], [1.73, 3.12], cream, "Brochure-backed dining space.");
  addLowRoom(root, features, "102-bed-a", "Bed Room 3.383 x 3.761", "102-502", [3.38, 3.76], [4.22, 5.95], cream, "Bedroom placement follows the supplied floor-plan render.");
  addLowRoom(root, features, "102-bed-b", "Bed Room 3.500 x 3.204", "102-502", [3.5, 3.2], [0.78, 6.03], cream, "Bedroom placement follows the supplied floor-plan render.");
  addLowRoom(root, features, "102-toilet", "Toilet 1.30 x 2.132", "102-502", [1.3, 2.13], [1.28, 4.28], bath, "Brochure-backed toilet.");
  addBalcony(root, features, "102-balcony", "Balcony 1.40", "102-502", [1.4, 2.82], [6.3, 0.7]);
  addBalcony(root, features, "102-wbal", "W. Bal 1.140", "102-502", [1.14, 2.0], [6.28, 3.28]);

  addSofa(root, 3.08, 0.4, 2.3, Math.PI);
  addKitchen(root, 4.45, 3.12, 2.7, Math.PI);
  addDining(root, 1.72, 3.1);
  addBed(root, 4.25, 5.95, Math.PI);
  addBed(root, 0.8, 6.05, Math.PI);
  addToilet(root, 1.28, 4.28, Math.PI);

  // Shared duct between 101/102.
  addLowRoom(root, features, "duct", "DUCT 1.80 x 3.26", "Common", [1.8, 3.26], [0, 3.95], standard(0x9a9c9e, 0.92), "Central service duct shown on the supplied typical floor plan.");

  // Common lobby and stair block.
  addLowRoom(root, features, "lobby", "Lobby", "Common", [4.6, 2.1], [-0.25, -2.15], lobbyFloor, "Common lobby linking the three flats, staircase and fire lift.");
  const stair = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    stair.add(box([2.15, 0.12 + i * 0.04, 0.33], standard(0x666b70, 0.74), [-3.3, 0.08 + i * 0.04, -3.1 + i * 0.33]));
  }
  const stairPick = box([2.35, 0.1, 2.8], new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), [-3.3, 0.05, -2.0]);
  tagFeature(features, stairPick, "stair", "Staircase", "Common", "Common staircase shown on the brochure floor plan.");
  stair.add(stairPick);
  root.add(stair);

  addLowRoom(root, features, "fire-lift", "Fire Lift 1.60 x 1.80", "Common", [1.6, 1.8], [2.35, -2.25], standard(0xb7aea1, 0.68), "Fire lift shown on the supplied floor plan.");
  addLowRoom(root, features, "common-toilet", "Toilet 1.20 x 1.80", "Common", [1.2, 1.8], [4.0, -2.2], bath, "Common toilet beside the fire lift.");

  // FLAT 103 - brochure: Living 5.366x3.000, Kitchen 3.640x2.061,
  // Bedrooms 3.313x3.146 and 3.130x3.830, toilet 1.900x1.313.
  addLowRoom(root, features, "103-living", "Living 5.366 x 3.000", "103-403", [5.37, 3.0], [-0.5, -5.0], cream, "Brochure-backed Flat 103-403 living room.");
  addLowRoom(root, features, "103-kitchen", "Kitchen 3.640 x 2.061", "103-403", [3.64, 2.06], [-2.3, -7.72], kitchenFloor, "Brochure-backed modular kitchen.");
  addLowRoom(root, features, "103-bed-a", "Bed Room 3.313 x 3.146", "103-403", [3.31, 3.15], [3.55, -4.8], cream, "Brochure-backed bedroom.");
  addLowRoom(root, features, "103-bed-b", "Bed Room 3.130 x 3.830", "103-403", [3.13, 3.83], [3.45, -8.25], cream, "Brochure-backed bedroom.");
  addLowRoom(root, features, "103-toilet", "Toilet 1.900 x 1.313", "103-403", [1.9, 1.31], [0.55, -7.62], bath, "Brochure-backed toilet.");
  addBalcony(root, features, "103-balcony-side", "Balcony 1.460", "103-403", [1.46, 2.9], [-4.65, -5.0]);
  addBalcony(root, features, "103-wbal", "W. Bal 1.350", "103-403", [3.0, 1.35], [-2.25, -9.2]);
  addBalcony(root, features, "103-balcony", "Balcony 1.350", "103-403", [1.35, 1.35], [0.55, -9.2]);

  addSofa(root, -0.75, -5.0, 2.5, Math.PI / 2);
  addKitchen(root, -2.35, -7.75, 3.0, 0);
  addBed(root, 3.55, -4.8, Math.PI / 2);
  addBed(root, 3.45, -8.25, Math.PI / 2);
  addToilet(root, 0.55, -7.62);

  // Visual central axis / floor foundation.
  const overall = box([14.4, 0.05, 20.0], standard(0xcfc9be, 0.92), [0, -0.025, -0.6]);
  overall.renderOrder = -1;
  root.add(overall);

  return root;
}

function makeRoofOverlay(bounds: THREE.Box3, features: ExperienceFeature[]) {
  const root = new THREE.Group();
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const y = bounds.max.y + Math.max(size.y * 0.004, 0.06);
  const roof = box(
    [size.x * 0.88, 0.08, size.z * 0.84],
    standard(0xdad7d0, 0.82),
    [center.x, y, center.z],
  );
  tagFeature(features, roof, "roof", "Roof / Terrace", "Building", "Source-faithful roof inspection. No recreational roof amenity is claimed by the supplied brochure.");
  root.add(roof);

  const glow = new THREE.MeshStandardMaterial({
    color: 0xffdfb0,
    emissive: 0xff9f4a,
    emissiveIntensity: 2.2,
    roughness: 0.35,
  });
  root.add(
    box([size.x * 0.72, 0.035, 0.035], glow, [center.x, y + 0.09, center.z + size.z * 0.39]),
    box([0.035, 0.035, size.z * 0.55], glow, [center.x + size.x * 0.42, y + 0.09, center.z + size.z * 0.06]),
  );
  return root;
}

function addFacadeWarmLights(root: THREE.Object3D, bounds: THREE.Box3, mobile: boolean) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffe8c6,
    emissive: 0xffa65a,
    emissiveIntensity: 4.2,
    roughness: 0.3,
  });
  const floors = [0.23, 0.36, 0.49, 0.62, 0.75, 0.88];
  for (const ratio of floors) {
    const y = bounds.min.y + size.y * ratio;
    for (const xRatio of [-0.32, 0.02, 0.34]) {
      const fixture = new THREE.Mesh(new THREE.SphereGeometry(Math.max(size.x * 0.008, 0.055), 10, 8), lightMat);
      fixture.position.set(center.x + size.x * xRatio, y, bounds.max.z + Math.max(size.z * 0.012, 0.04));
      root.add(fixture);
    }
  }

  if (!mobile) {
    for (const xRatio of [-0.3, 0.28]) {
      const light = new THREE.PointLight(0xffb56d, 2.2, Math.max(size.x * 0.72, 10), 2);
      light.position.set(
        center.x + size.x * xRatio,
        bounds.min.y + size.y * 0.48,
        bounds.max.z + Math.max(size.z * 0.22, 1.4),
      );
      root.add(light);
    }
  }
}

function dispose(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material.dispose();
  });
}

export function createProjectExperience(bounds: THREE.Box3, mobile: boolean) {
  const root = new THREE.Group();
  root.name = "source-faithful-project-experience";

  const siteRoot = new THREE.Group();
  const interiorRoot = new THREE.Group();
  const terraceRoot = new THREE.Group();
  root.add(siteRoot, interiorRoot, terraceRoot);

  const features: ExperienceFeature[] = [];
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const spanX = Math.max(size.x, 12);
  const spanZ = Math.max(size.z, 10);
  const baseY = bounds.min.y - Math.max(size.y * 0.006, 0.04);

  // Source-faithful site: paved plot, road, low compound wall, gate and restrained front landscaping.
  const plot = box([spanX * 1.68, 0.14, spanZ * 1.48], standard(0xc5bbae, 0.88), [center.x, baseY - 0.06, center.z]);
  addFeature(siteRoot, features, plot, "plot", "Project Plot", "Site", "Project parcel shown as a compact paved residential site around the building.");

  const parking = box([spanX * 1.35, 0.09, spanZ * 0.58], standard(0x918a82, 0.86), [center.x, baseY + 0.02, center.z + spanZ * 0.18]);
  addFeature(siteRoot, features, parking, "parking", "Car Parking", "Amenity", "Car Parking is explicitly listed in the supplied project brochure.");

  const road = makeRoad(spanX * 2.35, Math.max(spanZ * 0.42, 5.2));
  road.position.set(center.x, baseY + 0.04, bounds.max.z + spanZ * 0.52);
  addFeature(siteRoot, features, road, "road", "Front Road", "Site", "Road/approach context in front of the project.");

  const flower = makeFlowerStrip(Math.max(spanX * 0.92, 6));
  flower.position.set(center.x, baseY + 0.06, bounds.max.z + spanZ * 0.17);
  addFeature(siteRoot, features, flower, "landscape", "Front Landscaping", "Landscape", "Shrubs and flower strip following the exterior render intent.");

  if (!mobile) {
    for (const [xRatio, zRatio, h] of [
      [-0.56, 0.46, 2.5],
      [-0.32, 0.48, 2.15],
      [-0.08, 0.49, 2.05],
      [0.18, 0.48, 2.15],
      [0.44, 0.45, 2.45],
      [-0.72, -0.34, 3.15],
      [0.72, -0.34, 3.1],
    ] as Array<[number, number, number]>) {
      const tree = makeConifer(h);
      tree.position.set(center.x + spanX * xRatio, baseY + 0.04, center.z + spanZ * zRatio);
      siteRoot.add(tree);
    }
  }

  const boundaryMat = standard(0xb8684f, 0.84);
  const capMat = standard(0xeee5da, 0.72);
  const wallH = 0.85;
  const wallDepth = spanZ * 1.4;
  for (const x of [center.x - spanX * 0.82, center.x + spanX * 0.82]) {
    siteRoot.add(
      box([0.18, wallH, wallDepth], boundaryMat, [x, baseY + wallH / 2, center.z - spanZ * 0.03]),
      box([0.22, 0.09, wallDepth], capMat, [x, baseY + wallH + 0.045, center.z - spanZ * 0.03]),
    );
  }
  siteRoot.add(
    box([spanX * 1.64, wallH, 0.18], boundaryMat, [center.x, baseY + wallH / 2, center.z - spanZ * 0.73]),
    box([spanX * 1.64, 0.09, 0.22], capMat, [center.x, baseY + wallH + 0.045, center.z - spanZ * 0.73]),
  );

  const frontZ = center.z + spanZ * 0.70;
  const gateWidth = Math.max(spanX * 0.46, 4.4);
  const sideWidth = (spanX * 1.64 - gateWidth) / 2;
  siteRoot.add(
    box([sideWidth, wallH, 0.18], boundaryMat, [center.x - gateWidth / 2 - sideWidth / 2, baseY + wallH / 2, frontZ]),
    box([sideWidth, wallH, 0.18], boundaryMat, [center.x + gateWidth / 2 + sideWidth / 2, baseY + wallH / 2, frontZ]),
  );
  const gate = makeGate(gateWidth, 1.45);
  gate.position.set(center.x, baseY, frontZ);
  addFeature(siteRoot, features, gate, "gate", "Main Gate", "Site", "Decorative front gate matching the exterior-render treatment.");

  addFacadeWarmLights(siteRoot, bounds, mobile);

  const interior = makeBrochureTypicalFloor(features);
  const floorScale = Math.min(
    (spanX * 1.25) / 14.4,
    (spanZ * 1.35) / 20.0,
    1.15,
  );
  interior.scale.setScalar(floorScale);
  interior.position.set(center.x, baseY + 0.14, center.z - spanZ * 0.02);
  interiorRoot.add(interior);

  const roof = makeRoofOverlay(bounds, features);
  terraceRoot.add(roof);

  interiorRoot.visible = false;
  terraceRoot.visible = false;

  return {
    root,
    features,
    setMode(mode: ExperienceMode) {
      siteRoot.visible = mode === "site";
      interiorRoot.visible = mode === "interior";
      terraceRoot.visible = mode === "terrace";
    },
    setNight(night: boolean) {
      siteRoot.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const material = Array.isArray(object.material) ? object.material[0] : object.material;
        if (material instanceof THREE.MeshStandardMaterial && material.emissive) {
          material.emissiveIntensity = night
            ? Math.max(material.emissiveIntensity, 2.4)
            : Math.min(material.emissiveIntensity, 0.8);
        }
      });
    },
    focus(mode: ExperienceMode) {
      if (mode === "interior") {
        const box3 = new THREE.Box3().setFromObject(interiorRoot);
        return { box: box3, target: box3.getCenter(new THREE.Vector3()) };
      }
      if (mode === "terrace") {
        const box3 = new THREE.Box3().setFromObject(terraceRoot);
        return { box: box3, target: box3.getCenter(new THREE.Vector3()) };
      }
      const box3 = new THREE.Box3().setFromObject(siteRoot);
      return { box: box3, target: box3.getCenter(new THREE.Vector3()) };
    },
    dispose() {
      dispose(root);
    },
  };
}
