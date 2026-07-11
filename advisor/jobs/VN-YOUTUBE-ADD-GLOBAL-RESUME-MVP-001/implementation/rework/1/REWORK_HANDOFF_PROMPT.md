# Worker Rework Handoff — implementation-rework-001-a1

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
TARGET_ACTOR: VibeNews Worker
TARGET_SESSION_NAME: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 263678ed5ea71975b23007cb0a84cd167ee9d54c
REVIEW_FINDING_IDS: IR-F1
REWORK_INPUT_HEAD: RECORDED_AFTER_REWORK_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
PREVIOUS_SUBJECT_HEAD: 767e0d2bdc6d31e9950858c4267adf75c90f5fae
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
WORKER_EVIDENCE_PATHS: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md; runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
FORBIDDEN_PATHS: every other repository path, including frozen design, Reviewer reports, Advisor artifacts, existing tests, package files, environment files, runtime state, generated audio, DB, and secrets
IMPLEMENTATION_REWORK_ATTEMPT: 1
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a1
LIVE_PROVIDER_CALLS_ALLOWED: false
LIVE_YOUTUBE_CALLS_ALLOWED: false
SECRET_ACCESS: false
RUNTIME_MUTATION_ALLOWED: false
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads

Before editing, verify the exact repository, origin, branch, launcher-supplied `REWORK_INPUT_HEAD`, fetched
`origin/master`, clean staged/unstaged/untracked state, and ancestry. Then directly read:

- `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, and every required canonical protocol;
- all 14 frozen-design paths at `FROZEN_DESIGN_HEAD`, especially `설계문서/18_YouTube_Add_Global_Resume_MVP.md`
  sections 14.1, 14.4, 14.5, 15, 16.1, 17, and 18;
- the original Worker brief/handoff and complete initial implementation result/pointer;
- the complete `implementation-review-001` result and pointer at report head
  `263678ed5ea71975b23007cb0a84cd167ee9d54c`, especially IR-F1;
- `server/src/bin/accept-private.ts`, the other server bins as wiring examples, existing config/provider/service/API
  interfaces needed by the runner, and all directly relevant tests at `PREVIOUS_SUBJECT_HEAD`.

Do not execute from chat memory, summaries, or test names. Never open, print, parse, copy, hash, or source
`.env.server.local`. This rework uses only synthetic, non-secret injected configuration and transports.

## IR-F1 — exact bounded correction

The current `accept-private.ts` unconditionally prints `NOT_RUN_PENDING_IMPLEMENTATION_REVIEW` and exits. It has no
config-gated real path and cannot produce frozen section 14.4 evidence even after review. Deferred live execution is
correct; missing executable tooling is not.

Within only the two allowed subject paths:

1. Implement `server/src/bin/accept-private.ts` as the real, fail-closed private acceptance runner required by frozen
   sections 14.1/14.4/16.1. It must expose a testable orchestration boundary with dependency injection while its normal
   CLI path uses the existing validated config, DB, providers, services, and HTTP/playback evidence interfaces.
2. The CLI must require the authorized canonical `--video-id` and `--channel-id`, validated runtime configuration,
   fixed user `leo`, the approved current scope, private loopback/tailnet access preconditions, Funnel-disabled/public-
   unreachable evidence, and the value-free runtime bindings. Missing/invalid config or access must return a non-zero
   truthful `NOT_RUN`/`BLOCKED` status such as `RUNTIME_CONFIG_REQUIRED` or `RUNTIME_ACCESS_REQUIRED`; there is no
   public, sample, mock, or synthetic fallback in the normal CLI path.
3. With real prerequisites later supplied, the runner must drive the existing real path for public caption acquisition
   through separate DeepSeek Builder and Verifier (score >= 9.0, zero critical failures, max two submissions), Fish
   synthesis, exactly one receipt/success increment/ready AudioAsset, authorized Range/playback evidence, and hourly
   channel discovery evidence. Do not duplicate pipeline business logic or bypass scope/payload/runtime-binding guards.
4. Emit every frozen section 14.4 evidence item using only safe IDs, hashes, statuses, scores, counts, and timestamps.
   Never emit transcript text, prompts, provider bodies, generated private audio, credentials, configured provider
   values, HMAC material, private data, or raw errors.
5. Emit the five exact D-009-A labels only after verified local preflight:

```text
PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED
LOCAL_DATA_CONTROLS: VERIFIED
PROVIDER_SIDE_DELETION: NOT_VERIFIED
PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED
PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED
```

   Never emit `LOCAL_DATA_CONTROLS: VERIFIED` on absent/failed scope, payload, binding, no-body-log, transcript cleanup,
   access, or other local-control evidence. Policy uncertainty alone remains nonblocking only for this approved slice.
6. Any transient YouTube/provider/tailnet/device failure must produce truthful non-zero `FAIL`/`BLOCKED`, preserve safe
   retry/idempotency semantics, and never convert sentinel/sample/synthetic evidence into live acceptance.
7. Add only `server/test/integration/accept-private.test.ts`. With injected synthetic transports and no live call, prove:
   - the orchestration invokes the real existing pipeline ports and produces the complete section 14.4 evidence shape;
   - the five labels appear in exact literal form and order only after all local controls pass;
   - absent config/access/scope/payload/binding/cleanup evidence fails closed with a non-zero result and never emits
     `LOCAL_DATA_CONTROLS: VERIFIED`;
   - normal CLI mode cannot select synthetic/sample fallback or expose secret/body/transcript values;
   - no product/provider/network/runtime side effect occurs in the test.

Do not change frozen design, provider/pipeline/service modules, package scripts, docs, existing tests, or any other path.
If the finding cannot be closed within these two subject paths, return blocked to Advisor; do not broaden scope or
invent authority.

## Required verification

Run and record at minimum:

```text
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:runtime-local
npm run server:migrate -- --dry-run
```

Also run the new targeted test independently; exact path comparison; `git diff --check`; control-byte/text checks;
frozen-design/Reviewer-report immutability; searches proving no secret/body/transcript/sample fallback; and clean state.
Do not run `accept:private` against live configuration in this rework.

## Result and commit contract

Use two additive commits without amend or history rewrite:

1. A rework content commit containing only the two allowed subject paths actually changed plus
   `runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md`. Use the canonical `REWORK_RESULT` schema,
   original finding `IR-F1`, frozen head, previous subject head, new-subject sentinel, exact paths/tests/access status,
   `IMPLEMENTATION_REWORK_ATTEMPTS_USED: 1`, and unrelated changes `none`. The new implementation subject is the prior
   86-path subject plus the new integration test at this content head; Worker evidence is not a verdict subject.
2. After pushing and verifying the content commit, a pointer-only commit containing only
   `runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md`, recording the actual rework content/new
   subject head with `REWORK_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT`.

Push both to `master`, verify `origin/master`, clean worktree, previous-subject ancestry, frozen/report immutability,
and exact path ownership. Return only the canonical concise rework pointer block to Advisor and STOP. Do not message or
launch Reviewer, Designer, Leo/GPT, another agent, or another session.
