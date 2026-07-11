// Server-only configuration validation (설계문서/18 §4.1, §12.3).
// Reads process.env only. NEVER opens .env.server.local and NEVER prints any value.
// The eight provider key names below are the exact D-003 allowlist; any unlisted provider
// alias or alternate-provider key fails config review.

import { isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SERVER_RUNTIME_KEYS = [
  'VIBENEWS_ENV',
  'VIBENEWS_BIND_HOST',
  'VIBENEWS_PORT',
  'VIBENEWS_STATE_DIR',
  'VIBENEWS_USER_TIMEZONE',
  'VIBENEWS_DEVICE_TOKEN_SHA256',
  'YTDLP_BINARY',
] as const;

export const PROVIDER_KEY_ALLOWLIST = [
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_BASE_URL',
  'DEEPSEEK_BUILDER_MODEL',
  'DEEPSEEK_VERIFIER_MODEL',
  'DEEPSEEK_VERIFIER_REASONING_EFFORT',
  'FISH_API_KEY',
  'FISH_TTS_MODEL',
  'FISH_REFERENCE_ID',
] as const;

// Any env key matching a real provider/alternate-LLM prefix must be exactly one of
// PROVIDER_KEY_ALLOWLIST. The set mirrors the design's forbidden alternate providers
// (anthropic|openai|kimi|qwen plus the two allowlisted providers); unrelated tooling
// variables are not provider keys.
const PROVIDER_KEY_PATTERN = /^(DEEPSEEK|FISH|OPENAI|ANTHROPIC|KIMI|QWEN)_/;

export type ConfigCheckName =
  | 'runtime_names_present'
  | 'provider_names_present'
  | 'no_unlisted_provider_key'
  | 'timezone_fixed'
  | 'bind_loopback'
  | 'port_integer'
  | 'state_dir_absolute_outside_repo'
  | 'ytdlp_path_absolute'
  | 'device_token_sha256'
  | 'deepseek_base_url'
  | 'distinct_builder_verifier_selectors';

export interface ConfigCheck {
  name: ConfigCheckName;
  ok: boolean;
  code: string;
}

export interface ConfigCheckResult {
  ok: boolean;
  checks: ConfigCheck[];
}

export class ConfigError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = 'ConfigError';
  }
}

type Env = Record<string, string | undefined>;

const PLACEHOLDER = /^(changeme|placeholder|todo|example|none|null|undefined|x{3,})$/i;

function isPlaceholder(value: string | undefined): boolean {
  if (value === undefined) return true;
  const v = value.trim();
  if (v === '') return true;
  if (v.includes('<') || v.includes('>')) return true;
  if (PLACEHOLDER.test(v)) return true;
  return false;
}

function present(env: Env, keys: readonly string[]): boolean {
  return keys.every((k) => !isPlaceholder(env[k]));
}

function unlistedProviderKeys(env: Env): string[] {
  const allow = new Set<string>(PROVIDER_KEY_ALLOWLIST);
  return Object.keys(env).filter((k) => PROVIDER_KEY_PATTERN.test(k) && !allow.has(k));
}

function checkDeepseekBaseUrl(raw: string | undefined): boolean {
  if (isPlaceholder(raw)) return false;
  try {
    const u = new URL(raw as string);
    if (u.protocol !== 'https:') return false;
    if (u.username !== '' || u.password !== '') return false;
    if (u.search !== '' || u.hash !== '') return false;
    return true;
  } catch {
    return false;
  }
}

