# Stage 5 — Platform integration contract

Status: implemented

## Role

Rekixo AR3D Engine remains an isolated 3D data/rendering plane. It does not read the Platform database and does not store Platform plot/project records.

## Versioned read contract

The Engine Admin Worker exposes a minimal non-sensitive read endpoint for the sibling Platform:

`GET /3Dprojects/api/integration/projects/[slug]`

Contract version: `1`

The response contains only:

- Engine project identity
- slug/name/location/status
- enabled scene count
- whether the active model object is available

It does not expose raw model keys, scene settings, source filenames, Platform credentials or any write capability.

## Link ownership

The link itself is owned by the Platform database. The Engine does not create or mutate `project_3d_links`.

The Platform persists only Engine identity/link metadata and then refers users to the existing Engine public/admin surfaces.

## Admin handoff

Stage 5 handoff selects an Engine project using the existing `?project=[slug]` Admin context.

No Platform password, cookie or session secret is transferred to the Engine.

The Engine Admin remains read-only. Authentication/authorization for future privileged Engine writes must be introduced before any POST/PUT/PATCH/DELETE admin API is enabled.

## Isolation remains unchanged

- Engine D1: `rekixo-3d-production`
- Engine R2: `rekixo-3d-assets`
- Platform D1/R2 are not bound
- Engine routes remain `/3Dprojects/*`
- Platform routes remain owned by the sibling repository
