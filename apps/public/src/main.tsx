import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  FIRST_PROJECT_SLUG,
  PUBLIC_BASE_PATH,
  type Public3DExperience,
  type Scene3D,
  type Scene3DType,
} from "@rekixo/3d-contracts";
import { loadPublicExperience } from "./api";
import { Viewer3D } from "./viewer/Viewer3D";
import "./styles.css";

function currentSlug() {
  const prefix = `${PUBLIC_BASE_PATH}/`;
  const pathname = window.location.pathname;
  if (!pathname.startsWith(prefix)) return "";
  return decodeURIComponent(pathname.slice(prefix.length).split("/")[0] || "");
}

type UnitFact = { series: string; type: string; areaSqFt: number };
type NearbyFact = { name: string; distance: string };

type ProjectSettings = {
  status?: string;
  headline?: string;
  brochurePrice?: string;
  exteriorRenderKey?: string;
  brochureCoverKey?: string;
  modelNote?: string;
};

type FloorSettings = {
  status?: string;
  title?: string;
  mediaKey?: string;
  units?: UnitFact[];
};

type AmenitySettings = {
  status?: string;
  amenities?: string[];
  nearby?: NearbyFact[];
};

type PendingSettings = {
  status?: string;
  reason?: string;
};

const moduleOrder: Array<[Scene3DType, string]> = [
  ["project-navigation", "Project Navigation"],
  ["typical-floor", "Typical Floor"],
  ["amenity", "Amenities"],
  ["section", "Section View"],
  ["wing-distance", "Wing Distance"],
  ["balcony", "Balcony View"],
];

function sceneOf(experience: Public3DExperience, type: Scene3DType) {
  return experience.scenes?.find((scene) => scene.type === type);
}

function settingsOf<T>(scene?: Scene3D) {
  return (scene?.settings ?? {}) as T;
}

function mediaUrl(experience: Public3DExperience, key?: string) {
  if (!key || !experience.mediaBaseUrl) return undefined;
  const fileName = key.split("/").pop();
  return fileName ? `${experience.mediaBaseUrl}/${encodeURIComponent(fileName)}` : undefined;
}

function MediaImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`media-placeholder ${className ?? ""}`}>
        <strong>Media prepared</strong>
        <span>Upload the generated production asset to Rekixo 3D storage to publish it here.</span>
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

function LoadingPage() {
  return (
    <main className="loading-page">
      <div className="brand-mark" aria-hidden="true">AR</div>
      <p className="eyebrow">AR3D STUDIO</p>
      <h1>Preparing 3D project</h1>
      <div className="loading-line" />
    </main>
  );
}

function NotFound({ message }: { message?: string }) {
  return (
    <main className="not-found">
      <p className="eyebrow">AR3D STUDIO</p>
      <h1>3D project unavailable</h1>
      <p>{message ?? "The requested project is not currently published."}</p>
    </main>
  );
}

function ProjectNavigation({ experience }: { experience: Public3DExperience }) {
  const { model, camera } = experience;
  const settings = settingsOf<ProjectSettings>(sceneOf(experience, "project-navigation"));
  const render = mediaUrl(experience, settings.exteriorRenderKey);

  return (
    <>
      <section className="viewer-section">
        <Viewer3D
          modelUrl={model?.available ? model.url : undefined}
          cameraPreset={camera}
          modelLabel={model?.name}
        />
      </section>

      <section className="project-overview">
        <div className="overview-copy">
          <p className="eyebrow">PROJECT OVERVIEW</p>
          <h2>{settings.headline ?? "2 BHK Flats"}</h2>
          <p>
            Jyoti Paradise is presented from the supplied project model, brochure,
            first-floor drawing and approved exterior reference. Interactive modules
            only publish facts available in the supplied source package.
          </p>
          <div className="fact-row">
            <div><span>Brochure offer</span><strong>{settings.brochurePrice ?? "₹34 Lakh"}</strong></div>
            <div><span>Location</span><strong>{experience.project.location ?? "Hingna, Nagpur"}</strong></div>
            <div><span>Model</span><strong>{model?.available ? "Live 3D" : "Web asset ready"}</strong></div>
          </div>
        </div>
        <MediaImage src={render} alt="Jyoti Paradise exterior architectural render" className="exterior-reference" />
      </section>

      <section className="source-note">
        <span>MODEL STATUS</span>
        <strong>{model?.available ? `${model.name} · v${model.version}` : "Converted web GLB ready for storage upload"}</strong>
        <p>{settings.modelNote ?? "The supplied FBX geometry is supported; exact external texture images were not included in the source package."}</p>
      </section>
    </>
  );
}

