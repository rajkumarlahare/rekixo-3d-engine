# Stage 4 — Engine generalization

Status: implemented

## Objective

Make Rekixo AR3D Engine reusable for any 3D real-estate project without changing the existing Jyoti Paradise production URL, D1 data, R2 objects, or applied migration history.

## Completed boundaries

- There is no runtime `FIRST_PROJECT_SLUG`.
- Admin loads the Engine project registry from D1 and selects projects dynamically.
- Public runtime derives the project only from `/3Dprojects/[slug]`.
- Shared project slug/path/asset-key behavior lives in `packages/engine-core`.
- Viewer and camera fallbacks are project-neutral.
- Jyoti-specific names and copy are absent from generic runtime source.
- Historical migrations `0001`, `0002`, and `0003` remain unchanged.
- Existing Jyoti records/assets remain valid production data, not engine defaults.

## Project provisioning

New projects are not added through schema migrations.

`.github/workflows/provision-project.yml` is an authenticated operator workflow. It validates the slug/name/location and creates an idempotent **draft** row in `rekixo-3d-production`.

The workflow deliberately does not publish a project, create model records, or expose an HTTP write API.

This keeps Stage 4 compatible with the security rule that privileged 3D writes must wait for the authenticated admin handoff in Stage 5.

## Data and storage isolation

- Engine D1 stays `rekixo-3d-production`.
- Engine R2 stays `rekixo-3d-assets`.
- Project assets remain under `projects/{slug}/...`.
- The sibling Rekixo AR3D Platform D1/R2 resources are never bound here.
- No shared database is introduced.

## Legacy production fixture

Jyoti Paradise remains the current production fixture used by deployment smoke tests because it is the existing live project. Those checks are compatibility verification only; they do not define a default project in application code.

## Acceptance

Stage 4 is accepted when:

1. TypeScript and both app builds pass.
2. The full test suite passes, including the Stage 4 no-hardcoded-tenant guard.
3. Admin project-registry API is live.
4. Existing Jyoti public/admin production fixture still verifies.
5. No migration history or production resource name changes.
