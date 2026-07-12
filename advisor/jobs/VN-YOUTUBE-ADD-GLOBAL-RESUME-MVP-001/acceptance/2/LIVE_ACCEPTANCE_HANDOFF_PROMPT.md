# Worker Live Private Acceptance Handoff — live-private-acceptance-002

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
TARGET_ACTOR: VibeNews Worker
TARGET_SESSION_NAME: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
ACCEPTANCE_ID: live-private-acceptance-002
PRIOR_ACCEPTANCE_ID: live-private-acceptance-001
PRIOR_ACCEPTANCE_STATUS: BLOCKED_BEFORE_COMMAND_PROVIDER_OR_RUNTIME
PRIOR_ACCEPTANCE_CONTENT_HEAD: 5bcc0b649783077d5209242f462af80dc5618d3a
PRIOR_ACCEPTANCE_POINTER_HEAD: 0203dd34ebed518ba2694027231a79f6cc948b00
D012_ACK_HEAD: dad870ac5c5f0df1d434395eddb823118bcfb781
IMPLEMENTATION_SUBJECT_HEAD: 1b39a51a100c8b5e2925699620e24602a4df9445
IMPLEMENTATION_SUBJECT_PATH_COUNT: 87
FINAL_IMPLEMENTATION_REVIEW_ID: implementation-delta-review-001-a4
FINAL_IMPLEMENTATION_REVIEW_REPORT_HEAD: 4d600337fbcaa08ff0d4fecd1c4a684430d81700
FINAL_IMPLEMENTATION_REVIEW_VERDICT: PASS
FROZEN_DESIGN_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
D009_ACK_HEAD: 5c93fe01fefa1927244588e114ffa1a0f565c6ff
D011_ACK_HEAD: c5086000070db388f6d217384191feb50433bfd2
ACCEPTANCE_INPUT_HEAD: RECORDED_AFTER_ACCEPTANCE_REROUTING_PUSH_IN_ACTUAL_LAUNCHER
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
RESULT_PATH: runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/live-private-acceptance-002/LIVE_ACCEPTANCE_RESULT.md
POINTER_PATH: runs/worker/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/live-private-acceptance-002/LIVE_ACCEPTANCE_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## Authority and controlling contract

D-012-A records that Leo/operator completed the trusted-console prerequisite. Advisor then verified, without exposing
values, that the Tailscale CLI/daemon and PATH `yt-dlp` backend are available and the read-only Tailscale status, Serve,
and Funnel commands return successfully. This opens a fresh acceptance attempt; it is not an access PASS.

Read and follow the complete original acceptance contract at
`advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/acceptance/LIVE_ACCEPTANCE_HANDOFF_PROMPT.md`, plus
`11_D012_DECISION_ACK.md`, `09_LIVE_ACCEPTANCE_BLOCKED.md`, the a4 report, frozen design, canonical Worker/run/result
rules, and this handoff. All original authority, data minimization, D-009 snapshot facts and five labels, preflight,
single-launch, evidence, backup, API, failure, no-secret, no-original-media, and stop rules remain mandatory.

Where the original handoff names `live-private-acceptance-001`, its input head, or its result/pointer paths, this file
replaces only those fields with `live-private-acceptance-002`, the launcher-supplied rerouting head, and the two new
`live-private-acceptance-002` evidence paths. Never edit or overwrite the immutable attempt-001 evidence.

## Fresh-attempt rules

1. Fetch and require clean `HEAD == origin/master ==` the launcher-supplied acceptance input head. Reconfirm the
   reviewed 87-path subject, a4 report, ACK, and route ancestry and immutability.
2. Verify `.env.server.local` metadata without reading it. Only a non-xtrace server subprocess may consume the
   environment. Run the sanitized config check and record codes/status only, never values.
3. Boolean-check the configured absolute caption binary and the reviewed access prerequisites. Discard raw
   status/Serve/Funnel/ping/denial-probe output and do not report a path, address, hostname, peer, device identity,
   tailnet/Serve URL, configured port, token, selector, reference ID, or provider body.
4. Do not install, login, join, configure, enable/disable, or otherwise mutate Tailscale, Serve, Funnel, grants, ACL,
   firewall, packages, binaries, or device state. Any mismatch returns truthful `BLOCKED` before provider calls.
5. The first attempt did not execute `accept:private`, consume secrets, call a provider, or mutate runtime state. After
   every fresh preflight passes, execute the reviewed command exactly once for attempt 002:

   ```text
   npm run accept:private -- --video-id 5JqK9JLD140 --channel-id UCx_YiR733cfqVPRsQ1n8Fag
   ```

6. Do not rerun the whole command after any YouTube, DeepSeek, or Fish request may have occurred. Inspect only safe
   aggregate runtime evidence and return the exact sanitized `PASS`, `FAIL`, or `BLOCKED` result.
7. A `PASS` still requires every frozen §14.4 item, the five exact D-009 labels, one real generated private audio asset,
   backup/restore verification, repository immutability, and `LIVE_PRIVATE_ACCEPTANCE: PASS`. It must explicitly leave
   physical-device §14.5 and global resume/exclusion acceptance pending.
8. Publish exactly two additive commits: content-only `LIVE_ACCEPTANCE_RESULT.md`, then pointer-only
   `LIVE_ACCEPTANCE_RESULT_POINTER.md`. Push, verify origin equality and clean state, return only the pointer, and STOP.

No product/design/protocol/Advisor/Reviewer/implementation change, alternate source/provider, mock/sample audio,
Whisper/audio fallback, secret inspection, substitute actor/agent/subagent, device PASS, reload, final audit, or mission
completion is authorized in this Worker phase.
