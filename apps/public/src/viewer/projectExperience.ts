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

function makeTree(height: number) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(height * 0.055, height * 0.075, height * 0.42, 10),
    standard(0x76513a, 0.92),
  );
  trunk.position.y = height * 0.21;
  trunk.castShadow = true;
  group.add(trunk);

  const leafMaterial = standard(0x2f7d45, 0.94);
  for (const [x, y, z, scale] of [
    [0, 0.63, 0, 0.3],
    [0.18, 0.72, 0.05, 0.23],
    [-0.17, 0.73, -0.05, 0.24],
    [0.02, 0.84, -0.1, 0.22],
  ] as Array<[number, number, number, number]>) {
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(height * scale, 2),
      leafMaterial,
    );
    crown.position.set(x * height, y * height, z * height);
    crown.castShadow = true;
    group.add(crown);
  }
  return group;
}

function makeFlowerBed(width: number, depth: number) {
  const group = new THREE.Group();
  const soil = box([width, 0.16, depth], standard(0x5a3827, 0.98), [0, 0.08, 0]);
  group.add(soil);
  const colors = [0xff5d8f, 0xffc857, 0x8f6bff, 0xf45d48, 0x49c6e5];
  for (let ix = -2; ix <= 2; ix += 1) {
    for (let iz = -1; iz <= 1; iz += 1) {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.024, 0.25, 7),
        standard(0x3d7d3e, 0.92),
      );
      stem.position.set((ix / 5) * width * 0.8, 0.22, (iz / 3) * depth * 0.65);
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 8),
        standard(colors[(ix + iz + 7) % colors.length], 0.62),
      );
      flower.position.copy(stem.position).add(new THREE.Vector3(0, 0.17, 0));
      group.add(stem, flower);
    }
  }
  return group;
}

