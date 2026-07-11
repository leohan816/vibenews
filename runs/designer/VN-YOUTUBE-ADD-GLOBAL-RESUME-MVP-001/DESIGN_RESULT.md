# Design Result — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
DESIGN_RESULT
JOB_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001
DESIGN_ID: VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001-DESIGN-001
DESIGN_VERSION: 2
ACTOR: VibeNews Designer
DESIGN_DEPTH: FULL_DESIGN
ORIGINAL_LEO_GPT_INTENT: Build a private fixed-user MVP that accepts manual YouTube batches and approved channels, turns public captions into verified Fish Audio briefings through DeepSeek-only LLM stages, and provides one durable global automatic queue/resume state across every playback entry point.
USER_VALUE: Leo can approve technology sources once, receive trustworthy private audio without retaining original media, and always continue the same briefing from the same position without replaying completed or skipped items.
SUCCESS_CRITERIA: Every condition in sections 2 and 18 is required; design/mock/sample-only or partial-provider output is not success.
CURRENT_STATE: At immutable revision input 5c93fe01fefa1927244588e114ffa1a0f565c6ff, local HEAD and origin/master matched on master with a clean staged/unstaged/untracked worktree; previous design content f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984 and design-review-001 report f46ea708d9768ce883effbb97bcd15cbddfa1227 are ancestors, D-009-A is acknowledged, and no product/runtime code changed.
CONFIRMED_FACTS: Defined in sections 3 and 4; D-001 through D-009-A are resolved Leo/GPT authority and are not reopened. D-009-A accepts limited/unverified provider policy assurance for only the current private public-YouTube low-risk technology MVP while requiring verified local scope/payload controls and hard escalation before expanded scope.
ASSUMPTIONS: One private device, fixed user leo, existing Hetzner development server, Asia/Seoul quota day, repository-contained Node processes, and no public audience; detailed in section 5.
UNKNOWNS: DeepSeek/Fish configured-account retention, training, deletion, tier, and opt-out effects remain limited/unverified but do not alone block this bounded current slice; actual provider/YouTube availability, host packages, runtime secret configuration, and operator-owned tailnet access remain acceptance facts and cannot be replaced with mocks.
OPEN_DECISIONS: None.
REQUIRED_LEO_DECISIONS: None for the current scope; every D-009-A expanded-scope category requires a new Leo/GPT decision before provider use.
PROPOSED_DESIGN: A same-repository Fastify API plus SQLite lease worker and hourly poller, constrained public-caption adapter, separated DeepSeek Builder/Verifier, Fish TTS, private AudioAsset streaming, Add UX, and server-canonical/device-journaled global playback; detailed in sections 6 through 15 and 설계문서/18_YouTube_Add_Global_Resume_MVP.md.
ROLE_AND_AUTHORITY_DESIGN: Defined in section 4; Designer authors design only, Advisor validates/freezes/routes, Worker implements the frozen head, Reviewer independently reviews, and Leo/GPT owns material policy.
MISSION_FLOW: Designer revision content/pointer -> Advisor validation -> same Reviewer DESIGN_DELTA_REVIEW design-delta-review-001 -> Advisor exact freeze -> Worker -> independent implementation review/correction -> real private/provider/device acceptance -> required reloads -> Advisor audit/pointer.
USER_FLOW: Add manual batch or approved channel -> per-item progress -> verified audio_ready -> any automatic play surface -> global active resume -> immutable unheard snapshot -> completed/skipped exclusion; manual replay stays isolated.
SYSTEM_FLOW: Approved public-low-risk-technology canonical YouTube ID -> bounded public caption temp -> local scope/payload guard -> DeepSeek Builder -> separate DeepSeek Verifier (score >=9.0, no critical, max 2) -> minimized guarded Fish Audio payload -> atomic private AudioAsset -> authorized device playback/checkpoints.
DATA_AND_STATE: Server SQLite entities include provider scope approvals, public policy snapshots, private runtime-binding evidence and value-free payload audits alongside exact enums/constraints/indexes/leases; device Expo SQLite journal/outbox, SecureStore token, immutable session membership, and four-state playback are defined in sections 10 through 13.
INTERFACES: CaptionProvider, BuilderProvider, VerifierProvider, TtsProvider, ProviderPayloadGuard, strict Builder/Verifier/provider-policy schemas, API routes, error envelope, Range audio, and global playback controller are defined in sections 8, 9, 12, and 14.
FAILURE_HANDLING: Fail closed on expanded/ambiguous scope, bad payload/runtime binding, missing public captions, secrets, config, cleanup, migration, storage, or verifier gate; policy lookup/control uncertainty alone records LIMITED/NOT_VERIFIED and does not block this current slice; bounded retry/defer/recovery rules remain unchanged.
SECURITY_AND_PRIVACY: Exact DeepSeek/Fish payload allowlists, no user preferences/private context, versioned public-policy evidence, literal D-009-A labels, prohibited-claim controls, pre-provider scope enforcement, plus the unchanged loopback/tailnet, bearer, SecureStore, secret, SSRF/subprocess/path/log/file, deletion, and backup boundaries are defined in section 15.
COPYRIGHT_OR_POLICY: Private/internal derived use of approved public YouTube low-risk technology content only; provider-side deletion/no-training are NOT_VERIFIED and production privacy approval is NOT_GRANTED; no login/cookies/original media/public redistribution, and no raw source/provider data in Git/log/tests/reports/chat.
COST: Bounded by 10 links/batch, 5 channels, hourly polls, 3 unseen/channel/poll, 10 successful TTS/user/day, concurrency 1, and at most 2 verifier attempts; actual provider pricing remains runtime-variable and no cap may be bypassed.
NON_GOALS: Production/public deployment, private/user-uploaded/internal/customer/personal/sensitive/children/regulated scope, multi-device or multi-user auth/sync, non-YouTube ingestion, original-media retention, transcript product surface, alternate/local LLMs, provider fallback, general Source Pool/Hot Topic backend, and mock/sample acceptance.
IMPLEMENTATION_BOUNDARIES: Exact Worker allowlist and forbidden paths/actions are in section 17 and 설계문서/18 §16; every path outside the allowlist requires an Advisor-routed design defect.
TEST_AND_REVIEW_CRITERIA: Exact commands plus policy-record, role payload allowlist, prohibited-field absence, current-scope/expanded-scope, exact assurance-label, runtime-binding, unit/integration/failure/runtime/live/device, A/B/C/D, stale-search, no-secret/no-media, and lineage checks are in sections 18 and 19.
MIGRATION_FROM_CURRENT_GOVERNANCE: No canonical governance change; this design follows the current five-actor sequence, replaces product mocks/hook-local playback only in the later Worker phase, and preserves separate design content and pointer identities.
SESSION_RELOAD_REQUIREMENTS: After final implementation PASS and correction closure, Advisor must apply the current SESSION_RELOAD_PROTOCOL to VibeNews-advisor, VibeNews-designer, VibeNews, and VibeNews-reviewer before final mission closure; Designer does not launch or message sessions.
RESIDUAL_RISKS: Provider-side retention/training/deletion controls remain unverified under the explicitly accepted bounded D-009-A scope, alongside YouTube anti-bot/platform change, provider availability/pricing, operator-owned tailnet state, token compromise, single-host loss, position lag, and private-use copyright boundary; detailed in section 20.
DESIGN_SUBJECT_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/README.md; 설계문서/00_제품_전체지도.md; 설계문서/01_화면_구조_네비게이션.md; 설계문서/02_Listen_오디오_플레이어.md; 설계문서/03_Briefing_예약_카테고리_브리핑.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/14_Video_Briefing_Quality_Strategy.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md
DESIGN_AUTHORIZED_WRITE_PATHS: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md; 설계문서/10_DataModel_데이터구조.md; 설계문서/11_EventLog_사용행동기록.md; 설계문서/12_Implementation_Roadmap.md; 설계문서/13_FEATURE_INDEX.md; 설계문서/15_Source_Pool_and_Editorial_Curation.md; 설계문서/16_Candidate_Review_and_TTS_Approval_Pipeline.md; 설계문서/18_YouTube_Add_Global_Resume_MVP.md; runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT_POINTER.md
SUPERSEDES_DESIGN_CONTENT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
REVISION_ID: design-revision-001
REVIEW_FINDING_IDS_ADDRESSED: DR1-F1
DESIGN_REVIEW_RECOMMENDATION: REQUIRED — run the same Reviewer DESIGN_DELTA_REVIEW design-delta-review-001 against the actual revised content head, base f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984, and exact DESIGN_SUBJECT_PATHS.
DESIGN_STATUS: READY_FOR_DESIGN_REVIEW
DESIGN_CONTENT_HEAD: RECORDED_AFTER_DESIGN_CONTENT_PUSH_IN_POINTER
RESULT_PATH: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT.md
POINTER_PATH: runs/designer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/DESIGN_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

