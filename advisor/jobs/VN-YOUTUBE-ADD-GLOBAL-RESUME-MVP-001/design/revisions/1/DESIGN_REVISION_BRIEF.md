# Design Revision Brief — design-revision-001

```text
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
REVISION_ID: design-revision-001
ATTEMPT: 1
CURRENT_DESIGN_VERSION: 1
TARGET_DESIGN_VERSION: 2
TARGET_ACTOR: VibeNews Designer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-designer
INPUT_HEAD: RECORDED_AFTER_ADVISOR_REVISION_ROUTING_PUSH_IN_SHORT_LAUNCHER
PREVIOUS_DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
PREVIOUS_DESIGN_POINTER_HEAD: 3112f0c088b793d24df0b3084d9939fb6992d3ef
SOURCE_REVIEW_ID: design-review-001
SOURCE_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
REVIEW_FINDING_IDS_IN_SCOPE: DR1-F1
LEO_GPT_DECISION_IN_SCOPE: D-009-A — RECORD WITHOUT BLOCKING
DECISION_ACK_PATH: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/06_D009_DECISION_ACK.md
DESIGN_DEPTH: FULL_DESIGN revision
DESIGN_REVIEW_REQUIRED: true
DESIGN_DELTA_REVIEW_REQUIRED: true
DESIGN_DELTA_REVIEW_ID: design-delta-review-001
DESIGN_SUBJECT_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
AUTHORIZED_DELTA_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
DESIGN_AUTHORIZED_WRITE_PATHS: every exact AUTHORIZED_DELTA_PATHS entry plus runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT_POINTER.md
FORBIDDEN_PATHS: every path not listed in DESIGN_AUTHORIZED_WRITE_PATHS, including the other unchanged design subjects; CLAUDE.md; AGENTS.md; docs/agent/**; advisor/**; runs/worker/**; runs/reviewer/**; src/**; assets/**; package/lock/app/ts config; .env*; server/runtime/database/migration/test/code paths
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads and immutable evidence

Open directly, not from chat memory:

1. Root entries and every canonical protocol required by `docs/agent/ROLE_INDEX.md`.
2. `00_INTAKE.md`, `01_ADVISOR_BRIEF.md`, `05_LEO_DECISION_REQUEST.md`, `06_D009_DECISION_ACK.md`, this brief and
   handoff, `10_LOOP_STATE.md`, and `index.md`.
3. Reviewer report and pointer at `SOURCE_REVIEW_REPORT_HEAD`.
4. Complete previous `DESIGN_RESULT.md` and `설계문서/18_YouTube_Add_Global_Resume_MVP.md` from
   `PREVIOUS_DESIGN_CONTENT_HEAD`; read any other authorized delta subject before changing it.
5. Verify all 14 previous subject blobs and the actual interleaved Git ancestry. Unchanged subject blobs must remain
   byte-identical to the previous content head.
6. Current official DeepSeek and Fish Audio policy/privacy pages needed for public policy URL/date/statement facts.
   Use the `agent-reach` search/web routing skill and official provider sources only. If its CLI is unavailable, use
   the skill's official-web fallback. Do not treat search snippets or third-party commentary as policy authority.

Never open or print `.env.server.local`. Do not fetch or retain caption text, provider bodies, private audio, secret
values, configured reference voice values, or private data.

## Exact bounded revision required

Close only `DR1-F1` by reflecting the now-explicit D-009-A decision:

1. Remove every rule that makes unverifiable provider no-training/data-control a hard blocker for this current
   private low-risk public-technology MVP. Policy lookup failure or an unverified control must be truthfully recorded
   as limited/unverified, not converted to a false PASS claim and not used alone to block this slice.
2. Preserve public provider-policy evidence per provider: provider name, official policy URL, effective/last-updated
   date, review date, model/API endpoint used, available retention/training/deletion/data-control statements,
   verified controls, and controls not independently verified. Define which public fields may be versioned and how
   runtime model/endpoint evidence is retained privately without leaking secrets or configured reference voice.
3. Preserve all prohibited claims and exact live-acceptance labels from `06_D009_DECISION_ACK.md`.
4. Enforce the DeepSeek and Fish data-minimization allowlists from the ACK. In particular, remove the existing
   DeepSeek aggregate-context allowance for any `leo` preference/user data. Add pre-provider fail-closed scope
   enforcement so only authorized public low-risk technology content reaches providers in this slice.
5. Preserve the hard Leo/GPT escalation gate before every private/user-uploaded, internal-company, personal-memory,
   personal-data health/finance/legal/election, children, production, commercial, third-party customer,
   confidential, or regulated scope listed in the ACK. This gate is distinct from provider-policy uncertainty for
   the current slice.
6. Add exact schema/audit/event/test/acceptance behavior needed to prove the provider-policy record, payload
   minimization, prohibited-field absence, current-scope enforcement, exact assurance labels, and expanded-scope
   stop without requiring new implementation paths unless the design proves one is necessary.
7. Keep the Tailscale operator prerequisite unchanged except for any minimal wording needed to state that it remains
   a non-blocking bounded external prerequisite already accepted as `DR1-F2`.
8. Do not reopen or change D-001 through D-008, provider choice, caps, verifier gate, TTS receipt semantics, playback,
   source fixture, implementation scope, or unrelated design.

## Result and commit contract

- `DESIGN_RESULT.md` remains a complete replacement package, sets `DESIGN_VERSION: 2`,
  `SUPERSEDES_DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984`,
  `REVISION_ID: design-revision-001`, and `REVIEW_FINDING_IDS_ADDRESSED: DR1-F1`.
- With D-009 resolved, `OPEN_DECISIONS` and `REQUIRED_LEO_DECISIONS` may be `none`; the full D-009 scope must be
  recorded as confirmed Leo/GPT authority rather than hidden policy.
- Update the major-feature design document version/status consistently. Only authorized delta paths may differ.
- Run path, secret/raw/media, stale hard-block, minimization, scope-gate, schema consistency, Markdown, and lineage
  checks. Do not perform live provider calls or implementation.
- Create and push one content-only revision commit. Then update only the existing Designer pointer in a separate
  pointer-only commit with the actual new content head. Return only the pointer block to Advisor and stop.