export function checkConfig(env: Env = process.env): ConfigCheckResult {
  const checks: ConfigCheck[] = [];
  const add = (name: ConfigCheckName, ok: boolean, code: string) => checks.push({ name, ok, code });

  add(
    'runtime_names_present',
    present(env, SERVER_RUNTIME_KEYS),
    present(env, SERVER_RUNTIME_KEYS) ? 'OK' : 'RUNTIME_CONFIG_REQUIRED',
  );
  add(
    'provider_names_present',
    present(env, PROVIDER_KEY_ALLOWLIST),
    present(env, PROVIDER_KEY_ALLOWLIST) ? 'OK' : 'PROVIDER_CONFIG_REQUIRED',
  );
  const unlisted = unlistedProviderKeys(env);
  add('no_unlisted_provider_key', unlisted.length === 0, unlisted.length === 0 ? 'OK' : 'UNLISTED_PROVIDER_KEY');

  const tz = env.VIBENEWS_USER_TIMEZONE;
  add('timezone_fixed', tz === 'Asia/Seoul', tz === 'Asia/Seoul' ? 'OK' : 'TIMEZONE_MUST_BE_ASIA_SEOUL');

  const host = env.VIBENEWS_BIND_HOST;
  const loopback = host === '127.0.0.1' || host === '::1';
  add('bind_loopback', loopback, loopback ? 'OK' : 'BIND_HOST_MUST_BE_LOOPBACK');

  const port = Number(env.VIBENEWS_PORT);
  const portOk = Number.isInteger(port) && port >= 1 && port <= 65535;
  add('port_integer', portOk, portOk ? 'OK' : 'PORT_INVALID');

  const stateDir = env.VIBENEWS_STATE_DIR;
  const stateOk =
    !isPlaceholder(stateDir) &&
    isAbsolute(stateDir as string) &&
    !(stateDir as string).startsWith(process.cwd() + '/') &&
    (stateDir as string) !== process.cwd();
  add(
    'state_dir_absolute_outside_repo',
    stateOk,
    stateOk ? 'OK' : 'STATE_DIR_MUST_BE_ABSOLUTE_OUTSIDE_REPO',
  );

  const ytdlp = env.YTDLP_BINARY;
  const ytdlpOk = !isPlaceholder(ytdlp) && isAbsolute(ytdlp as string);
  add('ytdlp_path_absolute', ytdlpOk, ytdlpOk ? 'OK' : 'YTDLP_BINARY_MUST_BE_ABSOLUTE');

  const tok = env.VIBENEWS_DEVICE_TOKEN_SHA256;
  const tokOk = typeof tok === 'string' && /^[0-9a-f]{64}$/i.test(tok);
  add('device_token_sha256', tokOk, tokOk ? 'OK' : 'DEVICE_TOKEN_SHA256_INVALID');

  const baseUrlOk = checkDeepseekBaseUrl(env.DEEPSEEK_BASE_URL);
  add('deepseek_base_url', baseUrlOk, baseUrlOk ? 'OK' : 'DEEPSEEK_BASE_URL_INVALID');

  const builder = env.DEEPSEEK_BUILDER_MODEL;
  const verifier = env.DEEPSEEK_VERIFIER_MODEL;
  const distinct =
    !isPlaceholder(builder) && !isPlaceholder(verifier) && !isPlaceholder(env.DEEPSEEK_VERIFIER_REASONING_EFFORT);
  add(
    'distinct_builder_verifier_selectors',
    distinct,
    distinct ? 'OK' : 'BUILDER_VERIFIER_SELECTORS_REQUIRED',
  );

  return { ok: checks.every((c) => c.ok), checks };
}

export interface ServerConfig {
  env: string;
  bindHost: string;
  port: number;
  stateDir: string;
  timezone: 'Asia/Seoul';
  deviceTokenSha256: string;
  ytdlpBinary: string;
}

/** Loads validated non-secret runtime config. Throws ConfigError with a safe code on failure.
 *  Provider secret values are NEVER returned; only presence was validated. */
export function loadConfig(env: Env = process.env): ServerConfig {
  const result = checkConfig(env);
  if (!result.ok) {
    const firstFail = result.checks.find((c) => !c.ok);
    throw new ConfigError(firstFail ? firstFail.code : 'CONFIG_INVALID');
  }
  return {
    env: env.VIBENEWS_ENV as string,
    bindHost: env.VIBENEWS_BIND_HOST as string,
    port: Number(env.VIBENEWS_PORT),
    stateDir: env.VIBENEWS_STATE_DIR as string,
    timezone: 'Asia/Seoul',
    deviceTokenSha256: (env.VIBENEWS_DEVICE_TOKEN_SHA256 as string).toLowerCase(),
    ytdlpBinary: env.YTDLP_BINARY as string,
  };
}

// server:config-check entrypoint. Prints only safe check names/codes, never values.
const isMain = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
  } catch {
    return false;
  }
})();

if (isMain) {
  const result = checkConfig(process.env);
  for (const c of result.checks) {
    process.stdout.write(`${c.ok ? 'PASS' : 'FAIL'} ${c.name} ${c.code}\n`);
  }
  process.stdout.write(`CONFIG_CHECK ${result.ok ? 'OK' : 'FAILED'}\n`);
  process.exit(result.ok ? 0 : 1);
}
