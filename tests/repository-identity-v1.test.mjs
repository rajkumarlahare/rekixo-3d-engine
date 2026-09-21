import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const readme=fs.readFileSync("README.md","utf8");
const architecture=fs.readFileSync("ARCHITECTURE.md","utf8");
const deploy=fs.readFileSync(".github/workflows/deploy-cloudflare.yml","utf8");
const adminConfig=fs.readFileSync("wrangler.admin.jsonc","utf8");
const publicConfig=fs.readFileSync("wrangler.public.jsonc","utf8");
const infraConfig=fs.readFileSync("wrangler.infra.jsonc","utf8");

test("canonical source identity is Rekixo AR3D Engine",()=>{
  assert.equal(pkg.name,"rekixo-ar3d-engine");
  assert.match(readme,/# Rekixo AR3D Engine/);
  assert.match(architecture,/Repository:\s*\n\s*`rajkumarlahare\/rekixo-ar3d-engine`/);
  assert.match(deploy,/^name: Deploy Rekixo AR3D Engine/m);
});

test("identity cleanup preserves isolated 3D production resources",()=>{
  for(const config of [adminConfig,publicConfig,infraConfig]){
    assert.match(config,/rekixo-3d-production/);
  }
  assert.match(adminConfig,/rekixo-3d-admin/);
  assert.match(publicConfig,/rekixo-3d-public/);
  assert.match(adminConfig,/rekixo-3d-assets/);
  assert.match(publicConfig,/rekixo-3d-assets/);
});

test("engine remains a sibling of the AR3D Platform, not a shared database module",()=>{
  assert.match(readme,/sibling of `rekixo-ar3d-platform`/);
  assert.match(readme,/must not bind directly to the platform D1\/R2 resources/);
  assert.match(architecture,/same Rekixo AR3D product family/);
});
