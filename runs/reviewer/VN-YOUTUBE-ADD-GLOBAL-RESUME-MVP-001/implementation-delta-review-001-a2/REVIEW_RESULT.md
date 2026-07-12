# Review Result — implementation-delta-review-001-a2 (VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001)

```text
REVIEW_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a2
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
DESIGN_CONTENT_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_SUBJECT_PATHS: 14 frozen design paths at 5c97382 (unchanged; especially §8.2, §12.3, §14.1, §14.4, §14.5, §15, §16.1, §16.3)
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_REPORT_HEAD: 8ce5c26f214b6aafd7404f5642c5698ea3672517
SUBJECT_BASE: f6850963349d2a667b766e60a49800079335da00
VERDICT_TARGET_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
VERDICT_TARGET_PATHS: the 87 implementation paths (86 + server/test/integration/accept-private.test.ts); Worker/Rework result+pointer excluded
PREVIOUS_SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_CONTENT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
FINDING_IDS_IN_SCOPE: IR-F1-D1
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
AUTOMATIC_REWORK_LIMIT_REACHED: true
REPORT_PATHS:
- runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a2/REVIEW_RESULT.md
- runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a2/REVIEW_RESULT_POINTER.md
REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT
FILES_READ:
- CLAUDE.md; AGENTS.md; docs/agent/ROLE_INDEX.md + all five canonical protocols
- frozen §8.2/§12.3/§14.1/§14.4/§14.5/§15/§16.1/§16.3 at 5c97382; initial review 263678e; a1 delta review 8ce5c26; a2 rework prompts + REWORK_RESULT
- server/src/bin/accept-private.ts (full, 500 lines) + previous blob at f685096; server/test/integration/accept-private.test.ts (full)
- called modules: config.ts, db/connection, domain/contracts (assertValidPolicySnapshot/buildRuntimeBinding/providerBindingHmac/formatAssurance), bin/api (buildApp), bin/worker (loadPipelineEvidence/buildPipelinePorts), services/{source,scheduler,playback,processing}, providers/caption
DIFF_READ:
- git diff f685096..98d3ea6 -- accept-private.ts (M +455/-...), accept-private.test.ts (M +284/-...); other 85 subject blobs unchanged
- full f685096..98d3ea6: only the 2 delta paths + expected interleaved evidence; content commit 98d3ea6 touches only the 2 delta paths + its own REWORK_RESULT.md
COMMANDS_EXECUTED:
- git preflight/fetch/ancestry (f685096 ancestor of 98d3ea6, OK); allowlist/path checks; git diff --check (clean)
- npm run typecheck (PASS); node --test accept-private.test.ts (8/8); test:unit 46/46; test:integration 59/59 (no regression)
- greps: no server-only audit-key file/provisioning path (provider-audit-hmac / O_EXCL / INSERT INTO provider_runtime_bindings) anywhere in server/src outside test; confirmed test injects okAccess()+arbitrary AUDIT_KEY
VERDICT: NEEDS_PATCH
DESIGN_CONFORMANCE_CHECK: PARTIAL — 5 of 7 IR-F1-D1 sub-items are genuinely closed with observable/verified evidence (large, real improvement); 2 sub-items (b access, g audit-key) remain false-evidence / design-deviation paths that let the runner false-claim §14.4(9) and diverge from the frozen §8.2 server-only audit key.
BLOCKING_FINDINGS:
- IR-F1-D1(b): §14.4(9) access preconditions are not genuinely observed; a running tailnet with Funnel enabled / Serve unconfigured can false-PASS. OPEN.
- IR-F1-D1(g): the acceptance runner uses the device bearer-token hash as the provider audit key instead of the frozen server-only provider-audit-hmac-v1.key (no provisioning/loading path exists), and does not verify audit_key_id/credential_present/verified_at. OPEN.
NON_BLOCKING_FINDINGS:
- residual (d): TTS before/after queries read daily_tts_usage by user_id only (`.get()` without local_date); robust for a single-day fresh acceptance (delta-based) but nondeterministic across multiple date rows / midnight rollover. Recommend filtering by the run's local_date.
- residual (e): the authorized Range boundary is exercised with a fresh ephemeral token against a new in-process app, not the configured Leo device token; it proves the route enforces auth+Range+headers but not the configured-credential path.
- residual (f): policy `official_policy_urls` accepts any https host (provider-owned host not enforced); exact statement/control code sets, surface, labels, and doc-hash ARE strictly validated, so impact is minor.
- carried IR2/IR3 (caption 60s default; 47 cosmetic lint warnings) remain non-blocking.
AUTHORITY_CONFLICTS: none — no D-001..D-009-A decision reopened. (g) is a deviation FROM the frozen §8.2 design, not a reinterpretation by review.
RUNTIME_CHANGE_CHECK: PASS (no unauthorized change) — delta touches only the 2 declared paths; no frozen-design/canonical/Advisor/other-actor path; no secret/media/transcript; no live call made; .env.server.local not opened.
DIRTY_FILE_CHECK: PASS — clean worktree; git diff --check clean; 85 non-delta subject blobs unchanged.
RELOAD_READINESS: NOT_APPLICABLE — no PASS.
REQUIRED_PATCHES: IR-F1-D1(b) and (g) remain (bounded to the 2 delta paths), BUT the two-attempt automatic rework limit is now reached; no attempt 3 / substitute actor / Advisor patch is authorized. Returns to Advisor and then Leo/GPT for decision.
RESIDUAL_RISKS: until (b)/(g) are resolved, the acceptance runner can emit LIVE_PRIVATE_ACCEPTANCE: PASS + the five labels while §14.4(9) access is unverified and the provider audit key is the wrong material; live acceptance evidence would therefore be partly untrustworthy.
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Two-attempt limit

This is IMPLEMENTATION_REWORK attempt 2 of 2. With a non-pass, the automatic rework budget is exhausted. Per the
handoff/brief, this returns to Advisor and then Leo/GPT; no third automatic rework, substitute actor, or Advisor patch
is authorized, and none is proposed here.

## Genuinely closed by attempt 2 (credit)

Attempt 2 is a large, real improvement over attempt 1. Verified from code (not test names/output):

- **(a) §14.4(8) raw-retention** — the attempt-1 constant `rawRetained = false` is gone. Now
  `rawRetained = !(captionDeleted && boundedClean && allowedAuditsMissingHash === 0)`, where `scanBoundedForRaw`
  recursively walks `captionTempRoot`/`stagingDir` (fail-closed `accessible=false` on unreadable dirs) matching a raw
  media/transcript extension set, plus a DB check that allowed audits carry hash+bytes. Derived from observable
  evidence. CLOSED (minor: backups/audioDir not scanned, but raw source does not live there by schema).
- **(c) §14.4(7) channel** — the tautology `discovered >= 0` is gone. Now identity-bound: `discovered === entries.length`
  and recorded IDs match parsed feed IDs; oldest-first ≤3 promotion verified against the expected queue; `last_polled===now`
  and `next_poll===now+HOUR`. Fails closed on pre-existing/duplicate state. CLOSED.
- **(d) §14.4(5) TTS** — daily-total===1 replaced with a measured `dailyDelta = afterSuccess - beforeSuccess === 1`
  plus one finalized receipt for THIS job and one ready asset for THIS content. CLOSED (residual above).
- **(e) §14.4(6) Range** — statSync replaced with a real in-process `buildApp().inject()` authorized `Range: bytes=0-0`
  returning 206 + exact `content-range`/`content-length`/`cache-control: private, no-store`, and an unauthorized request
  denied 401. Real handler boundary. CLOSED (residual: ephemeral not configured token).
- **(f) §14.4(11) policy** — empty-array acceptance replaced with `validatePolicySnapshot` + `assertValidPolicySnapshot`,
  which strictly enforce provider-exact statement/unverified/verified code sets, API surface, the five labels, and the
  doc-hash-vs-lookup rule. CLOSED (minor url-host residual).

## Remaining blocking sub-items

### IR-F1-D1(b) — §14.4(9) access is not genuinely observed (false-PASS path)
- Location: `cliAccessObserver` (accept-private.ts ~397–422). It runs only `tailscale status --json` and derives:
  `tailnetServeHttps = st(up)`, `authorizedDeviceGrant = st(up)` (both from `BackendState==='Running' && Self.Online`),
  `funnelDisabled = st(!!statusJson)`, and `publicDenied = statusJson && funnelOff ? 'denied' : 'failed'`.
- Why it fails the bar: it never runs `tailscale serve status` (to confirm Serve HTTPS actually fronts the API), never
  runs `tailscale funnel status` (to confirm Funnel is actually OFF — `!!statusJson` is 'ok' for ANY successful status
  read, so a Funnel-ENABLED running tailnet reads as `funnelDisabled='ok'`), never verifies the specific authorized Leo
  device grant (only that self is online), and performs no HTTP reachability/denial probe for `publicDenied`. A running
  tailnet with Funnel enabled and/or Serve unconfigured therefore passes §14.4(9) and the runner can emit PASS + the five
  labels — the exact defect class of the original D1(b). The length-only digest (`sha8(JSON.stringify(status).length)`)
  is also weak provenance. Tests bypass this via `okAccess()`.
- Required (for a later, Leo-authorized fix — NOT an automatic attempt 3): observe each fact with a dedicated read-only
  redacted check — `tailscale serve status` for Serve HTTPS on the API port, `tailscale funnel status` for Funnel-off,
  the authorized device from the grant/peer set, and a bounded loopback-vs-nonloopback reachability/denial probe for
  `publicDenied` — each with real per-fact provenance; block otherwise. A test must drive the real observer (or a
  faithful seam) so a Funnel-enabled/Serve-absent status cannot pass.

### IR-F1-D1(g) — wrong provider audit key + no provisioning path + missing key/credential verification
- Location: `main()` passes `auditKey: Buffer.from(config.deviceTokenSha256, 'hex')` (accept-private.ts ~487); the
  binding recomputation (`validateRoleBinding`/`buildRuntimeBinding`) is otherwise correct.
- Why it fails the bar: the frozen design §4.2/§8.2 requires a SERVER-ONLY provider audit key at
  `/var/lib/vibenews-dev/private/provider-audit-hmac-v1.key` (0700/0600, provisioned with `O_EXCL`), distinct from the
  device bearer token, with only the safe `audit_key_id` in the DB. The runner instead reuses the device bearer-token
  hash as the audit key, and there is NO server-only audit-key loading/provisioning path anywhere in `server/src`
  (grep: no `provider-audit-hmac-v1.key` read, no `O_EXCL` creation, and no real-runtime `INSERT INTO
  provider_runtime_bindings` — only the test seeds bindings). `validateRoleBinding` also selects HMAC/config columns but
  does not verify `audit_key_id`, `credential_present`, or `verified_at` freshness. Tests bypass this by building AND
  validating rows with the same arbitrary `AUDIT_KEY`.
- Required (for a later, Leo-authorized fix): load the frozen server-only audit key from its private 0700/0600 path
  (fail closed / RUNTIME_ACCESS_REQUIRED if absent or wrong mode/owner), ensure a real runtime path provisions the
  bindings with that key, use it (not the device token hash) for recomputation, and additionally verify `audit_key_id`,
  `credential_present`, and `verified_at` freshness. A test must exercise the real key source, not an injected key that
  also built the rows.

## Verdict

`NEEDS_PATCH` for rework head `98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518` against `FROZEN_DESIGN_HEAD 5c97382`. Attempt 2
genuinely closed 5 of 7 IR-F1-D1 sub-items with observable, job-bound, verified evidence and introduced no regression
(typecheck + 8/8 acceptance + 46 unit + 59 integration pass). It did not close (b) §14.4(9) access observation or
(g) the frozen server-only provider audit key — the two normal-runtime paths the tests inject trusted values to bypass —
so the runner can still false-claim §14.4(9) and diverges from §8.2. Because this is the second and final automatic
rework attempt, the two-attempt limit is reached: this returns to Advisor and then Leo/GPT. No attempt 3 is proposed or
authorized. This verdict performs no live acceptance, freezes nothing, and accepts no risk on Leo/GPT's behalf.
```
