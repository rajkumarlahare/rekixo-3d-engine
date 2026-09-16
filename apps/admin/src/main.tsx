import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ADMIN_BASE_PATH,
  FIRST_PROJECT_SLUG,
  type Admin3DProjectStatus,
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

const modules = [
  ["Project", "Live"],
  ["3D Model", "Asset pipeline"],
  ["Scene Builder", "Project navigation"],
  ["Floors & Units", "Queued"],
  ["Camera Views", "Default ready"],
  ["Hotspots", "Queued"],
  ["Media", "Queued"],
  ["Preview", "Live route"],
  ["Publish", "Production"],
] as const;

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

    void fetch(
      `${ADMIN_BASE_PATH}/api/status?slug=${encodeURIComponent(FIRST_PROJECT_SLUG)}`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      },
    )
      .then(async (response) => {
        const body = (await response.json()) as ApiStatus & { error?: string };
        if (!response.ok) {
          throw new Error(body.error ?? `Status API failed (${response.status}).`);
        }
        setStatus(body);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error ? reason.message : "Could not load 3D status.",
        );
      });

    return () => controller.abort();
  }, [refresh]);

  const publicUrl = `https://ar3dstudio.in/3Dprojects/${FIRST_PROJECT_SLUG}`;
  const model = status?.activeModel;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">REKIXO</p>
          <h1>3D Project Engine</h1>
        </div>
        <div className="topbar-actions">
          <span className="route">{ADMIN_BASE_PATH}</span>
          <button type="button" onClick={() => setRefresh((value) => value + 1)}>
            Refresh
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className={`status status--${status?.project.status ?? "loading"}`}>
            {status?.project.status ?? "Loading"}
          </span>
          <h2>{status?.project.name ?? "Jyoti Paradise"}</h2>
          <p>{status?.project.location ?? "Hingna, Nagpur"}</p>
        </div>
        <div className="hero-meta">
          <small>Public production URL</small>
          <a href={publicUrl} target="_blank" rel="noreferrer">
            {publicUrl}
          </a>
        </div>
      </section>

      {error && (
        <section className="alert">
          <strong>Status API unavailable</strong>
          <span>{error}</span>
        </section>
      )}

      <section className="health-grid">
        <article>
          <span>DATABASE</span>
          <strong>{status ? "Connected" : "Checking…"}</strong>
          <small>rekixo-3d-production</small>
        </article>
        <article>
          <span>3D STORAGE</span>
          <strong>{status ? "Connected" : "Checking…"}</strong>
          <small>{status?.storage.bucket ?? "rekixo-3d-assets"}</small>
        </article>
        <article>
          <span>ACTIVE MODEL</span>
          <strong>{model?.available ? "Ready" : "Pending GLB"}</strong>
          <small>
            {model
              ? `${model.name} · ${formatBytes(model.byteSize)}`
              : "No active model record yet"}
          </small>
        </article>
        <article>
          <span>SCENES</span>
          <strong>{status?.scenes.length ?? "—"}</strong>
          <small>Enabled project modules</small>
        </article>
      </section>

      <section className="asset-panel">
        <div>
          <p className="eyebrow">PRODUCTION ASSET PIPELINE</p>
          <h3>Approved model delivery</h3>
          <p>
            Raw FBX / SKP / D5 files stay outside Git. The web viewer accepts a
            versioned, optimized GLB in the dedicated R2 bucket.
          </p>
        </div>
        <dl>
          <div>
            <dt>Required format</dt>
            <dd>{status?.uploadContract?.format ?? "GLB 2.0"}</dd>
          </div>
          <div>
            <dt>Recommended R2 key</dt>
            <dd>
              {status?.uploadContract?.recommendedKey ??
                "projects/jyoti-paradise/models/exterior-v1.glb"}
            </dd>
          </div>
          <div>
            <dt>Mobile target</dt>
            <dd>
              ≤{" "}
              {formatBytes(
                status?.uploadContract?.maxRecommendedMobileBytes ?? 25_000_000,
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">PRODUCTION WORKSPACE</p>
            <h3>Project modules</h3>
          </div>
          <span className="read-only">Safe read-only admin status</span>
        </div>

        <div className="module-grid">
          {modules.map(([module, state], index) => (
            <article
              className={index < 3 || index > 7 ? "module-card module-card--ready" : "module-card"}
              key={module}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{module}</strong>
              <small>{state}</small>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <span>Current Rekixo/Tiyansh admin remains isolated and untouched.</span>
        <span>Writes stay disabled until 3D admin authentication is wired.</span>
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
