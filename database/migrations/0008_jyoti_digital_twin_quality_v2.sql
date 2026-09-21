-- Jyoti Paradise digital twin quality V2.
-- Engine/Jyoti scope only; no Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"supplied FBX + SKB + D5 + DWG + brochure + exterior reference","headline":"2 BHK Flats","brochurePrice":"₹34 Lakh","exteriorRenderKey":"projects/jyoti-paradise/media/exterior-render-v1.webp","brochureCoverKey":"projects/jyoti-paradise/media/brochure-cover-v1.webp","modelSource":"jyoti aprtment model(4).fbx","modelNote":"The premium digital twin keeps the published model as geometry truth and adds cinematic presentation without replacing the architecture.","presentation":{"style":"premium-real-estate-digital-twin","primaryNavigation":"aerial-project-explorer","modes":["project-navigation","building-explorer","floor-explorer","unit-explorer","amenities","balcony-view","distance-context"],"walkthroughRole":"secondary","cameraTransitionMs":900},"siteContext":{"source":"D5 dependent landscape resources + supplied exterior reference","ground":true,"paving":true,"roadContext":true,"landscapeIntent":true,"sourceResourceClasses":["ground albedo/normal/AO","grass albedo/normal/opacity","vegetation references"],"note":"Runtime site context is presentation geometry derived from source intent; it is not a surveyed site model."},"walkthrough":{"enabled":true,"role":"secondary","movement":"bounded-free-walk","roomSemanticBinding":"pending-source-verification"}}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"Jyoti Paradise brochure + supplied FBX/SKB/DWG audit","title":"Residential Floor Explorer","mediaKey":"projects/jyoti-paradise/media/floor-plan-v1.webp","floors":[1,2,3,4,5],"floorPattern":"G+5+terrace","interaction":{"floorIsolation":true,"explodedView":true,"unitSelection":"brochure-backed","walkEntry":"floor-targeted","semanticMeshBinding":"pending-source-verification"},"units":[{"series":"101 to 501","type":"2BHK","areaSqFt":972},{"series":"102 to 502","type":"2BHK","areaSqFt":949},{"series":"103 to 403","type":"2BHK","areaSqFt":940}],"verifiedSpaces":["Living","Kitchen","Bed Room","Toilet","Lift","Fire Lift","Stair","Floor Landing"],"drawingNotes":["First-floor structural/architectural source contains room labels and dimensions.","Verified room labels are not automatically assigned to a specific unit mesh."],"note":"Unit identities and areas are brochure-backed. Room/common-space labels are present in the supplied DWG; exact mesh ownership remains gated on semantic boundary verification."}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v6',
  'project_jyoti_paradise',
  6,
  '{"phase":"digital-twin-quality-v2","features":["cinematic-camera-transitions","architectural-sky","site-ground","paving-context","road-context","source-backed-landscape-intent","verified-dwg-space-program"],"sourceFacts":["D5 references ground/grass/vegetation resources","DWG contains Living/Kitchen/Bed Room/Toilet/Lift/Stair labels"],"limitations":["site context is not surveyed GIS","exact flat/room mesh binding remains source-gated"],"scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
