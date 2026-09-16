import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { CameraPreset3D } from "@rekixo/3d-contracts";

type ViewerMode = "booting" | "loading" | "model" | "demo" | "error";

interface Viewer3DProps {
  modelUrl?: string;
  cameraPreset?: CameraPreset3D;
  modelLabel?: string;
}

interface HomeView {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

function isMobileDevice() {
  return (
    window.matchMedia("(max-width: 760px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material];
  for (const item of materials) {
    for (const value of Object.values(item)) {
      if (value instanceof THREE.Texture) value.dispose();
    }
    item.dispose();
  }
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry?.dispose();
    if (object.material) disposeMaterial(object.material);
  });
}

function createDemoBuilding() {
  const group = new THREE.Group();
  group.name = "Jyoti Paradise preview geometry";

  const wall = new THREE.MeshStandardMaterial({
    color: 0xe8edf2,
    roughness: 0.72,
    metalness: 0.02,
  });
  const frame = new THREE.MeshStandardMaterial({
    color: 0x26313d,
    roughness: 0.52,
    metalness: 0.12,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x8fc8dd,
    roughness: 0.18,
    metalness: 0,
    transmission: 0.24,
    transparent: true,
    opacity: 0.78,
  });
  const warm = new THREE.MeshStandardMaterial({
    color: 0xf0c3a3,
    emissive: 0x9b4d24,
    emissiveIntensity: 0.22,
    roughness: 0.76,
  });

  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 0.8, 5.2),
    frame,
  );
  podium.position.y = 0.4;
  podium.receiveShadow = true;
  podium.castShadow = true;
  group.add(podium);

  for (let floor = 0; floor < 5; floor += 1) {
    const y = 1.3 + floor * 1.55;

    const core = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 1.35, 4.45),
      wall,
    );
    core.position.y = y;
    core.castShadow = true;
    core.receiveShadow = true;
    group.add(core);

    const balcony = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.18, 1.05),
      frame,
    );
    balcony.position.set(0.7, y - 0.25, 2.55);
    balcony.castShadow = true;
    group.add(balcony);

    const balconyGlow = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 0.72, 0.08),
      warm,
    );
    balconyGlow.position.set(0.7, y + 0.08, 2.09);
    group.add(balconyGlow);

    for (const x of [-2.1, 0, 2.1]) {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.78, 0.08),
        glass,
      );
      windowMesh.position.set(x, y + 0.06, 2.27);
      group.add(windowMesh);
    }

    const sideFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.2, 4.65),
      frame,
    );
    sideFrame.position.set(3.42, y, 0);
    group.add(sideFrame);
  }

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(6.9, 0.35, 4.7),
    frame,
  );
  crown.position.y = 8.75;
  crown.castShadow = true;
  group.add(crown);

  return group;
}

function fitCamera(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): HomeView {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());

  const radius = Math.max(sphere.radius, 1);
  const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = Math.max(radius / Math.sin(halfFov), radius * 2.1);

  const direction = new THREE.Vector3(1, 0.72, 1).normalize();
  const position = sphere.center
    .clone()
    .add(direction.multiplyScalar(distance * 0.72));

  camera.position.copy(position);
  camera.near = Math.max(distance / 1000, 0.01);
  camera.far = Math.max(distance * 30, 250);
  camera.updateProjectionMatrix();

  controls.target.copy(sphere.center);
  controls.minDistance = Math.max(radius * 0.55, 1.5);
  controls.maxDistance = Math.max(radius * 8, 40);
  controls.update();

  return {
    position: camera.position.clone(),
    target: controls.target.clone(),
  };
}

function applyPreset(
  preset: CameraPreset3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): HomeView {
  const position = new THREE.Vector3(...preset.position);
  const target = new THREE.Vector3(...preset.target);

  camera.position.copy(position);
  camera.fov = preset.fov ?? 45;
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  controls.update();

  return { position, target };
}

