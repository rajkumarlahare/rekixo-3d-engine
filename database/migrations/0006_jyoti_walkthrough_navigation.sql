-- Jyoti Paradise Phase 4 walkthrough navigation.
-- Engine-only metadata. No Platform/customer-site resources are modified.

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"active textured Jyoti model + verified floor zoning","reason":"Free-walk navigation is available over the published 3D model with bounded movement, floor-targeted eye height, drag-look, keyboard and mobile controls.","walkthrough":{"enabled":true,"movement":"bounded-free-walk","desktopControls":["W","A","S","D","Arrow keys","drag-look"],"mobileControls":"on-screen directional controls + drag-look","floorTargeting":[0,1,2,3,4,5],"collisionModel":"bounds-only","roomSemanticBinding":"pending-source-verification"},"safety":"Walkthrough never assigns unverified room names or unit meshes."}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation_v1';

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"Jyoti Paradise brochure + supplied FBX/SKB/DWG audit","title":"Residential Floor Explorer","mediaKey":"projects/jyoti-paradise/media/floor-plan-v1.webp","floors":[1,2,3,4,5],"floorPattern":"G+5+terrace","interaction":{"floorIsolation":true,"explodedView":true,"unitSelection":"brochure-backed","walkEntry":"floor-targeted","semanticMeshBinding":"pending-source-verification"},"units":[{"series":"101 to 501","type":"2BHK","areaSqFt":972},{"series":"102 to 502","type":"2BHK","areaSqFt":949},{"series":"103 to 403","type":"2BHK","areaSqFt":940}],"note":"Selecting a brochure-backed unit can enter its floor in 3D Walk. Exact unit/room mesh binding is not guessed."}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v4',
  'project_jyoti_paradise',
  4,
  '{"phase":"walkthrough-navigation","features":["free-walk","drag-look","keyboard-movement","mobile-dpad","floor-targeted-entry","unit-to-floor-walk-entry"],"limitations":["bounds-only movement constraint","no unverified room labels","no guessed unit mesh binding"],"scope":"rekixo-ar3d-engine-only"}',
  datetime('now')
);
