# Worker Rework Handoff — implementation-rework-001-a2

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
PRIOR_DELTA_REVIEW_ID: implementation-delta-review-001-a1
PRIOR_DELTA_REVIEW_REPORT_HEAD: 8ce5c26f214b6aafd7404f5642c5698ea3672517
REVIEW_FINDING_IDS: IR-F1-D1
REWORK_INPUT_HEAD: RECORDED_AFTER_REWORK_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
PREVIOUS_SUBJECT_HEAD: f6850963349d2a667b766e60a49800079335da00
ALLOWED_PATCH_PATHS: server/src/bin/accept-private.ts; server/test/integration/accept-private.test.ts
WORKER_EVIDENCE_PATHS: runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md; runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md
FORBIDDEN_PATHS: every other repository path, including frozen design, Reviewer reports, Advisor artifacts, package files, environment files, runtime state, generated audio, DB, and secrets
IMPLEMENTATION_REWORK_ATTEMPT: 2
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
IMPLEMENTATION_DELTA_REVIEW_ID: implementation-delta-review-001-a2
LIVE_PROVIDER_CALLS_ALLOWED: false
LIVE_YOUTUBE_CALLS_ALLOWED: false
SECRET_ACCESS: false
RUNTIME_MUTATION_ALLOWED: false
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and identity checks

Before editing, verify the exact repository, origin, branch, launcher-supplied `REWORK_INPUT_HEAD`, fetched
`origin/master`, clean staged/unstaged/untracked state, and ancestry. Directly read, without relying on chat memory or
summaries:

- both root entries and every canonical protocol;
- all 14 frozen-design paths at `FROZEN_DESIGN_HEAD`, especially sections 14.1, 14.4, 14.5, 15, 16.1, 17, and 18;
- the original Worker contract and complete initial Worker result/pointer;
- the complete initial implementation-review result/pointer and the complete `implementation-delta-review-001-a1`
  result/pointer at `PRIOR_DELTA_REVIEW_REPORT_HEAD`;
- both attempt-1 rework prompts and the current `REWORK_RESULT.md`/pointer;
- both allowed subject files at `PREVIOUS_SUBJECT_HEAD`, their previous blobs, and every existing module/interface the
  runner calls for access, policy, binding, storage, channel, HTTP Range, pipeline, and playback evidence.

Never open, print, parse, copy, hash, or source `.env.server.local`. This rework uses only synthetic injected
configuration, stores, command results, probes, HTTP requests, and transports. Do not run the normal CLI or any live
provider, YouTube, tailnet, public-network, runtime-DB, generated-audio, or physical-device path.

## IR-F1-D1 — final bounded correction

Attempt 1 genuinely replaced the inert sentinel with an executable fail-closed runner and real pipeline wiring. Keep
that work. Correct only the seven evidence-verification defects `IR-F1-D1(a–g)` identified by the same Reviewer. The
normal CLI must be incapable of emitting any section 14.4 success item or the five D-009-A labels from a constant,
tautology, unverified operator assertion, permissive empty record, or precomputed unchecked boolean.

Within only the two allowed subject paths:

1. **IR-F1-D1(a), raw retention/local controls.** Remove the hard-coded `rawRetained = false`. Derive the result from
   observable job-bound evidence: the job's temporary caption artifact is deleted within its deadline; no raw source,
   response body, transcript value, or original-media value remains for the job in the applicable DB/audit records;
   and no original video, original audio, or raw transcript file remains under the job's bounded temp/state paths.
   Missing, malformed, inaccessible, or positive-retention evidence fails closed. Never scan outside the bounded
   configured VibeNews paths and never output filenames containing private data or any file/body contents.
2. **IR-F1-D1(b), private-access evidence.** Remove acceptance of bare `VIBENEWS_ACCEPT_*` truth flags. The normal CLI
   must obtain redacted observable, time-bound evidence for loopback binding, tailnet-only Serve exposure, authorized
   device grant, Funnel disabled, and public/non-tailnet denial using read-only status commands and bounded probes.
   Record only safe provenance type, timestamp, status, and digest/count data; no IP, hostname, token, credential, raw
   command body, or private route may be printed. Tests must inject synthetic observers. Absence, stale evidence,
   command failure, contradictory exposure, or a plain operator boolean returns non-zero `RUNTIME_ACCESS_REQUIRED`.
   Do not change Tailscale, Serve, Funnel, firewall, systemd, or network configuration.
3. **IR-F1-D1(c), channel poll/discovery.** Replace `discovered >= 0`. Bind this acceptance run to the feed parsed in
   this run and the discoveries recorded from it; require at least one real discovery, exact recorded identity/count
   correspondence, oldest-first promotion of no more than three unseen videos, and last/next poll timestamps written
   by this poll at exactly the one-hour interval. Zero discovery, unrelated prior rows, wrong order, stale timestamps,
   or over-promotion fails closed.