## 1. Intent and user value

The MVP creates one trustworthy private path from a user-approved public YouTube source to a generated Korean audio
briefing and one consistent playback history. Manual submission is an explicit batch approval. Turning channel
automation on is a revocable standing approval for only that channel. Nothing else gains automatic approval.

The product-level correction is equally important: Listen global play, today's briefing, Category, Tag, and today's
flow are not separate queues. They are five entrances to one fixed-user automatic playback state. An unfinished item
resumes first at the durable position. Completed and skipped items remain excluded everywhere. A manual replay does
not rewrite automatic history.

## 2. Required success criteria

All are mandatory:

1. The bottom Briefing tab becomes Add while existing Briefing, ScheduleBriefing, and BriefingSession remain
   reachable as push flows.
2. Add accepts at most 10 links per explicit batch approval, validates per item, isolates sibling failures, and shows
   progress/defer/recovery accessibly.
3. Add manages at most 5 YouTube channels with explicit standing-approval copy, ON/OFF revocation, deletion, hourly
   status, and no-discard cap visibility.
4. Only validated public YouTube captions are acquired with constrained server-side `yt-dlp --skip-download`; login,
   cookies, original video/audio, arbitrary commands/hosts/paths, and source retention are impossible.
5. Raw captions are isolated, bounded, removed immediately after use, and independently swept before a hard 24-hour
   deadline; only hashes/languages/bytes/provenance/deletion audit persist.
6. Every LLM stage uses DeepSeek. Builder and Verifier have separate prompts, contexts, schemas, adapters, and
   configured model selectors.
7. Server-calculated PASS requires overallScore >=9.0, zero critical failures, and PASS verdict. There are at most two
   total verifier attempts; non-pass becomes human_review_required and never reaches TTS/automatic playback.
8. Fish Audio uses configured model/reference values only on the server; each valid provider audio response creates
   one daily-counted generation receipt and exactly one AudioAsset per ContentItem is recoverably finalized.
9. The same private Node/SQLite slice enforces 10 links, 5 channels, hourly poll, 3 unseen/channel/poll, 10 successful
   TTS/day, concurrency 1, and verifier max 2 at authoritative transaction/lease boundaries. Hit work is deferred,
   never discarded.
