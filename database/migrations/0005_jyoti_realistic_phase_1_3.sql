-- Jyoti Paradise realistic Phase 1-3 completion.
-- Additive metadata update only; no customer Platform resources are touched.

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"Jyoti Paradise brochure + supplied FBX/SKB/DWG audit","title":"Residential Floor Explorer","mediaKey":"projects/jyoti-paradise/media/floor-plan-v1.webp","floors":[1,2,3,4,5],"floorPattern":"G+5+terrace","interaction":{"floorIsolation":true,"explodedView":true,"unitSelection":"brochure-backed","semanticMeshBinding":"pending-source-verification"},"units":[{"series":"101 to 501","type":"2BHK","areaSqFt":972},{"series":"102 to 502","type":"2BHK","areaSqFt":949},{"series":"103 to 403","type":"2BHK","areaSqFt":940}],"note":"Unit identities and areas are source-backed. Exact 3D unit-mesh binding is not guessed where the supplied model lacks semantic unit labels."}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"active exterior model + supplied material audit","reason":"Realistic exterior inspection uses the published textured model with PBR material tuning, architectural environment lighting, shadows, pan/orbit/zoom, day-night mode and exploded-floor interaction.","visualProfile":{"target":"supplied Jyoti Paradise exterior reference","preserveSourceTextures":true,"pbrEnhancement":true,"glassTuning":true,"metalTuning":true,"stoneTileTuning":true,"concreteTuning":true}}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_balcony_pending';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v3',
  'project_jyoti_paradise',
  3,
  '{"source":"supplied-project-files","phase":"realistic-1-3","geometry":"G+5+terrace","features":["pbr-material-tuning","architectural-lighting","pan-orbit-zoom","day-night","floor-isolation","exploded-floor","section-cut","brochure-backed-unit-selection"],"safety":["no invented unit-mesh binding","no customer Platform site changes"]}',
  datetime('now')
);
