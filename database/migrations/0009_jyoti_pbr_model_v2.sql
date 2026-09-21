-- Jyoti Paradise PBR web model v2.
-- Engine-only asset metadata change. No Platform/customer website resources are modified.

UPDATE models_3d
   SET asset_key = 'projects/jyoti-paradise/models/exterior-v2.glb',
       source_filename = 'jyoti aprtment model(5).fbx',
       mime_type = 'model/gltf-binary',
       byte_size = 4033620,
       version = 2,
       is_active = 1,
       updated_at = datetime('now')
 WHERE id = 'model_jyoti_exterior_v1'
   AND project_id = 'project_jyoti_paradise';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v7',
  'project_jyoti_paradise',
  7,
  '{"phase":"pbr-model-v2","modelId":"model_jyoti_exterior_v1","modelVersion":2,"assetKey":"projects/jyoti-paradise/models/exterior-v2.glb","sha256":"46cde07ba8a59e04e198c778189f24eff89f05eb73e823369fcc7594cbf05bf2","source":"uploaded-FBX","features":["source-geometry","source-material-names","pbr-material-properties","versioned-cache-safe-url"],"limitations":["external texture image files are not embedded in the supplied FBX"],"scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