10. One server-canonical global state and device Expo SQLite journal survive restart. The states are exactly unheard,
    in_progress, completed, and skipped.
11. New automatic sessions put one active incomplete item first and then snapshot ready unheard items ordered by
    audioReadyAt and deterministic ID. Membership/order is immutable and post-start ready items are excluded.
12. Completed/skipped/deleted content is excluded from every automatic surface. Manual replay changes only manual
    counters/last-played and never active pointer/status/snapshot.
13. A/B/C/D, 2:14 resume, process exit, offline outbox, conflict, background, one-player, completion/skip, and manual
    replay tests pass on the real device.
14. The selected official Expo technology video passes real public-caption -> DeepSeek Builder -> separate DeepSeek
    Verifier -> Fish Audio -> AudioAsset -> authorized device playback, and the official Expo channel exercises real
    discovery/poll scheduling.
15. No secret, actual model/reference value, raw caption, provider body, original media, or private audio artifact
    enters Git, logs, fixtures, reports, or chat.
16. Migration, restart lease recovery, deletion/correction, backup/restore, safe rollback, failure injection, exact
    commands, independent review, origin lineage, and clean worktree evidence all pass.
17. DeepSeek and Fish each have versioned official policy/API evidence, policy date/review date/public statement
    codes, privately retained actual runtime endpoint/model/reference bindings, exact payload-audit evidence, and the
    five literal D-009-A acceptance labels without any prohibited provider deletion/retention/training claim.
18. Every provider call is preceded by an active `public_low_risk_youtube_technology` approval and role-exact local
    payload guard. Any private, internal, personal/memory, personal-data health/finance/legal/election, children/
    biometric, multi-user production, commercial launch, customer, confidential/regulated, or ambiguous scope stops
    before network and requires a new Leo/GPT decision.

## 3. Current-state evidence

### Repository/Git

- Repository: `/home/leo/Project/VibeNews`
- Origin: `https://github.com/leohan816/vibenews.git`
- Branch: `master`
- Original design input head: `e03644239eb46d056ebfa0a19959a8eca3344d9b`
- Immutable revision input/local/origin entry head: `5c93fe01fefa1927244588e114ffa1a0f565c6ff`
- Entry staged/unstaged/untracked state: clean
- Previous design content/pointer heads: `f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984` /
  `3112f0c088b793d24df0b3084d9939fb6992d3ef`
- Source design-review report head: `f46ea708d9768ce883effbb97bcd15cbddfa1227`
- Input transition: design-review-001 raised DR1-F1, Leo/GPT chose D-009-A, and Advisor acknowledged/routed this bounded
  revision. No product/runtime code or previous design-subject blob changed after the original design content head.

### App/package

- Expo `~57.0.1`, Expo Router, React Native, TypeScript strict, `expo-audio` are present.
- Bottom tabs are Listen/Briefing/Recap/Saved/Settings.
- Listen/Briefing use mock data. BriefingSession owns a hook-local `useAudioPlayer` and remote fallback samples.
- No direct Expo SQLite/SecureStore dependency, server framework, server DB, auth, provider adapter, worker/poller, or
  test runner exists.
- Existing event logging is memory/console only.

### Official Expo SDK 57 evidence

- SDK baseline and Node minimum: <https://docs.expo.dev/versions/v57.0.0/> (Node 22.13.x minimum).
- Audio: <https://docs.expo.dev/versions/v57.0.0/sdk/audio/> supports a directly created persistent player,
  playback status events/currentTime/duration/didJustFinish, remote source headers, source replacement/seeking, and
  background/lock-screen configuration.
- SQLite: <https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/> persists across restarts and supports provider-based
  initialization/migration, WAL/foreign keys, prepared access, and exclusive async transactions.
- SecureStore: <https://docs.expo.dev/versions/v57.0.0/sdk/securestore/> provides encrypted device key-value storage;
  it stores only the device token, not irreplaceable playback state.
- Router: <https://docs.expo.dev/versions/v57.0.0/sdk/router/> preserves the Tabs/root Stack split used for Add versus
  push Briefing/session routes.

## 4. Resolved authority and roles

D-001 through D-009-A are binding:

- constrained no-login/no-cookie public-caption-only yt-dlp, no original media, caption hard-delete within 24 hours;
- existing Hetzner dev server, repository-contained Node API/worker, private DB/audio, device persistence, hourly
  poll, no production/multi-device auth;
- DeepSeek at every LLM stage, separated Builder/Verifier, score/no-critical/max-2 gate, Fish TTS, replaceable four
  provider interfaces, and no named alternate/local LLMs;
- manual CTA approval and channel ON standing approval; human-review items stop;
- exact caps and defer/no-discard;
- private/internal derived retention and user deletion, no redistribution/original retention;
- fixed user leo and four playback states, active-first, completed/skipped exclusion, isolated manual replay; the old
  duration-based exclusion rule is deleted;
- Designer authority to select one low-risk official-captioned technology video and official technology channel.
- D-009-A records provider-policy assurance as limited/unverified without blocking this current private low-risk
  public-technology slice; requires verified local scope/payload controls and exact labels; forbids provider-side
  retention/training/deletion or production-compliance claims; and requires Leo/GPT escalation before every expanded
  private/personal/sensitive/customer/internal/production/commercial/confidential scope.

Designer selects bounded reversible implementation details but does not implement, self-review, approve, freeze, or
route. Advisor validates and routes independent review/freeze. Worker implements only a frozen content head and exact
allowlist. Reviewer independently checks design then implementation. Leo/GPT retains material policy/risk authority.

