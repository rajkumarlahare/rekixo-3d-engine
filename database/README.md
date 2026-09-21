# Rekixo 3D D1 Database

Production D1 database: `rekixo-3d-production`

Database ID: `43423a10-66b2-4460-af5f-f6ab9f2947dc`

## Migration policy

Migrations are additive and owned only by this repository. They must never target `tiyansh-production`.

Current core tables include:

- `projects_3d`
- `models_3d`
- `camera_presets_3d`
- `scenes_3d`
- `publish_versions_3d`

Later schema capabilities such as floors, units, hotspots and managed media may be introduced only through new numbered migrations.

## Historical seed

Migration `0001_core.sql` historically seeded the first production project, Jyoti Paradise. Migrations `0002` and `0003` then added its production viewer/content records.

Those files are **immutable applied migration history**. Stage 4 intentionally does not edit, rename or delete them.

The existence of Jyoti data inside old migrations does not make Jyoti an Engine default.

## New project provisioning

Future projects are data, not migrations.

Use the GitHub Actions workflow:

`Provision Rekixo AR3D Project`

It validates project slug/name/location and inserts an idempotent `draft` project record into `rekixo-3d-production`. It does not publish, create model data, or mutate another project.

## Safety

Do not manually create duplicate schema tables in Cloudflare. Do not add customer project seeds to new schema migrations. Do not bind this database to the sibling AR3D Platform.