function makePool(width: number, depth: number) {
  const group = new THREE.Group();
  const deck = box([width + 1.2, 0.16, depth + 1.2], standard(0xc7b49a, 0.78), [0, 0.08, 0]);
  group.add(deck);
  const basin = box([width, 0.34, depth], standard(0x2d89b8, 0.28), [0, 0.05, 0]);
  group.add(basin);
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.94, depth * 0.94),
    new THREE.MeshPhysicalMaterial({
      color: 0x28b8e3,
      roughness: 0.08,
      metalness: 0,
      transmission: 0.22,
      transparent: true,
      opacity: 0.83,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.24;
  water.receiveShadow = true;
  group.add(water);

  for (const side of [-1, 1]) {
    const lounger = box([0.78, 0.1, 1.8], standard(0xf8ead8, 0.62), [side * (width * 0.63), 0.28, 0]);
    lounger.rotation.z = side * -0.08;
    group.add(lounger);
  }
  return group;
}

function makeInterior(width: number, depth: number, baseY: number, features: ExperienceFeature[]) {
  const root = new THREE.Group();
  root.name = "furnished-show-flat";

  const floorMat = standard(0xd9c4a8, 0.54);
  const wallMat = standard(0xf6f1e7, 0.82);
  const accent = standard(0x6a4735, 0.55);
  const dark = standard(0x27333d, 0.48, 0.12);
  const fabric = standard(0x4477aa, 0.82);
  const cream = standard(0xeadcca, 0.86);

  const floor = box([width, 0.16, depth], floorMat, [0, baseY, 0]);
  root.add(floor);

  // Partial perimeter walls keep the interior visible from the camera.
  root.add(
    box([width, 2.8, 0.16], wallMat, [0, baseY + 1.4, -depth / 2]),
    box([0.16, 2.8, depth], wallMat, [-width / 2, baseY + 1.4, 0]),
    box([width * 0.44, 2.8, 0.16], wallMat, [width * 0.28, baseY + 1.4, depth / 2]),
  );

  const livingX = -width * 0.2;
  const bedroomX = width * 0.24;

  // Living room.
  const sofa = box([width * 0.34, 0.55, 1.0], fabric, [livingX, baseY + 0.36, depth * 0.1]);
  tagFeature(features, sofa, "living", "Living Room", "Interior", "Furnished living room with sofa, TV and coffee table.");
  root.add(sofa);
  const sofaBack = box([width * 0.34, 0.75, 0.18], fabric, [livingX, baseY + 0.75, depth * 0.46]);
  root.add(sofaBack);
  const coffee = box([1.25, 0.28, 0.72], accent, [livingX, baseY + 0.22, -depth * 0.13]);
  root.add(coffee);
  const tv = box([1.85, 1.0, 0.1], dark, [livingX, baseY + 1.25, -depth / 2 + 0.12]);
  root.add(tv);

  // Bedroom.
  const bedBase = box([2.5, 0.34, 2.0], accent, [bedroomX, baseY + 0.25, depth * 0.05]);
  tagFeature(features, bedBase, "bedroom", "Bedroom", "Interior", "Bedroom visualization with bed, pillows and wardrobe.");
  root.add(bedBase);
  const mattress = box([2.34, 0.28, 1.84], cream, [bedroomX, baseY + 0.56, depth * 0.05]);
  root.add(mattress);
  for (const side of [-1, 1]) {
    const pillow = box([0.78, 0.2, 0.46], standard(0xffffff, 0.92), [bedroomX + side * 0.58, baseY + 0.79, depth * 0.49]);
    root.add(pillow);
  }
  const wardrobe = box([1.55, 2.2, 0.55], accent, [width / 2 - 0.9, baseY + 1.18, -depth * 0.32]);
  root.add(wardrobe);

  // Kitchen.
  const kitchenZ = -depth * 0.28;
  const kitchenBase = box([2.5, 0.9, 0.62], standard(0xf1eee7, 0.65), [-width * 0.26, baseY + 0.52, kitchenZ]);
  tagFeature(features, kitchenBase, "kitchen", "Kitchen", "Interior", "Modular kitchen visualization with counter and tall storage.");
  root.add(
    kitchenBase,
    box([2.5, 0.08, 0.7], dark, [-width * 0.26, baseY + 1.0, kitchenZ]),
    box([1.45, 1.8, 0.58], standard(0xe8e5dc, 0.62), [-width / 2 + 0.82, baseY + 1.0, kitchenZ]),
  );

  // Dining.
  const dining = box([1.55, 0.12, 1.0], accent, [0, baseY + 0.78, depth * 0.32]);
  tagFeature(features, dining, "dining", "Dining Area", "Interior", "Dining table and seating area.");
  root.add(dining);
  for (const [x, z] of [[-0.95, 0], [0.95, 0], [0, -0.72], [0, 0.72]] as Array<[number, number]>) {
    const chair = box([0.48, 0.7, 0.48], standard(0xc48f65, 0.72), [x, baseY + 0.38, depth * 0.32 + z]);
    root.add(chair);
  }

  // Bathroom zone.
  const bathX = width * 0.32;
  const bathZ = -depth * 0.35;
  const bath = box([1.15, 0.55, 0.65], standard(0xf5f7f8, 0.4), [bathX, baseY + 0.35, bathZ]);
  tagFeature(features, bath, "bathroom", "Bathroom", "Interior", "Bathroom zone visualization with sanitary fixtures.");
  root.add(
    bath,
    box([0.65, 0.9, 0.65], standard(0xffffff, 0.4), [bathX + 0.95, baseY + 0.48, bathZ]),
  );

  // Balcony deck + railing.
  const balconyZ = depth / 2 + 0.8;
  root.add(box([width * 0.55, 0.16, 1.45], standard(0xa27b58, 0.72), [width * 0.08, baseY, balconyZ]));
  const rail = new THREE.MeshPhysicalMaterial({
    color: 0x8fc7dd,
    roughness: 0.16,
    transmission: 0.18,
    transparent: true,
    opacity: 0.72,
  });
  const balconyRail = box([width * 0.55, 0.8, 0.06], rail, [width * 0.08, baseY + 0.46, balconyZ + 0.68]);
  tagFeature(features, balconyRail, "interior-balcony", "Balcony", "Interior", "Glass-railing balcony connected to the furnished show flat.");
  root.add(balconyRail);

  // Warm ceiling lights.
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe4b5,
    emissive: 0xff9b3d,
    emissiveIntensity: 3.2,
  });
  for (const [x, z] of [[-2.1, 0.5], [0, 0.4], [2.0, 0.2], [-1.5, -1.4], [1.7, -1.3]] as Array<[number, number]>) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lightMaterial);
    bulb.position.set(x, baseY + 2.58, z);
    root.add(bulb);
  }

  return root;
}

