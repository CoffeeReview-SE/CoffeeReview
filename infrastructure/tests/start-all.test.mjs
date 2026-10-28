import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servicePlan, startAll } from '../../scripts/start-all.mjs';

test('each backend has a fixed internal port independent of Railway PORT', () => {
  const plan = servicePlan({ PORT: '9000', Gateway__SharedKey: 'test-key', ConnectionStrings__Supabase: 'test-connection' });
  assert.equal(plan.length, 4);
  assert.equal(new Set(plan.map(service => service.port)).size, 4);
  for (const service of plan) {
    assert.equal(service.env.PORT, String(service.port));
    assert.equal(service.env.ASPNETCORE_ENVIRONMENT, 'Production');
    assert.equal(service.env.Gateway__SharedKey, 'test-key');
    assert.equal(service.env.ConnectionStrings__Supabase, 'test-connection');
  }
});
test('gateway ignores stale multi-service addresses and enables direct admin access by default', () => {
  const gateway = servicePlan({ ReverseProxy__Clusters__analytics__Destinations__d1__Address: 'http://old.railway.internal:8080' }).find(service => service.name === 'gateway');
  assert.equal(gateway.env.Admin__Enabled, 'true');
  assert.equal(gateway.env.ReverseProxy__Clusters__analytics__Destinations__d1__Address, 'http://127.0.0.1:5105');
  assert.equal(gateway.env.ReverseProxy__Clusters__catalog__Destinations__d1__Address, 'http://127.0.0.1:5101');
  assert.equal(gateway.env.ReverseProxy__Clusters__submission__Destinations__d1__Address, 'http://127.0.0.1:5104');
});
test('an explicit Admin disabled setting is respected', () => {
  assert.equal(servicePlan({ Admin__Enabled: 'false' }).find(service => service.name === 'gateway').env.Admin__Enabled, 'false');
});
test('missing runtime secrets and conflicting external ports fail before spawning services', async () => {
  await assert.rejects(startAll({}), /Gateway__SharedKey/);
  await assert.rejects(startAll({ Gateway__SharedKey: 'test' }), /ConnectionStrings__Supabase/);
  for (const PORT of ['5100', '5101', '5104', '5105', 'invalid', '0'])
    await assert.rejects(startAll({ PORT, Gateway__SharedKey: 'test', ConnectionStrings__Supabase: 'test' }), /PORT/);
});
