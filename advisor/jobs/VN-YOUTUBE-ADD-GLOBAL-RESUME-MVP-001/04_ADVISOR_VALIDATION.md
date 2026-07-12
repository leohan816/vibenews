# 04 Advisor Validation — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

## Design phase validation

```text
VALIDATION_PHASE: PRE_DESIGN_REVIEW
VALIDATION_STATUS: PASS_FOR_INDEPENDENT_DESIGN_REVIEW
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
REPO: /home/leo/Project/VibeNews
ORIGIN: https://github.com/leohan816/vibenews.git
BRANCH: master
ADVISOR_INPUT_HEAD: 42790e7102a144b052d1385aac93f73bc9dc77bf
ADVISOR_DESIGN_ROUTING_HEAD: e03644239eb46d056ebfa0a19959a8eca3344d9b
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 1
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
DESIGN_POINTER_HEAD: 3112f0c088b793d24df0b3084d9939fb6992d3ef
DESIGN_REVIEW_ID: design-review-001
BLOCKING_OPEN_DECISIONS: none declared by Designer; independent authority and feasibility review required
FROZEN_DESIGN_HEAD: PENDING_REVIEWER_PASS
RUNTIME_CHANGE_STATUS: ZERO
DIRTY_STATE: clean
NEXT_ACTOR: VibeNews Reviewer
```

### Direct evidence checked

- The repository root, origin, `master`, local `HEAD`, `origin/master`, staged/unstaged/untracked state, and ancestry
  were checked directly after Designer return.
- Content head `f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984` descends from immutable Designer input
  `e03644239eb46d056ebfa0a19959a8eca3344d9b` and changes exactly the 14 declared design subject paths.
- Pointer head `3112f0c088b793d24df0b3084d9939fb6992d3ef` has the content head as its parent and changes only
  `runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT_POINTER.md`.
- The Advisor opened and read all 5,481 lines of the immutable design result and 13 product design documents
  directly from the content object. The pointer was also read directly from its containing commit.
- Required result/pointer schema, subject paths, D-001 through D-008 preservation, Add/Briefing navigation,
  no-login/no-cookie/no-media caption boundary, exact prepared provider key-name allowlist, separated DeepSeek
  Builder/Verifier contracts, Fish TTS receipt semantics, caps/defer, four playback states, immutable snapshot,
  manual-replay isolation, implementation allowlist, exact tests, and real acceptance requirements are present.
- `git diff --check` passed. Searches found no stale `FISH_AUDIO_*` aliases, credential-looking values, private-key
  material, raw caption artifact, original media artifact, or secret value in the declared design subjects.
- No secret file was opened or printed. Only the exact already-authorized provider key names were used as contract
  evidence.
- The worktree was clean and local `HEAD == origin/master == 3112f0c088b793d24df0b3084d9939fb6992d3ef` before
  this Advisor routing phase.

### Independent Reviewer focus

The pre-review shape is sufficient to route, but the Advisor does not resolve these design judgments:

1. Determine whether making operator-preconfigured Tailscale Serve/grants/Funnel-disabled state a mandatory private
   acceptance prerequisite is a bounded design selection under D-002/D-006, or an unapproved material external-state
   dependency that must be patched or returned to Leo/GPT.
2. Determine whether the added no-training/data-control policy verification gate is supported by D-003/D-006 and is
   concretely verifiable for the selected DeepSeek and Fish accounts without exposing secrets, or instead adds a new
   unapproved/unimplementable acceptance blocker.
3. Determine whether the implementation-defined runtime configuration, Hetzner/operator access, Tailscale/device
   prerequisites, and exact Worker allowlist make the required real server/device acceptance executable without the
   Worker reading or writing `.env.server.local` or mutating external identity/access policy.
4. Verify the complete DB/API/provider/playback state contracts and Expo SDK 57 citations independently; do not rely
   on the Designer or Advisor summary.

### Gate decision

Advisor validation permits only independent `DESIGN_REVIEW` of the immutable content head and exact subject paths.
It does not approve, accept risk for, or freeze the design. A `PASS_WITH_RISK` that requires material Leo/GPT risk
acceptance is not freezeable by Advisor. `NEEDS_PATCH` must return stable finding IDs for a bounded same-Designer
revision and same-Reviewer delta review.

## Initial design review validation

```text
VALIDATION_PHASE: POST_DESIGN_REVIEW
VALIDATION_STATUS: BLOCKED_PENDING_LEO_GPT_DECISION
DESIGN_REVIEW_ID: design-review-001
REVIEW_TYPE: DESIGN_REVIEW
REVIEWER_VERDICT: NEEDS_PATCH
VERDICT_TARGET_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
DESIGN_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
BLOCKING_FINDING_IDS: DR1-F1
NON_BLOCKING_FINDING_IDS: DR1-F2
DESIGN_REVISION_ATTEMPTS_USED: 0
DESIGN_FREEZE_STATUS: NOT_FROZEN
REQUIRED_LEO_DECISION: D-009
NEXT_ACTOR: Leo/GPT
```

The Advisor directly read both Reviewer files and verified that report commit
`f46ea708d9768ce883effbb97bcd15cbddfa1227` is pushed, descends from the Advisor review-routing commit, changes only
the two declared `design-review-001` report paths, uses the required containing-commit sentinel, targets the exact
14-path design content head, and leaves the worktree clean.

`DR1-F1` finds that provider-side no-training/data-control unverifiability was introduced as a hard acceptance
blocker without Leo/GPT authority. The report requires a same-Designer bounded revision after the material outcome is
explicitly decided. `DR1-F2` independently accepts the Tailscale private-transport selection as a bounded D-002/D-006
choice and requires no patch. Advisor does not freeze, revise the design, or infer D-009.

## Design revision and pre-delta-review validation

