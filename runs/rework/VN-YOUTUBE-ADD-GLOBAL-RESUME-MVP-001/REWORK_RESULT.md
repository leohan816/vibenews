# Rework Result — implementation-rework-001-a3 (VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001)

```text
REWORK_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
REWORK_ID: implementation-rework-001-a3
ACTOR: VibeNews Worker
REPO: /home/leo/Project/VibeNews
BRANCH: master
REWORK_INPUT_HEAD: 2b36dbfcde9007ddcab823f0b330364ededd5966
PREVIOUS_IMPLEMENTATION_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a2
PRIOR_DELTA_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
REVIEW_FINDING_IDS: IR-F1-D1(b); IR-F1-D1(g)
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a3
LEO_DECISION_ID: D-010
LEO_DECISION: D-010-A — AUTHORIZE ONE EXCEPTIONAL FINAL REWORK
LEO_DECISION_ACK_HEAD: 53f64282ec594962011da22c2328335d6a12fd8f
RESULT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER
NEW_IMPLEMENTATION_SUBJECT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER
RESULT_STATUS: REWORKED_AWAITING_IMPLEMENTATION_DELTA_REVIEW
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPT: 3
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 1
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
CHANGED_FILES:
- server/src/bin/accept-private.ts (IR-F1-D1(b): dedicated per-fact observable access collector; IR-F1-D1(g): frozen
  server-only audit key loader + real transaction-bound binding provisioning/validation; reordered main())
- server/test/integration/accept-private.test.ts (IR-F1-D1(b): positive executes the real collector via injected
  seams + eight access negatives; IR-F1-D1(g): real temp-dir key loader/provisioner/validator positive + negatives)
- runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md (this result, in the content commit)
SCOPE: D-010-A's single exceptional final rework closes ONLY IR-F1-D1(b) and IR-F1-D1(g). Every attempt-2 behavior for
  the already-closed IR-F1-D1(a), (c), (d), (e), (f) is preserved byte-for-behavior; no design/schema/package/config/
  provider/service/API/migration/other-test path changed.
FINDING_RESOLUTION:
- IR-F1-D1(b) dedicated observable access proof: replaced the attempt-2 generic AccessObserver (which accepted trusted
  {status,...} objects, allowing a bare/precomputed pass and a non-distinct shared digest) with a real, seam-injectable
  collector collectAccessEvidence(seams, cfg) that main() uses unchanged via realAccessSeams(config). It derives five
  INDEPENDENT, time-bound facts, each from its own dedicated read-only command or bounded probe:
    * loopbackBind: loopback-only bind + successful bounded loopback health probe (200) + failed non-loopback bind probe
      for the configured API port;
    * tailnetServeHttps: strict parse of read-only `tailscale serve status --json` (serveTargetsLoopbackPort) proving
      HTTPS Serve targets the expected loopback API port;
    * authorizedDeviceGrant: strict parse of read-only `tailscale status --json` (authorizedPeerOnline) proving the
      explicitly configured authorized Leo device identity is the matching online self/peer — identity never emitted;
    * funnelDisabled: strict parse of read-only `tailscale funnel status --json` (funnelExplicitlyDisabled: an explicit
      map with no enabled target; unknown/absent => not disabled), NOT a bare `!!status`;
    * publicDenied: combined from verified loopback-only bind + explicit Funnel-off + a dedicated public denial probe,
      never inferred from tailnet-up alone.
  Each fact carries {status, observedAt, safe source code, digest of canonical redacted fields} and is stamped with its OWN
  completion time (seams.clock() sampled after that observation); the runner samples the validation clock AFTER collection
  (deps.clock) so ages are truthful, never negative, and long collection is detected. The runner requires each expected
  status (public path 'denied'), freshness (0 <= accessNow-observedAt <= accessMaxAgeMs), AND all five digests distinct
  (ACCESS_PROOFS_DISTINCT). Strictness added this attempt: serveTargetsLoopbackPort requires an HTTPS Serve (TLS :443) site
  entry proxying the exact loopback API port (not any Web proxy; malformed Web fails closed); funnelExplicitlyDisabled
  requires an object whose every entry is strictly boolean false (any true or non-boolean/malformed value fails closed);
  the device fact requires a DISTINCT online in-network-map Peer (never Self) matching the configured id, from which ONE
  validated Tailscale IP (CGNAT/ULA) is derived and passed to a dedicated `tailscale ping` reachability probe (the IP is
  never emitted); the non-loopback and public probes are REAL bounded read-only TCP connect probes (no hard-coded
  constants) that fail closed on timeout/ambiguity, and public denial is proven only against globally-routable public
  unicast targets (RFC1918/CGNAT/link-local/ULA/reserved excluded) with a missing public target failing closed. Missing
  command, non-zero exit, malformed/ambiguous output, unexpected target/non-443 listener, missing/wrong/offline/not-granted/
  unreachable/self-only device, malformed/mismatched tailnet IP, Funnel enabled/unknown/malformed, public or non-loopback
  reachability, no public target, stale, or shared proof yields non-zero RUNTIME_ACCESS_REQUIRED and no five-label block.
  Emits only safe source codes/status/age/8-char digest; never raw output, host, IP, route, peer/device id, URL, token, or
  secret; thrown command/probe errors are sanitized. The future normal CLI seams are read-only and mutate no Tailscale
  login/Serve/Funnel/grant/ACL/firewall/bind/systemd state.
- IR-F1-D1(g) frozen separate audit key + real binding provisioning: removed the attempt-2 deviation that validated
  against an arbitrary injected/matching key (and any device-bearer-token-hash-as-HMAC material). Implemented the real
  normal-runtime path inside the runner and export it for test/main use:
    * resolveAuditKey(stateDir, {allowCreate}) resolves only <validated stateDir>/private/provider-audit-hmac-v1.key,
      rejecting symlinks, non-regular files, wrong owner, wrong size (!=32), and any private dir/file mode != 0700/0600.
      The authorized acceptance run may create a missing dir/key exclusively (O_EXCL, 32 CSPRNG bytes, exact modes, fsync,
      fail-closed cleanup on partial creation). It never returns/logs the path or key bytes; main() zeroizes the key buffer
      after binding work.
    * provisionRoleBindings(db, key, selectors, now) is a transaction-bound, idempotent provisioner that builds the three
      exact role bindings from the current NORMALIZED base URL surface (scheme+host+path, no creds/query/fragment — a
      non-root base path such as /v1 is bound, not dropped by URL.origin), models, Verifier reasoning, Fish model/reference,
      and adapter schema using the separate key, inserting/selecting under UNIQUE(provider_role, config_version_hash) and
      returning only safe row IDs. Re-provisioning an unchanged binding re-affirms credential_present and re-stamps
      verified_at (freshness refresh path), so a still-valid binding never becomes permanently stale — no dependence on
      tests or manual SQL to create or refresh the rows.
    * validateRoleBindings(db, key, ids, selectors, now, freshness) recomputes with the LOADED separate key and verifies
      audit_key_id='provider-audit-hmac-v1', credential_present=1, verified_at finite/not-future/within the freshness bound,
      the distinct 3-role matrix, API surface, every required/forbidden selector HMAC, and the config-version hash. Missing/
      extra/duplicate/stale/wrong-key/wrong-key-id/no-credential/mismatched rows block RUNTIME_BINDING_REQUIRED before any
      provider call. Never returns key/HMAC material, device token, selectors, or private-path metadata.
    * main() reordered so key resolution and binding provisioning+validation occur BEFORE pipeline evidence is accepted;
      policy snapshots remain required and unchanged. The old precomputed boolean and the tests' arbitrary matching key can
      no longer substitute for this verification. The device bearer-token hash is used ONLY as the ephemeral in-process
      Range-auth token (a fresh random token hashed for §14.4(6)), never as provider-binding HMAC material.
- Preserved unchanged: IR-F1-D1(a) job-bound raw-retention/local-controls evidence; (c) this-run feed-bound discovery/
  promotion/timestamps; (d) exactly-one job-attributable TTS success delta; (e) authorized HTTP Range boundary via the real
  in-process handler; (f) strict D-009-A policy-snapshot validation. All D-001..D-009-A constraints, authorized-source-only,
  fixed userId=leo, no original media, no synthetic/sentinel fallback, and the five exact labels only after every local gate
  passes remain intact. No live YouTube/DeepSeek/Fish/tailnet call; accept:private not run against live config.
COMMANDS_EXECUTED:
- preflight: git rev-parse/fetch origin master (HEAD == origin/master == REWORK_INPUT_HEAD 2b36dbf); 98d3ea6 present;
  git status --porcelain (only the two allowed subject paths modified before staging the evidence result)
- direct reads: rework/3 REWORK_RUN_PROMPT.md + REWORK_HANDOFF_PROMPT.md; delta-review-001-a2 IR-F1-D1(b)/(g) at 054333e;
  frozen 설계문서/18 §4.2/§8.2/§14.4/§15/§16 at FROZEN_DESIGN_HEAD; D-010 ACK at 53f6428; both subject files + prior blobs
  at PREVIOUS_SUBJECT_HEAD; contracts (buildRuntimeBinding/RuntimeBinding/ProviderRole) and the runtime-binding schema/CHECK
- npm run typecheck; npm run lint; npm run test:unit; npm run test:integration; npm run test:runtime-local;
  node --import tsx --test server/test/integration/accept-private.test.ts; npm run server:migrate -- --dry-run (isolated
  synthetic state dir, no DB written)
- git diff --check; git status path comparison; control-byte/text scans on both subject files; frozen-design + D-010 +
  all Reviewer-report immutability; focused greps proving no bare-operator funnel/access inference, no device-token-as-audit
  -key, no trusted okAccess, no secret/body/selector/HMAC output, and no synthetic fallback remain
TEST_RESULTS:
- typecheck (app + server): exit 0
- lint (official Expo flat config, frozen scope): exit 0 (0 errors, 53 warnings)
- unit: 46 pass / 0 fail
- integration: 80 pass / 0 fail (accept-private.test.ts now 29 tests)
- runtime-local: 2 pass / 0 fail
- server:migrate -- --dry-run: MIGRATE_DRY_RUN OK, exit 0, no DB written
- accept-private.test.ts (29/29): the positive PASS constructs access evidence by EXECUTING collectAccessEvidence with
  injected synthetic command/probe seams (never okAccess/trusted objects) and provisions bindings with the real temp-dir
  resolveAuditKey + provisionRoleBindings, proving every gate + the five labels only after preflight and asserting no
  device id or derived tailnet IP leaks. (b) negatives — serve wrong loopback port, serve non-443 listener, serve malformed
  web, serve absent, Funnel enabled, Funnel malformed non-boolean value, Funnel unknown shape, authorized device offline,
  device not in network map, device mismatched/malformed tailnet IP, configured id present only as server Self (no peer),
  device unreachable, public reachable, non-loopback reachable, malformed command output, command failure, and stale
  per-fact observation — each BLOCK RUNTIME_ACCESS_REQUIRED with no labels; a dedicated derivePublicDenial test proves the
  global-unicast public classifier (RFC1918/CGNAT/link-local/ULA excluded) and fail-closed on no-public-target/reachable/
  ambiguous. (g) resolveAuditKey creates idempotently and rejects missing/symlink/wrong-file-mode/wrong-size/wrong-dir-mode;
  validateRoleBindings rejects the device-token-hash key (wrong HMAC), a changed base-URL surface (non-root path), absent
  credential, stale/future verified_at, and a duplicate role; the DB CHECK enforces the frozen audit_key_id at the storage
  layer; re-provisioning refreshes verified_at so a valid binding is never permanently stale; normalizeBaseSurface preserves
  a non-root path and strips creds/query/fragment; and an acceptance run whose bindings were provisioned with the device-
  token hash BLOCKS RUNTIME_BINDING_REQUIRED with no labels. Preserved (a) raw-retention FAIL, (c) zero-discovery FAIL,
  (d) pre-seeded aggregate + one delta PASS, (e) 206/Content-Range/Cache + 401 via the real handler, (f) empty policy ->
  POLICY_SNAPSHOT_REQUIRED, plus regression never-passing-verifier FAIL and non-authorized source BLOCKED. No raw
  transcript/audio-body/secret/selector/HMAC/device-id/tailnet-IP/fallback in output.
- exact path allowlist: only server/src/bin/accept-private.ts and server/test/integration/accept-private.test.ts changed
- immutability: 설계문서/**, docs/agent/**, runs/reviewer/**, advisor/** untouched; git diff --check clean
- both subject files are text (no NUL/control bytes; the only non-ASCII bytes are legitimate `§` section signs and Korean
  script fixtures, present since the reviewed prior versions)
BUILD_RESULTS: NOT_APPLICABLE (no production build; Expo bundling is a device step)
UNRELATED_CHANGES: none
STAGED_FILES: content commit = server/src/bin/accept-private.ts + server/test/integration/accept-private.test.ts +
  this REWORK_RESULT.md; the pointer commit stages only REWORK_RESULT_POINTER.md
UNSTAGED_FILES: none at each commit
UNTRACKED_FILES: none after each push
NEW_IMPLEMENTATION_SUBJECT: the same 87 implementation paths at NEW_IMPLEMENTATION_SUBJECT_HEAD (the original 86 plus
  server/test/integration/accept-private.test.ts); server/src/bin/accept-private.ts and
  server/test/integration/accept-private.test.ts are the two reworked subject paths. REWORK_RESULT.md and
  REWORK_RESULT_POINTER.md are Worker EVIDENCE records, excluded from the verdict subject.
RUNTIME_ACCESS: false
DB_ACCESS: synthetic/in-memory test databases and isolated temp key/state paths only
SECRET_ACCESS: false
PROD_ACCESS: false
LIVE_PROVIDER_CALLS: false
LIVE_YOUTUBE_CALLS: false
LIVE_TAILNET_OR_PUBLIC_NETWORK_CALLS: false
KNOWN_LIMITATIONS: This is D-010-A's ONE exceptional final rework (exceptional attempt 3, used 1 of 1) after the two
  automatic attempts; no fourth attempt exists. The live private acceptance RUN (real YouTube/DeepSeek/Fish/tailnet
  execution of accept:private) and §14.5 device A/B/C/D playback remain deferred to the post-review acceptance phase; the
  runner is now the real fail-closed, evidence-verifying tooling to perform it. No completed live run is claimed.
RESIDUAL_RISKS: YouTube anti-bot may block real caption extraction at acceptance (runner fails closed); provider-side
  retention/training NOT_VERIFIED under D-009-A (accepted by Leo); single-host/token/tailnet risks per §19-20. No new risk
  requiring Leo/GPT acceptance.
RESULT_PATH: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md
POINTER_PATH: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```
