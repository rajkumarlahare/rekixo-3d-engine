# Jyoti Paradise — Realistic 3D Phase 1–3

## Scope isolation

This work changes only the Rekixo AR3D Engine and Jyoti Paradise 3D experience.

It does **not** modify any existing customer Platform website, customer project UI, Platform route, Platform D1 record, or Platform R2 object.

## Phase 1 — Source and geometry lock

Supplied project files were audited as a source set:

- SketchUp/SKB editable model
- ASCII FBX exchange model
- DWG architectural drawing
- D5/DRS render project
- Jyoti Paradise brochure
- supplied exterior render/reference image

The production geometry pattern remains:

- Ground/Stilt
- Floor 1
- Floor 2
- Floor 3
- Floor 4
- Floor 5
- Terrace/Roof

The supplied FBX material inventory contains 38 material definitions and 27 texture definitions. Source material names include glass/translucent, metal panel, marble, slate, tile, granite, concrete and paver categories.

A reusable ASCII FBX material audit tool now records those categories without putting raw customer FBX/SKB/DWG files in Git.

## Phase 2 — Realistic exterior runtime

The live textured production GLB remains the visual source.

The web viewer now enhances it rather than replacing it with a cartoon reconstruction:

- ACES filmic tone mapping
- PMREM room/environment lighting
- adaptive environment intensity
- soft architectural shadows
- source-texture anisotropy
- material-name based PBR tuning
- glass transparency/roughness tuning
- metal roughness/metalness tuning
- stone/tile tuning
- concrete/plaster/paver tuning
- day/night mode
- orbit, zoom and pan
- ground/shadow plane scaled to the loaded building bounds

Source colors/textures remain authoritative; tuning does not invent a new facade design.

## Phase 3 — Floor and unit interaction

The viewer supports:

- Ground + Floors 1–5 isolation
- section cut
- exploded-floor interaction derived from mesh vertical position
- full-building restore
- brochure-backed floor selector
- brochure-backed unit selection
- unit type and area display

Brochure-backed unit series remain:

- 101–501 — 2BHK — 972 sq.ft.
- 102–502 — 2BHK — 949 sq.ft.
- 103–403 — 2BHK — 940 sq.ft.

### Semantic safety rule

The supplied FBX contains many generic SketchUp/FBX mesh names and does not provide a reliable semantic mapping such as `UNIT_101`, `UNIT_102`, or room IDs for every mesh.

Therefore Phase 3 does **not** guess which arbitrary mesh belongs to a specific flat. Unit identity/area selection is live and source-backed, while exact 3D mesh binding remains gated on a verified semantic boundary.

This avoids showing the wrong flat as selected.

## Acceptance

Phase 1–3 are accepted when:

1. Engine CI/typecheck/build/tests pass.
2. Production D1 migration 0005 applies.
3. Admin/Public Workers deploy successfully.
4. Existing Jyoti public production smoke checks pass.
5. PBR material enhancement and exploded-floor controls compile in production.
6. No Platform/customer-site repository is changed by this phase.
