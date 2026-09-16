import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  FIRST_PROJECT_SLUG,
  PUBLIC_BASE_PATH,
  type Public3DExperience,
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

const moduleLabels = [
  ["Project Navigation", "Live"],
  ["Section View", "Coming next"],
  ["Wing Distance", "Coming next"],
  ["Balcony View", "Coming next"],
  ["Typical Floor", "Coming next"],
  ["Amenities", "Coming next"],
] as const;

function LoadingPage() {
  return (
    <main className="loading-page">
      <div className="brand-mark" aria-hidden="true">
        AR
      </div>
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

function App() {
  const slug = useMemo(currentSlug, []);
  const [experience, setExperience] = useState<Public3DExperience>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setError(undefined);

    void loadPublicExperience(slug, controller.signal)
      .then(setExperience)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load the 3D project.",
        );
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
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Try again
        </button>
      </main>
    );
  }
  if (!experience) return <LoadingPage />;

  const { project, model, camera } = experience;

  return (
    <main className="experience">
      <header className="project-header">
        <a
          className="brand"
          href="https://ar3dstudio.in"
          aria-label="AR3D Studio home"
        >
          <span>AR</span>
          <div>
            <strong>AR3D STUDIO</strong>
            <small>Interactive Real Estate</small>
          </div>
        </a>

        <div className="project-heading">
          <p className="eyebrow">3D PROJECT EXPERIENCE</p>
          <h1>{project.name}</h1>
          <p className="location">{project.location}</p>
        </div>

        <span className="production-badge">
          <i aria-hidden="true" />
          Production
        </span>
      </header>

      <section className="viewer-section">
        <Viewer3D
          modelUrl={model?.available ? model.url : undefined}
          cameraPreset={camera}
          modelLabel={model?.name}
        />
      </section>

      <section className="experience-info">
        <div>
          <p className="eyebrow">EXPLORE</p>
          <h2>One project. Every view.</h2>
          <p>
            The viewer is built for touch screens, desktop browsers and mobile
            devices. Project modules load independently so the experience stays
            fast as more scenes are published.
          </p>
        </div>

        <div className="model-card">
          <span>MODEL STATUS</span>
          <strong>
            {model?.available
              ? `${model.name} · v${model.version}`
              : "Approved web model pending"}
          </strong>
          <small>
            {model?.available
              ? "Optimized GLB delivered from dedicated 3D storage."
              : "The engine is live; preview geometry is shown until the approved GLB is uploaded."}
          </small>
        </div>
      </section>

      <nav className="module-nav" aria-label="3D project modules">
        {moduleLabels.map(([label, state], index) => (
          <button
            type="button"
            className={index === 0 ? "module module--active" : "module"}
            disabled={index !== 0}
            key={label}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
            <small>{state}</small>
          </button>
        ))}
      </nav>

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
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
