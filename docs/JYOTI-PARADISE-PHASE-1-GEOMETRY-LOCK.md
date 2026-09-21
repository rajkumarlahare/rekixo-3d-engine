# Jyoti Paradise — Phase 1 geometry lock

Status: geometry/floor zoning completed from the supplied FBX source.

## Source findings

The supplied ASCII FBX contains approximately:

- 913 mesh geometries
- 277,446 source vertices
- 1,978 FBX model nodes in the file
- overall raw bounds about 26.07 × 20.85 × 27.56 coordinate units

The source is Y-up.

The raw dimensions align with architectural metre-scale building and room proportions, so the Phase 1 production intermediate treats one source coordinate unit as one metre. The FBX `UnitScaleFactor=1` metadata is not trusted for this project because interpreting the geometry as centimetres would make the building physically implausible.

## Vertical zoning

Geometry distribution shows a repeating ~3.0 metre vertical pattern.

The locked Phase 1 zones are:

- `GROUND_STILT`: 0–3 m
- `FLOOR_01`: 3–6 m
- `FLOOR_02`: 6–9 m
- `FLOOR_03`: 9–12 m
- `FLOOR_04`: 12–15 m
- `FLOOR_05`: 15–18 m
- `TERRACE_ROOF`: 18–21.5 m

This supports a G+5 + terrace/roof geometry pattern.

The brochure wording is not used as the dimensional source of truth. Unit/floor semantics still require DWG/SKB reconciliation before interactive unit IDs are assigned.

## Production intermediate

A local geometry-only GLB was generated with seven named scene nodes matching the vertical zones above.

Materials/textures are deliberately not considered locked in Phase 1. Facade materials, lighting and production look development belong to Phase 2.

## Reusable pipeline

`scripts/asset-pipeline/ascii-fbx-floor-zones.mjs` provides a tenant-neutral ASCII FBX geometry zoning analyzer.

It exists to prevent future projects from hard-coding customer/floor assumptions into the Engine runtime.

## Next gate

Before unit-level interactivity:

1. verify floor labels and slab heights against the approved drawing;
2. map geometry to common/core vs unit 101/102/103 families;
3. preserve façade/static geometry separately from selectable units;
4. lock material/texture recovery from the editable source;
5. export the first textured, optimized web GLB.
