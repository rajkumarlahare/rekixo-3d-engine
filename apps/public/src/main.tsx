import React from "react";
import { createRoot } from "react-dom/client";
import {
  FIRST_PROJECT_SLUG,
  PUBLIC_BASE_PATH,
} from "@rekixo/3d-contracts";
import "./styles.css";

function currentSlug() {
  const prefix = `${PUBLIC_BASE_PATH}/`;
  const pathname = window.location.pathname;
  if (!pathname.startsWith(prefix)) return "";
  return decodeURIComponent(pathname.slice(prefix.length).split("/")[0] || "");
}

function App() {
  const slug = currentSlug();
  const knownProject = slug === FIRST_PROJECT_SLUG;

  if (!knownProject) {
    return (
      <main className="not-found">
        <p className="eyebrow">AR3D STUDIO</p>
        <h1>3D project not found</h1>
        <p>The requested 3D project is not published in this foundation build.</p>
      </main>
    );
  }

  return (
    <main className="experience">
      <header>
        <div>
          <p className="eyebrow">AR3D STUDIO</p>
          <h1>Jyoti Paradise</h1>
          <p className="location">Hingna, Nagpur</p>
        </div>
        <span className="phase">Foundation</span>
      </header>

      <section className="viewer-placeholder" aria-label="3D viewer placeholder">
        <div className="building-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="eyebrow">3D EXPERIENCE</p>
          <h2>Viewer slot is isolated and ready.</h2>
          <p>
            The optimized Jyoti Paradise GLB, camera controls, and scene loading
            will be connected after the dedicated Cloudflare D1/R2 resources are
            created.
          </p>
        </div>
      </section>

      <nav className="module-nav" aria-label="Planned 3D modules">
        {[
          "Project Navigation",
          "Section View",
          "Balcony View",
          "Typical Floor",
          "Amenities",
        ].map((label) => (
          <button type="button" disabled key={label}>
            {label}
          </button>
        ))}
      </nav>

      <footer>Public route: {PUBLIC_BASE_PATH}/{FIRST_PROJECT_SLUG}</footer>
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
