# Rekixo 3D Engine

Independent 3D real-estate experience platform for AR3D Studio.

## Locked URLs

- Admin: `https://admin.rekixo.com/3Dprojects`
- Public: `https://ar3dstudio.in/3Dprojects/[slug]`
- First project: `jyoti-paradise`

## Isolation guarantee

This repository is intentionally separate from the existing `tiyansh-prime-square` / Rekixo plot platform. The current `admin.rekixo.com/admin`, `ar3dstudio.in/projects/*`, existing D1 database, existing R2 bucket, and existing deployment workflow are not dependencies of this engine and must not be modified for 3D development.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the binding architecture contract.

## Workspace

- `apps/admin` — 3D project editor shell
- `apps/public` — customer-facing 3D experience shell
- `packages/contracts` — shared project/scene contracts
- `docs` — project and operational documentation

## Local start

```bash
npm install
npm run dev:admin
```

In another terminal:

```bash
npm run dev:public
```

3D libraries, Cloudflare D1/R2 bindings, and production routes are intentionally added in later phases after the isolated infrastructure resources exist.
