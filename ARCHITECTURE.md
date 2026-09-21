# Rekixo AR3D Engine Architecture Contract

Status: **LOCKED**
Date: 2026-09-21

This file is the source of truth for the 3D platform architecture. Future patches must preserve these boundaries unless the owner explicitly changes them.

## 1. Rekixo AR3D product-family boundary

The following existing production surfaces must remain unchanged by 3D development:

- Sibling platform repository: `rajkumarlahare/rekixo-ar3d-platform` (historical name: `rajkumarlahare/tiyansh-prime-square`)
- Super Admin: `https://admin.rekixo.com/admin`
- Existing public projects: `https://ar3dstudio.in/projects/*`
- Existing D1 database: `tiyansh-production`
- Existing R2 bucket: `tiyansh-gallery-production`
- Existing Cloudflare Workers and current deployment workflow
- Existing plot mapper, project mapper, road access, side mapping, pricing, plot status, project gallery, client admin, and public project runtime

The Platform and Engine are parts of the same Rekixo AR3D product family, but their production runtime resources stay isolated. No 3D dependency, schema migration, asset, route, or deployment step may be added to the Platform merely to support this engine.

## 2. New 3D system identity

Repository:

`rajkumarlahare/rekixo-ar3d-engine`

Historical repository name: `rajkumarlahare/rekixo-3d-engine`. The rename is source identity only; Cloudflare resource names remain unchanged.

Admin surface:

`https://admin.rekixo.com/3Dprojects`

Public surface:

`https://ar3dstudio.in/3Dprojects/[slug]`

First project:

`https://ar3dstudio.in/3Dprojects/jyoti-paradise`

The exact path segment is `3Dprojects` with an uppercase `D`.

## 3. Separate production resources

The 3D engine uses its own Cloudflare resources:

- D1: `rekixo-3d-production`
- R2: `rekixo-3d-assets`
- Admin Worker: `rekixo-3d-admin`
- Public Worker: `rekixo-3d-public`

The admin and public Workers may share the new 3D D1/R2 resources, but they must never bind to the existing Tiyansh production D1/R2 resources.

## 4. Bundle isolation

The admin and public experiences are separate applications.

`apps/admin`
- project management
- model upload/replace controls
- scene builder
- camera preset editor
- floor/unit editor
- hotspot editor
- media manager
- preview/publish controls

`apps/public`
- customer-facing project viewer
- 3D navigation
- scene transitions
- floor/unit browsing
- balcony/section/amenity experiences
- mobile fallbacks

Heavy editor-only code must not ship in the public bundle.

## 5. Route isolation

All new browser assets and APIs must remain under the `3Dprojects` prefix so the route can be delegated without taking over the whole host.

Admin examples:

- `/3Dprojects`
- `/3Dprojects/projects/jyoti-paradise`
- `/3Dprojects/api/projects`
- `/3Dprojects/assets/*`

Public examples:

- `/3Dprojects/jyoti-paradise`
- `/3Dprojects/api/public/jyoti-paradise`
- `/3Dprojects/assets/*`

No host-wide wildcard takeover is allowed.

## 6. Data model direction

The 3D database is project-scoped. Planned entities:

- `projects_3d`
- `models_3d`
- `scenes_3d`
- `camera_presets_3d`
- `floors_3d`
- `units_3d`
- `hotspots_3d`
- `media_3d`
- `publish_versions_3d`

Each row that belongs to a project must be keyed by the 3D project ID. Jyoti Paradise is only the first project; the engine must remain reusable for future projects.

## 7. Asset policy

Raw architectural/source assets must not be committed to GitHub:

- FBX
- MAX
- DWG
- SKP / SKB
- DRS
- GLB / glTF production models
- large texture packs
- rendered videos/panoramas

Source files stay in controlled working/archive storage. Web-ready production assets are uploaded to the dedicated `rekixo-3d-assets` R2 bucket.

Preferred web pipeline:

`FBX/SKP -> Blender cleanup -> GLB -> Meshopt/Draco where appropriate -> KTX2/compressed textures -> R2`

Large projects should be split by scene/module rather than loaded as one giant model.

## 8. Jyoti Paradise phase-one target

Phase one is intentionally small:

1. independent repository/workspace
2. independent admin shell
3. independent public shell
4. create `jyoti-paradise` project record
5. upload one optimized GLB
6. rotate/zoom 3D viewer
7. save a default camera preset
8. preview
9. publish to `/3Dprojects/jyoti-paradise`

Section View, Balcony View, Typical Floor, Amenity Floor, hotspots, advanced floor/unit selection, and photoreal media are later phases built on this base.

## 9. Deployment rule

The Engine repository has its own CI/CD workflow. Deploying the AR3D Engine must not trigger or modify deployment of the sibling `rekixo-ar3d-platform` application.

Production routing is configured only after the new Workers, D1, and R2 resources exist and have been verified independently.

## 10. Change-control rule

Any patch that would couple the Engine to the AR3D Platform D1/R2 resources, `/admin` surface, or `/projects/*` route must stop and require an explicit architecture decision first.