function makeTerrace(width: number, depth: number, baseY: number, features: ExperienceFeature[]) {
  const root = new THREE.Group();
  const deck = box([width, 0.18, depth], standard(0xb8946d, 0.78), [0, baseY, 0]);
  tagFeature(features, deck, "terrace", "Roof Terrace", "Roof", "Usable terrace visualization with pergola, seating and planters.");
  root.add(deck);

  const pergolaMaterial = standard(0x5b3f31, 0.62);
  for (const x of [-width * 0.32, width * 0.32]) {
    for (const z of [-depth * 0.32, depth * 0.32]) {
      root.add(box([0.16, 2.2, 0.16], pergolaMaterial, [x, baseY + 1.1, z]));
    }
  }
  for (let i = -3; i <= 3; i += 1) {
    root.add(box([width * 0.68, 0.12, 0.12], pergolaMaterial, [0, baseY + 2.18, i * 0.28]));
  }

  const seating = box([2.3, 0.48, 0.82], standard(0x2e6f83, 0.8), [0, baseY + 0.32, 0.55]);
  root.add(seating);
  const table = box([1.0, 0.34, 0.72], standard(0xe0b46d, 0.58), [0, baseY + 0.28, -0.55]);
  root.add(table);

  for (const x of [-width * 0.4, width * 0.4]) {
    const planter = box([0.68, 0.52, 0.68], standard(0x8f5f44, 0.84), [x, baseY + 0.28, -depth * 0.28]);
    root.add(planter);
    const plant = makeTree(1.3);
    plant.position.set(x, baseY + 0.46, -depth * 0.28);
    root.add(plant);
  }
  return root;
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
  root.name = "interactive-project-experience";

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

  const plot = box([spanX * 2.05, 0.16, spanZ * 2.1], standard(0xbcae96, 0.92), [center.x, baseY - 0.08, center.z]);
  addFeature(siteRoot, features, plot, "plot", "Project Plot", "Site", "The shaped project parcel around the building.");

  const lawn = box([spanX * 1.75, 0.12, spanZ * 1.72], standard(0x4e8d48, 0.97), [center.x, baseY + 0.01, center.z]);
  addFeature(siteRoot, features, lawn, "garden", "Garden", "Landscaped green area with trees, flowers and seating.");

  const drive = box([spanX * 2.2, 0.08, Math.max(spanZ * 0.35, 4.8)], standard(0x2d3339, 0.96), [center.x, baseY + 0.06, bounds.max.z + spanZ * 0.55]);
  addFeature(siteRoot, features, drive, "road", "Road & Entry", "Front approach road and project entrance.");

  const pool = makePool(Math.max(spanX * 0.65, 5), Math.max(spanZ * 0.42, 3.4));
  pool.position.set(bounds.max.x + spanX * 0.62, baseY + 0.1, center.z - spanZ * 0.05);
  addFeature(siteRoot, features, pool, "pool", "Swimming Pool", "Colorful pool deck with water and lounge area.");

  const flower = makeFlowerBed(Math.max(spanX * 0.72, 5), 1.25);
  flower.position.set(center.x, baseY + 0.08, bounds.max.z + spanZ * 0.18);
  addFeature(siteRoot, features, flower, "flowers", "Flower Garden", "Front landscaped flower bed.");

  if (!mobile) {
    for (const [px, pz, scale] of [
      [-0.95, -0.7, 3.3],
      [-0.9, 0.6, 2.8],
      [0.95, -0.62, 3.0],
      [1.05, 0.55, 2.6],
      [-0.52, 0.92, 2.2],
      [0.55, 0.92, 2.3],
    ] as Array<[number, number, number]>) {
      const tree = makeTree(scale);
      tree.position.set(center.x + px * spanX, baseY + 0.06, center.z + pz * spanZ);
      siteRoot.add(tree);
    }
  }

  // Boundary wall with front opening.
  const wallMaterial = standard(0xcab8a2, 0.84);
  const sideWallDepth = spanZ * 2.06;
  siteRoot.add(
    box([0.22, 1.25, sideWallDepth], wallMaterial, [center.x - spanX, baseY + 0.62, center.z]),
    box([0.22, 1.25, sideWallDepth], wallMaterial, [center.x + spanX, baseY + 0.62, center.z]),
    box([spanX * 2.0, 1.25, 0.22], wallMaterial, [center.x, baseY + 0.62, center.z - spanZ]),
  );

  const frontZ = center.z + spanZ;
  siteRoot.add(
    box([spanX * 0.62, 1.25, 0.22], wallMaterial, [center.x - spanX * 0.69, baseY + 0.62, frontZ]),
    box([spanX * 0.62, 1.25, 0.22], wallMaterial, [center.x + spanX * 0.69, baseY + 0.62, frontZ]),
  );
  const gate = box([spanX * 0.52, 1.6, 0.12], standard(0x493c35, 0.48, 0.26), [center.x, baseY + 0.8, frontZ]);
  addFeature(siteRoot, features, gate, "gate", "Main Gate", "Main project entry gate.");

  const interiorWidth = Math.min(Math.max(spanX * 0.75, 7.2), 11.5);
  const interiorDepth = Math.min(Math.max(spanZ * 0.7, 6.2), 9.2);
  const interior = makeInterior(interiorWidth, interiorDepth, 0, features);
  interior.position.set(center.x, baseY + 0.12, center.z);
  interiorRoot.add(interior);

  const terrace = makeTerrace(Math.max(spanX * 0.8, 7), Math.max(spanZ * 0.62, 5.2), 0, features);
  terrace.position.set(center.x, bounds.max.y + 0.18, center.z);
  terraceRoot.add(terrace);

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
        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissiveIntensity = night ? 0.16 : 0;
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
