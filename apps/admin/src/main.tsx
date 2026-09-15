import React from "react";
import { createRoot } from "react-dom/client";
import {
  ADMIN_BASE_PATH,
  FIRST_PROJECT_SLUG,
  type Project3D,
} from "@rekixo/3d-contracts";
import "./styles.css";

const project: Project3D = {
  id: "jyoti-paradise",
  slug: FIRST_PROJECT_SLUG,
  name: "Jyoti Paradise",
  location: "Hingna, Nagpur",
  status: "draft",
};

const modules = [
  "Project",
  "3D Model",
  "Scene Builder",
  "Floors & Units",
  "Camera Views",
  "Hotspots",
  "Media",
  "Preview",
  "Publish",
];

function App() {
  const publicUrl = `https://ar3dstudio.in/3Dprojects/${project.slug}`;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">REKIXO</p>
          <h1>3D Project Engine</h1>
        </div>
        <span className="route">{ADMIN_BASE_PATH}</span>
      </header>

      <section className="hero">
        <div>
          <span className="status">Draft</span>
          <h2>{project.name}</h2>
          <p>{project.location}</p>
        </div>
        <div className="hero-meta">
          <small>Public URL</small>
          <strong>{publicUrl}</strong>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">PHASE 1 FOUNDATION</p>
            <h3>Project workspace</h3>
          </div>
          <button type="button" disabled>
            + New 3D Project
          </button>
        </div>

        <div className="module-grid">
          {modules.map((module, index) => (
            <article className="module-card" key={module}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{module}</strong>
              <small>{index === 0 ? "Foundation ready" : "Next phase"}</small>
            </article>
          ))}
        </div>
      </section>

      <footer>
        Current Rekixo/Tiyansh admin remains isolated and untouched.
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
