# Worker Live Private Acceptance Handoff — live-private-acceptance-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
TARGET_ACTOR: VibeNews Worker
TARGET_SESSION_NAME: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
ACCEPTANCE_ID: live-private-acceptance-001
IMPLEMENTATION_SUBJECT_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
IMPLEMENTATION_SUBJECT_PATH_COUNT: 87
FINAL_IMPLEMENTATION_REVIEW_ID: implementation-delta-review-001-a4
FINAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 4d600337fbcaa08ff0d4fecd1c4a684430d81700
FINAL_IMPLEMENTATION_REVIEW_VERDICT: PASS
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
D009_ACK_HEAD: 5c93fe01fefa1927244588e114ffa1a0f565c6ff
D011_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
ACCEPTANCE_INPUT_HEAD: RECORDED_AFTER_ACCEPTANCE_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
AUTHORIZED_VIDEO_ID: 5JqK9JLD140
AUTHORIZED_CHANNEL_ID: UCx_YiR733cfqVPRsQ1n8Fag
SOURCE_SCOPE: public_low_risk_youtube_technology
LIVE_YOUTUBE_CALLS_ALLOWED: true, only the authorized public source and constrained caption/feed profiles
LIVE_DEEPSEEK_CALLS_ALLOWED: true, only Builder/Verifier guarded payloads in this acceptance
LIVE_FISH_CALLS_ALLOWED: true, only the final approved SpokenAudioScript and minimum TTS parameters
READ_ONLY_TAILSCALE_AND_PUBLIC_DENIAL_PROBES_ALLOWED: true
TAILSCALE_OR_ACCESS_POLICY_MUTATION_ALLOWED: false
PRIVATE_RUNTIME_MUTATION_ALLOWED: true, only the reviewed development-slice DB/key/bindings/policy/audit/content/audio/backup state
PRODUCT_OR_DESIGN_FILE_CHANGE_ALLOWED: false
SECRET_RUNTIME_CONSUMPTION: server-only from .env.server.local without value output, copying, logging, or report inclusion
RESULT_PATH: runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/live-private-acceptance-001/LIVE_ACCEPTANCE_RESULT.md
POINTER_PATH: runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/live-private-acceptance-001/LIVE_ACCEPTANCE_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Authority and terminal scope

The same fixed Worker now executes the already-approved real private vertical slice against the Reviewer-passed subject.
This phase may consume the prepared server secrets only inside the server processes and make the bounded real public
YouTube, DeepSeek Builder/Verifier, and Fish Audio calls required by the frozen design. It may initialize the private
development runtime state, apply migration 001, record the required public policy snapshots, create the frozen private
audit key/bindings only from an empty binding state, generate one private audio asset, and create/verify a private DB
backup.

Do not change any tracked product/design/protocol/Advisor/Reviewer/Worker implementation/config/package/migration/ops
file. Do not edit, copy, relocate, print, grep, cat, hash into output, or otherwise expose `.env.server.local` or any
secret value. Disable shell tracing before server-only environment consumption; do not place credentials in arguments,
logs, process summaries, results, chat, Git, Expo client, or provider-policy rows.

Do not install/update packages or binaries, configure Tailscale login/Serve/Funnel/grants/ACL/firewall, install systemd
units, change public networking, or substitute another source/provider/model. A missing prerequisite returns a truthful
safe `BLOCKED` result before provider calls when possible.

## Required immutable and runtime preflight

1. Verify launcher-supplied `ACCEPTANCE_INPUT_HEAD`, fetched `origin/master`, clean state, ancestry, exact a4 report-only
   commit, reviewed subject immutability, and the 87-path subject.
2. Read the canonical Worker/run/result rules, frozen sections 4.2, 6.3–6.5, 7, 12–16, D-009-A, the a4 PASS report,
   the reviewed runner, config loader, migration, adapters, processing pipeline, API/Range route, backup path, and this
   handoff. Do not repeat broad discovery.
3. Confirm `.env.server.local` existence, mode 0600, Git-ignore, and untracked status without reading its contents.
   Then, only in non-xtrace server subprocesses, consume it as environment and run the sanitized config check. Record
   only PASS/BLOCKED and required-name codes, never values.
4. Boolean-check the configured yt-dlp executable and Tailscale CLI without printing paths/configured values. The
   caption binary must already exist and be executable; do not install or replace it in this phase.
5. Initialize only the configured private state directory outside the repository with service-user 0700 directories
   and 0600 files. If a runtime DB exists, create and verify a pre-run backup before mutation. Never delete/reset an
   existing key, binding, provider attempt, receipt, audio, or derived artifact to force a pass.
6. Apply migration 001 to the configured runtime DB and verify status/checksum. No schema or migration edit is allowed.
7. Start the reviewed API transiently from this repository in the same fixed Worker session, consuming the environment
   server-side. It must bind the configured loopback address only. Do not create another actor/session or expose a
   public listener.
8. Before any provider call, perform a safe boolean-only prerequisite check that local health responds and the read-only
   Tailscale Serve/status/Funnel commands and required denial probes are available. Discard raw command output and never
   emit hostname, IP, peer/device identity, route, Serve URL, configured port, or token. The reviewed runner remains the
   authoritative access verifier.

## D-009-A policy snapshot record

Advisor reviewed the following official public documents on `2026-07-12` using the documented agent-reach Jina Reader
fallback. The wrapper itself was unavailable. Record these facts in the private runtime DB before acceptance, using an
idempotent transaction and no raw document body:

```text
DEEPSEEK_PROVIDER: deepseek
DEEPSEEK_POLICY_URLS: https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html; https://cdn.deepseek.com/policies/en-US/model-algorithm-disclosure.html; https://api-docs.deepseek.com/
DEEPSEEK_POLICY_EFFECTIVE_OR_UPDATED_DATE: 2026-02-10
DEEPSEEK_REVIEWED_DATE: 2026-07-12
DEEPSEEK_DOCUMENT_SET_SHA256: 149a9ff9c740bbe301b6c5e37f4b3ffc71e53ad8306b9eab56ee01777107fc07
DEEPSEEK_PUBLIC_API_URL: https://api.deepseek.com
DEEPSEEK_PUBLIC_API_SURFACE_ID: deepseek.post.chat-completions

FISH_PROVIDER: fish_audio
FISH_POLICY_URLS: https://fish.audio/privacy/; https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech; https://fish.audio/pt/blog/s2-1-pro-free-api/?articleLocale=en
FISH_POLICY_EFFECTIVE_OR_UPDATED_DATE: 2024-08-28
FISH_FREE_TIER_STATEMENT_PUBLISHED_DATE: 2026-06-23
FISH_REVIEWED_DATE: 2026-07-12
FISH_DOCUMENT_SET_SHA256: 3101be3428a571ed9464966baabeda6b54226f154ec9f04ee59654909bac1f0e
FISH_PUBLIC_API_URL: https://api.fish.audio
FISH_PUBLIC_API_SURFACE_ID: fish.post.v1.tts
```

Use the exact statement/control-code sets and five assurance values already defined in the reviewed domain contracts.
The public records say inputs/content may be collected and used for improvement/training or product development,
retention is purpose/system/business/legal based, and deletion/opt-out rights are stated. Configured account/tier/model
effects, exact retention windows, provider-side deletion, and provider-side no-training remain independently
unverified. Record configured model/reference/API bindings only through the reviewed safe role, public API surface,
audit-key ID, HMAC/config hash, credential-present boolean, and verified time; never output raw configured selectors or
the reference identifier.

The acceptance evidence must contain these exact labels and no prohibited assurance claim:

```text
PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED
LOCAL_DATA_CONTROLS: VERIFIED
PROVIDER_SIDE_DELETION: NOT_VERIFIED
PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED
PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED
```

## Exactly one real acceptance launch

After every safe prerequisite passes, run the reviewed command once:

```text
npm run accept:private -- --video-id 5JqK9JLD140 --channel-id UCx_YiR733cfqVPRsQ1n8Fag
```

The server-only environment may be consumed by the command but never printed. Do not use login, cookies, browser
profiles, netrc, original video/audio download, Whisper/audio fallback, alternate LLM/TTS, mock/sample audio, or a
synthetic success path. The product's internal Verifier maximum-two-attempt and provider error/defer logic remain the
only provider retry behavior. Do not automatically launch the whole acceptance command again after a provider request
may have occurred; inspect safe DB state and return the truthful result.

## Required PASS evidence

Record only safe IDs, counts, hashes, booleans, dates, timestamps, durations, statuses, and fixed codes—never source
text, generated script text, provider bodies, secrets, configured selector values, private paths, audio bytes, device
identity, IP/host, or raw Tailscale output. A PASS requires direct evidence for every frozen §14.4 item:

- exact official video/channel IDs and public caption metadata; deletion timestamp within 24 hours;
- separate Builder and Verifier attempt IDs/hashes/prompts/schemas, actual Verifier PASS score `>=9.0`, zero critical
  failures, and at most two submissions;
- one successful Fish generation attributable to the job, exactly one finalized TTS receipt, daily success delta one,
  and exactly one ready generated-audio asset;
- authorized in-process Range 206 evidence, with real device playback explicitly still pending §14.5;
- real channel-feed discovery identity/order, maximum three promotions, and exactly hourly next poll;
- zero original media and zero raw transcript in repo/DB/log/backup/result; bounded temp cleanup complete;
- loopback-only API, configured Serve HTTPS, authorized peer/grant, explicit Funnel off, and public/non-tailnet denial,
  each from the runner's dedicated redacted observation;
- active current-scope approval and allowed value-free payload audits for each provider call;
- both exact current policy snapshots and three valid role bindings; and
- all five D-009 labels followed by `LIVE_PRIVATE_ACCEPTANCE: PASS`.

After PASS, independently query only value-free aggregate evidence, run the reviewed backup and restore verification,
confirm repo remains clean and immutable, and leave the private loopback API available only if it remains inside the
same fixed Worker session for the immediately following device acceptance. Do not claim device/global playback PASS in
this phase.

## Failure and result contract

Any missing config/tool/access prerequisite before provider calls returns `BLOCKED` without improvisation. Any
YouTube/provider/pipeline/local-control failure returns the exact sanitized `FAIL`/`BLOCKED` code and safe attempt/receipt
counts; it never authorizes sample output, secret inspection, a second Fish call, or a completion claim.

Write two additive evidence-only commits without changing the reviewed subject:

1. Content commit: only `LIVE_ACCEPTANCE_RESULT.md`. Record the immutable heads, exact commands, runtime mutation scope,
   policy snapshot facts, safe §14.4 evidence, exact five labels/status, no-secret/no-original-media checks, backup
   result, limitations, and whether the transient API remains active. Use
   `LIVE_ACCEPTANCE_CONTENT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER`.
2. Pointer-only commit: only `LIVE_ACCEPTANCE_RESULT_POINTER.md`, recording the actual content head and
   `LIVE_ACCEPTANCE_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT`.

Push both to `master`, verify origin equality, reviewed-subject/report immutability, exact evidence ownership, and clean
state. Return only the canonical pointer to Advisor and STOP. Do not launch device acceptance, Reviewer, Designer,
Leo/GPT, another actor, agent, or subagent.
