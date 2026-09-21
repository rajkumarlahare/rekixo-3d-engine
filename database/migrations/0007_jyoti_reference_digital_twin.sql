-- Jyoti Paradise reference-style digital twin presentation.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = '{"status":"ready","source":"supplied Jyoti model + brochure + reference-video direction","headline":"2 BHK Flats","brochurePrice":"₹34 Lakh","exteriorRenderKey":"projects/jyoti-paradise/media/exterior-render-v1.webp","brochureCoverKey":"projects/jyoti-paradise/media/brochure-cover-v1.webp","modelSource":"jyoti aprtment model(1).fbx","modelNote":"The digital twin uses the verified published model as its geometry source.","presentation":{"style":"premium-real-estate-digital-twin","primaryNavigation":"aerial-project-explorer","modes":["project-navigation","building-explorer","floor-explorer","unit-explorer","amenities","balcony-view","distance-context"],"walkthroughRole":"secondary"},"walkthrough":{"enabled":true,"role":"secondary","movement":"bounded-free-walk","roomSemanticBinding":"pending-source-verification"}}',
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v5',
  'project_jyoti_paradise',
  5,
  '{"phase":"reference-digital-twin-v1","referenceDirection":"premium-real-estate-sales-explorer","features":["full-screen-3d-stage","aerial-project-navigation","building-camera","exploded-floor-stack","single-floor-top-view","brochure-backed-unit-explorer","amenity-context","balcony-camera","distance-context"],"walkthrough":"secondary","scope":"rekixo-ar3d-engine+j yoti-only"}',
  datetime('now')
);
