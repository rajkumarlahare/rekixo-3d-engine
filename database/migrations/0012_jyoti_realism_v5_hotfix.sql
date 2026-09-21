-- Jyoti Paradise realism V5 hotfix.
-- Fixes the V4 washed-out render while preserving source geometry/data.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v5',
     '$.presentation.visualProfile', 'source-color-realism',
     '$.presentation.dayExposure', 0.90,
     '$.presentation.environmentIntensity', 0.65,
     '$.presentation.fogDensity', 0.0015,
     '$.presentation.notes', 'FBX diffuse colors preserved with SKB textures; synthetic circular ground layers removed; lighting rebalanced to prevent white washout.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v10',
  'project_jyoti_paradise',
  10,
  '{"phase":"realism-v5-hotfix","fixes":["restore-fbx-diffuse-tints","remove-white-texture-override","reduce-exposure","reduce-environment-intensity","reduce-fog","remove-duplicate-circular-ground","remove-synthetic-site-disc","restrain-facade-fill"],"source":"uploaded-FBX+SKB+DWG+DRS+brochure","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
