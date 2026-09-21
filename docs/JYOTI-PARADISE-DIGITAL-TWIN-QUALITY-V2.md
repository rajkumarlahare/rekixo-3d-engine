# Jyoti Paradise — Digital Twin Quality V2

## Direction

The premium experience follows the supplied real-estate digital-twin reference direction:

- cinematic aerial navigation
- building inspection
- exploded/focused floors
- brochure-backed unit browsing
- amenities
- balcony/facade inspection
- distance/context
- walkthrough as a secondary tool

## Source evidence used

The supplied source set was re-inspected before this pass.

### D5 / DRS

The project resource manifest references:

- ground albedo / normal / AO
- grass albedo / normal / opacity
- vegetation resources
- marble
- wood
- glass
- metal
- floor/tile materials

This is evidence that the authored scene intended landscaped/site context rather than an isolated building on a blank plane.

### DWG

The supplied first-floor drawing contains text labels including:

- Living
- Kitchen
- Bed Room
- Toilet
- Lift
- Fire Lift
- Stair
- Floor Landing

Some room dimensions are present in the drawing, but the current web model does not expose a verified semantic ownership map from those drawing rooms to arbitrary GLB meshes.

Therefore these labels are surfaced as verified architectural program only. They are not falsely assigned to Flat 101/102/103 meshes.

### FBX

The supplied FBX contains thousands of generic Group/Mesh/Component object names and source materials. A few numerical component names exist, but those numerical names alone are not sufficient evidence that a mesh equals a marketed flat number.

## Quality V2 changes

### Cinematic camera transitions

Changing Project / Building / Floor / Balcony / Context mode no longer requires tearing down and rebuilding the WebGL viewer.

The same model stays mounted and the camera transitions using an eased 900 ms interpolation.

### Architectural site context

The runtime now adds a model-bounds-driven presentation environment:

- architectural sky gradient
- warm sun glow
- landscaped ground
- paving apron
- road context
- curb edges
- restrained shrub context on desktop

The context is presentation geometry derived from source intent. It is not represented as a surveyed site/GIS model.

### Source-backed program overlay

Unit Explorer can display the room/common-space labels verified in the architectural drawing while explicitly keeping exact unit-to-mesh ownership gated.

## Isolation

This milestone changes only Rekixo AR3D Engine and Jyoti project data.

No Rekixo AR3D Platform customer website/project is modified.
