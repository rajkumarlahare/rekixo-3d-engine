-- Rekixo 3D Engine — Jyoti Paradise supplied-source production content v1
-- Built only from project-team files supplied for Jyoti Paradise.
-- No current Tiyansh/Admin resources are modified.

UPDATE projects_3d
   SET cover_asset_key = 'projects/jyoti-paradise/media/exterior-render-v1.webp',
       status = 'published',
       updated_at = datetime('now')
 WHERE id = 'project_jyoti_paradise';

-- Keep exactly one active web model record. The R2 object may be uploaded later;
-- the runtime verifies object availability before exposing its URL.
UPDATE models_3d
   SET is_active = 0
 WHERE project_id = 'project_jyoti_paradise';

INSERT INTO models_3d (
  id,
  project_id,
  name,
  asset_key,
  source_filename,
  mime_type,
  byte_size,
  version,
  is_active,
  transform_json
) VALUES (
  'model_jyoti_exterior_v1',
  'project_jyoti_paradise',
  'Jyoti Paradise Exterior',
  'projects/jyoti-paradise/models/exterior-v1.glb',
  'jyoti aprtment model(1).fbx',
  'model/gltf-binary',
  11658368,
  1,
  1,
  '{"position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1]}'
)
ON CONFLICT(id) DO UPDATE SET
  asset_key = excluded.asset_key,
  source_filename = excluded.source_filename,
  mime_type = excluded.mime_type,
  byte_size = excluded.byte_size,
  version = excluded.version,
  is_active = excluded.is_active,
  transform_json = excluded.transform_json;

UPDATE camera_presets_3d
   SET position_json = '[42,30,44]',
       target_json = '[13,10,-14]',
       fov = 42,
       updated_at = datetime('now')
 WHERE id = 'camera_jyoti_exterior_home';

UPDATE scenes_3d
   SET model_id = 'model_jyoti_exterior_v1',
       settings_json = '{"status":"ready","source":"project-team-files","background":"night-neutral","controls":{"rotate":true,"zoom":true,"pan":false},"headline":"2 BHK Flats","brochurePrice":"₹34 Lakh","exteriorRenderKey":"projects/jyoti-paradise/media/exterior-render-v1.webp","brochureCoverKey":"projects/jyoti-paradise/media/brochure-cover-v1.webp","modelSource":"jyoti aprtment model(1).fbx","modelNote":"Web GLB preserves supplied FBX geometry and diffuse material colours; external texture image files were not supplied."}',
       enabled = 1,
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT INTO scenes_3d (
  id, project_id, name, type, model_id, camera_preset_id,
  settings_json, sort_order, enabled
) VALUES (
  'scene_jyoti_typical_floor_v1',
  'project_jyoti_paradise',
  'Typical Floor',
  'typical-floor',
  NULL,
  NULL,
  '{"status":"ready","source":"Jyoti Paradise brochure","title":"1st to 3rd Floor Plan","mediaKey":"projects/jyoti-paradise/media/floor-plan-v1.webp","units":[{"series":"101 to 501","type":"2BHK","areaSqFt":972},{"series":"102 to 502","type":"2BHK","areaSqFt":949},{"series":"103 to 403","type":"2BHK","areaSqFt":940}]}',
  20,
  1
)
ON CONFLICT(id) DO UPDATE SET
  settings_json = excluded.settings_json,
  sort_order = excluded.sort_order,
  enabled = excluded.enabled,
  updated_at = datetime('now');

INSERT INTO scenes_3d (
  id, project_id, name, type, model_id, camera_preset_id,
  settings_json, sort_order, enabled
) VALUES (
  'scene_jyoti_amenities_v1',
  'project_jyoti_paradise',
  'Amenities & Nearby',
  'amenity',
  NULL,
  NULL,
  '{"status":"ready","source":"Jyoti Paradise brochure","amenities":["Car Parking","Modular Kitchen","POP In Hall","CCTV Camera"],"nearby":[{"name":"Hingna D-Mart","distance":"1 KM"},{"name":"Lata Mangeshkar Hospital","distance":"2 KM"},{"name":"G.S. Raisoni College","distance":"1 KM"},{"name":"Priyadarshini Engineering College","distance":"1 KM"},{"name":"Hingna Road","distance":"1 KM"},{"name":"Metro Station","distance":"1 KM"}]}',
  30,
  1
)
ON CONFLICT(id) DO UPDATE SET
  settings_json = excluded.settings_json,
  sort_order = excluded.sort_order,
  enabled = excluded.enabled,
  updated_at = datetime('now');

-- These modules remain explicitly unavailable rather than inventing project facts
-- that were not present in the supplied source package.
INSERT INTO scenes_3d (
  id, project_id, name, type, settings_json, sort_order, enabled
) VALUES
  ('scene_jyoti_section_pending', 'project_jyoti_paradise', 'Section View', 'section', '{"status":"source-pending","reason":"No building section render/model was supplied in the current source package."}', 40, 0),
  ('scene_jyoti_wing_distance_pending', 'project_jyoti_paradise', 'Wing Distance', 'wing-distance', '{"status":"source-pending","reason":"No verified multi-wing distance data was supplied in the current source package."}', 50, 0),
  ('scene_jyoti_balcony_pending', 'project_jyoti_paradise', 'Balcony View', 'balcony', '{"status":"source-pending","reason":"No balcony panorama or unit-facing camera package was supplied in the current source package."}', 60, 0)
ON CONFLICT(id) DO UPDATE SET
  settings_json = excluded.settings_json,
  sort_order = excluded.sort_order,
  enabled = excluded.enabled,
  updated_at = datetime('now');

INSERT OR IGNORE INTO publish_versions_3d (
  id,
  project_id,
  version,
  snapshot_json,
  published_at
) VALUES (
  'publish_jyoti_v1',
  'project_jyoti_paradise',
  1,
  '{"source":"project-team-files","model":"model_jyoti_exterior_v1","modules":["project-navigation","typical-floor","amenity"],"unavailableModules":["section","wing-distance","balcony"]}',
  datetime('now')
);