## 5. Assumptions, unknowns, decisions

### Assumptions

- Exactly one private device and one fixed user `leo`; API schemas stay user-keyed but there is no general account or
  sync system.
- `Asia/Seoul` is the quota-day timezone, matching the current product context. All stored instants remain UTC.
- The dev host can run Node >=22.13, one SQLite native driver, three systemd processes, and pinned yt-dlp. Worker must
  verify rather than infer this.
- A manually provisioned random opaque bearer token is a private-device transport gate, not multi-user auth.
- Official source availability can change. A D-008-compliant substitute is allowed only if caption availability
  fails, and must be recorded without source text.

### Non-blocking unknowns

- Provider pricing and transient availability at Worker acceptance time.
- Actual model/reference/credential values; intentionally runtime-only and undisclosed.
- DeepSeek/Fish configured-account no-training, retention window, provider-side deletion, account opt-out effect, and
  Fish tier. These remain `LIMITED_AND_UNVERIFIED`/`NOT_VERIFIED`, never become a false PASS claim, and alone do not
  block the exact current D-009-A slice.
- Exact installed host service user and operator-owned tailnet membership/grant state. The transport selection is
  fixed: loopback Fastify behind tailnet-only Tailscale Serve, with no Funnel/public fallback. Missing prepared state
  returns `RUNTIME_ACCESS_REQUIRED`; Worker does not mutate external identity/access policy.

### Open decisions

None for current scope. Private/user-uploaded/internal-company/customer content, personal conversation/memory,
personal-data health/finance/legal/election use, children/biometric or confidential/regulated data, multi-user
production, public commercial launch, a new public audience, non-YouTube source, multi-device identity, cookie/login
need, alternate provider, or material schema/API deviation is a new Leo/GPT decision and safe stop, not an
implementation detail.
If an expanded scope is separately designed, unverified provider-side controls become its release blocker unless
Leo/GPT separately approves a provider or self-hosted model satisfying the required protection; this grants no
alternate-provider authority to the current MVP.

## 6. Selected architecture

Use one repository-contained `server/` TypeScript subsystem with:

- Fastify 5 private API;
- Zod strict request/provider/DTO parsing;
- better-sqlite3, raw versioned SQL, WAL/foreign keys, no ORM;
- native Node fetch/crypto/fs/child_process and fast-xml-parser for the exact YouTube feed;
- separate API, concurrency-one lease Worker, and due-time hourly Poller systemd processes;
- private state/audio/temp/backup under `/var/lib/vibenews-dev`, never repo/static root;
- loopback-only Fastify behind operator-preconfigured Tailscale Serve HTTPS and a least-privilege Leo-device grant;
- `node:test` + `tsx` for pure app state, server unit/integration/failure/runtime tests;
- Expo SDK 57 `expo-sqlite` and `expo-secure-store`, installed via Expo compatibility tooling;
- root-lifetime `createAudioPlayer`, one listener, and a global React context/controller.

Rejected alternatives are Expo Router server routes (secret/runtime boundary collision), a separate repo (violates
SINGLE_REPO), public object storage (private/audio authorization conflict), Postgres/queue infrastructure (excess for
one private host), JSON files (no transactional invariants), screen-local hooks/AsyncStorage-only state (cannot own
the global snapshot/revision contract), synchronous provider work in HTTP requests (timeout/recovery risk), and
public listener/Tailscale Funnel/ad-hoc tunnel (violates the private-only boundary).

## 7. Add and preserved Briefing UX

Tabs become Listen/Add/Recap/Saved/Settings. The old Briefing screen moves from `(tabs)/briefing.tsx` to root
`briefing.tsx`; Listen and Add link to it and existing ScheduleBriefing/BriefingSession routes remain.

Manual entry is a line-oriented 1-10 URL card. It reports invalid host/form and duplicate input inline, preserves the
draft on network errors, treats the CTA as both explicit processing approval and versioned attestation that every
source is public YouTube low-risk technology content, returns one batch plus independently progressing items, and
exposes retry only for typed retryable failures. Copy names private/personal/sensitive exclusions. An eleventh item is
rejected before mutation.

Channel entry accepts a stable `/channel/UC...` URL or `@handle`, resolves and stores the stable channel ID, enforces
five in a transaction, gives exact standing-approval copy, and exposes ON/OFF/delete. OFF increments approval version
and revokes the matching source-scope approval; ON requires a fresh exact D-009-A attestation. Delete tombstones/frees
the slot but does not silently delete derived content.

Loading/empty/stale/server error/cap defer/human review states are explicit. Controls are at least 44pt, properly
labeled and ordered for assistive tech; progress uses live regions, errors use alerts, status does not rely on color,
Dynamic Type/contrast/reduced motion/keyboard focus are tested.

## 8. Source contract

Canonicalize only public HTTPS watch, youtu.be, and shorts video forms to an 11-character video ID and canonical watch
URL. Channel forms are stable channel IDs or handles resolved to them. Reject arbitrary host/port/userinfo/IP/embed/
playlist-only/path/query tricks. DB unique IDs and API idempotency perform authoritative deduplication.

The caption adapter uses `spawn(..., {shell:false})` with an exact argument profile: ignore config/cache, skip
download, no playlist/thumbnail/comments, public manual/automatic English/Korean VTT, isolated paths/output, bounded
metadata print, and a URL reconstructed only from the validated ID. Cookies, login, netrc, browser profile, format/
media selection, postprocessors, arbitrary extractor args/paths are not expressible.

