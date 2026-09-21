-- Jyoti Paradise reference-shell V10.
-- Hero/project/building/balcony views now use a coherent integrated facade model
-- shaped from the approved exterior reference instead of detached overlay cages.
-- Floor/unit/top/interior views continue to use the supplied source model and
-- brochure-backed interior tools.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v10',
     '$.presentation.visualProfile', 'integrated-reference-facade-shell',
     '$.presentation.heroExterior', 'reference-shell',
     '$.presentation.referenceShellViews', 'project+building+balcony',
     '$.presentation.sourceModelViews', 'floors+units+top+context+interior+walk',
     '$.presentation.facadeStructure', 'five-storey-balcony-stack+charcoal-box-frames+glass-rails+timber-cladding+vertical-glass-strip+privacy-fins+roof-crown+stilt-parking',
     '$.presentation.lighting', 'warm-recessed-balcony+roof-strip+dusk-environment',
     '$.presentation.notes', 'V10 replaces floating facade patches with one coherent 3D facade shell so orbiting the hero view remains architecturally consistent.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v15',
  'project_jyoti_paradise',
  15,
  '{"phase":"reference-shell-v10","fixes":["coherent-reference-facade-shell","hide-source-model-in-hero-views","charcoal-balcony-frames","glass-railings","timber-cladding","vertical-glass-spine","privacy-fins","roof-crown","stilt-parking","balcony-planters","warm-downlights","source-model-restored-for-top-floor-unit-interior-views"],"source":"approved-exterior-reference+uploaded-source-model","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
