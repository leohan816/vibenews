# Reviewer Brief — implementation-delta-review-001-a2

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Independently delta-review final implementation rework attempt 2 for IR-F1-D1 against the unchanged frozen design and prior subject.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID: implementation-delta-review-001-a2
REVIEW_PASS: delta
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a1
PRIOR_DELTA_REVIEW_REPORT_HEAD: 8ce5c26f214b6aafd7404f5642c5698ea3672517
PREVIOUS_SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
SUBJECT_PATH_COUNT: 87
VERDICT_TARGET_PATHS: the exact prior 87 implementation paths; Worker/Rework results and pointers excluded
DELTA_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
REWORK_INPUT_HEAD: 1289037722b4b1ec6136b69292602ecce2b300ce
REWORK_CONTENT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
REWORK_POINTER_HEAD: 01807f1993961bd12bdc5656aba745b47d80c7f7
FINDING_IDS_IN_SCOPE: IR-F1-D1
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_DELTA_REVIEW
REPORT_PATHS: runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a2/REVIEW_RESULT.md; runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/implementation-delta-review-001-a2/REVIEW_RESULT_POINTER.md
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and identity checks

Directly read, without relying on prior Reviewer memory or Worker/Advisor summaries:

- both root entries and all canonical protocols;
- all 14 frozen-design subjects at `FROZEN_DESIGN_HEAD`, especially sections 8.2, 12.3, 14.1, 14.4, 14.5, 15,
  16.1, 16.3, 17, 18, and the design-delta report's audit-key closure evidence;
- the complete initial implementation-review and attempt-1 delta-review result/pointer at their immutable heads;
- both attempt-2 rework prompts plus `REWORK_RESULT.md` and pointer at their actual heads;
- both changed subject files at `SUBJECT_HEAD`, their previous blobs at `PREVIOUS_SUBJECT_HEAD`, and every existing
  config/contract/provider/service/API/migration interface they call;
- the exact previous-to-new Git history and path-filtered delta.

Verify repo/origin/branch, fetched origin, clean staged/unstaged/untracked state, ancestry, commit ownership, exact
87-path target identity, exact two-path subject delta, result/pointer exclusion, frozen-design/all-Reviewer-report
immutability, and absence of unrelated product changes. The content commit may additionally update only the declared
Worker `REWORK_RESULT.md`; the pointer commit may update only its pointer.

At minimum read:

```text
git diff f6850963349d2a667b766e60a49800079335da00..98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518 -- server/src/bin/accept-private.ts server/test/integration/accept-private.test.ts
git diff 1289037722b4b1ec6136b69292602ecce2b300ce..98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
```

## IR-F1-D1 final delta-review criteria

Determine independently whether every `IR-F1-D1(a–g)` item is completely closed, the normal CLI can truthfully run
the later real acceptance without modifying the reviewed subject, and no new regression or false-evidence path was
introduced. Passing synthetic tests and output strings are not proof by themselves.

Resolve the following direct-code questions. They are risk-focused review questions, not pre-declared verdicts:

1. **Private access, D1(b)/§14.4(9).** The normal `cliAccessObserver` executes only `tailscale status --json`.
   Determine whether `const funnelOff = !!statusJson`, `tailnetServeHttps = st(up)`, `authorizedDeviceGrant = st(up)`,
   and `publicDenied = statusJson && funnelOff ? denied : failed` genuinely observe Serve HTTPS, an authorized Leo
   device grant, Funnel-disabled state, and public/non-tailnet denial. It does not call a Serve/Funnel status command,
   perform an HTTP reachability/denial probe, or distinguish a running tailnet from those four facts. Assess whether it
   can false-PASS the exact defect previously identified. Also assess the length-derived digest and safe provenance.