function TypicalFloor({ experience }: { experience: Public3DExperience }) {
  const scene = sceneOf(experience, "typical-floor");
  const settings = settingsOf<FloorSettings>(scene);
  const floorPlan = mediaUrl(experience, settings.mediaKey);
  const units = settings.units ?? [];

  return (
    <section className="content-module">
      <div className="module-copy">
        <p className="eyebrow">SUPPLIED FLOOR PLAN</p>
        <h2>{settings.title ?? "Typical Floor"}</h2>
        <p>The unit series and areas below are reproduced from the supplied Jyoti Paradise brochure.</p>
      </div>
      <div className="floor-layout">
        <MediaImage src={floorPlan} alt="Jyoti Paradise supplied floor plan" className="floor-plan-image" />
        <div className="unit-grid">
          {units.map((unit) => (
            <article className="unit-card" key={unit.series}>
              <span>FLAT SERIES</span>
              <strong>{unit.series}</strong>
              <p>{unit.type}</p>
              <b>{unit.areaSqFt.toLocaleString("en-IN")} Sq. Ft.</b>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Amenities({ experience }: { experience: Public3DExperience }) {
  const settings = settingsOf<AmenitySettings>(sceneOf(experience, "amenity"));
  return (
    <section className="content-module">
      <div className="module-copy">
        <p className="eyebrow">BROCHURE INFORMATION</p>
        <h2>Amenities & nearby locations</h2>
        <p>Only items printed in the supplied brochure are shown here.</p>
      </div>
      <div className="amenity-columns">
        <div>
          <h3>Amenities</h3>
          <div className="chip-grid">
            {(settings.amenities ?? []).map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div>
          <h3>Nearby</h3>
          <div className="nearby-list">
            {(settings.nearby ?? []).map((item) => (
              <div key={item.name}><strong>{item.name}</strong><span>{item.distance}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PendingModule({ type, experience }: { type: Scene3DType; experience: Public3DExperience }) {
  const allScenes = experience.scenes ?? [];
  const scene = allScenes.find((item) => item.type === type);
  const settings = settingsOf<PendingSettings>(scene);
  const label = moduleOrder.find(([item]) => item === type)?.[1] ?? "Module";
  return (
    <section className="content-module pending-module">
      <p className="eyebrow">SOURCE CONTROLLED</p>
      <h2>{label}</h2>
      <p>{settings.reason ?? "A verified source asset for this module was not included in the supplied project files, so Rekixo does not fabricate it."}</p>
    </section>
  );
}

function App() {
  const slug = useMemo(currentSlug, []);
  const [experience, setExperience] = useState<Public3DExperience>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [activeType, setActiveType] = useState<Scene3DType>("project-navigation");

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setError(undefined);
    void loadPublicExperience(slug, controller.signal)
      .then(setExperience)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Could not load the 3D project.");
      });
    return () => controller.abort();
  }, [slug, attempt]);

  if (!slug) return <NotFound />;
  if (error) {
    return (
      <main className="not-found">
        <p className="eyebrow">AR3D STUDIO</p>
        <h1>3D experience could not start</h1>
        <p>{error}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
      </main>
    );
  }
  if (!experience) return <LoadingPage />;

  const sceneMap = new Map((experience.scenes ?? []).map((scene) => [scene.type, scene]));
  const activeScene = sceneMap.get(activeType);
  const activeReady = Boolean(activeScene?.enabled);

  return (
    <main className="experience">
      <header className="project-header">
        <a className="brand" href="https://ar3dstudio.in" aria-label="AR3D Studio home">
          <span>AR</span>
          <div><strong>AR3D STUDIO</strong><small>Interactive Real Estate</small></div>
        </a>
        <div className="project-heading">
          <p className="eyebrow">3D PROJECT EXPERIENCE</p>
          <h1>{experience.project.name}</h1>
          <p className="location">{experience.project.location}</p>
        </div>
        <span className="production-badge"><i aria-hidden="true" />Production</span>
      </header>

      <nav className="module-nav" aria-label="3D project modules">
        {moduleOrder.map(([type, label], index) => {
          const scene = sceneMap.get(type);
          const ready = Boolean(scene?.enabled);
          return (
            <button
              type="button"
              className={activeType === type ? "module module--active" : "module"}
              onClick={() => setActiveType(type)}
              key={type}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <small>{ready ? "Available" : "Source pending"}</small>
            </button>
          );
        })}
      </nav>

      <div className="module-stage" key={activeType}>
        {activeType === "project-navigation" && <ProjectNavigation experience={experience} />}
        {activeType === "typical-floor" && <TypicalFloor experience={experience} />}
        {activeType === "amenity" && <Amenities experience={experience} />}
        {!activeReady && <PendingModule type={activeType} experience={experience} />}
      </div>

      <footer>
        <span>AR3D Studio · Rekixo 3D Engine</span>
        <span>{PUBLIC_BASE_PATH}/{FIRST_PROJECT_SLUG}</span>
      </footer>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root mount node");
createRoot(root).render(
  <React.StrictMode><App /></React.StrictMode>,
);
