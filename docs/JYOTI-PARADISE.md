# Jyoti Paradise — Production 3D Intake

Slug: `jyoti-paradise`  
Public: `https://ar3dstudio.in/3Dprojects/jyoti-paradise`  
Admin: `https://admin.rekixo.com/3Dprojects`

## Production status

The isolated production engine is live with:

- dedicated D1: `rekixo-3d-production`
- dedicated R2: `rekixo-3d-assets`
- production public Worker: `rekixo-3d-public`
- production admin Worker: `rekixo-3d-admin`
- responsive Three.js viewer
- desktop/mobile orbit controls
- reset/fullscreen controls
- model loading progress and safe fallback geometry
- R2 model streaming through the public Worker
- D1-backed project / scene / camera / model metadata
- read-only admin health surface

The current Tiyansh plot project and the existing Rekixo Super Admin are not modified by this engine.

## Source assets received outside Git

The working package has references to:

- Jyoti Paradise brochure PDF
- apartment FBX model
- first-floor DWG
- D5 project file
- SketchUp backup (`.skb`)
- exterior render/reference image

Raw source files must remain outside Git.

## Required production web asset

The next manual asset handoff is one approved optimized file:

`projects/jyoti-paradise/models/exterior-v1.glb`

Target:

- glTF 2.0 binary (`.glb`)
- correct real-world scale
- model centered near origin
- Y-up orientation
- no hidden construction geometry
- duplicate geometry removed
- materials consolidated where practical
- textures compressed and sized for web
- versioned immutable R2 object key
- target <= 25 MB for the first mobile exterior model when visually acceptable

The engine already supports Meshopt-compressed GLB files.

## Publish contract for a model

After the GLB is uploaded to `rekixo-3d-assets`, create or activate a `models_3d` record with:

- `project_id = project_jyoti_paradise`
- a stable model id, e.g. `model_jyoti_exterior_v1`
- `asset_key = projects/jyoti-paradise/models/exterior-v1.glb`
- `mime_type = model/gltf-binary`
- `version = 1`
- `is_active = 1`

Only one active model is allowed per project by the database index.

## 3D artist export checklist

1. Confirm the latest approved FBX/SKP revision.
2. Link all missing textures.
3. Apply transforms and correct scale.
4. Delete hidden/duplicate construction geometry.
5. Fix inverted normals.
6. Merge only meshes that do not need separate future interaction.
7. Keep meaningful object names for tower/floor/unit expansion.
8. Compress textures; avoid giant baked texture sheets.
9. Export a versioned GLB.
10. Validate in the live viewer before activating the model record.

Advanced section, balcony, floor, amenity and hotspot modules are additive. The production viewer does not need to be rewritten for them.


## Final public experience

Public URL:

`https://ar3dstudio.in/3Dprojects/jyoti-paradise`

Final modules:

1. **3D Building** — active production exterior GLB with orbit/zoom, fullscreen, reset, day/night lighting and floor isolation.
2. **Location Map** — brochure-backed Hingna/Nagpur connectivity overview with nearby destinations and an external Maps search action.
3. **Floor Explorer** — Floors 1–5 with brochure-backed unit numbering/areas. The 103-series stops at 403 because the supplied brochure does not list 503.
4. **Amenities** — only supplied brochure amenities and nearby distances.
5. **Section Cut** — interactive clipping of the active 3D model. It is explicitly not represented as an approved structural section drawing.
6. **Facade Detail** — closer interactive inspection of exterior balcony/facade geometry. It does not claim to be an interior panorama.

The previous **Wing Distance** module remains disabled because the supplied source package does not establish a verified multi-wing layout.

## Geometry lock used by the viewer

The Phase 1 audit supports the following vertical building pattern:

- Ground/Stilt
- Floor 1
- Floor 2
- Floor 3
- Floor 4
- Floor 5
- Terrace/Roof

The runtime floor isolation is implemented with clipping planes so the current textured production model can remain active; the geometry-only Phase 1 intermediate does not replace the production visual model.

## Completion definition

The product is considered complete for the supplied source package when:

- public page and project API return 200;
- active production GLB is available;
- all six public modules render;
- no unsupported project fact is invented;
- desktop/mobile controls work;
- generic Engine CI passes;
- production Admin/Public Workers deploy;
- Platform integration contract remains green;
- legacy Jyoti production smoke checks pass.