```text
VALIDATION_PHASE: PRE_DESIGN_DELTA_REVIEW
VALIDATION_STATUS: PASS_FOR_INDEPENDENT_DESIGN_DELTA_REVIEW
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
REVISION_ID: design-revision-001
REVISION_ATTEMPT: 1
FINDING_IDS_IN_SCOPE: DR1-F1
LEO_GPT_DECISION: D-009-A — RECORD WITHOUT BLOCKING
PREVIOUS_DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
DESIGN_CONTENT_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_POINTER_HEAD: 9d130d43d3b14dedc795803ab01ff0a9ea4ef6a7
DESIGN_DELTA_REVIEW_ID: design-delta-review-001
DESIGN_REVISION_ATTEMPTS_USED: 1
BLOCKING_OPEN_DECISIONS: none
FROZEN_DESIGN_HEAD: PENDING_REVIEWER_PASS
RUNTIME_CHANGE_STATUS: ZERO
PRODUCT_CODE_CHANGE_STATUS: ZERO
DIRTY_STATE: clean before Advisor routing
NEXT_ACTOR: VibeNews Reviewer
```

### Direct evidence checked

- The Advisor fetched `origin/master` and verified `master`, clean staged/unstaged/untracked state, and
  `HEAD == origin/master == 9d130d43d3b14dedc795803ab01ff0a9ea4ef6a7` before this routing edit.
- Revision content `5c97382841d00ceb8b18e27998c5e68bbe468555` descends from the previous content through only the declared
  prior pointer, review routing/report, D-009 decision, and revision-routing evidence. Its direct parent is the exact
  Advisor D-009 ACK/routing head `5c93fe01fefa1927244588e114ffa1a0f565c6ff`.
- The revision commit changes exactly the eight authorized delta paths. All 14 design subject paths exist, and the
  six unchanged product design blobs are byte-identical to
  `f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984`.
- Pointer head `9d130d43d3b14dedc795803ab01ff0a9ea4ef6a7` has the revision content head as its parent and changes only
  `runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT_POINTER.md`.
- The Advisor directly read the complete revised `DESIGN_RESULT.md` and all seven changed product design documents,
  4,902 lines total. The six unchanged subjects had already been directly read during initial validation and were
  revalidated by immutable blob identity.
- Version 2 records D-009-A, closes only `DR1-F1`, declares no current-scope open decision, preserves D-001 through
  D-008, and leaves Tailscale's accepted operator prerequisite unchanged.
- Provider uncertainty is now explicitly limited/unverified and nonblocking for this current slice. The two provider
  records, public policy/API facts, role-specific value-free runtime binding, exact five acceptance labels,
  prohibited-claim boundary, and local-control-before-label rule are present.
- DeepSeek and Fish role payload allowlists exclude the required private/personal/sensitive/user/history/secret
  material. All ten expanded/ambiguous scope reasons stop before network and require a new Leo/GPT decision.
- `git diff --check` passed. The revision has no stale `FISH_AUDIO_*` aliases, credential-looking literal values,
  broken relative Markdown targets, implementation/runtime/package change, caption/media artifact, or secret file.
- No secret file or value was opened, read, printed, copied, or used as evidence.

### Gate decision

Advisor validation permits the same fixed Reviewer to perform only `DESIGN_DELTA_REVIEW` of immutable content head
`5c97382841d00ceb8b18e27998c5e68bbe468555` and all 14 design subject paths, with `DR1-F1` in scope. It does not
freeze the design. A `PASS` permits the exact freeze gate; `PASS_WITH_RISK` waits for Leo/GPT acceptance;
`NEEDS_PATCH` may consume the second and final automatic design-revision attempt; `FAIL` stops.

## Design delta review validation and exact freeze

```text
VALIDATION_PHASE: POST_DESIGN_DELTA_REVIEW
VALIDATION_STATUS: PASS
DESIGN_REVIEW_ID: design-delta-review-001
REVIEW_TYPE: DESIGN_DELTA_REVIEW
REVIEWER_VERDICT: PASS
VERDICT_TARGET_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
VERDICT_TARGET_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
PREVIOUS_SUBJECT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
DESIGN_DELTA_REVIEW_REPORT_HEAD: 8c9a94480fcaca7104edcb832f283c9e541c60b9
DESIGN_REVISION_ATTEMPTS_USED: 1
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
FROZEN_DESIGN_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
DESIGN_FREEZE_STATUS: FROZEN
BLOCKING_FINDINGS: none
REQUIRED_PATCHES: none
RISK_ACCEPTANCE_REQUIRED: false; D-009-A already accepted the bounded residual risk
NEXT_ACTOR: VibeNews Worker
```

The Advisor directly read both delta-review files and verified that report commit
`8c9a94480fcaca7104edcb832f283c9e541c60b9` is pushed, has the Advisor review-routing head
`842aebd8338b56ae27ed39dd364e466275c15aea` as its parent, changes only the two declared
`design-delta-review-001` report paths, uses the required containing-commit sentinel, targets exactly design version 2
and all 14 design paths, closes `DR1-F1`, requires no patch or new risk acceptance, and leaves the worktree clean.

The immutable design is therefore frozen at `5c97382841d00ceb8b18e27998c5e68bbe468555`. Neither the Designer pointer
head nor either Reviewer report head replaces that identity. Any later frozen-subject change invalidates the freeze
and must use the bounded Designer revision and same-Reviewer delta-review flow before Worker may resume.

The Worker implementation pass is intentionally separated from real external acceptance. It must build the complete
server/app/tests/ops/acceptance tooling and pass synthetic local checks without reading live secrets or making live
YouTube/DeepSeek/Fish calls. After independent implementation review and any required bounded correction/delta review,
the same reviewed code will be routed to the real private server/provider/device acceptance required by the mission.

## Pre-implementation-review validation

