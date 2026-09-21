-- Jyoti Paradise visual-match V8.
-- Tightens the live digital-twin presentation against the supplied exterior reference:
-- darker charcoal frames, warmer timber, muted off-white plaster, mint accent,
-- glass balcony rails, warm concealed strips, visible mobile landscaping/brick context,
-- and a closer lower three-quarter camera.
-- Engine/Jyoti only. No Platform/customer website resources are modified.

UPDATE scenes_3d
   SET settings_json = json_set(
     settings_json,
     '$.presentation.sourceFidelity', 'v8',
     '$.presentation.visualProfile', 'reference-facade-structural-match',
     '$.presentation.mobileCamera', 'closer-lower-three-quarter',
     '$.presentation.mobileShadows', 'enabled-1024',
     '$.presentation.facadeStructure', 'charcoal-opening-frames+glass-balcony-rails+vertical-fins+timber-return+mint-accent+warm-strip-lighting',
     '$.presentation.siteContext', 'brick-facing+front-shrubs+trees-on-mobile+dark-parking+compact-plot',
     '$.presentation.materialIsolation', 'reference-palette-applies-only-to-reference-render-preset',
     '$.presentation.notes', 'V8 is based on zoomed visual comparison of the live mobile render against the supplied exterior reference. It improves visual correspondence without replacing the source FBX or inventing room ownership.'
   ),
       updated_at = datetime('now')
 WHERE id = 'scene_jyoti_project_navigation';

INSERT OR IGNORE INTO publish_versions_3d (
  id, project_id, version, snapshot_json, published_at
) VALUES (
  'publish_jyoti_v13',
  'project_jyoti_paradise',
  13,
  '{"phase":"visual-match-v8","fixes":["closer-mobile-camera","reference-contrast","mobile-shadows","reference-palette-isolation","charcoal-facade-frames","glass-rails","timber-cladding-return","mint-accent","vertical-privacy-fins","warm-balcony-strips","mobile-landscaping","brick-facing","compact-site-plane"],"source":"uploaded-FBX+SKB+DWG+DRS+brochure+supplied-exterior-reference","scope":"rekixo-ar3d-engine+jyoti-only"}',
  datetime('now')
);
