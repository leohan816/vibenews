#!/usr/bin/env node
// VibeNews loopback smoke check. Operator-run AFTER a reviewed deploy. Performs NO provider calls:
// it only probes the private API's own loopback /v1/health/live and (optionally) a library read.
// Usage: node scripts/server-smoke.mjs            -> health only
//        VIBENEWS_SMOKE_TOKEN=... node scripts/server-smoke.mjs --library   -> + authed library read
// Exit 0 = pass, non-zero = fail. The device token, if supplied, is read from env, never printed.

import process from 'node:process';

const HOST = process.env.VIBENEWS_BIND_HOST ?? '127.0.0.1';
const PORT = process.env.VIBENEWS_PORT;
const BASE = `http://${HOST}:${PORT ?? ''}`;

function assertLoopback(host) {
  // Refuse to smoke anything but loopback; this script must never reach the network.
  if (!['127.0.0.1', '::1', 'localhost'].includes(host)) {
    console.error(`[smoke] refusing non-loopback host: ${host}`);
    process.exit(2);
  }
}

async function main() {
  assertLoopback(HOST);
  if (!PORT) {
    console.error('[smoke] VIBENEWS_PORT is not set');
    process.exit(2);
  }
  const health = await fetch(`${BASE}/v1/health/live`).catch((e) => {
    console.error('[smoke] health request failed:', e?.message ?? 'error');
    process.exit(1);
  });
  if (health.status !== 200) {
    console.error(`[smoke] health returned ${health.status}`);
    process.exit(1);
  }
  console.log('[smoke] health OK');

  if (process.argv.includes('--library')) {
    const token = process.env.VIBENEWS_SMOKE_TOKEN;
    if (!token) {
      console.error('[smoke] --library requested but VIBENEWS_SMOKE_TOKEN is unset');
      process.exit(2);
    }
    const lib = await fetch(`${BASE}/v1/library`, { headers: { authorization: `Bearer ${token}` } });
    if (lib.status !== 200) {
      console.error(`[smoke] library returned ${lib.status}`);
      process.exit(1);
    }
    console.log('[smoke] library read OK');
  }
  console.log('[smoke] PASS');
}

main();
