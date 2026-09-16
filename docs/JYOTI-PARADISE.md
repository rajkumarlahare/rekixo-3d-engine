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