```text
VALIDATION_PHASE: PRE_IMPLEMENTATION_REVIEW
VALIDATION_STATUS: PASS_FOR_INDEPENDENT_IMPLEMENTATION_REVIEW
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
ACTOR: VibeNews Advisor
WORKER_INPUT_HEAD: 60b6983942f92de123e4fe37fd735353cec06611
INITIAL_WORKER_CONTENT_HEAD: e73ce657c731d29b3cfb8309866b076c3770081d
IMPLEMENTATION_REVIEW_SUBJECT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
IMPLEMENTATION_REVIEW_SUBJECT_PATH_COUNT: 86
WORKER_EVIDENCE_HEAD: d008d9ed0a498fc56d00e555eb64d7e402df9edb
WORKER_POINTER_HEAD: 8fe7f16405954f26722d4266161e5bdf5f4dec51
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
INITIAL_DESIGN_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
DESIGN_DELTA_REVIEW_REPORT_HEAD: 8c9a94480fcaca7104edcb832f283c9e541c60b9
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 0
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
DIRTY_STATE: clean before Advisor review routing
NEXT_ACTOR: VibeNews Reviewer
```

### Direct evidence checked

- Fetched `origin/master` and verified `/home/leo/Project/VibeNews`, the configured GitHub origin, `master`, clean
  staged/unstaged/untracked state, and `HEAD == origin/master == 8fe7f16405954f26722d4266161e5bdf5f4dec51` before
  this Advisor routing edit.
- Verified all four fixed sessions exist: `VibeNews-advisor`, `VibeNews-designer`, `VibeNews`, and
  `VibeNews-reviewer`.
- Verified `.env.server.local` exists, has permission `600`, is Git-ignored, and is not tracked. Its content and values
  were never opened, read, printed, copied, hashed, sourced, or used as evidence.
- Read the complete final Worker result and pointer. The canonical result schema, 14 frozen-design paths, both
  design-review heads, exact subject/evidence separation, access statuses, limitations, and live-acceptance sentinel are
  present at the declared evidence heads.
- Verified `60b6983..767e0d2` contains exactly 86 implementation subjects plus the two interleaved Worker evidence
  paths. The verdict target excludes both evidence files. The correction commit updates only
  `server/src/http/schemas.ts`, `server/src/providers/caption.ts`, and `WORKER_RESULT.md`; later evidence/pointer commits
  do not alter any verdict subject.
- An immutable Git-blob scan found no forbidden control byte in any changed file at the subject head. `git diff
  --numstat` treats every file as text; `git diff --check` is clean.
- All 14 frozen-design subjects and both design-review report pairs are byte-unchanged from their immutable heads.
  Base, frozen design, design-review reports, initial content, corrected subject, evidence heads, and pointer heads have
  the required ancestry.
- Advisor independently reran the unchanged subject: typecheck passed; scoped official Expo flat-config lint passed
  with 0 errors and 47 warnings; unit 46/46, integration 51/51, and runtime-local 2/2 passed. The exact warning count was
  corrected in Worker evidence without changing the verdict subject.
- No live YouTube caption, DeepSeek, or Fish request was made; no systemd/Tailscale/runtime state was changed; no private
  acceptance or physical-device playback result is claimed.

### Gate decision

Advisor validation permits only independent `IMPLEMENTATION_REVIEW` of immutable subject head
`767e0d2bdc6d31e9950858c4267adf75c90f5fae` and the exact 86 declared paths. This is not an implementation verdict.
The Reviewer must inspect the full code/diff and run independent synthetic checks. `NEEDS_PATCH` returns stable finding
IDs for a bounded same-Worker correction followed by same-Reviewer `IMPLEMENTATION_DELTA_REVIEW`. Real private provider
and device acceptance remains blocked until the implementation review gate passes.

## Initial implementation-review validation

```text
VALIDATION_PHASE: POST_IMPLEMENTATION_REVIEW
VALIDATION_STATUS: NEEDS_PATCH_ROUTED_TO_BOUNDED_REWORK
IMPLEMENTATION_REVIEW_ID: implementation-review-001
REVIEW_TYPE: IMPLEMENTATION_REVIEW
REVIEWER_VERDICT: NEEDS_PATCH
VERDICT_TARGET_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
BLOCKING_FINDING_IDS: IR-F1
IMPLEMENTATION_REWORK_ATTEMPT: 1
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a1
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW
NEXT_ACTOR: VibeNews Worker
```

The Advisor directly read the complete Reviewer result and pointer and verified report commit
`263678ed5ea71975b23007cb0a84cd167ee9d54c` is pushed, descends from review-routing head
`cab7dace463bdce88c3bec2ccbc88bff08f6e98a`, changes only the two declared Reviewer report paths, targets the exact
86-path implementation subject, and leaves the worktree clean.

`IR-F1` is bounded and does not require a design revision or new Leo/GPT decision. The reviewed
`server/src/bin/accept-private.ts` unconditionally reports `NOT_RUN` and has no real config/provider/pipeline/playback
or evidence path, while frozen sections 14.1, 14.4, and 16.1 require executable real private-acceptance tooling before
the post-review live run. Advisor therefore routes same-Worker implementation rework attempt 1 in only that file plus
one new allowlisted integration test. Live provider/YouTube/device execution and secret access remain forbidden in the
rework; the same fixed Reviewer must perform `implementation-delta-review-001-a1` on the returned immutable subject.

## Pre-implementation-delta-review validation — attempt 1

```text
VALIDATION_PHASE: PRE_IMPLEMENTATION_DELTA_REVIEW
VALIDATION_STATUS: PASS_FOR_INDEPENDENT_IMPLEMENTATION_DELTA_REVIEW
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
FINDING_IDS_IN_SCOPE: IR-F1
IMPLEMENTATION_REWORK_ATTEMPT: 1
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
PREVIOUS_SUBJECT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
NEW_IMPLEMENTATION_SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
NEW_IMPLEMENTATION_SUBJECT_PATH_COUNT: 87
REWORK_CONTENT_HEAD: f6850963349d2a667b766e60a49800079335da00
REWORK_POINTER_HEAD: cd0fae7a173e88d6c3424ac6bf295ac083b9f8fe
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a1
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_DELTA_REVIEW
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
DIRTY_STATE: clean before Advisor delta-review routing
NEXT_ACTOR: VibeNews Reviewer
```