Bounds are 120 seconds, source duration <=2 hours, caption total <=10 MiB, file <=8 MiB, <=8 allowed VTT files,
stdout 8 KiB, stderr 16 KiB, validated regular files only, process-group termination, and redacted errors. No public
caption means fail closed. Temp files are mode 0600 under a 0700 per-job directory, destroyed in finally and swept
every 15 minutes; overdue deletion blocks new claims and no artifact exceeds 24 hours.

Channel discovery uses only the public Atom URL for the stable channel ID with HTTPS/redirect/size/time/XML bounds.
Every feed entry is recorded before cursor advancement; at most three oldest deferred/unseen items are promoted per
poll and the rest persist.

Before any provider request, local deterministic `ProviderPayloadGuard` requires active source-scope approval,
public canonical provenance, denied-category/private-marker checks, exact provider-role payload fields, and exact
configured runtime binding. Ambiguity is a stop, not a provider-classification request. A value-free audit keeps
field names/bytes/hash/guard version/outcome. Every D-009-A expanded-scope reason becomes
`SCOPE_ESCALATION_REQUIRED` before network and cannot be bypassed by retry or toggling.

## 9. Provider interfaces and gate

The full TypeScript interfaces and strict `builder-chunk-output.v1`/`builder-output.v1`/`verifier-output.v1` schemas
are frozen in `설계문서/18_YouTube_Add_Global_Resume_MVP.md` section 7. Required adapters:

```text
CaptionProvider.acquire/destroy
BuilderProvider.build
VerifierProvider.verify
TtsProvider.synthesize
```

All receive job/idempotency/deadline/AbortSignal context and return typed data or a redacted typed ProviderError.
Builder uses bounded VTT cue chunks (12,000 characters/eight minutes, at most 20) with separate chunk/aggregate prompt
and schema versions under the Builder selector. Verifier uses its own prompt/schema/selector and a candidate-ref-only
ephemeral evidence pack, not the Builder's hidden/system context. Requests/responses/strings/arrays have strict
size/count bounds and unknown/duplicate refs or permissive JSON repair fail closed.

DeepSeek chunk requests contain only the required public caption chunk/evidence references plus public provenance;
aggregate/revision requests contain only strict generated chunk/candidate/finding structures plus public provenance;
Verifier receives only the candidate and public evidence pack. No Leo preference, user history, notes, conversation,
private project document, credential/secret, account/payment data, health record, children's/biometric data,
confidential business information, non-public copyrighted material, or unrelated data enters any DeepSeek request.
Fish receives only the final approved SpokenAudioScript, configured voice reference identifier, and minimum synthesis
parameters. It never receives
the raw transcript, VideoContentMap, AnalyticSummary, playback/user data, app IDs, or secrets; authorization is added
by the adapter only after semantic guard success.

Attempt 1 PASS proceeds. REVISE permits one Builder revision using finding codes/evidence refs and a separate attempt
2. Attempt 2 non-pass, critical/schema/policy failure becomes human review/typed failure per taxonomy. No attempt 3.
Server independently requires verdict PASS, score >=9.0, critical count zero.

Only a passed script reaches Fish. The call first creates one idempotent intent and daily reservation; explicit failure
releases it, outcome-unknown retains it and forbids automatic retry, and a valid MP3 converts it to one daily success
even if later storage/publish fails. Deterministic durable staging plus receipt state makes file/DB crash recovery
avoid a second provider call; only final atomic file/DB activation produces exactly one audio_ready AudioAsset.
Actual provider configuration values never enter schema/log/client/report.

DeepSeek and Fish policy snapshots retain official policy/API URLs, effective/update and review dates, public
document-set hash/lookup status, public retention/training/deletion/control statement codes, locally verified control codes, and
unverified codes. Private runtime evidence binds the public API surface to actual endpoint/model/reasoning/reference
selectors with role-tagged HMACs and config version, never raw values. Its 32-byte key is server-only at
`/var/lib/vibenews-dev/private/provider-audit-hmac-v1.key` with a 0700 parent/0600 file; only the safe key ID is in DB/
events and missing-after-binding fails readiness rather than silently replacing it. Policy lookup failure/change or provider-side
control uncertainty is recorded and does not alone block current scope. Acceptance emits exactly:

```text
PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED
LOCAL_DATA_CONTROLS: VERIFIED
PROVIDER_SIDE_DELETION: NOT_VERIFIED
PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED
PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED
```

Local deletion is not provider deletion; no claim may say inputs are never retained/trained, provider-side deletion
is verified, or private safeguards equal production compliance.

## 10. Data and state

The authoritative entities are User, ManualBatch/Item, Channel, ChannelDiscovery, SourceVideo, ProcessingJob,
ProviderScopeApproval, ProviderPolicySnapshot, ProviderRuntimeBinding, ProviderAttempt, ProviderPayloadAudit,
TemporaryCaptionArtifact, Category/Subcategory/TopicCluster/Tag/Entity and joins, ContentItem, TtsGenerationReceipt,
AudioAsset, PlaybackItem, GlobalPlaybackState, BriefingSession/Item, PlaybackMutation, DailyTtsUsage,
WorkerSingleton, SchemaMigration, and AuditEvent.

Every required field, timestamp, enum, FK, unique/check, index, tombstone/correction/deletion behavior is defined in
`설계문서/18` section 8 and reconciled in `설계문서/10`. Key invariants:

- fixed user `leo`, timezone Asia/Seoul;
- one source ContentItem per user/source and one non-deleted AudioAsset per ContentItem;
- at most one active in_progress content per user;
- immutable `(session,ordinal,content)` membership/order;
- globally unique API/provider/playback idempotency keys;
- verifier attempt 0..2 and daily TTS reserved+successful <=10;
- every DeepSeek/Fish network attempt links the active source-scope approval, provider public-policy snapshot, exact private runtime
  binding, and one allowed payload audit; blocked pre-network checks retain an audit with no attempt ID;
- raw caption/provider body/model/reference value is not a DB field;
- the aggregate provider pipeline has no user-preference/history entity or edge;
- correction creates a new version and atomically swaps only after ready; deletion immediately excludes/tombstones
  and asynchronously removes derived/audio files.

## 11. Limits, scheduling, recovery

Batch and channel limits are checked in immediate transactions. Poll due/channel lease and up-to-three promotion are
one transaction. Daily TTS uses a pre-call intent/reservation; explicit failure releases, uncertain outcome remains
reserved, and a valid provider response converts to success before storage publish. Worker concurrency has both a singleton DB
lease and one service instance. Verifier attempt insertion checks the maximum before calling.

Worker ordering is eligible time, approval/discovery age, manual only as an exact-tie preference, then ID. This avoids
channel starvation. Poll promotions choose oldest deferred first. Initial channel poll is due immediately; each
attempt schedules the next exactly one hour later. Daily-cap deferrals become eligible at next Asia/Seoul midnight
plus deterministic small jitter. No cap path deletes work.

Worker lease is five minutes with 30-second heartbeat. Expired work reclaims the same job/stage/idempotency key.
Stage hashes and unique attempts prevent repeat provider output. Caption/TTS partial cleanup runs at start/finally/
sweep. Missing/mismatched migration, provider config, writable storage, or overdue temp cleanup fails readiness and
stops new claims.

## 12. Global playback semantics

The exact states are unheard/in_progress/completed/skipped. Native `playing=true` transitions unheard to in_progress;
pause/seek/background/exit retain in_progress and update position; `didJustFinish` transitions to completed; only
explicit user skip transitions to skipped. No elapsed-time or percentage exclusion rule exists.

Today, Listen, Category, Tag, and Flow call the same `startOrResumeAutomatic(entryPoint, context)` service. Context is
analytics/navigation metadata, not a filter. A new session transaction returns the same active in-process session or,
on a cold/new session, puts the one active incomplete item first and then ready unheard items ordered
`audioReadyAt ASC, contentItemId ASC`. The membership/order is immutable; post-start items wait for the next session.
Members later completed/skipped/deleted are dynamically bypassed.

Server owns canonical eligibility/revision. Device Expo SQLite owns immediate durable cache/outbox and writes every
two seconds during play plus every control/lifecycle event. Server checkpoints are coalesced every 15 seconds plus
control/lifecycle events. Client mutation IDs plus a monotonic per-run sequence make retries/order idempotent.
Revision conflicts replay the outbox in sequence, preserve explicit backward seek/control semantics for the same
active item, and discard old-item mutations after active/session changes. A root singleton player prevents surface
races/duplicate audio.

Manual replay is a separate mode/grant. It updates only manual count/last played. It does not change automatic status,
active item/position/session, snapshot, or resume copy.

## 13. A/B/C/D acceptance semantics

With A/B/C ready, S1 snapshots A/B/C. A pauses at 2:14. D becomes ready after S1 start and is absent from S1. Every
surface resumes A at 2:14. Cold process start creates S2 with active A then unheard B/C/D in ready-time/ID order.
Completing A excludes it everywhere and advances. Skipping C excludes it everywhere. Manually replaying completed B
leaves it completed and preserves the automatic active pointer. Device tolerance is 134 seconds +/-2 seconds and UI
must show current/total resume copy.

## 14. API/process/device boundaries

All `/v1` routes except live health require an opaque bearer token and user leo. The user manually provisions the
token in Settings; the app stores it in SecureStore, never source or EXPO_PUBLIC env. Server stores only runtime hash
and compares in constant time. API routes cover health/readiness, manual batches/item retry, channels, library,
deletion/correction, automatic sessions, global playback/mutations, manual replay, and authorized AudioAsset Range.

The complete request/response/error schemas and route list are frozen in `설계문서/18` section 11. Audio lookup is
ID-to-opaque-storage-key, ready/non-deleted only, one bounded Range, private/no-store/nosniff, with no redirect or
public URL. Client owns rendering/local outbox/native status only; it never owns secrets/provider/source/temp/storage.

State paths are `/var/lib/vibenews-dev/{db,audio,tmp,backups,private}` with service-user 0700 directories/0600 files and
relative opaque DB keys. API/worker/poller are separate supervised processes; a backup timer creates and verifies
generations. Live reveals only liveness; readiness safely checks DB/migration/storage/config/cleanup/process health.
Fastify always binds loopback. Operator-preconfigured Tailscale Serve exposes only tailnet HTTPS, and a grant admits
only the authorized Leo device. The client base URL is that nonsecret tailnet URL. Worker validates redacted status
but never logs in, changes grants, enables Serve, or enables Funnel; absent preparation is `RUNTIME_ACCESS_REQUIRED`.

## 15. Security, privacy, retention, policy

Bind Fastify to localhost only and proxy it through preconfigured tailnet-only Tailscale Serve. Funnel and direct
public listeners are forbidden; operator-owned tailnet identity/HTTPS/grants must already exist. There is no public
deployment/feed/share.
Validate URL structure, exact egress host/path, redirects/DNS/IP, request/body/response sizes, XML, subprocess
arguments/env/cwd/output, symlinks/hardlinks/path traversal, file mode and Range. Use systemd least privilege,
NoNewPrivileges, PrivateTmp, strict filesystem protection, writable state paths only, process/memory/file limits, and
egress restricted to YouTube/DeepSeek/Fish endpoints.

