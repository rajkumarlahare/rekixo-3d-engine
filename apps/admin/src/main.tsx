import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ADMIN_BASE_PATH,
  FIRST_PROJECT_SLUG,
  type Admin3DProjectStatus,
  type Scene3DType,
} from "@rekixo/3d-contracts";
import "./styles.css";

interface ApiStatus extends Admin3DProjectStatus {
  uploadContract?: {
    recommendedKey: string;
    format: string;
    versionedKeysRequired: boolean;
    maxRecommendedMobileBytes: number;
  };
}

const sourceFiles = [
  ["3D MODEL", "jyoti aprtment model(1).fbx"],
  ["CAD PLAN", "JYOTI APPARTMENT-FIRST FLOOR LEVEL-RC-003(2).dwg"],
  ["D5 SCENE", "JYOTI APPARTMENT D5(2).drs"],
  ["SKETCHUP", "jyoti appartment 1(2).skb"],
  ["BROCHURE", "Jyoti Paradise(2).pdf"],
  ["EXTERIOR", "Bagde flat scheme.max+1(2).jpg"],
] as const;

const moduleOrder: Array<[Scene3DType, string]> = [
  ["project-navigation", "Project Navigation"],
  ["typical-floor", "Typical Floor"],
  ["amenity", "Amenities"],
  ["section", "Section View"],
  ["wing-distance", "Wing Distance"],
  ["balcony", "Balcony View"],
];

function formatBytes(value?: number) {
  if (!value || value <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function App() {
  const [status, setStatus] = useState<ApiStatus>();
  const [error, setError] = useState<string>();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(undefined);
    void fetch(`${ADMIN_BASE_PATH}/api/status?slug=${encodeURIComponent(FIRST_PROJECT_SLUG)}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as ApiStatus & { error?: string };
        if (!response.ok) throw new Error(body.error ?? `Status API failed (${response.status}).`);
        setStatus(body);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Could not load 3D status.");
      });
    return () => controller.abort();
  }, [refresh]);

  const publicUrl = `https://ar3dstudio.in/3Dprojects/${FIRST_PROJECT_SLUG}`;
  const model = status?.activeModel;
  const scenes = useMemo(() => new Map(status?.scenes.map((scene) => [scene.type, scene]) ?? []), [status]);
  const enabledCount = status?.scenes.filter((scene) => scene.enabled).length ?? 0;

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">REKIXO</p><h1>3D Project Engine</h1></div>
        <div className="topbar-actions">
          <span className="route">{ADMIN_BASE_PATH}</span>
          <button type="button" onClick={() => setRefresh((value) => value + 1)}>Refresh</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className={`status status--${status?.project.status ?? "loading"}`}>{status?.project.status ?? "Loading"}</span>
          <h2>{status?.project.name ?? "Jyoti Paradise"}</h2>
          <p>{status?.project.location ?? "Hingna, Nagpur"}</p>
        </div>
        <div className="hero-meta"><small>Public production URL</small><a href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a></div>
      </section>

      {error && <section className="alert"><strong>Status API unavailable</strong><span>{error}</span></section>}

      <section className="health-grid">
        <article><span>DATABASE</span><strong>{status ? "Connected" : "Checking…"}</strong><small>rekixo-3d-production</small></article>
        <article><span>3D STORAGE</span><strong>{status ? "Connected" : "Checking…"}</strong><small>{status?.storage.bucket ?? "rekixo-3d-assets"}</small></article>
        <article><span>ACTIVE MODEL</span><strong>{model?.available ? "Live" : "Upload pending"}</strong><small>{model ? `${model.name} · ${formatBytes(model.byteSize)}` : "Model record loading"}</small></article>
        <article><span>PUBLIC MODULES</span><strong>{enabledCount || "—"}</strong><small>Source-backed modules enabled</small></article>
      </section>

      <section className="asset-panel">
        <div>
          <p className="eyebrow">SUPPLIED SOURCE PACKAGE</p>
          <h3>Project-team files registered</h3>
          <p>The engine now uses only verified material supplied for Jyoti Paradise. Missing section, wing-distance and balcony-view source data stay explicitly disabled instead of being invented.</p>
        </div>
        <dl>
          {sourceFiles.map(([label, file]) => <div key={label}><dt>{label}</dt><dd>{file}</dd></div>)}
        </dl>
      </section>

      <section className="asset-panel">
        <div>
          <p className="eyebrow">WEB ASSET PIPELINE</p>
          <h3>Generated production model</h3>
          <p>The supplied FBX has been converted to a real web GLB using its geometry and diffuse material colours. External texture JPG files were not included, so an exact texture upgrade can be applied later without changing the project URL or data model.</p>
        </div>
        <dl>
          <div><dt>Format</dt><dd>{status?.uploadContract?.format ?? "GLB 2.0"}</dd></div>
          <div><dt>Model R2 key</dt><dd>{status?.uploadContract?.recommendedKey ?? "projects/jyoti-paradise/models/exterior-v1.glb"}</dd></div>
          <div><dt>Exterior render</dt><dd>projects/jyoti-paradise/media/exterior-render-v1.webp</dd></div>
          <div><dt>Floor plan</dt><dd>projects/jyoti-paradise/media/floor-plan-v1.webp</dd></div>
          <div><dt>Brochure cover</dt><dd>projects/jyoti-paradise/media/brochure-cover-v1.webp</dd></div>
        </dl>
      </section>

      <section>
        <div className="section-heading">
          <div><p className="eyebrow">PRODUCTION WORKSPACE</p><h3>Source-controlled modules</h3></div>
          <span className="read-only">Current project protected</span>
        </div>
        <div className="module-grid">
          {moduleOrder.map(([type, label], index) => {
            const scene = scenes.get(type);
            const ready = Boolean(scene?.enabled);
            const settings = (scene?.settings ?? {}) as { reason?: string };
            return (
              <article className={ready ? "module-card module-card--ready" : "module-card"} key={type}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
                <small>{ready ? "Source ready" : settings.reason ?? "Source pending"}</small>
              </article>
            );
          })}
        </div>
      </section>

      <footer>
        <span>Current Rekixo/Tiyansh admin and project routes remain isolated and untouched.</span>
        <span>Binary source assets stay in dedicated Rekixo 3D R2 storage.</span>
      </footer>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root mount node");
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