### Direct evidence checked

- Fetched origin and verified `HEAD == origin/master == cd0fae7a173e88d6c3424ac6bf295ac083b9f8fe`, clean
  staged/unstaged/untracked state, previous-subject/review/rework ancestry, and the exact content/pointer commits.
- Read the complete rework result/pointer, all 338 lines of `accept-private.ts`, and all 260 lines of the new integration
  test directly. The content commit changes exactly the two authorized subject paths plus `REWORK_RESULT.md`; the
  pointer commit changes only `REWORK_RESULT_POINTER.md`.
- `git diff --check`, text/numstat/control-byte checks, frozen-design immutability, and initial Reviewer-report
  immutability pass. Rework evidence is excluded from the 87-path verdict target.
- Advisor independently reran typecheck and the targeted acceptance suite: typecheck exit 0 and 5/5 targeted tests
  passed. Worker records lint exit 0 with 49 warnings, unit 46/46, integration 56/56, runtime 2/2, and migration
  dry-run exit 0; the same Reviewer must reproduce and assess these.
- No live provider/YouTube/tailnet/device call, secret access, systemd/Tailscale mutation, runtime DB mutation, or live
  acceptance claim occurred.

### Required same-Reviewer focus

The delta is reviewable and within the routed path bound; this validation does not declare IR-F1 closed. The Reviewer
must determine whether the runner can produce false PASS evidence because runtime-access facts are operator-set
booleans rather than redacted observed checks; file stat/session creation substitutes for authorized Range/device
playback; `rawRetained` is hard-coded false; provider policy fixtures permit empty mandatory D-009 fields; runtime
bindings, payload audits, channel discovery, repeat-job/daily-count behavior, and failure sanitization are sufficiently
verified; and the new tests prove the normal CLI/evidence boundary rather than only injected assertions.

### Gate decision

Advisor validation permits only the same fixed Reviewer to perform `IMPLEMENTATION_DELTA_REVIEW` of immutable subject
`f6850963349d2a667b766e60a49800079335da00`, previous subject `767e0d2...`, and the 87 declared paths with IR-F1 in
scope. A `PASS` opens the later live acceptance phase but is not acceptance. `NEEDS_PATCH` may consume the second and
final automatic implementation-rework attempt; `PASS_WITH_RISK` requires Leo/GPT; `FAIL` stops.

## Implementation delta-review validation — attempt 1

```text
VALIDATION_PHASE: POST_IMPLEMENTATION_DELTA_REVIEW
VALIDATION_STATUS: NEEDS_PATCH_ROUTED_TO_FINAL_BOUNDED_REWORK
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a1
IMPLEMENTATION_DELTA_REVIEW_REPORT_HEAD: 8ce5c26f214b6aafd7404f5642c5698ea3672517
REVIEWER_VERDICT: NEEDS_PATCH
VERDICT_TARGET_HEAD: f6850963349d2a667b766e60a49800079335da00
BLOCKING_FINDING_IDS: IR-F1-D1
IMPLEMENTATION_REWORK_ATTEMPT: 2
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
NEXT_IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a2
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
NEXT_ACTOR: VibeNews Worker
```

The Advisor directly read the complete delta-review result and pointer and verified report commit
`8ce5c26f214b6aafd7404f5642c5698ea3672517` is pushed, descends from routing head
`c141596e2cee093370058965e81304464d54ee7b`, changes only the two declared Reviewer report paths, targets exact
87-path subject `f6850963349d2a667b766e60a49800079335da00`, and leaves the worktree clean. The report confirms the two-path
delta, prior/frozen/report immutability, typecheck, targeted 5/5, unit 46/46, and integration 56/56 without live calls
or secret access.

`IR-F1-D1(a–g)` is objective and bounded: hard-coded raw-retention success; operator-asserted access booleans;
tautological channel discovery; daily aggregate instead of job-attributable TTS increment; file stat instead of the
authorized HTTP Range boundary; empty D-009-A policy records accepted; and unchecked/precomputed runtime bindings.
These defects can emit false section 14.4 or `LOCAL_DATA_CONTROLS: VERIFIED` evidence. Correcting them implements the
already frozen contract and requires no new Leo/GPT decision.

The Advisor therefore routes same-Worker implementation rework attempt 2, the final automatic attempt, limited to the
same two subject paths and stable finding `IR-F1-D1`. Rework remains synthetic and may not access secrets, make live
provider/YouTube/tailnet/device calls, or mutate runtime state. The same fixed Reviewer must perform
`implementation-delta-review-001-a2`. Any further non-pass reaches the two-attempt limit and returns to Leo/GPT; there
is no third automatic rework, substitute actor, or Advisor patch.

## Pre-implementation-delta-review validation — attempt 2

```text
VALIDATION_PHASE: PRE_IMPLEMENTATION_DELTA_REVIEW
VALIDATION_STATUS: PASS_FOR_INDEPENDENT_IMPLEMENTATION_DELTA_REVIEW
VALIDATION_MEANING: route permission only; IR-F1-D1 closure not declared
IMPLEMENTATION_REVIEW_ID: implementation-review-001
INITIAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
PRIOR_IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a1
PRIOR_IMPLEMENTATION_DELTA_REVIEW_REPORT_HEAD: 8ce5c26f214b6aafd7404f5642c5698ea3672517
FINDING_IDS_IN_SCOPE: IR-F1-D1
IMPLEMENTATION_REWORK_ATTEMPT: 2
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
PREVIOUS_SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
NEW_IMPLEMENTATION_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
NEW_IMPLEMENTATION_SUBJECT_PATH_COUNT: 87
REWORK_INPUT_HEAD: 1289037722b4b1ec6136b69292602ecce2b300ce
REWORK_CONTENT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
REWORK_POINTER_HEAD: 01807f1993961bd12bdc5656aba745b47d80c7f7
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_DELTA_REVIEW
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
DIRTY_STATE: clean before Advisor delta-review routing
NEXT_ACTOR: VibeNews Reviewer
```

