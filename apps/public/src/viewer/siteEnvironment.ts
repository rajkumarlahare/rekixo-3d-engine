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

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f8b83,
    roughness: 0.98,
    metalness: 0,
  });
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(span * 2.4, mobile ? 48 : 96),
    groundMaterial,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(center.x, baseY - 0.03, center.z);
  ground.receiveShadow = true;
  root.add(ground);

  return {
    root,
    setNight(night: boolean) {
      groundMaterial.color.setHex(night ? 0x303238 : 0x8f8b83);
    },
    dispose() {
      skyTexture?.dispose();
      disposeGroup(root);
    },
  };
}
