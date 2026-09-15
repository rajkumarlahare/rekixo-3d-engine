# Jyoti Paradise — Project Intake

Slug: `jyoti-paradise`
Public target: `https://ar3dstudio.in/3Dprojects/jyoti-paradise`
Status: Foundation / asset preparation

## Assets received outside Git

The working package currently includes references to:

- Jyoti Paradise brochure PDF
- apartment FBX model
- first-floor DWG
- D5 project file
- SketchUp backup (`.skb`)
- exterior render/reference image

These source files must remain outside Git and are not production web assets.

## Still requested from the 3D source team

- original/latest `.skp` file if available
- complete texture/material folder used by the FBX/SKP model
- confirmation of the latest approved building model revision
- any packaged D5 project/media dependencies if available

## Planned asset pipeline

1. open the approved source in Blender/SketchUp as appropriate
2. verify scale/orientation
3. recover/link missing materials and textures
4. remove hidden/duplicate/unneeded geometry
5. optimize meshes and texture sizes
6. export web-ready GLB
7. validate mobile memory/performance
8. upload the optimized model and textures to `rekixo-3d-assets`
9. register the model version in the 3D database

## Phase-one viewer goal

The first publishable version needs only:

- one optimized exterior/building model
- drag to rotate
- pinch/wheel to zoom
- reset/default camera
- one saved camera preset
- admin preview
- public publish

Advanced section, balcony, typical-floor, amenity and hotspot experiences come after this base is stable.
