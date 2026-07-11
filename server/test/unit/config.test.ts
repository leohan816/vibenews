import assert from 'node:assert/strict';
import test from 'node:test';

import { checkConfig, loadConfig, PROVIDER_KEY_ALLOWLIST } from '../../src/config';

// Synthetic, non-secret configuration. No real values; never reads .env.server.local.
function validEnv(): Record<string, string> {
  return {
    VIBENEWS_ENV: 'development',
    VIBENEWS_BIND_HOST: '127.0.0.1',
    VIBENEWS_PORT: '8787',
    VIBENEWS_STATE_DIR: '/tmp/vibenews-dev-test-state',
    VIBENEWS_USER_TIMEZONE: 'Asia/Seoul',
    VIBENEWS_DEVICE_TOKEN_SHA256: 'a'.repeat(64),
    YTDLP_BINARY: '/usr/bin/yt-dlp',
    DEEPSEEK_API_KEY: 'synthetic-deepseek-key',
    DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
    DEEPSEEK_BUILDER_MODEL: 'synthetic-builder-model',
    DEEPSEEK_VERIFIER_MODEL: 'synthetic-verifier-model',
    DEEPSEEK_VERIFIER_REASONING_EFFORT: 'high',
    FISH_API_KEY: 'synthetic-fish-key',
    FISH_TTS_MODEL: 'synthetic-fish-model',
    FISH_REFERENCE_ID: 'synthetic-reference',
  };
}

test('valid synthetic env passes every config check', () => {
  const result = checkConfig(validEnv());
  assert.ok(result.ok, JSON.stringify(result.checks.filter((c) => !c.ok)));
});

test('missing a runtime name reports RUNTIME_CONFIG_REQUIRED and is not inferred from provider keys', () => {
  const env = validEnv();
  delete (env as Record<string, string | undefined>).VIBENEWS_STATE_DIR;
  const result = checkConfig(env);
  assert.ok(!result.ok);
  const check = result.checks.find((c) => c.name === 'runtime_names_present');
  assert.equal(check?.code, 'RUNTIME_CONFIG_REQUIRED');
});

test('placeholder provider value fails and no value is exposed', () => {
  const env = validEnv();
  env.FISH_REFERENCE_ID = '<changeme>';
  const result = checkConfig(env);
  assert.ok(!result.ok);
  assert.equal(result.checks.find((c) => c.name === 'provider_names_present')?.ok, false);
  // safety: result contains only names/codes, never the values
  const serialized = JSON.stringify(result);
  assert.ok(!serialized.includes('synthetic-fish-key'));
});

test('unlisted alternate-provider key fails config review', () => {
  const env = { ...validEnv(), OPENAI_API_KEY: 'x' };
  const result = checkConfig(env);
  assert.equal(result.checks.find((c) => c.name === 'no_unlisted_provider_key')?.ok, false);
  const env2 = { ...validEnv(), DEEPSEEK_EXTRA_MODEL: 'x' };
  assert.equal(
    checkConfig(env2).checks.find((c) => c.name === 'no_unlisted_provider_key')?.ok,
    false,
  );
});

test('DeepSeek base URL must be https with no credential/query/fragment', () => {
  assert.equal(
    checkConfig({ ...validEnv(), DEEPSEEK_BASE_URL: 'http://api.deepseek.com' }).checks.find(
      (c) => c.name === 'deepseek_base_url',
    )?.ok,
    false,
  );
  assert.equal(
    checkConfig({ ...validEnv(), DEEPSEEK_BASE_URL: 'https://api.deepseek.com?k=1' }).checks.find(
      (c) => c.name === 'deepseek_base_url',
    )?.ok,
    false,
  );
  assert.equal(
    checkConfig({ ...validEnv(), DEEPSEEK_BASE_URL: 'https://u:p@api.deepseek.com' }).checks.find(
      (c) => c.name === 'deepseek_base_url',
    )?.ok,
    false,
  );
});

test('non-loopback bind host and bad port fail', () => {
  assert.equal(
    checkConfig({ ...validEnv(), VIBENEWS_BIND_HOST: '0.0.0.0' }).checks.find((c) => c.name === 'bind_loopback')?.ok,
    false,
  );
  assert.equal(
    checkConfig({ ...validEnv(), VIBENEWS_PORT: 'abc' }).checks.find((c) => c.name === 'port_integer')?.ok,
    false,
  );
});

test('loadConfig returns only non-secret fields and never provider values', () => {
  const cfg = loadConfig(validEnv());
  assert.equal(cfg.bindHost, '127.0.0.1');
  assert.equal(cfg.timezone, 'Asia/Seoul');
  assert.equal(cfg.port, 8787);
  const serialized = JSON.stringify(cfg);
  for (const key of PROVIDER_KEY_ALLOWLIST) {
    assert.ok(!serialized.includes('synthetic'), `config leaked a provider value near ${key}`);
  }
});
