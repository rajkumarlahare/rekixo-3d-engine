import * as THREE from "three";

export function createArchitecturalSiteEnvironment(
  _bounds: THREE.Box3,
  _renderer: THREE.WebGLRenderer,
  _mobile: boolean,
) {
  // The supplied project has a compact urban plot. Do not add synthetic
  // circular ground/sky geometry around it: at aerial camera distances those
  // shapes become visible as giant discs and wash out the architectural model.
  const root = new THREE.Group();
  root.name = "architectural-site-environment";

  return {
    root,
    setNight(_night: boolean) {
      // Lighting/background is controlled by Viewer3D so the site itself
      // remains the source-backed plot/road/boundary geometry.
    },
    dispose() {
      // No generated geometry or textures to dispose.
    },
  };
}
