# Rekixo AR3D Engine — Repository Identity Contract

Status: **LOCKED FOR STEP 1**
Date: 2026-09-21

## Canonical identity

Canonical GitHub repository:

`rajkumarlahare/rekixo-ar3d-engine`

Historical GitHub repository:

`rajkumarlahare/rekixo-3d-engine`

The repository belongs to the Rekixo AR3D product family alongside `rekixo-ar3d-platform`.

## Rename scope

The repository rename changes source identity only:

- GitHub repository name
- local checkout folder
- Git remote URL
- npm root package name
- human-facing documentation/branding

It does not change:

- D1 `rekixo-3d-production`
- R2 `rekixo-3d-assets`
- Worker `rekixo-3d-admin`
- Worker `rekixo-3d-public`
- route prefix `/3Dprojects`
- `admin.rekixo.com/3Dprojects`
- `ar3dstudio.in/3Dprojects/*`
- existing project IDs/slugs
- applied migration history

## Product-family boundary

`rekixo-ar3d-platform` is the multi-project control plane for plots, customer sites and project administration.

`rekixo-ar3d-engine` is the dedicated realistic 3D authoring/rendering plane.

They are siblings. They do not share production D1/R2 bindings.

## Current project identity

Jyoti Paradise is currently the first 3D project. It is not the repository or engine identity.

Existing Jyoti-specific seed migrations remain immutable production history. Removing Jyoti hard-coding from runtime/admin flows belongs to the later engine-generalization phase, not Step 1.

## Local checkout target

```text
~/Dev/AR3D/
├── rekixo-ar3d-platform/
└── rekixo-ar3d-engine/
```

After the GitHub rename, an existing clone should set the canonical remote explicitly:

```bash
git remote set-url origin https://github.com/rajkumarlahare/rekixo-ar3d-engine.git
```

## Change-control rule

Repository identity cleanup must not be used as an excuse to rename live Cloudflare infrastructure or combine the Engine database/storage with the Platform.
