# Rekixo AR3D Engine Deployment

Deployment is intentionally GitHub-Actions-first, matching the existing Rekixo/Tiyansh operating model.

Repository rename target: `rekixo-ar3d-engine`. The existing D1, R2, Worker and route names below are stable production identifiers and are intentionally not renamed.

## Normal developer flow

From Termux or any Git client:

```bash
git add .
git commit -m "..."
git push
```

After changes are merged to `main`, GitHub Actions performs the production deployment on an Ubuntu runner. Local Termux does **not** need Wrangler or workerd.

## Production resources

Only the isolated 3D resources are targeted:

- D1: `rekixo-3d-production`
- R2: `rekixo-3d-assets`
- Admin Worker: `rekixo-3d-admin`
- Public Worker: `rekixo-3d-public`

Existing `tiyansh-production`, `tiyansh-gallery-production`, the old Super Admin, and `/projects/*` are not deployment targets of this repository.

## Production routes

Admin:

- `https://admin.rekixo.com/3Dprojects`
- `https://admin.rekixo.com/3Dprojects/*`

Public:

- `https://ar3dstudio.in/3Dprojects`
- `https://ar3dstudio.in/3Dprojects/*`

These are path-specific Worker Routes. They do not take over the full host.

## One-time GitHub secret

This repository requires one Actions secret:

`CLOUDFLARE_API_TOKEN`

Create it in:

`Repository > Settings > Secrets and variables > Actions > New repository secret`

Recommended token permissions for the current workflow:

### Account permissions

- D1: Edit
- Workers R2 Storage: Edit
- Workers Scripts: Edit

### Zone permissions

- Workers Routes: Edit
- Zone: Read

Scope the zone permissions to:

- `rekixo.com`
- `ar3dstudio.in`

The Cloudflare account ID is non-secret deployment metadata and is already fixed in the workflow for this isolated account.

## What the workflow does

On every push to `main`:

1. checkout repository
2. use Node.js 22 on Ubuntu
3. install dependencies
4. run TypeScript checks
5. build admin and public apps
6. apply D1 migrations to `rekixo-3d-production`
7. create `rekixo-3d-assets` if it does not already exist
8. deploy `rekixo-3d-admin`
9. deploy `rekixo-3d-public`
10. verify both production routes

## Admin security

The current Phase-1 admin build is only a non-sensitive foundation shell. Before write APIs, model uploads, publishing controls, or client data are enabled, the admin route must receive an authentication gate (Cloudflare Access or the dedicated Rekixo 3D auth layer). Do not add privileged write APIs to an unauthenticated admin route.
