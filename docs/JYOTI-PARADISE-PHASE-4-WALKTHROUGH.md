# Jyoti Paradise — Phase 4 Walkthrough Navigation

## Scope

This phase changes only the Rekixo AR3D Engine and Jyoti Paradise 3D experience.

No current customer Platform website/project is modified.

## Delivered

- Walk/Orbit mode toggle.
- Drag-look in Walk mode.
- Desktop movement with W/A/S/D and arrow keys.
- Mobile on-screen directional controls.
- Floor-targeted walk entry for Ground and Floors 1–5.
- Floor Explorer → "Enter Floor N in 3D Walk" handoff.
- Camera starts at an eye-height derived from the verified floor zoning.
- Movement is constrained to the loaded model bounds.
- Existing orbit, zoom, pan, floor isolation, explode, section and day/night modes remain available.

## Source-safety boundary

The supplied project model does not expose reliable semantic room IDs for every mesh.

Therefore:

- no arbitrary mesh is labelled Bedroom/Kitchen/Living;
- no arbitrary mesh is claimed as Flat 101/102/103;
- room/unit collision boundaries are not fabricated;
- free-walk uses the real published model and a conservative model-bounds constraint.

Where the source model already contains navigable interior geometry, the camera can move through it. Exact room-aware collision and room labels require a verified semantic interior boundary or a dedicated interior authoring pass.

## Controls

### Orbit mode

- Drag: rotate
- Secondary/two-finger drag: pan
- Wheel/pinch: zoom

### Walk mode

- Drag: look around
- W/A/S/D or arrow keys: move
- Mobile arrows: move
- Floor buttons: reposition walk camera to that floor
- Orbit button: exit Walk mode and return to the project camera

## Acceptance

1. Typecheck/build/tests pass.
2. D1 migration 0006 applies.
3. Engine Admin/Public Workers deploy successfully.
4. Jyoti public/admin production smoke checks pass.
5. Platform integration smoke remains green.
6. No Platform/customer-site repository is modified.
