-- Jyoti Paradise source-exact V6.
-- Aligns the interactive typical-floor composition with the supplied brochure artwork.
-- Exterior continues to use the supplied FBX geometry/material system.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v6',
     '$.presentation.visualProfile', 'brochure-aligned-digital-twin',
     '$.presentation.interiorLayout', 'brochure-page-2-combined-plan',
     '$.presentation.dimensionPolicy', 'show brochure dimensions in the interactive dollhouse; record brochure/DWG conflicts rather than silently reconciling them',
     '$.presentation.notes', '101/102 upper wings, central duct, stair/lobby/fire-lift common core, and lower 103 wing are aligned to the supplied brochure composition. Balcony rail orientation and furniture placement follow the brochure visuals.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.typicalFloor3d', 'brochure-page-2-aligned-v2',
     '$.dimensionPolicy', 'brochure-visible-values-with-source-conflict-record',
     '$.sourceConflicts', json('[
       {"item":"Flat 101 kitchen","brochure":"3.279 x 2.196","alternateArchitecturalSource":"3.379 x 2.196"},
       {"item":"Flat 102 kitchen","brochure":"3.416 x 2.155","alternateArchitecturalSource":"3.516 x 2.155"},
       {"item":"central duct","brochureCombinedPlan":"1.80 x 3.96","alternateSource":"1.90 x 3.26"}
     ]')
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v11',
  'project_jyoti_paradise',
  11,
  '{"phase":"source-exact-v6","fixes":["brochure-composition-101-102-103","balcony-side-orientation","brochure-furniture-placement","wardrobes","l-shaped-sofa-103","common-core-position","brochure-visible-dimensions","source-conflict-record"],"source":"uploaded-FBX+SKB+DWG+DRS+brochure","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