### Direct evidence checked

- Fetched origin and verified `HEAD == origin/master == 01807f1993961bd12bdc5656aba745b47d80c7f7`, clean
  staged/unstaged/untracked state, previous-subject/review/rework ancestry, and exact content/pointer commits.
- Read the complete rework result/pointer, all 500 lines of `accept-private.ts`, all 300 lines of the integration test,
  the runtime-binding constructor, actual `loadPipelineEvidence`, config surface, migration, audio route, and frozen
  audit-key/access requirements directly.
- Content commit `98d3ea6...` changes exactly the two allowed subject paths plus `REWORK_RESULT.md`; pointer commit
  `01807f1...` changes only its pointer. Worker evidence remains excluded from the 87-path verdict target.
- `git diff --check`, ancestry, text/control-byte, frozen-design, and both Reviewer-report immutability checks pass.
  Advisor independently reran typecheck and the targeted acceptance suite: exit 0 and 8/8. Worker records lint exit 0
  with 53 warnings, unit 46/46, integration 59/59, runtime 2/2, and migration dry-run exit 0.
- No live provider/YouTube/tailnet/public-network/device call, secret access, runtime DB/state mutation, or acceptance
  claim occurred.

### Required same-Reviewer focus

The delta is within the routed paths and independently reviewable; that does not mean the finding is closed. Direct
Advisor inspection found material normal-CLI questions that the Reviewer must decide:

- `cliAccessObserver` calls only `tailscale status --json`; `funnelOff = !!statusJson`, Serve/device status derives
  from self-online, and public denial derives from the same boolean. No Serve/Funnel status or reachability/denial
  probe is made, so the prior operator-boolean defect may have become another tautological false-PASS path.
- The CLI uses `config.deviceTokenSha256` as the provider-binding HMAC key, while frozen design requires a separate
  server-only audit key under an operator-only 0700/0600 private path. It does not load that key or compare stored
  `audit_key_id`, `credential_present`, or `verified_at`; the test injects an arbitrary matching key.
- Bounded raw scanning covers only caption-temp/staging with a partial extension list; policy host/API URL/freshness,
  daily local-date selection, ephemeral rather than configured Range authorization, and pre-existing channel/retry
  behavior also require direct judgment. The eight tests mostly inject already-trusted access/key evidence and do not
  prove those normal CLI boundaries.

### Gate decision

Advisor validation permits only the same fixed Reviewer to perform the final `IMPLEMENTATION_DELTA_REVIEW` of subject
`98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518`, previous subject `f685096...`, and the unchanged 87 paths with
`IR-F1-D1` in scope. `PASS` opens later live acceptance but is not acceptance. Any `PASS_WITH_RISK`, `NEEDS_PATCH`, or
`FAIL` returns to Leo/GPT because attempt 2 exhausted the automatic rework limit; no third rework or Advisor patch is
authorized.

## Final implementation delta-review validation — automatic limit reached

```text
VALIDATION_PHASE: POST_IMPLEMENTATION_DELTA_REVIEW
VALIDATION_STATUS: IMPLEMENTATION_REWORK_LIMIT_REACHED_RETURN_TO_LEO_GPT
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a2
IMPLEMENTATION_DELTA_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
REVIEWER_VERDICT: NEEDS_PATCH
VERDICT_TARGET_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
BLOCKING_FINDING_IDS: IR-F1-D1(b); IR-F1-D1(g)
CLOSED_SUBITEMS: IR-F1-D1(a); IR-F1-D1(c); IR-F1-D1(d); IR-F1-D1(e); IR-F1-D1(f)
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
AUTOMATIC_REWORK_LIMIT_REACHED: true
THIRD_AUTOMATIC_REWORK_AUTHORIZED: false
REQUIRED_LEO_DECISION: D-010
ADVISOR_RECOMMENDATION: D-010-A
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_BLOCKED_BY_IMPLEMENTATION_REVIEW
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
NEXT_ACTOR: Leo/GPT
```

The Advisor directly read the complete final delta-review result and pointer and verified report commit
`054333eb08d677c831e911866d3c7a9dbb34df9c` is pushed, descends from routing head
`1a961929360ec159178c1f8dafbad58a56f9f569`, changes only the two declared Reviewer report paths, targets exact
87-path subject `98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518`, and leaves the worktree clean. The same Reviewer independently
reproduced typecheck, acceptance 8/8, unit 46/46, and integration 59/59 with no live call or secret access.

The final verdict credits five closed sub-items and retains exactly two stable blockers. `IR-F1-D1(b)` can still
false-PASS private access from generic tailnet-up status; `IR-F1-D1(g)` uses the device bearer-token hash instead of
the frozen separate provider audit key and lacks the real key/binding provisioning path. Neither may be risk-accepted
implicitly because they directly affect whether live PASS evidence is truthful.

Both automatic reworks are consumed. Per `RUN_PROTOCOL.md`, the Advisor does not route attempt 3, patch code, substitute
an actor, run live acceptance, or claim mission completion. `D-010` in `05_LEO_DECISION_REQUEST.md` asks Leo/GPT to
authorize one exceptional same-Worker/same-Reviewer bounded correction, hold, or request a broader design-policy
change. Safe state remains stopped before runtime/provider/device activity.

## D-010 exceptional-rework decision ACK

```text
VALIDATION_PHASE: LEO_GPT_DECISION_ACK
DECISION_ID: D-010
DECISION: D-010-A — AUTHORIZE ONE EXCEPTIONAL FINAL REWORK
ACK_STATUS: ACKNOWLEDGED
ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/07_D010_DECISION_ACK.md
SOURCE_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
FINDING_IDS_IN_SCOPE: IR-F1-D1(b); IR-F1-D1(g)
PREVIOUS_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
AUTOMATIC_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_REWORK_LIMIT_REACHED: true
EXCEPTIONAL_IMPLEMENTATION_REWORK_AUTHORIZED: true
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPT: 3
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 1
ALLOWED_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
SAME_WORKER_REQUIRED: true
SAME_REVIEWER_REQUIRED: true
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a3
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
NEXT_ACTOR: VibeNews Advisor
```

