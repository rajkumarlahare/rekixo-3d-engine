-- Jyoti Paradise realism V4.
-- Source-faithful visual tuning only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v4',
     '$.presentation.visualProfile', 'bright-brochure-realism',
     '$.presentation.dayExposure', 1.28,
     '$.presentation.environmentIntensity', 1.48,
     '$.presentation.notes', 'Brighter daylight/evening balance, untinted source textures, warmer facade colors, lighter road/footpath and restrained warm facade lighting.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v9',
  'project_jyoti_paradise',
  9,
  '{"phase":"realism-v4","features":["brighter-daylight","lighter-fog","higher-environment-fill","untinted-source-textures","warmer-off-white-facade","charcoal-frames","warm-brown-cladding","blue-glass","lighter-asphalt","footpath-curb","warm-facade-fill"],"source":"brochure+FBX+SKB+DWG+DRS","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
