import * as THREE from "three";

type MeshFloorState = {
  mesh: THREE.Mesh;
  floor: number;
  originalWorldOrigin: THREE.Vector3;
};

function materialList(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material) ? material : [material];
}

function tuneTexture(texture: THREE.Texture | null | undefined, anisotropy: number) {
  if (!texture) return;
  texture.anisotropy = Math.max(texture.anisotropy || 1, anisotropy);
  texture.needsUpdate = true;
}

export function enhanceArchitecturalModel(
  root: THREE.Object3D,
  renderer: THREE.WebGLRenderer,
) {
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.castShadow = renderer.shadowMap.enabled;
    object.receiveShadow = true;

    for (const material of materialList(object.material)) {
      const name = material.name.toLowerCase();
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;

      tuneTexture(material.map, anisotropy);
      tuneTexture(material.normalMap, anisotropy);
      tuneTexture(material.roughnessMap, anisotropy);
      tuneTexture(material.metalnessMap, anisotropy);
      tuneTexture(material.aoMap, anisotropy);
      tuneTexture(material.emissiveMap, anisotropy);

      material.envMapIntensity = Math.max(material.envMapIntensity || 1, 1.18);

      if (/glass|window|translucent/.test(name)) {
        material.roughness = Math.min(material.roughness, 0.18);
        material.metalness = Math.min(material.metalness, 0.05);
        material.transparent = true;
        material.opacity = Math.min(material.opacity, 0.72);
        material.depthWrite = false;
      } else if (/metal|steel|aluminium|aluminum|railing|panel/.test(name)) {
        material.metalness = Math.max(material.metalness, 0.55);
        material.roughness = Math.min(Math.max(material.roughness, 0.24), 0.42);
      } else if (/marble|granite|tile|slate/.test(name)) {
        material.metalness = Math.min(material.metalness, 0.08);
        material.roughness = Math.min(Math.max(material.roughness, 0.32), 0.58);
      } else if (/concrete|paver|plaster|wall|frontcolor/.test(name)) {
        material.metalness = Math.min(material.metalness, 0.03);
        material.roughness = Math.max(material.roughness, 0.62);
      }

      material.needsUpdate = true;
    }
  });
}

function floorForY(y: number, bounds: THREE.Box3) {
  const total = Math.max(bounds.max.y - bounds.min.y, 0.001);
  const ratio = (y - bounds.min.y) / total;

  if (ratio < 0.12) return 0;
  if (ratio >= 0.79) return null;

  return THREE.MathUtils.clamp(
    Math.floor((ratio - 0.12) / 0.132) + 1,
    1,
    5,
  );
}

export function createFloorExploder(root: THREE.Object3D, bounds: THREE.Box3) {
  root.updateMatrixWorld(true);
  const totalHeight = Math.max(bounds.max.y - bounds.min.y, 1);
  const states: MeshFloorState[] = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || !object.parent) return;

    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;

    const meshHeight = box.max.y - box.min.y;
    // Long façade/core meshes stay fixed so the model never tears into nonsense.
    if (meshHeight > totalHeight * 0.22) return;

    const center = box.getCenter(new THREE.Vector3());
    const floor = floorForY(center.y, bounds);
    if (floor === null) return;

    states.push({
      mesh: object,
      floor,
      originalWorldOrigin: object.getWorldPosition(new THREE.Vector3()),
    });
  });

  const apply = (enabled: boolean) => {
    root.updateMatrixWorld(true);
    const gap = totalHeight * 0.035;

    for (const state of states) {
      const parent = state.mesh.parent;
      if (!parent) continue;

      const targetWorld = state.originalWorldOrigin.clone();
      if (enabled) targetWorld.y += state.floor * gap;

      parent.updateMatrixWorld(true);
      const targetLocal = parent.worldToLocal(targetWorld);
      state.mesh.position.copy(targetLocal);
    }

    root.updateMatrixWorld(true);
  };

  return {
    meshCount: states.length,
    setExploded: apply,
    reset: () => apply(false),
  };
}
