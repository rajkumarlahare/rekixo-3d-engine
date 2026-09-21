# Rekixo AR3D Engine

Rekixo AR3D Engine is the realistic 3D authoring and rendering system in the **Rekixo AR3D** product family.

It is a sibling of `rekixo-ar3d-platform`, not a separate product family. The repositories intentionally keep separate production databases, R2 assets, Workers and deployment pipelines so heavy 3D workloads cannot destabilize the plot/project platform.

## Repository identity

- Canonical repository name: `rekixo-ar3d-engine`
- Historical repository name: `rekixo-3d-engine`
- Product family: **Rekixo AR3D**
- Sibling control-plane repository: `rekixo-ar3d-platform`

Repository identity cleanup does not rename the existing Cloudflare runtime resources.

## Production surfaces

- Admin: `https://admin.rekixo.com/3Dprojects`
- Public: `https://ar3dstudio.in/3Dprojects/[slug]`
- Current first project: `jyoti-paradise`

Jyoti Paradise is a 3D project/tenant, not the engine identity. Project-specific hard-coding is a Phase 4 generalization concern and is intentionally not mixed into this identity-only step.

## Workspace

- `apps/admin` — 3D authoring/admin application
- `apps/public` — customer-facing 3D experience
- `packages/contracts` — shared engine contracts
- `workers/admin.mjs` — isolated admin Worker
- `workers/public.mjs` — isolated public Worker
- `database/migrations` — isolated 3D D1 migration history
- `docs` — architecture and operations

Future modularization may add reusable `engine-core`, viewer, scene and asset-pipeline packages, but that physical refactor is separate from repository identity cleanup.

## Stable production resource IDs

These existing infrastructure names stay unchanged:

- D1: `rekixo-3d-production`
- R2: `rekixo-3d-assets`
- Admin Worker: `rekixo-3d-admin`
- Public Worker: `rekixo-3d-public`
- Browser route prefix: `/3Dprojects`

Do not rename live infrastructure just to match the GitHub repository name.

## Isolation contract

The sibling AR3D Platform currently uses its own production resources and routes. The 3D Engine must not bind directly to the platform D1/R2 resources.

Later Platform ↔ Engine integration should use an explicit project-link/service contract. A shared database is not the integration boundary.

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Development

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run typecheck
npm run build
npm test
```

Local apps:

```bash
npm run dev:admin
npm run dev:public
```

## Production deployment

Merges to `main` deploy through GitHub Actions. The workflow:

1. type-checks the workspace,
2. builds admin/public bundles,
3. applies isolated D1 migrations,
4. ensures the isolated R2 bucket exists,
5. deploys admin/public Workers,
6. verifies both production surfaces.

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Safety rules

- Keep 3D D1/R2 isolated from the AR3D Platform.
- Keep raw CAD/FBX/SKP/MAX production source assets out of Git.
- Do not rewrite already-applied migration history.
- Do not treat Jyoti Paradise as the engine identity.
- Do not add host-wide route takeovers.
- Protect privileged 3D write APIs before enabling them.
