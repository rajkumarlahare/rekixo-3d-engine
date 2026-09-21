-- Jyoti Paradise source-fidelity V3.
-- Built from the supplied brochure, FBX, SKB, DWG and DRS package.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"supplied brochure+FBX+SKB+DWG+DRS","headline":"2 BHK Flats","brochurePrice":"₹34 Lakh","exteriorRenderKey":"projects/jyoti-paradise/media/exterior-render-v1.webp","brochureCoverKey":"projects/jyoti-paradise/media/brochure-cover-v1.webp","modelSource":"jyoti aprtment model(5).fbx","modelNote":"The published model uses the supplied FBX geometry. Source SKB material textures are restored at runtime for matching material names. Exterior/site additions are limited to source-supported road, boundary, gate, parking and landscaping intent.","presentation":{"style":"premium-real-estate-digital-twin","primaryNavigation":"aerial-project-explorer","walkthroughRole":"secondary","sourceFidelity":"v3"}}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"Jyoti Paradise brochure + supplied DWG","title":"1st to 3rd Floor Plan","mediaKey":"projects/jyoti-paradise/media/floor-plan-v1.webp","floors":[1,2,3,4,5],"floorPattern":"G+5+terrace","units":[{"series":"101 to 501","type":"2BHK","areaSqFt":972},{"series":"102 to 502","type":"2BHK","areaSqFt":949},{"series":"103 to 403","type":"2BHK","areaSqFt":940}],"verifiedSpaces":["Living","Kitchen","Bed Room","Toilet","Lift","Fire Lift","Stair","Floor Landing","Balcony","Duct"],"typicalFloor3d":"brochure-backed-dollhouse-v1","note":"Room dimensions and common-space arrangement are taken from the supplied brochure floor-plan render/DWG. Exact source FBX mesh ownership remains separate from this brochure-backed dollhouse."}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v8',
  'project_jyoti_paradise',
  8,
  '{"phase":"source-fidelity-v3","sources":["brochure","FBX","SKB","DWG","DRS"],"restoredTextures":["Metal_Panel","Color_A06","Tile_Canvas","Slate","Concrete_Pavers_Block_Multi","Marble_Carrara_Floor_Tile","Roofing_Slate_Tan","Tile_Ceramic_Multi","Tile_Ceramic_Natural","Granite_Tile","Basic_Tile","White_Subway_Tile"],"site":["car-parking","road","boundary-wall","gate","front-landscaping"],"removedUnsupported":["swimming-pool","recreational-roof-pergola"],"interior":"brochure-backed-101-102-103-typical-floor","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
