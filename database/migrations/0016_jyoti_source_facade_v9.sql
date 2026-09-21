-- Jyoti Paradise source-facade V9.
-- Corrects the V8 visual-match strategy after multi-angle desktop review.
-- The supplied FBX remains the visible building geometry; detached facade cages,
-- oversized cladding slabs and synthetic facade frames are not layered over it.
-- Reference matching is now driven by source-material calibration, lower hero
-- cameras, dusk contrast, source-faithful facade lighting and restrained site context.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v9',
     '$.presentation.visualProfile', 'source-model-material-first',
     '$.presentation.facadePolicy', 'no-detached-synthetic-facade-cage',
     '$.presentation.materialPolicy', 'source-material-names+reference-render-calibration',
     '$.presentation.cameraProfile', 'lower-close-three-quarter-hero',
     '$.presentation.lightingProfile', 'dusk-contrast+warm-facade-fill+soft-shadows',
     '$.presentation.siteContext', 'compact-plot+compact-road+brick-boundary+no-generated-reference-trees',
     '$.presentation.notes', 'V9 removes the V8 detached facade overlays visible from side/top angles. Exterior geometry remains the supplied FBX; only material, lighting, camera and restrained site presentation are calibrated.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v14',
  'project_jyoti_paradise',
  14,
  '{"phase":"source-facade-v9","fixes":["remove-detached-facade-cage","remove-oversized-side-cladding-overlay","source-model-only-exterior","warmer-plaster","deeper-charcoal","warmer-brown-cladding","cooler-glass-with-subtle-warm-emissive","lower-closer-hero-camera","dusk-contrast","adaptive-front-warm-lights","compact-road","compact-site","remove-generated-reference-trees"],"source":"uploaded-FBX+SKB+DWG+DRS+brochure+supplied-exterior-reference","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