export function Viewer3D({
  modelUrl,
  cameraPreset,
  modelLabel,
}: Viewer3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [mode, setMode] = useState<ViewerMode>("booting");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const hostElement = hostRef.current;
    if (!hostElement) return;

    let disposed = false;
    let animationFrame = 0;
    let activeObject: THREE.Object3D | undefined;
    let homeView: HomeView | undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111d);
    scene.fog = new THREE.FogExp2(0x07111d, 0.018);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 2000);
    camera.position.set(8, 6, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileDevice(),
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isMobileDevice();
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, isMobileDevice() ? 1.35 : 2),
    );
    renderer.domElement.className = "viewer-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D project viewer");
    hostElement.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.8;
    controls.minPolarAngle = THREE.MathUtils.degToRad(18);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(87);

    const hemi = new THREE.HemisphereLight(0xdcecff, 0x27313b, 2.4);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff4e5, 3.7);
    sun.position.set(8, 14, 10);
    sun.castShadow = renderer.shadowMap.enabled;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x9cc9ff, 1.1);
    fill.position.set(-8, 6, -5);
    scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(16, 72),
      new THREE.MeshStandardMaterial({
        color: 0x0b1925,
        roughness: 0.92,
        metalness: 0.02,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    scene.add(ground);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;

    function updateSize() {
      const width = Math.max(hostElement.clientWidth, 1);
      const height = Math.max(hostElement.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(hostElement);
    updateSize();

    function resetCamera() {
      if (!homeView) return;
      camera.position.copy(homeView.position);
      controls.target.copy(homeView.target);
      controls.update();
    }
    resetRef.current = resetCamera;

    function mountObject(object: THREE.Object3D, usePreset: boolean) {
      if (activeObject) {
        scene.remove(activeObject);
        disposeObject(activeObject);
      }
      activeObject = object;
      scene.add(object);

      homeView =
        usePreset && cameraPreset
          ? applyPreset(cameraPreset, camera, controls)
          : fitCamera(object, camera, controls);
    }

    function mountDemo() {
      if (disposed) return;
      mountObject(createDemoBuilding(), false);
      setProgress(100);
      setMode("demo");
    }

    if (modelUrl) {
      setMode("loading");
      setProgress(2);
      setErrorMessage(undefined);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(
        modelUrl,
        (gltf) => {
          if (disposed) {
            disposeObject(gltf.scene);
            return;
          }

          gltf.scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            object.castShadow = renderer.shadowMap.enabled;
            object.receiveShadow = true;
            if (object.material) {
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
              for (const material of materials) material.needsUpdate = true;
            }
          });

          mountObject(gltf.scene, Boolean(cameraPreset));
          setProgress(100);
          setMode("model");
        },
        (event) => {
          if (!event.total) return;
          const next = Math.min(
            98,
            Math.max(2, Math.round((event.loaded / event.total) * 100)),
          );
          setProgress(next);
        },
        (error) => {
          console.error("3D model load failed", error);
          if (disposed) return;
          setErrorMessage(
            "Approved model asset could not be loaded. Showing safe preview geometry.",
          );
          mountDemo();
        },
      );
    } else {
      setErrorMessage(
        "Approved optimized GLB has not been published yet. Showing preview geometry.",
      );
      mountDemo();
    }

    function render() {
      if (disposed) return;
      animationFrame = window.requestAnimationFrame(render);
      if (document.hidden) return;
      controls.update();
      renderer.render(scene, camera);
    }
    render();

    function handleContextLost(event: Event) {
      event.preventDefault();
      setMode("error");
      setErrorMessage(
        "The browser paused the 3D graphics context. Reload this page to restart the viewer.",
      );
    }

    renderer.domElement.addEventListener(
      "webglcontextlost",
      handleContextLost as EventListener,
      false,
    );

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost as EventListener,
      );
      if (activeObject) {
        scene.remove(activeObject);
        disposeObject(activeObject);
      }
      ground.geometry.dispose();
      disposeMaterial(ground.material);
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      resetRef.current = null;
    };
  }, [modelUrl, cameraPreset]);

  useEffect(() => {
    const update = () => {
      setIsFullscreen(document.fullscreenElement === hostRef.current);
    };
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    const host = hostRef.current;
    if (!host) return;
    if (document.fullscreenElement === host) {
      await document.exitFullscreen();
      return;
    }
    await host.requestFullscreen?.();
  }

  const statusLabel =
    mode === "model"
      ? "Live model"
      : mode === "demo"
        ? "Preview geometry"
        : mode === "loading"
          ? `Loading ${progress}%`
          : mode === "error"
            ? "Viewer paused"
            : "Starting";

  return (
    <div className="viewer-shell" ref={hostRef}>
      <div className="viewer-toolbar" aria-label="3D viewer controls">
        <span className={`viewer-status viewer-status--${mode}`}>
          <i aria-hidden="true" />
          {statusLabel}
        </span>
        <div className="viewer-actions">
          <button
            type="button"
            className="viewer-action"
            onClick={() => resetRef.current?.()}
          >
            Reset view
          </button>
          <button
            type="button"
            className="viewer-action"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </div>

      {(mode === "loading" || mode === "booting") && (
        <div className="viewer-loader" role="status" aria-live="polite">
          <div>
            <span>Preparing 3D experience</span>
            <strong>{progress}%</strong>
          </div>
          <div className="viewer-loader-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {errorMessage && mode !== "loading" && (
        <div className="viewer-notice">
          <strong>{modelLabel ?? "Jyoti Paradise"}</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="viewer-help" aria-hidden="true">
        Drag to rotate · Pinch or wheel to zoom
      </div>
    </div>
  );
}
