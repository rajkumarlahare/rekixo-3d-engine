import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { CameraPreset3D } from "@rekixo/3d-contracts";
import { createFloorExploder, enhanceArchitecturalModel } from "./realism";

type ViewerMode = "booting" | "loading" | "model" | "demo" | "error";

interface Viewer3DProps {
  modelUrl?: string;
  cameraPreset?: CameraPreset3D;
  modelLabel?: string;
  interactionMode?: "section" | "detail";
}

interface HomeView {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
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
    disposeMaterial(object.material);
  });
}

function createPreviewBuilding() {
  const group = new THREE.Group();
  group.name = "Rekixo AR3D preview geometry";

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

  const podium = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.8, 5.2), frame);
  podium.position.y = 0.4;
  podium.castShadow = true;
  podium.receiveShadow = true;
  group.add(podium);

  for (let floor = 0; floor < 5; floor += 1) {
    const y = 1.3 + floor * 1.55;

    const core = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.35, 4.45), wall);
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

    const glow = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.72, 0.08), warm);
    glow.position.set(0.7, y + 0.08, 2.09);
    group.add(glow);

    for (const x of [-2.1, 0, 2.1]) {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.78, 0.08),
        glass,
      );
      windowMesh.position.set(x, y + 0.06, 2.27);
      group.add(windowMesh);
    }
  }

  const crown = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.35, 4.7), frame);
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

  camera.position.copy(
    sphere.center.clone().add(direction.multiplyScalar(distance * 0.72)),
  );
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
    fov: camera.fov,
  };
}

function applyPreset(
  preset: CameraPreset3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): HomeView {
  const position = new THREE.Vector3(...preset.position);
  const target = new THREE.Vector3(...preset.target);
  const fov = preset.fov ?? 45;

  camera.position.copy(position);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  controls.update();

  return { position, target, fov };
}

