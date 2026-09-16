-- Rekixo 3D Engine — Jyoti Paradise production viewer defaults
-- This migration publishes only the isolated 3D project metadata.
-- No existing Tiyansh/Rekixo resources are touched.

UPDATE projects_3d
   SET status = 'published',
       updated_at = datetime('now')
 WHERE id = 'project_jyoti_paradise';

INSERT OR IGNORE INTO camera_presets_3d (
  id,
  project_id,
  name,
  position_json,
  target_json,
  fov,
  is_default
) VALUES (
  'camera_jyoti_exterior_home',
  'project_jyoti_paradise',
  'Exterior Home',
  '[8,6,9]',
  '[0,2.5,0]',
  42,
  1
);

INSERT OR IGNORE INTO scenes_3d (
  id,
  project_id,
  name,
  type,
  model_id,
  camera_preset_id,
  settings_json,
  sort_order,
  enabled
) VALUES (
  'scene_jyoti_project_navigation',
  'project_jyoti_paradise',
  'Project Navigation',
  'project-navigation',
  NULL,
  'camera_jyoti_exterior_home',
  '{"background":"night-neutral","controls":{"rotate":true,"zoom":true,"pan":false}}',
  10,
  1
);