4. **IR-F1-D1(d), exactly one TTS success for this job.** Measure a job-attributable before/after increment. Require
   exactly one finalized receipt and one ready audio asset for this job/content and exactly `+1` successful daily usage
   caused by this run. Do not require the day's aggregate to equal one; a day already containing other successful work
   must still pass when this job contributes exactly one, while zero or multiple job increments fail.
5. **IR-F1-D1(e), authorized HTTP Range path.** Replace filesystem-stat-only acceptance. Exercise the real authorized
   server audio Range boundary through the existing handler/router or an in-process authorized `Range: bytes=` request.
   Require status 206, a valid bounded `Content-Range`/length matching the selected ready asset, private/no-store cache
   behavior, and denial without authorization. Tests inject/invoke the local handler and do not open a live listener.
   Physical-device A/B/C/D execution remains deferred to section 14.5 and must not be fabricated.
6. **IR-F1-D1(f), D-009-A policy records.** Parse and validate both provider policy snapshots rather than selecting
   only status/date. Before any label, require provider identity, at least one official HTTPS policy URL, policy
   effective/last-updated date, reviewed date, model/API surface, non-empty retention/training/deletion/data-control
   statement codes, and non-empty verified and unverified control-code sets. Require the configured DeepSeek and Fish
   providers and an allowed lookup status. Empty arrays, invalid JSON/URLs/dates, missing fields, wrong provider, or
   stale/unbound rows fail closed. Output only safe status/count/date evidence, never configured values.
7. **IR-F1-D1(g), value-free runtime binding.** Recompute and validate the role-selector matrix against the current
   validated runtime configuration using the existing value-free binding/HMAC scheme. Builder and Verifier must each
   bind the correct DeepSeek endpoint/model/reasoning selector with separate roles; Fish must bind its endpoint/model/
   reference selector with the role-appropriate fields. Do not accept row count, non-null HMACs, or a precomputed
   `runtimeBindingValid` boolean as proof. Missing, duplicate, extra, mismatched, or stale role bindings fail closed.
   Never output selector values, HMAC keys/material, credentials, or reference IDs.

Keep all other frozen invariants: public low-risk authorized source only; fixed `userId=leo`; no original media; no
synthetic/sample fallback in the normal CLI; separate DeepSeek Builder/Verifier with threshold 9.0 and at most two
attempts; Fish receives only the approved spoken script; safe idempotency; sanitized non-zero failures; and the five
exact D-009-A labels emitted in their exact order only after every local evidence gate passes.

## Required negative and regression tests

Expand only `server/test/integration/accept-private.test.ts` using injected synthetic dependencies. Preserve the
existing positive orchestration test, but make its evidence complete and structurally verified. Add focused cases that
prove no five-label block and no `LOCAL_DATA_CONTROLS: VERIFIED` appears when any of these occurs:

- a retained raw artifact, undeleted/late caption artifact, raw/body/transcript DB/audit residue, or inaccessible
  bounded storage check;
- access supplied only by booleans, missing/stale observable access evidence, Funnel enabled, or public reachability;
- zero/unbound channel discoveries, wrong promotion order/count, or non-hourly/stale poll timestamps;
- zero or multiple job-attributable TTS increments; also prove a pre-seeded daily aggregate plus exactly one job
  increment succeeds;
- missing authorization, non-206 response, incorrect range/length, or unsafe cache headers;
- empty/malformed/missing policy URLs, dates, statement/control sets, or wrong provider identity;
- mismatched/duplicate/missing role-selector binding even when a precomputed boolean is true.

Tests must also prove failure output is sanitized and all existing attempt-1 positive/fail-closed behavior remains.
Do not weaken an assertion merely to make the suite pass.

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

Run the targeted acceptance test independently; exact path comparison; `git diff --check`; control-byte/text checks;
frozen-design and both Reviewer-report immutability checks; and focused secret/body/transcript/synthetic-fallback
searches. Do not execute `accept:private` against live configuration during rework.

## Result and commit contract

Use two additive commits without amend or history rewrite:

1. A rework content commit containing only the two allowed subject paths actually changed plus the updated
   `runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT.md`. Use the canonical `REWORK_RESULT` schema and
   record `IR-F1-D1`, both Reviewer report heads, frozen head, previous subject head, new-subject sentinel, exact
   changed paths/tests/access statuses, `IMPLEMENTATION_REWORK_ATTEMPTS_USED: 2`, and unrelated changes `none`. The
   new verdict subject remains the prior 87 implementation paths at this content head; Worker evidence is excluded.
2. After pushing and verifying the content commit, make a pointer-only commit containing only the updated
   `runs/rework/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/REWORK_RESULT_POINTER.md`, recording the actual rework content/new
   subject head with `REWORK_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT`.

Push both to `master`; verify actual `origin/master`, clean worktree, previous-subject ancestry, immutable frozen design
and Reviewer reports, and exact path ownership. Return only the canonical concise rework pointer block to Advisor and
STOP. Do not message or launch Reviewer, Designer, Leo/GPT, another agent, or another session. If all seven sub-items
cannot be closed within these two subject paths, return blocked; do not broaden scope or invent authority.
