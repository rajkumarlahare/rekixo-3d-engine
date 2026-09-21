import * as THREE from "three";

export type WalkDirection = "forward" | "back" | "left" | "right";

export function floorEyeY(bounds: THREE.Box3, floor: number | null) {
  const height = Math.max(bounds.max.y - bounds.min.y, 1);
  if (floor === null) return bounds.min.y + Math.min(1.65, height * 0.06);

  const lowerRatio = floor === 0 ? 0 : 0.12 + (floor - 1) * 0.132;
  const upperRatio = floor === 0 ? 0.12 : Math.min(0.79, 0.12 + floor * 0.132);
  const lower = bounds.min.y + height * lowerRatio;
  const upper = bounds.min.y + height * upperRatio;
  return lower + Math.min(1.65, Math.max((upper - lower) * 0.52, 1.15));
}

export function clampWalkPosition(position: THREE.Vector3, bounds: THREE.Box3) {
  const size = bounds.getSize(new THREE.Vector3());
  const marginX = Math.max(size.x * 0.025, 0.25);
  const marginZ = Math.max(size.z * 0.025, 0.25);

  position.x = THREE.MathUtils.clamp(
    position.x,
    bounds.min.x - marginX,
    bounds.max.x + marginX,
  );
  position.z = THREE.MathUtils.clamp(
    position.z,
    bounds.min.z - marginZ,
    bounds.max.z + marginZ,
  );
  return position;
}

export function walkStartPosition(bounds: THREE.Box3, floor: number | null) {
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  return clampWalkPosition(
    new THREE.Vector3(
      center.x,
      floorEyeY(bounds, floor),
      center.z + Math.max(size.z * 0.28, 1.5),
    ),
    bounds,
  );
}

export function walkDelta(
  yaw: number,
  direction: WalkDirection,
  distance: number,
) {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  if (direction === "forward") return forward.multiplyScalar(distance);
  if (direction === "back") return forward.multiplyScalar(-distance);
  if (direction === "left") return right.multiplyScalar(-distance);
  return right.multiplyScalar(distance);
}