This ACK supplies the new authority required after the canonical automatic limit. It is mission-specific and does not
change the canonical two-attempt policy, revive `SPECIAL_IMPLEMENTATION_EXCEPTION`, reopen D-001 through D-009-A, or
permit an Advisor implementation patch. The next transition is an Advisor-authored exceptional rework handoff to the
same fixed Worker, followed only by the same fixed Reviewer's `implementation-delta-review-001-a3`.

## D-010 exceptional implementation rework routing

```text
VALIDATION_PHASE: EXCEPTIONAL_IMPLEMENTATION_REWORK_ROUTING
DECISION_ID: D-010
DECISION_ACK_HEAD: 53f64282ec594962011da22c2328335d6a12fd8f
SOURCE_REVIEW_ID: implementation-delta-review-001-a2
SOURCE_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
FINDING_IDS_IN_SCOPE: IR-F1-D1(b); IR-F1-D1(g)
PREVIOUS_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
AUTOMATIC_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPT: 3
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1
EXCEPTIONAL_IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 1
ALLOWED_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
PLANNED_IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a3
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
NEXT_ACTOR: VibeNews Worker
```

The exceptional handoff narrows the Worker to the two final Reviewer findings and the same two product paths. Its
positive tests must use the real normal-CLI access collector and isolated real audit-key/binding provisioner, not
trusted success objects or a caller-supplied matching key. Rework execution remains synthetic and cannot read secrets,
call live services/networks/devices, or mutate runtime state. Only the same fixed Reviewer may judge returned subject
head in `implementation-delta-review-001-a3`; no further attempt is authorized.

## Exceptional rework attempt 3 return and pre-a3 validation

```text
VALIDATION_PHASE: ADVISOR_PRE_IMPLEMENTATION_DELTA_REVIEW_A3
DECISION_ID: D-010
DECISION_ACK_HEAD: 53f64282ec594962011da22c2328335d6a12fd8f
PRIOR_REVIEW_REPORT_HEAD: 054333eb08d677c831e911866d3c7a9dbb34df9c
PREVIOUS_SUBJECT_HEAD: 98d3ea6ffbb5b7377f5ed6480cad5f9b1ede7518
REWORK_INPUT_HEAD: 2b36dbfcde9007ddcab823f0b330364ededd5966
REWORK_CONTENT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
NEW_IMPLEMENTATION_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
REWORK_POINTER_HEAD: 45bd8185026395256fc855bd9dfd600b36c942d5
NEW_IMPLEMENTATION_SUBJECT_PATH_COUNT: 87
DELTA_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
FINDING_IDS_FOR_REVIEW: IR-F1-D1(b); IR-F1-D1(g)
AUTOMATIC_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_REWORK_ATTEMPTS_USED: 1
EXCEPTIONAL_REWORK_ATTEMPTS_MAX: 1
TYPECHECK: PASS
LINT: PASS_0_ERRORS_53_WARNINGS
UNIT_TESTS: PASS_46_OF_46
INTEGRATION_TESTS: PASS_80_OF_80
TARGETED_ACCEPT_PRIVATE_TESTS: PASS_29_OF_29
RUNTIME_LOCAL_TESTS: PASS_2_OF_2
MIGRATION_DRY_RUN: PASS_NO_DB_WRITTEN
CONTROL_BYTE_SCAN: PASS
ORIGIN_AND_CLEAN_STATE: PASS
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
ADVISOR_ROUTE_VALIDATION: PASS_FOR_INDEPENDENT_A3_REVIEW_ONLY
PLANNED_REVIEW_ID: implementation-delta-review-001-a3
NEXT_ACTOR: VibeNews Reviewer
```

Advisor fetched and verified exact origin equality, clean state, prior/routing ancestry, the three-path content commit
(two product paths plus Worker result), the pointer-only commit, and immutable frozen/decision/prior-review objects.
The positive suite executes the seam-driven collector and isolated real key/binding provisioner; no trusted `okAccess`
or device-token-as-audit-key production path remains. Advisor also caught and caused the same Worker to remove a literal
NUL and pre-commit constant access probes before the returned subject was published.

This is a routing validation, not a finding closure or risk acceptance. The a3 Reviewer brief requires direct scrutiny
of actual Serve/Funnel/device/public-denial semantics and of the frozen key lifecycle: current `main()` calls
`resolveAuditKey(..., {allowCreate:true})` before checking whether binding rows already exist, while frozen §4.2 says an
existing binding plus missing key must fail closed rather than create a new key. Only the same Reviewer may decide
whether that and every `(b)`/`(g)` requirement pass. Any non-pass returns to Leo/GPT; no attempt 4 is authorized.

## Exceptional implementation delta review a3 return

```text
VALIDATION_PHASE: ADVISOR_POST_IMPLEMENTATION_DELTA_REVIEW_A3
REVIEW_ID: implementation-delta-review-001-a3
REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
REVIEW_VERDICT: NEEDS_PATCH
VERDICT_TARGET_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
CLOSED_THIS_ATTEMPT: IR-F1-D1(b)
BLOCKING_FINDING_ID: IR-F1-D1(g)-L
AUTOMATIC_REWORK_ATTEMPTS_USED: 2
AUTOMATIC_REWORK_ATTEMPTS_MAX: 2
EXCEPTIONAL_REWORK_ATTEMPTS_USED: 1
EXCEPTIONAL_REWORK_ATTEMPTS_MAX: 1
ALL_REWORK_BUDGET_EXHAUSTED: true
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_BLOCKED_BY_IMPLEMENTATION_REVIEW
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
REQUIRED_LEO_DECISION: D-011
ADVISOR_RECOMMENDATION: D-011-A
NEXT_ACTOR: Leo/GPT
```

