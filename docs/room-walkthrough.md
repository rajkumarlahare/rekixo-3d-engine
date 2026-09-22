# Room walkthrough on the V9 source model

This update retains the V9 source-model facade and reference material calibration.
It does not restore the reverted V10 facade shell or change Platform resources.

The supplied brochure typical-floor drawing drives the reconstructed room sizes.
The uploaded FBX-derived exterior GLB remains the exterior model. The supplied
D5 file is a dependency manifest, not a complete textured interior scene.
Door positions, wall heights, furniture and unspecified finishes are illustrative;
the interface identifies this reconstruction instead of claiming an exact survey.

## Controls

- Select Interior for the cutaway plan. Tap a room or use the room selector.
- Select Walk to start at eye level in the Flat 101 living room.
- Drag with a mouse or finger to look. Hold the direction buttons or WASD/arrows
  to move. Walls and furniture block movement; the selector reaches every room.
- Choose Floor plan or press Escape to leave first-person mode.
- Input resets on pointer cancellation, focus loss, tab changes and mode changes.

The exterior camera now fits the complete source model to the viewport while
preserving the existing reference viewing direction. Existing texture maps are
retained; opaque glass-tile finishes are no longer treated as transparent windows.

## Verification

`npm test` includes TypeScript, both production builds and the regression suite.
The room geometry tests execute the builder and check entry height, nonoverlap,
full-height/cutaway transitions and input cancellation paths. Browser validation
uses the actual production GLB, checks all 30 room/balcony choices and exercises
desktop and mobile controls. Physical-device performance and a pixel-identical
match to the offline reference render are not certified by these checks.
