-- Roll back Jyoti Paradise V10 presentation to the last stable V9 state.
-- Keeps migration history append-only while restoring the V9 runtime/presentation metadata.
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
     '$.presentation.heroExterior', 'source-model',
     '$.presentation.referenceShellViews', NULL,
     '$.presentation.sourceModelViews', 'all-exterior+floors+units+top+context+interior+walk',
     '$.presentation.notes', 'Rollback after V10: restored the last stable V9 source-model presentation.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v16',
  'project_jyoti_paradise',
  16,
  '{"phase":"rollback-to-v9","restores":"source-facade-v9","reason":"restore last stable Jyoti presentation after V10 facade-shell regression","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