export function Viewer3D({
  modelUrl,
  cameraPreset,
  modelLabel,
  interactionMode,
}: Viewer3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const floorRef = useRef<((floor: number | null) => void) | null>(null);
  const sectionRef = useRef<((enabled: boolean) => void) | null>(null);
  const lightingRef = useRef<((night: boolean) => void) | null>(null);
  const explodeRef = useRef<((enabled: boolean) => void) | null>(null);
  const [mode, setMode] = useState<ViewerMode>("booting");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [sectionEnabled, setSectionEnabled] = useState(interactionMode === "section");
  const [nightMode, setNightMode] = useState(false);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const candidate = hostRef.current;
    if (candidate === null) return;
    const hostElement: HTMLDivElement = candidate;

    let disposed = false;
    let animationFrame = 0;
    let activeObject: THREE.Object3D | undefined;
    let homeView: HomeView | undefined;
    let floorExploder: ReturnType<typeof createFloorExploder> | undefined;

    const mobile = isMobileDevice();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111d);
    scene.fog = new THREE.FogExp2(0x07111d, 0.018);
    let modelBounds: THREE.Box3 | undefined;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 2000);
    camera.position.set(8, 6, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: !mobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 2));
    renderer.domElement.className = "viewer-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D project viewer");
    hostElement.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.82;
    controls.panSpeed = 0.65;
    controls.screenSpacePanning = true;
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

    const warmFill = new THREE.PointLight(0xffa35c, 0, 120, 1.5);
    warmFill.position.set(0, 18, 18);
    scene.add(warmFill);

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b1925,
      roughness: 0.92,
      metalness: 0.02,
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 72), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    scene.add(ground);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environmentTexture;
    scene.environmentIntensity = 1.08;

    const updateSize = () => {
      const width = Math.max(hostElement.clientWidth, 1);
      const height = Math.max(hostElement.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(hostElement);
    updateSize();

    const resetCamera = () => {
      if (!homeView) return;
      camera.position.copy(homeView.position);
      camera.fov = homeView.fov;
      camera.updateProjectionMatrix();
      controls.target.copy(homeView.target);
      controls.update();
    };
    resetRef.current = resetCamera;

    const applyFloor = (floor: number | null) => {
      if (!modelBounds) return;
      if (floor === null) {
        renderer.clippingPlanes = sectionEnabledRef.current ? renderer.clippingPlanes.filter((plane) => Math.abs(plane.normal.x) > 0.5) : [];
        return;
      }
      const minY = modelBounds.min.y;
      const height = Math.max(modelBounds.max.y - modelBounds.min.y, 1);
      const lowerRatio = floor === 0 ? 0 : 0.12 + (floor - 1) * 0.132;
      const upperRatio = floor === 0 ? 0.12 : 0.12 + floor * 0.132;
      const lower = minY + height * lowerRatio;
      const upper = minY + height * Math.min(upperRatio, 0.79);
      const sectionPlanes = sectionEnabledRef.current
        ? renderer.clippingPlanes.filter((plane) => Math.abs(plane.normal.x) > 0.5)
        : [];
      renderer.clippingPlanes = [
        ...sectionPlanes,
        new THREE.Plane(new THREE.Vector3(0, 1, 0), -lower),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), upper),
      ];
    };

    const sectionEnabledRef = { current: interactionMode === "section" };

    const applySection = (enabled: boolean) => {
      sectionEnabledRef.current = enabled;
      if (!modelBounds) return;
      const centerX = (modelBounds.min.x + modelBounds.max.x) / 2;
      const floorPlanes = renderer.clippingPlanes.filter((plane) => Math.abs(plane.normal.y) > 0.5);
      renderer.clippingPlanes = enabled
        ? [...floorPlanes, new THREE.Plane(new THREE.Vector3(-1, 0, 0), centerX)]
        : floorPlanes;
    };

    const applyLighting = (night: boolean) => {
      scene.background = new THREE.Color(night ? 0x020713 : 0x07111d);
      scene.fog = new THREE.FogExp2(night ? 0x020713 : 0x07111d, night ? 0.012 : 0.018);
      hemi.intensity = night ? 0.75 : 2.4;
      sun.intensity = night ? 0.9 : 3.7;
      fill.intensity = night ? 0.55 : 1.1;
      warmFill.intensity = night ? 16 : 0;
      renderer.toneMappingExposure = night ? 1.18 : 1.05;
    };

    floorRef.current = applyFloor;
    sectionRef.current = applySection;
    lightingRef.current = applyLighting;

    const mountObject = (object: THREE.Object3D, usePreset: boolean) => {
      if (activeObject) {
        scene.remove(activeObject);
        disposeObject(activeObject);
      }
      activeObject = object;
      scene.add(object);
      object.updateMatrixWorld(true);
      modelBounds = new THREE.Box3().setFromObject(object);
      enhanceArchitecturalModel(object, renderer);
      floorExploder = createFloorExploder(object, modelBounds);
      explodeRef.current = (enabled) => floorExploder?.setExploded(enabled);

      const size = modelBounds.getSize(new THREE.Vector3());
      const groundSize = Math.max(size.x, size.z, 12);
      ground.scale.setScalar(Math.max(1, groundSize / 20));
      ground.position.y = modelBounds.min.y - Math.max(size.y * 0.002, 0.02);

      homeView =
        usePreset && cameraPreset
          ? applyPreset(cameraPreset, camera, controls)
          : fitCamera(object, camera, controls);

      if (interactionMode === "detail") {
        const sphere = modelBounds.getBoundingSphere(new THREE.Sphere());
        const direction = new THREE.Vector3(1, 0.25, 1).normalize();
        camera.position.copy(sphere.center.clone().add(direction.multiplyScalar(Math.max(sphere.radius * 1.35, 4))));
        controls.target.copy(sphere.center.clone().add(new THREE.Vector3(0, sphere.radius * 0.08, 0)));
        controls.update();
      }
      if (interactionMode === "section") applySection(true);
    };

    const mountPreview = (message: string) => {
      if (disposed) return;
      mountObject(createPreviewBuilding(), false);
      setErrorMessage(message);
      setProgress(100);
      setMode("demo");
    };

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

          mountObject(gltf.scene, Boolean(cameraPreset));
          setProgress(100);
          setMode("model");
        },
        (event) => {
          if (!event.total) return;
          setProgress(
            Math.min(98, Math.max(2, Math.round((event.loaded / event.total) * 100))),
          );
        },
        (error) => {
          console.error("3D model load failed", error);
          mountPreview(
            "Approved model asset could not be loaded. Showing safe preview geometry.",
          );
        },
      );
    } else {
      mountPreview(
        "Approved optimized GLB has not been published yet. Showing preview geometry.",
      );
    }

    const render = () => {
      if (disposed) return;
      animationFrame = window.requestAnimationFrame(render);
      if (document.hidden) return;
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setMode("error");
      setErrorMessage(
        "The browser paused the 3D graphics context. Reload this page to restart the viewer.",
      );
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      if (activeObject) disposeObject(activeObject);
      ground.geometry.dispose();
      groundMaterial.dispose();
      environmentTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      resetRef.current = null;
      floorRef.current = null;
      sectionRef.current = null;
      lightingRef.current = null;
      explodeRef.current = null;
    };
  }, [modelUrl, cameraPreset, interactionMode]);

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
            Reset
          </button>
          <button
            type="button"
            className={nightMode ? "viewer-action viewer-action--active" : "viewer-action"}
            onClick={() => {
              const next = !nightMode;
              setNightMode(next);
              lightingRef.current?.(next);
            }}
          >
            {nightMode ? "Day" : "Night"}
          </button>
          <button
            type="button"
            className={exploded ? "viewer-action viewer-action--active" : "viewer-action"}
            onClick={() => {
              const next = !exploded;
              setExploded(next);
              explodeRef.current?.(next);
            }}
          >
            Explode
          </button>
          <button
            type="button"
            className={sectionEnabled ? "viewer-action viewer-action--active" : "viewer-action"}
            onClick={() => {
              const next = !sectionEnabled;
              setSectionEnabled(next);
              sectionRef.current?.(next);
            }}
          >
            Section
          </button>
          <button
            type="button"
            className="viewer-action"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? "Exit" : "Full screen"}
          </button>
        </div>
      </div>

      <div className="viewer-floor-controls" aria-label="Building floor selector">
        <button
          type="button"
          className={selectedFloor === null ? "viewer-floor viewer-floor--active" : "viewer-floor"}
          onClick={() => {
            setSelectedFloor(null);
            floorRef.current?.(null);
          }}
        >
          All
        </button>
        {[0,1,2,3,4,5].map((floor) => (
          <button
            type="button"
            key={floor}
            className={selectedFloor === floor ? "viewer-floor viewer-floor--active" : "viewer-floor"}
            onClick={() => {
              setSelectedFloor(floor);
              floorRef.current?.(floor);
            }}
          >
            {floor === 0 ? "Ground" : `F${floor}`}
          </button>
        ))}
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
          <strong>{modelLabel ?? "3D Project"}</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="viewer-help" aria-hidden="true">
        Drag to rotate · Two-finger/secondary drag to pan · Pinch or wheel to zoom
      </div>
    </div>
  );
}
