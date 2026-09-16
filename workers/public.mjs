const BASE_PATH = "/3Dprojects";
const MODEL_ROUTE_PREFIX = `${BASE_PATH}/api/models/`;

const SECURITY_HEADERS = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function json(value, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  for (const [key, item] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, item);
  }
  return new Response(JSON.stringify(value), { ...init, headers });
}

function parseJson(value, fallback) {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function getProjectExperience(env, slug) {
  const project = await env.DB.prepare(
    `SELECT id, slug, name, location, status, cover_asset_key
       FROM projects_3d
      WHERE slug = ? AND status = 'published'
      LIMIT 1`,
  )
    .bind(slug)
    .first();

  if (!project) return null;

  const [scene, defaultCamera, model] = await Promise.all([
    env.DB.prepare(
      `SELECT id, project_id, name, type, model_id, camera_preset_id,
              settings_json, sort_order, enabled
         FROM scenes_3d
        WHERE project_id = ? AND enabled = 1
        ORDER BY sort_order ASC, id ASC
        LIMIT 1`,
    )
      .bind(project.id)
      .first(),
    env.DB.prepare(
      `SELECT id, project_id, name, position_json, target_json, fov
         FROM camera_presets_3d
        WHERE project_id = ? AND is_default = 1
        LIMIT 1`,
    )
      .bind(project.id)
      .first(),
    env.DB.prepare(
      `SELECT id, project_id, name, asset_key, source_filename, mime_type,
              byte_size, version
         FROM models_3d
        WHERE project_id = ? AND is_active = 1
        ORDER BY version DESC
        LIMIT 1`,
    )
      .bind(project.id)
      .first(),
  ]);

  let sceneCamera = null;
  if (scene?.camera_preset_id && scene.camera_preset_id !== defaultCamera?.id) {
    sceneCamera = await env.DB.prepare(
      `SELECT id, project_id, name, position_json, target_json, fov
         FROM camera_presets_3d
        WHERE id = ? AND project_id = ?
        LIMIT 1`,
    )
      .bind(scene.camera_preset_id, project.id)
      .first();
  }

  const selectedCamera = sceneCamera ?? defaultCamera;
  let modelPayload;

  if (model) {
    const object = await env.MODEL_ASSETS.head(model.asset_key);
    const available = Boolean(object);
    modelPayload = {
      id: model.id,
      projectId: model.project_id,
      name: model.name,
      version: Number(model.version || 1),
      byteSize: object?.size ?? model.byte_size ?? undefined,
      sourceFilename: model.source_filename ?? undefined,
      mimeType: model.mime_type || "model/gltf-binary",
      available,
      url: available
        ? `${BASE_PATH}/api/models/${encodeURIComponent(model.id)}/content`
        : undefined,
    };
  }

  return {
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      location: project.location ?? undefined,
      status: project.status,
      coverAssetKey: project.cover_asset_key ?? undefined,
    },
    scene: scene
      ? {
          id: scene.id,
          projectId: scene.project_id,
          name: scene.name,
          type: scene.type,
          modelId: scene.model_id ?? undefined,
          cameraPresetId: scene.camera_preset_id ?? undefined,
          sortOrder: Number(scene.sort_order || 0),
          enabled: Boolean(scene.enabled),
          settings: parseJson(scene.settings_json, {}),
        }
      : undefined,
    camera: selectedCamera
      ? {
          id: selectedCamera.id,
          projectId: selectedCamera.project_id,
          name: selectedCamera.name,
          position: parseJson(selectedCamera.position_json, [8, 6, 9]),
          target: parseJson(selectedCamera.target_json, [0, 2.5, 0]),
          fov: Number(selectedCamera.fov || 42),
        }
      : undefined,
    model: modelPayload,
  };
}

async function serveModel(env, modelId, request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "Method not allowed." }, { status: 405 });
  }

  const model = await env.DB.prepare(
    `SELECT m.asset_key, m.mime_type, m.version, m.byte_size
       FROM models_3d m
       JOIN projects_3d p ON p.id = m.project_id
      WHERE m.id = ?
        AND m.is_active = 1
        AND p.status = 'published'
      LIMIT 1`,
  )
    .bind(modelId)
    .first();

  if (!model) {
    return json({ error: "Model not found." }, { status: 404 });
  }

  const object =
    request.method === "HEAD"
      ? await env.MODEL_ASSETS.head(model.asset_key)
      : await env.MODEL_ASSETS.get(model.asset_key);

  if (!object) {
    return json({ error: "Model asset is not available." }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata?.(headers);
  headers.set("Content-Type", model.mime_type || "model/gltf-binary");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");

  if (request.method === "HEAD") {
    headers.set("Content-Length", String(object.size));
    return new Response(null, { status: 200, headers });
  }

  return new Response(object.body, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(`${BASE_PATH}/api/projects/`)) {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed." }, { status: 405 });
      }

      const slug = decodeURIComponent(
        url.pathname.slice(`${BASE_PATH}/api/projects/`.length),
      )
        .split("/")[0]
        ?.trim();

      if (!slug) {
        return json({ error: "Project slug is required." }, { status: 400 });
      }

      const experience = await getProjectExperience(env, slug);
      if (!experience) {
        return json(
          { error: "This 3D project is not currently published." },
          { status: 404 },
        );
      }

      return json(experience);
    }

    if (
      url.pathname.startsWith(MODEL_ROUTE_PREFIX) &&
      url.pathname.endsWith("/content")
    ) {
      const modelId = decodeURIComponent(
        url.pathname
          .slice(MODEL_ROUTE_PREFIX.length, -"/content".length)
          .replace(/\/+$/, ""),
      );

      if (!modelId) {
        return json({ error: "Model id is required." }, { status: 400 });
      }

      return serveModel(env, modelId, request);
    }

    return addSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
