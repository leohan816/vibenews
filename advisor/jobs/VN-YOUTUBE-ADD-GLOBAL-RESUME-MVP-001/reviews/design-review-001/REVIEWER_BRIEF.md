# Reviewer Brief — design-review-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
MISSION: Independently review the complete YouTube Add, real DeepSeek/Fish pipeline, private server, and user-global resume MVP design before implementation.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: DESIGN_REVIEW
REVIEW_ID: design-review-001
REVIEW_PASS: initial
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
SUBJECT_BASE: e03644239eb46d056ebfa0a19959a8eca3344d9b
SUBJECT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
SUBJECT_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
PREVIOUS_SUBJECT_HEAD: NOT_APPLICABLE
PATCH_HEAD: NOT_APPLICABLE
DESIGN_POINTER_HEAD: 3112f0c088b793d24df0b3084d9939fb6992d3ef
REPORT_PATHS: runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/design-review-001/REVIEW_RESULT.md; runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/design-review-001/REVIEW_RESULT_POINTER.md
REQUIRED_DIFF: git diff e03644239eb46d056ebfa0a19959a8eca3344d9b..f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984 -- <all declared SUBJECT_PATHS>
DESIGN_REVIEW_REQUIRED: true
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads

- `CLAUDE.md`
- `AGENTS.md`
- `docs/agent/ROLE_INDEX.md`
- every canonical protocol required by that index
- `advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/00_INTAKE.md`
- `advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/01_ADVISOR_BRIEF.md`
- `advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/design/DESIGNER_BRIEF.md`
- `advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/04_ADVISOR_VALIDATION.md`
- this review brief and its handoff
- the immutable content of every declared `SUBJECT_PATHS` entry at `SUBJECT_HEAD`
- the Designer pointer at `DESIGN_POINTER_HEAD` and its actual Git lineage
- relevant current source/package/Expo SDK 57 official documentation needed to test feasibility and citations

Do not open, print, copy, or inspect values in `.env.server.local`. The already-authorized provider key names are
contract names only. Do not fetch, print, retain, or quote caption text, provider bodies, private audio, or secret
values during this design review.

## Independent review requirements

Verify directly, without using Designer or Advisor summaries as evidence:

1. D-001 through D-008 and the intake's complete success criteria are preserved without reopening resolved choices.
2. Add replaces only the Briefing tab while the existing Briefing/Schedule/BriefingSession routes remain reachable.
3. Manual CTA and channel ON authority, OFF/delete revocation, human-review stop, and no approval bypass are exact.
4. `yt-dlp` is public-caption-only, no-login/no-cookie/no-media, argument/path/host bounded, immediately cleaned, and
   independently hard-deleted within 24 hours; anti-bot failure remains truthful failure.
5. Every LLM stage is DeepSeek. Builder chunk/aggregate and Verifier have separate prompt, context, schema, adapter,
   and configured selector boundaries using only the exact prepared key names. Server PASS and actual submission
   accounting enforce threshold 9.0, zero critical failures, and at most two Verifier submissions.
6. Fish TTS uses only the configured Fish contract, daily reservations/receipts prevent duplicate or over-cap calls,
   outcome-unknown is not automatically resubmitted, and exactly one ready AudioAsset is recoverable.
7. DB tables, enums, FKs, unique/check/index constraints, API DTOs/routes/errors, correction/deletion, leases,
   idempotency, and process boundaries are complete, internally consistent, and implementable.
8. All exact caps—10 links, 5 channels, hourly poll, 3 unseen/channel/poll, 10 successful TTS/day, concurrency 1,
   Verifier max 2—defer without discard under restart/concurrency.
9. One server-canonical global playback state and device journal implement exactly four states, active-first resume,
   immutable `audioReadyAt,id` snapshot, post-start D exclusion/new-session inclusion, completed/skipped exclusion,
   deliberate backward-seek reconciliation, and isolated manual replay.
10. Expo SDK 57 Audio/SQLite/SecureStore/Router APIs and versions are accurately cited and sufficient for actual
    restart, Range-header audio, background/lock-screen playback, and one-player ownership.
11. Security/privacy/copyright/retention/logging/backup/rollback and secret/raw/media absence boundaries are coherent.
12. The Worker exact allowlist is sufficient for all implementation, tests, operations, real Hetzner deployment, and
    actual-device acceptance while excluding frozen/canonical/other-actor/secret paths.
13. Real selected official source/channel acceptance, private transport denial tests, A/B/C/D and 2:14 device tests,
    commands, failure injection, and lineage evidence are independently executable; mock/sample evidence cannot pass.
14. Decide explicitly whether mandatory Tailscale Serve/grants and provider no-training/data-control verification are
    authorized bounded design choices or new material external prerequisites. If not clearly authorized and
    implementable, issue stable blocking finding IDs rather than silently accepting them.
15. Determine whether non-provider runtime config and Hetzner/device/operator prerequisites can be satisfied within
    the declared Worker authority without reading/writing the ignored secret file or mutating external identity/access
    state. A design that structurally guarantees `RUNTIME_*_REQUIRED` without an authorized completion path is not
    implementation-ready.
16. Verify the actual Git base-to-subject diff, ancestry, content/pointer separation, origin, branch, exact subject
    paths, staged/unstaged/untracked state, and absence of unauthorized content/runtime changes.

The verdict applies only to `SUBJECT_HEAD` and `SUBJECT_PATHS`; pointer and Advisor routing files are context/evidence.
Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. `PASS_WITH_RISK` must enumerate every risk and
whether Leo/GPT acceptance is required. `NEEDS_PATCH` must use stable finding IDs, evidence locations, impact, and exact
bounded required patches. Do not edit or patch any subject, Advisor, Designer, Worker, canonical, runtime, or product
file.
