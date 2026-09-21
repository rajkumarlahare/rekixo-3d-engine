# Jyoti Paradise — Reference Digital Twin Direction

## Product direction

Jyoti Paradise is presented as a premium interactive real-estate digital twin / sales explorer.

The primary experience is no longer walkthrough-first. Free-walk remains a secondary inspection tool.

## Primary interaction flow

1. Project Navigation — aerial master view
2. Building Explorer — architectural facade inspection
3. Floor Explorer — exploded stack / single-floor top view
4. Unit Explorer — brochure-backed flat selection and area data
5. Amenities — project context
6. Balcony View — facade-side camera
7. Distance & Context — brochure-backed nearby destinations

## Camera system

The production viewer now supports presentation presets:

- aerial
- building
- top
- balcony
- context

These presets are derived from the active model bounds so the same renderer remains future-proof and does not hard-code one camera coordinate set.

## Source discipline

- The active published Jyoti model remains the geometry source.
- Brochure data is used for unit series, areas, amenities and connectivity facts.
- Exact flat/room mesh highlight is not fabricated where semantic source boundaries are not verified.
- Balcony mode is a verified exterior/facade camera, not an invented apartment-specific panorama.
- Connectivity values are brochure-supplied context, not surveyed GIS measurements.

## Tenant isolation

The dedicated full-screen digital twin shell is enabled only when the project slug is `jyoti-paradise`.

Other Engine projects continue using the generic multi-project interface.

No Rekixo AR3D Platform customer website/project is modified by this change.
