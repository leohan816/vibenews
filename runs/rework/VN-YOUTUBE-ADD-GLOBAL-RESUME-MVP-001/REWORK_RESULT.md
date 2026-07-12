# Rework Result — implementation-rework-001-a4 (VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001)

```text
REWORK_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
REWORK_ID: implementation-rework-001-a4
ACTOR: VibeNews Worker
REPO: /home/leo/Project/VibeNews
BRANCH: master
REWORK_INPUT_HEAD: e6e336bc091131d85891b2ace136b687e847eecd
PREVIOUS_IMPLEMENTATION_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a3
PRIOR_DELTA_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
REVIEW_FINDING_ID: IR-F1-D1(g)-L
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a4
LEO_DECISION_ID: D-011
LEO_DECISION: D-011-A — AUTHORIZE EXACTLY ONE FINAL LIFECYCLE MICRO-CORRECTION
LEO_DECISION_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
RESULT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER
NEW_IMPLEMENTATION_SUBJECT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER
RESULT_STATUS: REWORKED_AWAITING_IMPLEMENTATION_DELTA_REVIEW
AUTOMATIC_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2 / 2
D010_EXCEPTIONAL_REWORK_ATTEMPTS_USED: 1 / 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPT: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPTS_MAX: 1
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
CHANGED_FILES:
- server/src/bin/accept-private.ts (IR-F1-D1(g)-L: fail-closed audit-key/binding lifecycle seam; row-count checked
  before key resolution/creation; main() reordered to use it)
- server/test/integration/accept-private.test.ts (IR-F1-D1(g)-L: deterministic lifecycle integration proofs with
  before/after key-path and complete binding-row snapshots)
- runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md (this result, in the content commit)
SCOPE: D-011-A authorizes exactly one final lifecycle micro-correction, closing ONLY IR-F1-D1(g)-L. Every earlier closed
  behavior — IR-F1-D1(a)-(f), the closed (b) access work, and all earlier (g) protections — is preserved. No design/
  schema/package/config/provider/service/API/migration/other-test path changed; no key format/path/mode/size/owner-check
  semantics, binding schema, or selector/HMAC contract changed.
FINDING_RESOLUTION:
- IR-F1-D1(g)-L lifecycle ordering: previously main() called resolveAuditKey(config.stateDir, { allowCreate: true })
  BEFORE determining whether provider_runtime_bindings already held rows, so a lost/tampered key could be re-created and
  new key-dependent bindings inserted, allowing a false PASS. Added an exported, testable lifecycle-preparation seam
  prepareAuditKeyAndBindings(db, stateDir, selectors, now, freshnessMs, opts) used unchanged by main(), with this exact
  ordering:
    1. Query the provider_runtime_bindings row count BEFORE resolving or creating the key.
    2. rowCount === 0 (initial bootstrap only): resolveAuditKey({ allowCreate: true }) then a single three-role
       provisionRoleBindings, then validateRoleBindings; any failure returns sanitized RUNTIME_BINDING_REQUIRED and zeroes
       the key.
    3. Any existing row: the table must be exactly the three matching rows (rowCount === 3, else missing/extra/ambiguous
       fails closed); key resolution is LOAD-ONLY (allowCreate:false), so a missing/invalid/symlinked/wrong-owner/wrong-
       mode/wrong-size key returns the sanitized RUNTIME_BINDING_REQUIRED outcome BEFORE any provisioning or row mutation.
    4. With existing rows, no replacement binding set is inserted: loadRoleBindings performs a SELECT-only lookup of the
       three rows by their computed config-version hashes for the current valid key/configuration and validateRoleBindings
       confirms them; missing/extra/mismatched/invalid/ambiguous rows fail closed with no fallback provisioning.
    5. On every existing-binding failure the filesystem and the complete binding table are byte-for-value unchanged (fail()
       only zeroes the in-memory key buffer — no replacement key, silent rotation, new/deleted/updated/rewritten row); the
       run never reaches runPrivateAcceptance, never returns PASS, and never emits any of the five D-009 labels.
    6. Existing rows plus the correct valid key succeed idempotently — the same key and the same row IDs are reused and no
       key or binding row is created or mutated (load-only), so re-runs leave the ordered row snapshot unchanged.
    7. Loaded key buffers are zeroed on both the success path (acceptancePreflight zeroes the prepared key in its finally
       after the downstream returns) and the failure path (fail() zeroes any loaded buffer); the CLI maps every
       lifecycle/preparation failure to `LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED` and exits non-zero.
  main() is reordered to build selectors, then dispatch through an exported CLI preflight gate seam
  acceptancePreflight (used unchanged by main()): it runs the fail-closed lifecycle and ONLY on success invokes the
  downstream acceptance (runPrivateAcceptance); on any lifecycle failure it emits exactly the sanitized
  `LIVE_PRIVATE_ACCEPTANCE: BLOCKED RUNTIME_BINDING_REQUIRED` line, never calls the downstream, never emits any of the
  five D-009 labels, zeroes the prepared key, and returns non-zero. The earlier unconditional
  resolveAuditKey(allowCreate:true) and direct provisionRoleBindings/validateRoleBindings calls are removed from main().
  Two narrow injected seams (defaults preserve exact production behavior) were threaded into resolveAuditKey and
  forwarded by the lifecycle seam so the exact shared owner-check is deterministically exercisable without a privileged
  chown: currentUid (the expected process UID) and keyOwnerUid (the key file's observed owner UID) — the latter lets the
  resolver reach and reject the KEY FILE owner check (AUDIT_KEY_OWNER) specifically while the private-directory owner
  check passes. The a3 freshness-refresh capability remains on provisionRoleBindings (its direct test still passes) but is
  never invoked on existing rows by the lifecycle, since a refresh would mutate an existing row — preserving freshness
  only where it does not weaken these rules.
- Preserved unchanged: IR-F1-D1(a) raw-retention evidence; (b) the closed observable access collector; (c) feed-bound
  discovery/promotion; (d) exactly-one TTS success delta; (e) authorized HTTP Range boundary; (f) policy-snapshot
  validation; and all earlier (g) audit-key/binding protections. No live YouTube/DeepSeek/Fish/tailnet call; accept:private
  not run against live config.
COMMANDS_EXECUTED:
- preflight: git rev-parse/fetch origin master (HEAD == origin/master == REWORK_INPUT_HEAD e6e336b); df6dfd5 present and an
  ancestor; git status --porcelain (only the two allowed subject paths modified before staging the evidence result)
- direct reads: rework/4 REWORK_HANDOFF_PROMPT.md; D-011 ACK at c508600; a3 result/pointer + IR-F1-D1(g)-L at d228be4;
  rework-3 subject files at PREVIOUS_SUBJECT_HEAD; the provider_runtime_bindings schema/CHECK and the audit-key/binding
  seams at FROZEN_DESIGN_HEAD §4.2
- npm run typecheck; npm run lint; npm run test:unit; npm run test:integration; npm run test:runtime-local;
  node --import tsx --test server/test/integration/accept-private.test.ts; npm run server:migrate -- --dry-run (isolated
  synthetic state dir, no DB written)
- git diff --check; git status path comparison; control-byte/text scans on both subject files; frozen-design + D-011 +
  all Reviewer-report immutability; focused searches proving no unconditional allowCreate:true before the binding-row
  check (present only inside the rowCount===0 branch) and no existing-row fallback that inserts/replaces bindings
  (provisionRoleBindings is called only in the zero-rows branch, never in main() or the existing-rows path)
TEST_RESULTS:
- typecheck (app + server): exit 0
- lint (official Expo flat config, frozen scope): exit 0 (0 errors, 53 warnings)
- unit: 46 pass / 0 fail
- integration: 89 pass / 0 fail (accept-private.test.ts now 38 tests)
- runtime-local: 2 pass / 0 fail
- server:migrate -- --dry-run: MIGRATE_DRY_RUN OK, exit 0, no DB written
- accept-private.test.ts (38/38): nine new IR-F1-D1(g)-L lifecycle proofs exercise the SAME seams used by main() with
  isolated temp dirs and in-memory DBs — (i) zero rows allow one key creation + one three-role provisioning then validate;
  (ii) existing rows + missing key -> RUNTIME_BINDING_REQUIRED, key stays absent, no key created, complete row snapshot
  unchanged; (iii) existing rows + invalid correctly-sized key -> fail closed, exact key bytes + rows preserved (no
  replacement); (iv) existing rows + symlinked/wrong-mode/wrong-size key -> each fail closed, exact artifact/table
  preserved; (v) existing rows + wrong KEY-FILE owner reach and reject AUDIT_KEY_OWNER specifically (the private-directory
  owner check passes) via the injected key-owner seam -> deterministic fail closed (no chown), state preserved, and
  success with the real key-owner metadata; (vi) existing rows + a superfluous extra row -> fail closed with no fallback
  provisioning (extra row neither used nor removed); (vii) existing rows + correct valid key -> idempotent success with the
  same key, same row IDs, unchanged row snapshot (load-only); (viii) acceptancePreflight (the gate main() uses) on a
  failing lifecycle never calls the downstream runPrivateAcceptance spy, emits ONLY the blocked RUNTIME_BINDING_REQUIRED
  line (none of the five success labels), and returns non-zero; (ix) acceptancePreflight on a valid lifecycle calls the
  downstream exactly once with the prepared 32-byte key + the loaded binding IDs and propagates its exit code. Assertions
  compare before/after key-path state (exists/bytes/mode/symlink) AND complete ordered binding-row snapshots, and use a
  real downstream spy — not a constructed string or precomputed evidence. Earlier IR-F1-D1(a)-(f) and (g) positive/negative
  tests remain passing.
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
  server/test/integration/accept-private.test.ts are the two corrected subject paths. REWORK_RESULT.md and
  REWORK_RESULT_POINTER.md are Worker EVIDENCE records, excluded from the verdict subject.
RUNTIME_ACCESS: false
DB_ACCESS: synthetic/in-memory test databases and isolated temp key/state paths only
SECRET_ACCESS: false
PROD_ACCESS: false
LIVE_PROVIDER_CALLS: false
LIVE_YOUTUBE_CALLS: false
LIVE_TAILNET_OR_PUBLIC_NETWORK_CALLS: false
KNOWN_LIMITATIONS: This is D-011-A's single final lifecycle micro-correction (attempt 1 of 1) after the two automatic
  attempts and the one D-010 exceptional attempt; no further attempts exist. The live private acceptance RUN (real
  YouTube/DeepSeek/Fish/tailnet execution of accept:private) and §14.5 device A/B/C/D playback remain deferred to the
  post-review acceptance phase; the runner is the real fail-closed, evidence-verifying tooling. No completed live run is
  claimed.
RESIDUAL_RISKS: With existing rows, the lifecycle is load-only and performs no in-place freshness refresh, so a stale
  existing binding (verified_at older than the freshness window) fails closed. Any remediation or key/binding rotation is
  outside D-011 scope and requires an approved operator procedure; this Worker neither defines a re-bootstrap policy nor
  self-accepts a residual risk here. Provider-side retention/training NOT_VERIFIED under D-009-A (accepted by Leo);
  single-host/token/tailnet risks per §19-20. No new risk requiring Leo/GPT acceptance.
RESULT_PATH: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md
POINTER_PATH: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```
