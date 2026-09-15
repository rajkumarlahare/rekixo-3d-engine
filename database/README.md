# Rekixo 3D D1 Database

Production D1 database: `rekixo-3d-production`

Database ID: `43423a10-66b2-4460-af5f-f6ab9f2947dc`

## Migration policy

Migrations are additive and owned only by this repository. They must never target `tiyansh-production`.

Phase 1 uses only the core tables needed to get the first Jyoti Paradise viewer working:

- `projects_3d`
- `models_3d`
- `camera_presets_3d`
- `scenes_3d`
- `publish_versions_3d`

Later features such as floors, units, hotspots, media management and advanced scene metadata will be introduced by later numbered migrations. This keeps the initial production schema small and avoids committing unfinished contracts too early.

## Initial project seed

Migration `0001_core.sql` seeds one draft project:

- id: `project_jyoti_paradise`
- slug: `jyoti-paradise`
- name: `Jyoti Paradise`
- location: `Hingna, Nagpur`

No model or media row is created until the dedicated R2 bucket exists and a web-ready GLB has been uploaded.

## Safety

Do not manually create duplicate tables in the Cloudflare dashboard. Apply the checked-in migration as a unit. Future deployment automation will use the same migration files.
