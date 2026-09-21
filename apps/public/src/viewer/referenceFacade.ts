import * as THREE from "three";

function std(color: number, roughness = 0.72, metalness = 0.02) {
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

function glass(color = 0x8da7b3, opacity = 0.42) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.08,
    metalness: 0.03,
    transmission: 0.18,
    transparent: true,
    opacity,
    depthWrite: false,
    clearcoat: 0.62,
    emissive: new THREE.Color(0x2b160d),
    emissiveIntensity: 0.22,
  });
}

export function makeReferenceFacadeBuilding(bounds: THREE.Box3, mobile: boolean) {
  const root = new THREE.Group();
  root.name = "reference-facade-building";

  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const baseY = bounds.min.y;

  const width = size.x * 0.74;
  const depth = size.z * 0.72;
  const totalH = size.y * 0.94;
  const stiltH = totalH * 0.105;
  const upperH = totalH * 0.77;
  const floorH = upperH / 5;
  const bodyBottom = baseY + stiltH;
  const bodyCenterY = bodyBottom + upperH / 2;
  const frontZ = center.z + depth / 2;
  const rightX = center.x + width / 2;

  const plaster = std(0xe4ddd4, 0.84, 0.01);
  const warmPlaster = std(0xefe3d5, 0.82, 0.01);
  const charcoal = std(0x30353a, 0.44, 0.08);
  const charcoalWall = std(0x3b3f43, 0.72, 0.03);
  const timber = std(0x765345, 0.60, 0.03);
  const timberDark = std(0x5f4036, 0.62, 0.03);
  const mint = std(0xb8c3b7, 0.80, 0.01);
  const railGlass = glass();
  const railMetal = std(0x4a5055, 0.34, 0.42);
  const doorMat = std(0x7a4b35, 0.58, 0.02);
  const stone = std(0xa7a09a, 0.70, 0.02);
  const windowGlass = glass(0x8ba5b0, 0.48);
  const warmGlow = new THREE.MeshStandardMaterial({
    color: 0xffe8cf,
    emissive: 0xff9f55,
    emissiveIntensity: 3.6,
    roughness: 0.28,
  });

  const addWindow = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    side = false,
  ) => {
    const t = Math.max(w * 0.07, 0.08);
    const d = Math.max(depth * 0.012, 0.05);
    if (!side) {
      root.add(
        box([w, t, d], charcoal, [x, y - h / 2, z]),
        box([w, t, d], charcoal, [x, y + h / 2, z]),
        box([t, h, d], charcoal, [x - w / 2, y, z]),
        box([t, h, d], charcoal, [x + w / 2, y, z]),
        box([w - t * 1.35, h - t * 1.35, d * 0.72], windowGlass, [x, y, z + d * 0.16]),
      );
    } else {
      root.add(
        box([d, t, w], charcoal, [x, y - h / 2, z]),
        box([d, t, w], charcoal, [x, y + h / 2, z]),
        box([d, h, t], charcoal, [x, y, z - w / 2]),
        box([d, h, t], charcoal, [x, y, z + w / 2]),
        box([d * 0.72, h - t * 1.35, w - t * 1.35], windowGlass, [x + d * 0.16, y, z]),
      );
    }
  };

  const addPlant = (x: number, y: number, z: number, scale = 1) => {
    const pot = std(0x70503e, 0.9);
    const leaf = std(0x3f7446, 0.92);
    root.add(box([0.28 * scale, 0.28 * scale, 0.28 * scale], pot, [x, y, z]));
    for (const [dx, dz] of [[0, 0], [-0.10, 0.04], [0.10, -0.04]] as Array<[number, number]>) {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.16 * scale, 8, 7), leaf);
      crown.position.set(x + dx * scale, y + 0.28 * scale, z + dz * scale);
      crown.scale.set(0.8, 1.55, 0.8);
      root.add(crown);
    }
  };

  const addLight = (x: number, y: number, z: number) => {
    const fixture = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(width * 0.004, 0.035), 8, 6),
      warmGlow,
    );
    fixture.position.set(x, y, z);
    root.add(fixture);
  };

  const addBalcony = (y: number, x: number, w: number, fins: boolean) => {
    const d = depth * 0.26;
    const frame = Math.max(width * 0.026, 0.12);
    const slabY = y - floorH * 0.34;
    const slabZ = frontZ + d * 0.42;

    root.add(
      box([w, floorH * 0.075, d], plaster, [x, slabY, slabZ]),
      box([w + frame * 1.7, floorH * 0.12, frame], charcoal, [x, slabY, slabZ + d / 2]),
      box([frame, floorH * 0.86, d], charcoal, [x - w / 2 - frame / 2, y, slabZ]),
      box([frame, floorH * 0.86, d], charcoal, [x + w / 2 + frame / 2, y, slabZ]),
      box([w + frame * 1.7, floorH * 0.11, d], charcoal, [x, y + floorH * 0.41, slabZ]),
      box([w * 0.86, floorH * 0.22, Math.max(depth * 0.012, 0.05)], railGlass, [x, slabY + floorH * 0.15, slabZ + d / 2 + depth * 0.012]),
      box([w * 0.92, Math.max(floorH * 0.016, 0.045), Math.max(depth * 0.016, 0.055)], warmGlow, [x, slabY - floorH * 0.012, slabZ + d * 0.27]),
    );

    addWindow(x - w * 0.19, y, frontZ + d * 0.10, w * 0.46, floorH * 0.44);
    root.add(box([w * 0.22, floorH * 0.50, Math.max(depth * 0.013, 0.055)], doorMat, [x + w * 0.22, y - floorH * 0.015, frontZ + d * 0.11]));
    addPlant(x - w * 0.27, slabY + floorH * 0.08, slabZ + d * 0.22, 0.9);
    addPlant(x + w * 0.28, slabY + floorH * 0.08, slabZ + d * 0.20, 0.78);

    for (const ox of [-0.34, 0, 0.34]) addLight(x + w * ox, y + floorH * 0.31, slabZ + d * 0.22);

    if (fins) {
      const finX = x + w / 2 + frame * 0.16;
      const finZ = slabZ + d * 0.46;
      for (let i = -4; i <= 4; i += 1) {
        root.add(box([Math.max(width * 0.006, 0.045), floorH * 0.78, Math.max(depth * 0.018, 0.07)], railMetal, [finX + i * width * 0.009, y + floorH * 0.01, finZ]));
      }
    }
  };

  root.add(
    box([width * 0.92, upperH, depth * 0.78], plaster, [center.x, bodyCenterY, center.z - depth * 0.03]),
    box([width * 0.88, stiltH * 0.72, depth * 0.72], warmPlaster, [center.x, baseY + stiltH * 0.36, center.z]),
  );

  for (const x of [-0.34, -0.10, 0.16, 0.38]) {
    root.add(box([width * 0.045, stiltH * 0.82, depth * 0.055], plaster, [center.x + width * x, baseY + stiltH * 0.41, frontZ - depth * 0.06]));
  }
  root.add(
    box([width * 0.23, stiltH * 0.48, Math.max(depth * 0.018, 0.08)], charcoal, [center.x + width * 0.31, baseY + stiltH * 0.30, frontZ + depth * 0.012]),
    box([width * 0.18, stiltH * 0.44, Math.max(depth * 0.018, 0.08)], doorMat, [center.x - width * 0.12, baseY + stiltH * 0.29, frontZ + depth * 0.013]),
  );

  root.add(
    box([width * 0.25, upperH * 0.92, Math.max(depth * 0.025, 0.09)], timberDark, [center.x - width * 0.33, bodyBottom + upperH * 0.50, frontZ + depth * 0.003]),
    box([width * 0.11, upperH * 0.94, Math.max(depth * 0.03, 0.10)], charcoal, [center.x - width * 0.035, bodyBottom + upperH * 0.50, frontZ + depth * 0.004]),
    box([width * 0.075, upperH * 0.89, Math.max(depth * 0.032, 0.105)], windowGlass, [center.x - width * 0.035, bodyBottom + upperH * 0.50, frontZ + depth * 0.008]),
    box([width * 0.075, upperH * 0.94, Math.max(depth * 0.028, 0.10)], mint, [center.x - width * 0.08, bodyBottom + upperH * 0.50, frontZ - depth * 0.008]),
  );

  for (let i = 1; i < 6; i += 1) {
    root.add(box([width * 0.075, Math.max(floorH * 0.035, 0.06), Math.max(depth * 0.034, 0.11)], charcoal, [center.x - width * 0.035, bodyBottom + i * floorH, frontZ + depth * 0.012]));
  }

  for (let floor = 0; floor < 5; floor += 1) {
    const y = bodyBottom + floorH * (floor + 0.52);
    addWindow(center.x - width * 0.30, y, frontZ + depth * 0.025, width * 0.13, floorH * 0.36);
    addWindow(center.x - width * 0.17, y - floorH * 0.08, frontZ + depth * 0.026, width * 0.10, floorH * 0.28);
    root.add(box([width * 0.34, floorH * 0.70, Math.max(depth * 0.025, 0.09)], charcoalWall, [center.x + width * 0.18, y, frontZ - depth * 0.012]));
    addBalcony(y, center.x + width * 0.20 + (floor % 2 === 0 ? width * 0.015 : 0), width * (floor === 4 ? 0.42 : 0.40), floor === 1 || floor === 3 || floor === 4);
  }

  root.add(box([Math.max(width * 0.022, 0.08), upperH * 0.94, depth * 0.55], timber, [rightX + width * 0.008, bodyBottom + upperH * 0.50, center.z + depth * 0.10]));
  for (let floor = 0; floor < 5; floor += 1) {
    const y = bodyBottom + floorH * (floor + 0.52);
    addWindow(rightX + width * 0.019, y, center.z - depth * 0.02, depth * 0.14, floorH * 0.34, true);
    addWindow(rightX + width * 0.019, y - floorH * 0.08, center.z + depth * 0.24, depth * 0.11, floorH * 0.28, true);
  }

  const roofY = bodyBottom + upperH;
  root.add(
    box([width * 0.94, totalH * 0.025, depth * 0.82], plaster, [center.x, roofY + totalH * 0.012, center.z]),
    box([width * 0.52, totalH * 0.11, Math.max(depth * 0.026, 0.10)], timber, [center.x + width * 0.20, roofY + totalH * 0.065, frontZ + depth * 0.005]),
    box([width * 0.25, totalH * 0.16, depth * 0.24], plaster, [center.x - width * 0.19, roofY + totalH * 0.075, center.z - depth * 0.06]),
    box([width * 0.83, Math.max(totalH * 0.003, 0.025), Math.max(depth * 0.02, 0.07)], warmGlow, [center.x, roofY + totalH * 0.028, frontZ + depth * 0.015]),
  );

  for (let i = -4; i <= 4; i += 1) {
    root.add(box([Math.max(width * 0.006, 0.045), totalH * 0.14, Math.max(depth * 0.018, 0.07)], charcoal, [center.x + width * 0.39 + i * width * 0.008, roofY + totalH * 0.065, frontZ + depth * 0.02]));
  }

  root.add(
    box([width * 0.86, upperH * 0.84, Math.max(depth * 0.026, 0.10)], plaster, [center.x, bodyBottom + upperH * 0.50, center.z - depth * 0.41]),
    box([Math.max(width * 0.025, 0.09), upperH * 0.86, depth * 0.42], stone, [center.x - width * 0.47, bodyBottom + upperH * 0.50, center.z - depth * 0.12]),
  );

  if (mobile) {
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) object.castShadow = false;
    });
  }

  return root;
}
