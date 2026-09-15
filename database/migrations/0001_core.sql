-- Rekixo 3D Engine — Phase 1 core schema
-- Database: rekixo-3d-production

CREATE TABLE IF NOT EXISTS projects_3d (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  cover_asset_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS models_3d (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_key TEXT NOT NULL,
  source_filename TEXT,
  mime_type TEXT NOT NULL DEFAULT 'model/gltf-binary',
  byte_size INTEGER,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  transform_json TEXT NOT NULL DEFAULT '{"position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1]}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects_3d(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS camera_presets_3d (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position_json TEXT NOT NULL,
  target_json TEXT NOT NULL,
  fov REAL NOT NULL DEFAULT 45,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects_3d(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scenes_3d (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN (
      'project-navigation',
      'section',
      'wing-distance',
      'balcony',
      'typical-floor',
      'amenity'
    )),
  model_id TEXT,
  camera_preset_id TEXT,
  settings_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects_3d(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES models_3d(id) ON DELETE SET NULL,
  FOREIGN KEY (camera_preset_id) REFERENCES camera_presets_3d(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS publish_versions_3d (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects_3d(id) ON DELETE CASCADE,
  UNIQUE (project_id, version)
);

CREATE INDEX IF NOT EXISTS idx_models_3d_project
  ON models_3d(project_id, version DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_models_3d_one_active
  ON models_3d(project_id)
  WHERE is_active = 1;

CREATE INDEX IF NOT EXISTS idx_camera_presets_3d_project
  ON camera_presets_3d(project_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_camera_presets_3d_one_default
  ON camera_presets_3d(project_id)
  WHERE is_default = 1;

CREATE INDEX IF NOT EXISTS idx_scenes_3d_project_sort
  ON scenes_3d(project_id, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_publish_versions_3d_project
  ON publish_versions_3d(project_id, version DESC);

INSERT OR IGNORE INTO projects_3d (
  id,
  slug,
  name,
  location,
  status
) VALUES (
  'project_jyoti_paradise',
  'jyoti-paradise',
  'Jyoti Paradise',
  'Hingna, Nagpur',
  'draft'
);