Logger serializers drop authorization/provider headers and bodies. Safe events contain IDs, state/error code,
versions/hashes, byte/duration/time only. Transcript/script/provider/audio content never enters event/log/test/report.
Secrets and actual model/reference values are checked for presence/non-placeholder without printing.
The exact prepared D-003 provider config key-name allowlist is `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`,
`DEEPSEEK_BUILDER_MODEL`, `DEEPSEEK_VERIFIER_MODEL`, `DEEPSEEK_VERIFIER_REASONING_EFFORT`, `FISH_API_KEY`,
`FISH_TTS_MODEL`, and `FISH_REFERENCE_ID`. No value is copied into the design, Git, logs, reports, or chat; unlisted
provider aliases are invalid.

DeepSeek receives only the role-specific request-lifetime public payloads in section 9; Fish receives only the final
approved SpokenAudioScript/reference/minimum parameters. Before live calls, Worker requires the active current-scope
approval, local semantic payload guard, exact runtime binding, and versioned public policy record. Scope/payload/
binding failure blocks before network. Provider public-policy lookup failure or configured-account no-training/
deletion/retention uncertainty instead preserves the exact limited/unverified labels and does not alone block this
slice. Local deletion is never represented as proof of provider-side deletion.

Official evidence reviewed 2026-07-11: DeepSeek [Privacy Policy](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html)
(last update 2026-02-10), [Model Mechanism disclosure](https://cdn.deepseek.com/policies/en-US/model-algorithm-disclosure.html),
and [API docs](https://api-docs.deepseek.com/) state input collection, possible service-improvement/training use, stated opt-out/deletion rights,
purpose/business/legal retention, and that downstream developer-app processing is not covered. Fish Privacy Policy
(effective 2024-08-28; <https://fish.audio/privacy/>), [TTS API docs](https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech),
and its [2026-06-23/2026-06-29 free-tier statement](https://fish.audio/pt/blog/s2-1-pro-free-api/?articleLocale=en) state User Content collection,
research/analytics/product-development use, system-need retention, deletion rights, and possible free-tier
model-improvement use. These public statements do not prove the configured account/tier controls.

Raw caption is removed immediately and excluded from backups. Derived analysis/script/provenance/generated audio stay
until user deletion. A copyright-reproduction critical gate blocks source-substitute scripts. User delete tombstones
immediately and removes private files with audit. Daily seven-generation DB/audio backups exclude secrets/temp and
require restore/hash/FK/migration drill. Public/non-private use requires new policy/design review.

## 16. Migration and rollback

Worker adds compatible Expo/server/test packages, creates state dirs and migration 001 after dry-run/backup, starts
API then Worker then Poller, migrates device DB to version 1, installs root providers, removes hook-local ownership,
replaces Briefing tab with Add while moving Briefing to push, and runs the real vertical slice.

Existing mock content/sample positions are not seeded or treated as real. Automatic playback has no active row,
revision zero, and empty outbox on first migration. Samples are removed from the automatic resolver.

Deployment records prior commit/DB/audio generation. Rollback stops processes, returns code to the prior commit,
checks additive migration compatibility, and preserves new tables unless an explicit destructive plan is separately
approved. Unreferenced new audio is cleaned by manifest. Provider calls remain audited and are not repeated to mimic
reversal. Any factual mismatch becomes an Advisor-routed design defect.

## 17. Implementation boundary

The exact Worker write allowlist is frozen in `설계문서/18` section 16.1 and includes only the specified package/lock,
app config/TS config, nonsecret env/docs, exact app/API/audio/storage/Add files, exact server source/migration/tests,
systemd/operation scripts, and Worker result/pointer paths.

All design subjects, canonical governance, Advisor/Reviewer/other actor results, actual secret env, unrelated product
code/assets are forbidden. Forbidden actions include reading/copying actual secret/model/reference values, login/
cookies/browser profiles, media download, public deployment, alternate/local models, approval/cap/attempt bypass,
raw content artifacts, design edits, self-review/freeze, history rewrite/force push, and destructive DB changes.

Server/provider/device/YouTube validations require their actual access. This includes loopback bind, preconfigured
Tailscale Serve HTTPS, authorized-device grant, Funnel-disabled, and public-unreachable evidence. Missing access must
be reported NOT_RUN/BLOCKED or `RUNTIME_ACCESS_REQUIRED`; no synthetic/sample/public fallback can claim acceptance.
Actual provider credentials/API availability and role binding are required for the live vertical slice, but public
policy lookup failure or provider-side no-training/deletion control remaining unverified alone is not a current-scope
blocker. The Tailscale operator prerequisite remains the previously accepted bounded external prerequisite and is not
changed by D-009-A.

## 18. Test and acceptance plan

Required commands:

```bash
npm ci
npx expo install --check
npx expo-doctor
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run server:migrate -- --dry-run
npm run server:config-check
npm run test:runtime-local
npm run accept:private -- --video-id 5JqK9JLD140 --channel-id UCx_YiR733cfqVPRsQ1n8Fag
```

Unit coverage includes canonicalization/SSRF, strict provider schemas/separation, score/critical/max-2 gate, all job/
playback transitions, ordering/snapshot/manual replay, local day/caps/fairness, Range/path/log redaction. Integration
injects DB/worker/process crashes; expired lease; captionless/login/timeout/oversize/symlink/bad VTT; invalid provider
JSON/429/5xx; TTS partial/storage/commit; cleanup overdue; 9->10 cap/defer; five unseen promote three; approval revoke;
auth/Range/delete; backup/restore/restart.

D-009-A unit/integration coverage also proves exact scope-attestation version and every expanded-scope reason; missing,
revoked, ambiguous, or expanded scope produces a value-free audit and no network attempt; each role's recursive field
set excludes preferences/history/private context and Fish excludes raw transcript/VideoContentMap/AnalyticSummary;
Fish auth is added only after guard success; runtime-binding mismatch blocks; policy lookup unavailable/changed remains
limited/nonblocking for this current slice; policy records serialize exact public fields/codes and the five literal
labels; assurance output cannot emit prohibited deletion/retention/training/production-compliance claims.

Local fixtures are synthetic metadata/hashes/tiny generated audio only and contain no actual caption/secret. The live
command uses real runtime config but emits only safe IDs/hashes/state/score/timestamps/deletion/audio evidence. It must
show public caption -> Builder -> separate Verifier -> Fish -> one AudioAsset -> authorized device and channel
discovery/next-hour due. It also proves Fastify loopback-only, Funnel disabled, authorized Leo tailnet access, and
non-tailnet/public denial. For both providers it proves public policy snapshots, private role-specific runtime HMAC
bindings, active `public_low_risk_youtube_technology` approval, allowed value-free payload audits, and exact
`LIMITED_AND_UNVERIFIED` / `VERIFIED` / `NOT_VERIFIED` / `NOT_VERIFIED` / `NOT_GRANTED` label output. Transient
provider/API failure is truthful failure; policy uncertainty alone is not. This Designer revision makes no live call.

Device acceptance executes section 13 plus screen switches, background/lock-screen, one player/listener, offline
outbox and 409 reconciliation. The implementation Reviewer runs stale alternate-provider/cookie/media/sample/
duration-threshold searches, tracked-secret/raw-artifact searches, schema/API/state consistency, exact frozen diff,
official SDK contract checks, runtime absence evidence, origin identity, and clean state.

## 19. Selected real private sources

Only public metadata was inspected; caption text/feed entry bodies were not fetched into an artifact or retained.

```text
VIDEO_TITLE: Introducing "Observe": Performance monitoring for React Native apps
VIDEO_ID: 5JqK9JLD140
VIDEO_URL: https://www.youtube.com/watch?v=5JqK9JLD140
OFFICIAL_CHANNEL: Expo
CHANNEL_ID: UCx_YiR733cfqVPRsQ1n8Fag
CHANNEL_URL: https://www.youtube.com/channel/UCx_YiR733cfqVPRsQ1n8Fag
CHANNEL_FEED_URL: https://www.youtube.com/feeds/videos.xml?channel_id=UCx_YiR733cfqVPRsQ1n8Fag
EVIDENCE_DATE: 2026-07-11
CAPTION_EVIDENCE: Public watch metadata exposed a searchable transcript endpoint; no text was requested.
FEED_EVIDENCE: The public channel feed exposed 15 entries; bodies were not retained.
DESIGN_WORKSPACE_EXTRACTION_CHECK: A metadata-only no-cookie yt-dlp request was challenged by YouTube anti-bot controls; it downloaded no captions or media and is not live-pipeline PASS evidence.
USE: private acceptance only
```

This is official low-risk Expo/React Native performance-tooling content, outside the forbidden source classes. If its
public captions disappear at acceptance, a replacement must remain an official, low-risk, public-captioned technology
video and record stable IDs/URLs/metadata-only evidence. Login/cookies are never an option.

The public transcript endpoint proves that the selected page exposes captions, not that the current server egress can
extract them. Worker must re-run the constrained adapter in the actual service environment. A persistent anti-bot
challenge is truthful runtime failure/blocked evidence and cannot be converted to PASS with cookies or samples.

## 20. Residual risks and safe stop

- YouTube anti-bot/platform changes may make public no-login caption extraction unavailable. Fail closed.
- Provider price/availability may change. Behavioral caps bound usage, not currency amount; report truthful runtime
  failure and never substitute.
- DeepSeek/Fish configured-account retention, training, deletion, tier and opt-out effects are not independently
  verified. D-009-A accepts that residual risk only for the current private approved public-YouTube low-risk
  technology slice; local deletion does not delete provider copies and production privacy approval is not granted.
- Scope attestation/local scanners can misclassify. Ambiguity fails closed; every private, personal, sensitive,
  customer/internal, multi-user/production/commercial, confidential/regulated expansion needs a new Leo/GPT decision.
- A private bearer token can be compromised. Rotate/revoke and reprovision SecureStore; do not expand into inferred
  production auth.
- Tailscale Serve/grant is operator-owned external state. A missing/mis-scoped grant or enabled Funnel blocks
  acceptance as `RUNTIME_ACCESS_REQUIRED`; Worker never repairs it by mutating identity/access policy or going public.
- Single-host SQLite/audio can be lost. Backup/restore drill and generation checks are required.
- OS kill may leave up to two seconds local/15 seconds server position lag; the device journal and +/-2-second live
  resume tolerance bound the user-visible case.
- Private derived-use authorization does not cover public/non-private redistribution. Such a request is a new policy
  and external-review gate.

Any expanded-scope need, new material decision, factual server/repo mismatch, secret-boundary failure, local
scope/payload/runtime-binding failure, overdue caption deletion, schema/API defect, or need for forbidden source/
provider behavior stops implementation and returns only through Advisor. Provider policy uncertainty alone does not
recreate the removed DR1-F1 hard blocker for current scope.
