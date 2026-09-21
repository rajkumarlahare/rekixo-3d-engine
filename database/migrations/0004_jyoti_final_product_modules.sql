-- Jyoti Paradise final product modules.
-- Additive only. Uses supplied brochure/model data and does not invent unit geometry.

UPDATE scenes_3d
   SET name = 'Floor Explorer',
       settings_json = '{"status":"ready","source":"Jyoti Paradise brochure + Phase 1 geometry audit","title":"Residential Floor Explorer","mediaKey":"projects/jyoti-paradise/media/floor-plan-v1.webp","floors":[1,2,3,4,5],"units":[{"series":"101 to 501","type":"2BHK","areaSqFt":972},{"series":"102 to 502","type":"2BHK","areaSqFt":949},{"series":"103 to 403","type":"2BHK","areaSqFt":940}],"note":"Unit numbering is displayed only where the brochure series supports that floor."}',
       sort_order = 30,
       enabled = 1,
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

UPDATE scenes_3d
   SET sort_order = 40,
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_amenities_v1';

UPDATE scenes_3d
   SET name = 'Location Map',
       model_id = NULL,
       camera_preset_id = NULL,
       settings_json = '{"status":"ready","source":"Jyoti Paradise brochure","title":"Hingna, Nagpur Connectivity","subtitle":"Project location context with brochure-listed nearby destinations.","projectLabel":"Jyoti Paradise","mapQuery":"Jyoti Paradise Hingna Nagpur","nearby":[{"name":"Hingna D-Mart","distance":"1 KM"},{"name":"Lata Mangeshkar Hospital","distance":"2 KM"},{"name":"G.S. Raisoni College","distance":"1 KM"},{"name":"Priyadarshini Engineering College","distance":"1 KM"},{"name":"Hingna Road","distance":"1 KM"},{"name":"Metro Station","distance":"1 KM"}],"note":"Distances are brochure-supplied. The on-site diagram is a connectivity overview, not a surveyed geographic map."}',
       sort_order = 20,
       enabled = 1,
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_wing_distance_pending';

UPDATE scenes_3d
   SET name = 'Interactive Section Cut',
       model_id = 'model_jyoti_exterior_v1',
       camera_preset_id = 'camera_jyoti_exterior_home',
       settings_json = '{"status":"ready","source":"active exterior model","reason":"Interactive clipping reveals the building section from the currently published 3D model. This is a visualization tool, not a structural section drawing."}',
       sort_order = 50,
       enabled = 1,
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_section_pending';

UPDATE scenes_3d
   SET name = 'Facade & Balcony Detail',
       model_id = 'model_jyoti_exterior_v1',
       camera_preset_id = 'camera_jyoti_exterior_home',
       settings_json = '{"status":"ready","source":"active exterior model","reason":"Closer interactive exterior inspection of balcony and facade geometry. No interior balcony panorama is claimed."}',
       sort_order = 60,
       enabled = 1,
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_balcony_pending';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v2',
  'project_jyoti_paradise',
  2,
  '{"source":"project-team-files+phase1-geometry-audit","model":"model_jyoti_exterior_v1","modules":["project-navigation","wing-distance","typical-floor","amenity","section","balcony"],"floorPattern":"G+5+terrace","notes":["section is interactive clipping, not a structural drawing","facade detail is exterior model inspection"]}',
  datetime('now')
);