2. **Separate audit key and binding, D1(g)/§8.2.** Frozen design requires a server-only local provider audit key, with
   only its safe key ID persisted and the key under the operator-only 0700/0600 private path. The normal CLI instead
   passes `Buffer.from(config.deviceTokenSha256, 'hex')`. Determine whether reusing the device bearer-token hash is
   authorized or compatible with the rows' actual audit key. Check that `audit_key_id`, `credential_present`,
   `verified_at` freshness, endpoint origin/base path, Fish endpoint, and all role selectors are independently verified,
   not just the HMAC columns selected by ID. Confirm there is a real normal-runtime key-loading/provisioning path.
3. **Raw-retention evidence, D1(a)/§14.4(8).** The runner scans only `captionTempRoot` and `stagingDir`, with a fixed
   extension list. Determine whether this proves no original video/audio or raw transcript in every bounded job/state/
   storage location and whether original-audio/transcript formats, DB/log/backup/result structural absence, access
   failures, and job binding are covered. Verify that an absent file with an unrecognized extension or another state
   subdirectory cannot yield false `LOCAL_DATA_CONTROLS: VERIFIED`.
4. **Policy evidence, D1(f)/D-009-A/§14.4(11).** Confirm both records require official provider-owned policy/API URLs,
   effective/update and reviewed dates, document hash/lookup status, exact statement/control sets, API surface, and the
   model/API endpoint actually used. Assess whether any HTTPS host and an empty/malformed `official_api_url`, stale or
   unbound row, or numeric/string date coercion can pass. Confirm the evidence safely records all mandatory fields.
5. **Per-day/per-job TTS, D1(d)/§14.4(5).** Before/after queries filter only `user_id='leo'` and call `.get()` without
   `local_date`. Determine whether multiple daily rows, reruns/idempotent existing jobs, zero/multiple increments, or a
   prior finalized receipt can false-pass or make the reviewed live run unusable. Confirm exactly one increment is
   attributable to this job and date. The test covers a single pre-seeded daily row but no zero/multiple negative.
6. **Authorized Range, D1(e)/§14.4(6).** The in-process app is constructed with a new ephemeral token/hash rather than
   the configured Leo device authorization. Determine whether that proves the required authorized app Range boundary,
   correct byte, headers, and configured authorization or merely self-authorizes a synthetic token inside the live
   runner. Keep physical device A/B/C/D correctly deferred to §14.5, but do not defer §14.4 item 6 itself.
7. **Channel evidence, D1(c)/§14.4(7).** Confirm parsed feed entries, newly recorded discoveries, oldest-first ≤3
   promotion, and timestamps are bound to this poll and work with a pre-existing registered channel/discovery state,
   retries, duplicate feed entries, and more than three entries. No unrelated prior row may satisfy or invalidate the
   evidence incorrectly.
8. **Failure truthfulness and tests.** Check exceptions from access/policy/binding/filesystem/app/channel/pipeline,
   resource closure, partial DB mutations, retry semantics, safe output, and whether the eight tests exercise the real
   normal CLI observers/key/config boundary. In particular, tests inject a fully trusted `okAccess()` and arbitrary
   `AUDIT_KEY`, so determine whether they bypass the two most important normal-runtime defects rather than prove them.

A `PASS` requires concrete code evidence that all seven stable sub-items are closed and the reviewed tooling cannot
false-claim any §14.4 item or D-009-A local-control label. Deferred live provider/network/device execution remains
correct, but the tooling and normal-runtime evidence collectors must already be truthful and complete.

Independently run typecheck, lint, all unit/integration/runtime tests, the targeted acceptance test, migration dry-run,
`git diff --check`, exact-path/control-byte checks, and focused secret/body/transcript/synthetic-fallback searches. Do
not open/source `.env.server.local`, make live YouTube/DeepSeek/Fish/tailnet/public-network calls, mutate runtime state,
or perform device acceptance.

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. This is automatic rework attempt 2 of 2. A
`PASS` closes only implementation tooling and opens later live acceptance; it is not live acceptance or mission
completion. Any non-pass returns to Advisor and then Leo/GPT because no third automatic rework, substitute actor, or
Advisor patch is authorized. Do not edit any subject, design, Advisor, Worker, result, runtime, or other actor-owned
file.