The Advisor directly read the complete a3 result/pointer and verified report commit
`d228be432e5645b06e2ad8847293a2adebb8ca88` is pushed, descends from routing head
`a30659723791e0722094f696de4d7a8fd2cdb164`, changes only the two declared Reviewer report paths, targets exact
87-path subject `df6dfd502593735518d77ee7d7ec62035989a016`, and leaves the worktree clean. The Reviewer independently
confirmed `(b)` closed, all earlier closed sub-items intact, and the synthetic suite green.

`IR-F1-D1(g)-L` remains blocking because the normal CLI can create a fresh key and fresh key-dependent binding rows
when old binding rows exist but the key file is missing. That violates frozen §4.2 and can false-PASS after key loss or
tampering. All authorized rework is consumed. The Advisor does not route attempt 4, patch code, run live acceptance, or
claim completion. `D-011` in `05_LEO_DECISION_REQUEST.md` requests the new authority required for a single narrow
lifecycle micro-correction or a hold/design-policy decision.

## D-011 lifecycle micro-correction decision ACK

```text
VALIDATION_PHASE: LEO_GPT_DECISION_ACK
DECISION_ID: D-011
DECISION: D-011-A — AUTHORIZE EXACTLY ONE FINAL LIFECYCLE MICRO-CORRECTION
ACK_STATUS: ACKNOWLEDGED
ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/08_D011_DECISION_ACK.md
SOURCE_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
FINDING_ID_IN_SCOPE: IR-F1-D1(g)-L
PREVIOUS_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
FINAL_LIFECYCLE_MICRO_CORRECTION_AUTHORIZED: true
ALLOWED_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
SAME_WORKER_REQUIRED: true
SAME_REVIEWER_REQUIRED: true
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a4
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
NEXT_ACTOR: VibeNews Advisor
```

This ACK supplies exact mission-specific authority for the final lifecycle guard only. It leaves the frozen design and
D-001 through D-010 unchanged, permits only synthetic local proof during correction, and does not authorize the
Advisor to patch product code or substitute any actor. The next transition is an Advisor-authored handoff to the same
fixed Worker followed by the same fixed Reviewer's `implementation-delta-review-001-a4`. A4 `PASS` opens the already
approved real private acceptance; any other verdict returns the exact evidence to Leo/GPT.

## D-011 final lifecycle micro-correction routing

```text
VALIDATION_PHASE: FINAL_LIFECYCLE_MICRO_CORRECTION_ROUTING
DECISION_ID: D-011
DECISION_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
SOURCE_REVIEW_ID: implementation-delta-review-001-a3
SOURCE_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
FINDING_ID_IN_SCOPE: IR-F1-D1(g)-L
PREVIOUS_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPT: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPTS_MAX: 1
ALLOWED_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
PLANNED_IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a4
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
NEXT_ACTOR: VibeNews Worker
```

The handoff requires the normal runtime to count binding rows before resolving the audit key, permits key/binding
creation only at zero rows, and makes every existing-row path load/validate without replacement provisioning. Its tests
must compare complete before/after key and binding state for missing, invalid, symlinked, wrong-owner, wrong-mode, and
wrong-size keys, plus empty-state provisioning and valid-key idempotence. Correction execution remains synthetic and
local. Only the same fixed Reviewer may judge the returned subject in a4.

## D-011 micro-correction return and pre-a4 validation

```text
VALIDATION_PHASE: ADVISOR_PRE_IMPLEMENTATION_DELTA_REVIEW_A4
DECISION_ID: D-011
DECISION_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
PRIOR_REVIEW_REPORT_HEAD: d228be432e5645b06e2ad8847293a2adebb8ca88
PREVIOUS_SUBJECT_HEAD: df6dfd502593735518d77ee7d7ec62035989a016
REWORK_INPUT_HEAD: e6e336bc091131d85891b2ace136b687e847eecd
REWORK_CONTENT_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
NEW_IMPLEMENTATION_SUBJECT_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
REWORK_POINTER_HEAD: 613b9a4ed96e4eaf6ac94b653071b2308d5bd8c7
NEW_IMPLEMENTATION_SUBJECT_PATH_COUNT: 87
DELTA_PRODUCT_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
FINDING_ID_FOR_REVIEW: IR-F1-D1(g)-L
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPT: 1
D011_FINAL_LIFECYCLE_MICRO_CORRECTION_ATTEMPTS_MAX: 1
TYPECHECK: PASS
LINT: PASS_0_ERRORS_53_WARNINGS
UNIT_TESTS: PASS_46_OF_46
INTEGRATION_TESTS: PASS_89_OF_89
TARGETED_ACCEPT_PRIVATE_TESTS: PASS_38_OF_38
RUNTIME_LOCAL_TESTS: PASS_2_OF_2
MIGRATION_DRY_RUN: PASS_NO_DB_WRITTEN
CONTROL_BYTE_SCAN: PASS
ORIGIN_AND_CLEAN_STATE: PASS
LIVE_PRIVATE_ACCEPTANCE: NOT_RUN
RUNTIME_CHANGE_STATUS: ZERO
SECRET_VALUE_ACCESS: ZERO
ADVISOR_ROUTE_VALIDATION: PASS_FOR_INDEPENDENT_A4_REVIEW_ONLY
PLANNED_REVIEW_ID: implementation-delta-review-001-a4
NEXT_ACTOR: VibeNews Reviewer
```

Advisor fetched and verified `HEAD == origin/master == 613b9a4ed96e4eaf6ac94b653071b2308d5bd8c7`, a clean worktree,
exact parent/ancestry, a three-path content commit (two authorized product paths plus Worker result), and a pointer-only
commit. Frozen design, D-011 ACK, canonical protocols, prior Reviewer reports, packages, migrations, APIs, and services
are unchanged. Both product subjects are control-byte clean and `git diff --check` passes.

