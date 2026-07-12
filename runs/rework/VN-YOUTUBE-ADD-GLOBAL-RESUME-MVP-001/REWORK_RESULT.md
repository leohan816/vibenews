# Rework Result — implementation-rework-001-a2 (VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001)

```text
REWORK_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
REWORK_ID: implementation-rework-001-a2
ACTOR: VibeNews Worker
REPO: /home/leo/Project/VibeNews
BRANCH: master
REWORK_INPUT_HEAD: 1289037722b4b1ec6136b69292602ecce2b300ce
PREVIOUS_IMPLEMENTATION_SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a1
PRIOR_DELTA_REVIEW_REPORT_HEAD: 8ce5c26f214b6aafd7404f5642c5698ea3672517
REVIEW_FINDING_IDS: IR-F1-D1
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a2
RESULT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER
NEW_IMPLEMENTATION_SUBJECT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER
RESULT_STATUS: REWORKED_AWAITING_IMPLEMENTATION_DELTA_REVIEW
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
CHANGED_FILES:
- server/src/bin/accept-private.ts (IR-F1-D1(a-g): observable/verified evidence gates)
- server/test/integration/accept-private.test.ts (IR-F1-D1(a-g): complete positive + focused negatives)
- runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md (this result, in the content commit)
FINDING_RESOLUTION:
- IR-F1-D1: attempt 1's executable fail-closed runner + real pipeline wiring is kept; the seven evidence-verification
  defects are corrected so the normal CLI cannot emit any §14.4 success item or the five labels from a constant,
  tautology, unverified operator assertion, permissive empty record, or precomputed boolean.
- IR-F1-D1(a) raw retention/local controls: removed the hard-coded rawRetained=false. It is now derived from job-bound
  observable evidence — the job's temporary caption artifact is deleted within its deadline, every allowed payload audit
  retains only field-names/bytes/sha256 (no body), and a bounded recursive scan of only the configured caption-temp and
  staging paths finds zero raw source-media/transcript files (.vtt/.srt/.sbv/.ttml/.txt/.mp4/.webm/.mkv/.mov/.avi/.m4v/
  .ts/.flv). Missing/inaccessible/positive-retention evidence fails closed; no path outside the bounded VibeNews paths
  is scanned and no filename/content is emitted.
- IR-F1-D1(b) private-access evidence: removed the bare VIBENEWS_ACCEPT_* truth flags. Access is now an injected
  AccessObserver returning, per precondition (loopback, tailnet Serve HTTPS, authorized-device grant, Funnel-disabled,
  public-denied), a structured {status, observedAt, source, digest}. The runner requires each to be the expected status
  (public path observed 'denied') AND fresh (0 <= now-observedAt <= accessMaxAgeMs). A plain boolean, absent/stale
  evidence, command failure, Funnel-on, or public reachability returns non-zero RUNTIME_ACCESS_REQUIRED. Emits only safe
  status/source-label/age/8-char digest. The CLI observer runs read-only `tailscale status` and config-derived loopback
  and mutates no Tailscale/Serve/Funnel/firewall/systemd/network config. Tests inject synthetic observers.
- IR-F1-D1(c) channel poll/discovery: replaced discovered>=0. The run parses the feed fetched this run, requires >=1 real
  discovery with exact recorded-identity/count correspondence to the parsed entries, oldest-first promotion of no more
  than three unseen videos (verified against the published-time ordering), and channel last/next poll timestamps written
  by this poll at exactly the one-hour interval. Zero discovery, unrelated rows, wrong order/count, or stale timestamps
  fail closed.
- IR-F1-D1(d) exactly one TTS success for this job: measured a before/after successful_count delta caused by this run
  and require it to be exactly +1, plus exactly one finalized receipt and one ready audio asset for this job/content.
  A day already containing other successful work still passes (proven by a pre-seeded aggregate + a single job delta).
- IR-F1-D1(e) authorized HTTP Range path: replaced fs-stat-only. The runner builds the real Fastify app in-process
  (buildApp + the existing audio Range handler) and app.inject()s an authorized `Range: bytes=0-0` request, requiring
  206, exact Content-Range `bytes 0-0/size`, Content-Length 1, Cache-Control `private, no-store`, and a 401 for the
  unauthorized request. No live listener is opened; §14.5 physical device A/B/C/D remains deferred and is not fabricated.
- IR-F1-D1(f) D-009-A policy records: parses and strictly validates both snapshots via the existing
  assertValidPolicySnapshot plus provider identity, at least one official HTTPS URL, valid effective/reviewed dates,
  API surface, and non-empty statement/verified/unverified control-code sets, and an allowed lookup status. Empty arrays,
  invalid JSON/URLs/dates, missing fields, or wrong provider fail closed. Emits only safe status/count/date.
- IR-F1-D1(g) value-free runtime binding: recomputes each role binding from the current validated runtime configuration
  with the existing value-free buildRuntimeBinding/HMAC scheme and compares every endpoint/model(/reasoning|reference)
  HMAC and config-version hash to the stored row, plus a distinct-3-role check. Builder/Verifier/Fish each bind their
  role-appropriate selectors. Row count, non-null HMACs, or a precomputed boolean are not accepted. Missing/duplicate/
  extra/mismatched/stale bindings fail closed. Never outputs selector values, HMAC material, credentials, or reference IDs.
- Kept all other frozen invariants: authorized source only; fixed userId=leo; no original media; no synthetic/sentinel
  fallback in the normal CLI; separate DeepSeek Builder/Verifier threshold 9.0 with at most two attempts; Fish receives
  only the approved spoken script; safe idempotency; sanitized non-zero failures; five exact labels in exact order only
  after every local gate passes. No live YouTube/DeepSeek/Fish/tailnet call; accept:private not run against live config.
COMMANDS_EXECUTED:
- preflight: git rev-parse/fetch origin master/merge --ff-only (Already up to date; HEAD == origin/master ==
  REWORK_INPUT_HEAD 1289037); git status --porcelain --untracked-files=all
- direct reads: roots + canonical protocols; frozen 설계문서/18 §14.1/§14.4/§15/§16.1 at FROZEN_DESIGN_HEAD; IR-F1 at
  263678e; implementation-delta-review-001-a1 IR-F1-D1 at 8ce5c26; attempt-1 prompts/result/pointer; both subject files
  at PREVIOUS_SUBJECT_HEAD; config/contracts(policy+binding)/source/scheduler/playback/worker/api(audio Range) interfaces
- npm run typecheck; npm run lint; npm run test:unit; npm run test:integration; npm run test:runtime-local;
  node --import tsx --test server/test/integration/accept-private.test.ts; npm run server:migrate -- --dry-run (clean
  synthetic nonsecret env, isolated state dir, no DB written)
- git diff --check; git status path comparison; control-byte/text scans; frozen-design + both Reviewer-report
  immutability; secret/body/transcript/selector/HMAC/fallback searches on the two files
TEST_RESULTS:
- typecheck (app + server): exit 0
- lint (official Expo flat config, frozen scope): exit 0 (0 errors, 53 warnings)
- unit: 46 pass / 0 fail
- integration: 59 pass / 0 fail (accept-private.test.ts now 8 tests)
- runtime-local: 2 pass / 0 fail
- server:migrate -- --dry-run: MIGRATE_DRY_RUN OK, exit 0, no DB written
- accept-private.test.ts (8/8): positive proves every gate from observable/verified evidence + five labels only after
  preflight; and fail-closed with NO five-label block and NO LOCAL_DATA_CONTROLS: VERIFIED on: (a) a retained raw
  transcript file under a bounded path; (b) stale/wrong access evidence -> RUNTIME_ACCESS_REQUIRED; (c) zero channel
  discoveries; (f) empty policy statement-code set -> POLICY_SNAPSHOT_REQUIRED; (g) mismatched role-selector binding ->
  RUNTIME_BINDING_REQUIRED; plus (d) a pre-seeded daily aggregate + exactly one job delta still passes; plus regression
  never-passing-verifier FAIL and non-authorized-source BLOCKED. Range (e) authorized 206/Content-Range/Cache + 401
  unauthorized proven via the real in-process handler. No raw transcript/audio-body/secret/selector/HMAC/fallback in output.
- exact path allowlist: only server/src/bin/accept-private.ts and server/test/integration/accept-private.test.ts changed
- immutability: 설계문서/**, docs/agent/**, runs/reviewer/**, advisor/** untouched; git diff --check clean
- both subject files are text (no NUL/control bytes)
BUILD_RESULTS: NOT_APPLICABLE (no production build; Expo bundling is a device step)
UNRELATED_CHANGES: none
STAGED_FILES: content commit = server/src/bin/accept-private.ts + server/test/integration/accept-private.test.ts +
  this REWORK_RESULT.md; the pointer commit stages only REWORK_RESULT_POINTER.md
UNSTAGED_FILES: none at each commit
UNTRACKED_FILES: none after each push
NEW_IMPLEMENTATION_SUBJECT: the prior 87 implementation paths at PREVIOUS_IMPLEMENTATION_SUBJECT_HEAD f685096 (the
  original 86 plus server/test/integration/accept-private.test.ts) at NEW_IMPLEMENTATION_SUBJECT_HEAD; REWORK_RESULT.md
  and REWORK_RESULT_POINTER.md are Worker EVIDENCE records, excluded from the verdict subject.
RUNTIME_ACCESS: false
DB_ACCESS: synthetic/in-memory test databases only
SECRET_ACCESS: false
PROD_ACCESS: false
LIVE_PROVIDER_CALLS: false
LIVE_YOUTUBE_CALLS: false
LIVE_TAILNET_OR_PUBLIC_NETWORK_CALLS: false
KNOWN_LIMITATIONS: This is the final automatic rework attempt (2 of 2). The live private acceptance RUN (real
  YouTube/DeepSeek/Fish/tailnet execution of accept:private) and §14.5 device A/B/C/D playback remain deferred to the
  post-review acceptance phase; the runner is now the real fail-closed, evidence-verifying tooling to perform it. No
  completed live run is claimed.
RESIDUAL_RISKS: YouTube anti-bot may block real caption extraction at acceptance (runner fails closed); provider-side
  retention/training NOT_VERIFIED under D-009-A (accepted by Leo); single-host/token/tailnet risks per §19-20. No new
  risk requiring Leo/GPT acceptance.
RESULT_PATH: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md
POINTER_PATH: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```
