-- Jyoti Paradise reference-fidelity V7.
-- Calibrates the web presentation against the supplied brochure/exterior render
-- while keeping the supplied FBX/SKB material data as the source audit layer.
-- Adds a touch + desktop walkthrough over the brochure-backed typical-floor envelope.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v7',
     '$.presentation.visualProfile', 'reference-render-calibrated-digital-twin',
     '$.presentation.facadeCalibration', 'warm-off-white+charcoal+timber-brown+mint-accent+warm-recessed-lighting',
     '$.presentation.cameraProfile', 'reference-lower-front-corner',
     '$.presentation.walkthrough', 'brochure-backed-typical-floor-touch-desktop',
     '$.presentation.walkthroughControls', 'pointer-drag+touch-drag+WASD+arrow-keys+onscreen-arrows',
     '$.presentation.walkthroughBoundaryPolicy', 'free movement inside verified typical-floor envelope; no invented semantic door/collision boundaries',
     '$.presentation.notes', 'Reference-render color calibration is a web presentation layer. Original FBX diffuse values remain preserved separately for source fidelity.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.typicalFloor3d', 'brochure-page-2-aligned-v3-walkable',
     '$.walkthrough', 'enabled',
     '$.walkthroughInput', 'touch+pointer+keyboard',
     '$.walkthroughCollisionPolicy', 'bounds-only-until-semantic-door-boundaries-are-source-verified'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_typical_floor_v1';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v12',
  'project_jyoti_paradise',
  12,
  '{"phase":"reference-fidelity-v7","fixes":["reference-facade-palette","warm-dusk-lighting","lower-reference-camera","recessed-facade-pinlights","premium-shell-room-walkthrough","touch-drag-look","desktop-wasd-arrows","onscreen-mobile-arrows","interior-walk-bounds"],"source":"uploaded-FBX+SKB+DWG+DRS+brochure","sourcePolicy":"preserve-original-fbx-diffuse-audit-and-apply-separate-reference-visual-calibration","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