Direct code inspection confirms the new normal CLI calls `acceptancePreflight`; its lifecycle seam counts binding rows
before key resolution, confines key creation and provisioning to the zero-row branch, and makes the existing-row branch
load/select/validate only. The deterministic suite compares full key state and ordered binding-row snapshots across
missing, invalid, symlinked, wrong-owner, wrong-mode, wrong-size, extra-row, and valid-key cases. At Advisor request, the
same Worker strengthened the owner proof to reach `AUDIT_KEY_OWNER` specifically and replaced a constructed label check
with a real downstream spy on the same preflight seam used by `main()`.

The Advisor independently reran every listed check without live calls, secret access, runtime mutation, or deployment.
This permits only same-Reviewer a4 review; it does not close `IR-F1-D1(g)-L`, authorize live acceptance yet, accept the
owner test seams as safe, or claim mission completion. Reviewer must decide actual production-default owner enforcement,
all no-replacement paths, valid-key idempotence, stale fail-closed behavior, and every earlier closure.

## Implementation delta review a4 PASS and live-acceptance routing

```text
VALIDATION_PHASE: ADVISOR_POST_IMPLEMENTATION_DELTA_REVIEW_A4
REVIEW_ID: implementation-delta-review-001-a4
REVIEW_REPORT_HEAD: 4d600337fbcaa08ff0d4fecd1c4a684430d81700
REVIEW_VERDICT: PASS
VERDICT_TARGET_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
FINDING_CLOSED: IR-F1-D1(g)-L
CUMULATIVE_IMPLEMENTATION_FINDINGS: all IR-F1 and IR-F1-D1(a)-(g)-L closed
FINAL_IMPLEMENTATION_REVIEW_VERDICT: PASS
IMPLEMENTATION_REVIEW_GATE_STATUS: PASSED_VIA_A4
LIVE_ACCEPTANCE_ID: live-private-acceptance-001
LIVE_PRIVATE_ACCEPTANCE: ROUTED_NOT_RUN
DEVICE_GLOBAL_PLAYBACK_ACCEPTANCE: NOT_RUN
RUNTIME_CHANGE_STATUS: ZERO_BEFORE_LIVE_ROUTE
SECRET_VALUE_ACCESS: ZERO_BEFORE_LIVE_ROUTE
NEXT_ACTOR: VibeNews Worker
```

Advisor fetched and directly read the complete a4 result/pointer. Report commit
`4d600337fbcaa08ff0d4fecd1c4a684430d81700` is report-only, descends from routing head
`e495deeed90e690d524a8e4394c14e0124b4c48e`, changes exactly the two declared Reviewer paths, targets immutable
87-path subject `1b39a51a100c8b5e2925699620e24602a4df9445`, and leaves origin/worktree clean. The same Reviewer independently
inspected the actual lifecycle, ran the deterministic suites, closed `IR-F1-D1(g)-L`, and confirmed every earlier
closure without new risk or authority conflict.

D-011-A therefore opens the already-approved real private acceptance without another counter-based decision. Advisor
routes the reviewed code to the same fixed Worker for exactly one bounded real public YouTube-to-DeepSeek-to-Fish run,
private generated-audio/runtime evidence, channel/access/policy/local-control verification, and no device PASS claim.
The Worker may consume prepared server secrets only inside sanitized server processes and mutate only the private
development runtime state. Product/design changes, Tailscale/access-policy mutation, secret output/copy, alternate
providers/sources, sample audio, and completion claims remain forbidden.

Advisor separately verified current public policy metadata on `2026-07-12` through the agent-reach documented Jina
Reader fallback; the wrapper command was unavailable. The routing artifact records only official URLs, dates, safe
document-set hashes, statement/control codes, and the exact limited/unverified labels. No private content or credential
was used. Live acceptance and device/global playback remain mandatory before reloads and final audit.

## Live private acceptance preflight blocker validation

```text
VALIDATION_PHASE: ADVISOR_POST_LIVE_ACCEPTANCE_PREFLIGHT
LIVE_ACCEPTANCE_ID: live-private-acceptance-001
WORKER_ACCEPTANCE_CONTENT_HEAD: 5bcc0b649783077d5209242f462af80dc5618d3a
WORKER_ACCEPTANCE_POINTER_HEAD: 0203dd34ebed518ba2694027231a79f6cc948b00
RESULT_STATUS: BLOCKED
BLOCKED_CODE: RUNTIME_ACCESS_TOOLING_UNAVAILABLE
BLOCKED_STAGE: PREFLIGHT_BEFORE_SECRET_CONSUMPTION_OR_PROVIDER_CALL
TAILSCALE_CLI: ABSENT
TAILSCALED: ABSENT
PROVIDER_CALLS: ZERO
ACCEPTANCE_COMMAND_RUN: false
SECRET_VALUE_CONSUMPTION: ZERO
RUNTIME_MUTATION_STATUS: ZERO
DEVICE_GLOBAL_PLAYBACK_ACCEPTANCE: NOT_RUN
MISSION_COMPLETE: false
REQUIRED_LEO_DECISION: D-012
NEXT_ACTOR: Leo/GPT
```

Advisor independently fetched and verified `HEAD == origin/master ==
0203dd34ebed518ba2694027231a79f6cc948b00`, a clean worktree, exact content/pointer ancestry, and evidence-only Worker
commits. The implementation subject `1b39a51a100c8b5e2925699620e24602a4df9445` and final a4 `PASS` report
`4d600337fbcaa08ff0d4fecd1c4a684430d81700` remain immutable.

The Advisor reproduced absence of both the Tailscale CLI and daemon without reading environment contents. The accepted
runner cannot prove frozen section 14.4(9) without the mandated read-only Serve/status/Funnel/ping observations. The
Worker correctly stopped before `accept:private`, secret consumption, provider/network/device calls, or runtime
mutation. The configured absolute caption binary remains unevaluated rather than falsely classified from PATH alone.

Implementation review remains `PASS`; this environment prerequisite does not reopen any closed finding. It prevents
live or device acceptance, the five D-009 labels, reload completion, final audit, and `MISSION_COMPLETE`. D-012 is
required because installation, tailnet identity, Serve configuration, and device presence are operator-owned state.
