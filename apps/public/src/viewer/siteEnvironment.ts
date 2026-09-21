import * as THREE from "three";

function roundedRectTexture(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#9fc5df");
  gradient.addColorStop(0.46, "#dbe5e9");
  gradient.addColorStop(0.7, "#eac9a7");
  gradient.addColorStop(1, "#a98a72");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const sun = ctx.createRadialGradient(354, 190, 2, 354, 190, 78);
  sun.addColorStop(0, "rgba(255,244,217,.96)");
  sun.addColorStop(.18, "rgba(255,222,174,.55)");
  sun.addColorStop(1, "rgba(255,205,158,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  texture.needsUpdate = true;
  return texture;
}

function makeShrub(scale: number) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x315f3d,
    roughness: 0.94,
    metalness: 0,
  });
  const geometry = new THREE.IcosahedronGeometry(scale, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(1, 0.8, 1);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

function disposeGroup(group: THREE.Object3D) {
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material.dispose();
  });
}

export function createArchitecturalSiteEnvironment(
  bounds: THREE.Box3,
  renderer: THREE.WebGLRenderer,
  mobile: boolean,
) {
  const root = new THREE.Group();
  root.name = "architectural-site-environment";

  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const baseY = bounds.min.y - Math.max(size.y * 0.004, 0.025);
  const span = Math.max(size.x, size.z, 12);

  const skyTexture = roundedRectTexture(renderer);
  if (skyTexture) {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(span * 9, mobile ? 20 : 32, mobile ? 12 : 20),
      new THREE.MeshBasicMaterial({
        map: skyTexture,
        side: THREE.BackSide,
        fog: false,
      }),
    );
    sky.position.copy(center);
    root.add(sky);
  }

  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x486a42,
    roughness: 0.98,
    metalness: 0,
  });
  const grass = new THREE.Mesh(
    new THREE.CircleGeometry(span * 1.75, mobile ? 48 : 96),
    grassMaterial,
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(center.x, baseY - 0.02, center.z);
  grass.receiveShadow = true;
  root.add(grass);

  const pavingMaterial = new THREE.MeshStandardMaterial({
    color: 0x8c8377,
    roughness: 0.86,
    metalness: 0.01,
  });
  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x * 1.35, Math.max(size.z * 0.24, 3.4)),
    pavingMaterial,
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(center.x, baseY + 0.008, bounds.max.z + Math.max(size.z * 0.11, 1.2));
  apron.receiveShadow = true;
  root.add(apron);

  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x25282b,
    roughness: 0.95,
    metalness: 0,
  });
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x * 2.8, Math.max(size.z * 0.42, 5.5)),
    roadMaterial,
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(center.x, baseY + 0.004, bounds.max.z + Math.max(size.z * 0.42, 5));
  road.receiveShadow = true;
  root.add(road);

  const curbMaterial = new THREE.MeshStandardMaterial({
    color: 0xc7c2b8,
    roughness: 0.8,
    metalness: 0,
  });
  for (const offset of [-1, 1]) {
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(size.x * 1.55, 0.12, 0.18),
      curbMaterial,
    );
    curb.position.set(
      center.x,
      baseY + 0.05,
      bounds.max.z + Math.max(size.z * (offset < 0 ? 0.2 : 0.63), offset < 0 ? 2.5 : 7),
    );
    curb.castShadow = true;
    curb.receiveShadow = true;
    root.add(curb);
  }

  if (!mobile) {
    const shrubScale = Math.max(span * 0.025, 0.35);
    const positions = [
      [-0.62, 0.56], [-0.38, 0.62], [-0.13, 0.6], [0.14, 0.61], [0.42, 0.58], [0.66, 0.55],
      [-0.74, -0.45], [0.74, -0.45],
    ];
    for (const [px, pz] of positions) {
      const shrub = makeShrub(shrubScale);
      shrub.position.set(
        center.x + size.x * px,
        baseY + shrubScale * 0.7,
        center.z + size.z * pz,
      );
      root.add(shrub);
    }
  }

  return {
    root,
    setNight(night: boolean) {
      grassMaterial.color.setHex(night ? 0x1f3426 : 0x486a42);
      pavingMaterial.color.setHex(night ? 0x49443f : 0x8c8377);
      roadMaterial.color.setHex(night ? 0x141619 : 0x25282b);
    },
    dispose() {
      skyTexture?.dispose();
      disposeGroup(root);
    },
  };
}
