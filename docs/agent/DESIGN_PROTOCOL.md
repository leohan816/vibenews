# VibeNews Design Protocol

Status: canonical

This protocol owns design depth, design artifacts, review eligibility, Advisor validation, freeze, revision, and
implementation-time design-defect semantics. The role, run, reporting, reload, and index protocols integrate it by
reference and retain their own specialties.

## 1. Mandatory Designer participation

Every VibeNews mission that proceeds beyond Advisor intake receives a Designer-owned design package before Worker
implementation. The Designer is mandatory for all missions, including docs, governance, hotfix, and no-code work.
Urgency and size change design depth, never Designer participation. The Advisor may investigate enough to prepare
intake before Designer routing, but may not send implementation to Worker without an Advisor-frozen design.

Only the Advisor launches the Designer and receives Designer results. The Designer authors design and never
implements, reviews, approves, freezes, or routes work. No non-Advisor actor routes to another actor or to Leo/GPT.

## 2. Design depth

The Advisor selects depth in intake and the Designer brief, records the rationale, and may escalate depth when new
facts appear. A downgrade after routing requires an Advisor record showing no required content or review is lost. If
any trigger points to a deeper level, the deeper level wins; uncertainty never justifies a shallower depth. Depth
never changes actor participation.

- `QUICK_DESIGN`: only for one small, reversible, well-understood, low-risk subject with no new behavior or
  cross-module contract (for example a typo, broken internal link, formatting-only Markdown repair, or non-normative
  wording clarification). The complete package still includes original intent, exact subject and implementation
  paths, scope/non-goals, acceptance criteria, risks, rollback, assumptions, open decisions, and tests. QUICK_DESIGN
  is not permission to skip design; it is the only depth that can be evaluated for the section-3 review skip.
- `STANDARD_DESIGN`: default for bounded product/UI/UX behavior, several related files, a new component, or a
  meaningful documentation/operations change. It includes user and system flows, state changes, interfaces, failure
  behavior, security/privacy/copyright/cost considerations, migration/rollout when relevant, exact implementation
  boundaries, and executable review criteria. DESIGN_REVIEW is mandatory.
- `FULL_DESIGN`: required for cross-cutting architecture, canonical governance or actor authority, new
  data/schema/migration, external providers, permissions/auth, irreversible operations,
  security/privacy/copyright exposure, ranking/personalization, automatic publishing/notifications, high-risk
  content, material recurring cost, or multiple modules. It adds alternatives and decision exposure, complete state
  and lineage models, recovery/rollback, staged migration, and strong audit criteria. DESIGN_REVIEW is mandatory.

## 3. Design review matrix and low-impact skip

| Design depth | DESIGN_REVIEW_REQUIRED default | Skip permitted |
| --- | --- | --- |
| QUICK_DESIGN | true | Only when every low-impact predicate below is true |
| STANDARD_DESIGN | true | Never |
| FULL_DESIGN | true | Never |

Review is mandatory at any depth when the subject affects product/runtime behavior, UI interaction or meaning, public
contracts, navigation, data/schema/migrations, dependencies/build/configuration, credentials/permissions,
security/privacy/copyright, source collection or attribution, external providers, cost/rate limits,
ranking/personalization, automatic actions, high-risk content, canonical governance, actor authority, freeze or
ownership rules, or more than one functional module.

### All-of low-impact predicate

The Advisor may set `DESIGN_REVIEW_REQUIRED: false` only when all are directly evidenced:

1. `DESIGN_DEPTH` is QUICK_DESIGN.
2. The change is non-behavioral, reversible, and confined to an exact small Markdown/text allowlist.
3. It changes no normative governance, product requirement, user promise, UX meaning, public API, data, code,
   configuration, dependency, generated artifact, test behavior, security/privacy/copyright posture, or cost.
4. The Unknown Gate has no unresolved item and no mandatory-review trigger.
5. No assumption or open decision can change the implementation.
6. The design has exact acceptance tests and rollback.
7. The Advisor records `DESIGN_REVIEW_SKIP_REASON: LOW_IMPACT_QUICK_DESIGN`, the predicates and evidence, the exact
   `DESIGN_CONTENT_HEAD`, and the exact `DESIGN_SUBJECT_PATHS` in an Advisor-owned validation artifact.

The Designer may recommend but cannot decide eligibility. If any predicate is false or uncertain, review is required.
Product copy, legal/trust copy, visual behavior, feature-index status, canonical protocol text, and any ambiguous
change never qualify, and this wording must not be broadened. Skipping design review never skips implementation
review for a changed implementation subject.

## 4. Advisor design validation and freeze gate

The Advisor validates directly after each Designer return: repo/origin/branch/input-ancestry/clean-state/commit/push
and exclusive path ownership; DESIGN_RESULT schema, exact original intent, selected depth, success criteria, and
required direct reads; confirmed facts versus assumptions, Unknown Gate coverage, and zero blocking open decisions;
complete user/system flows, state, interfaces, failure/recovery, policy, non-goals, implementation allowlist, and
executable tests proportional to depth; safe self-reference (content head in the pointer, pointer-head sentinel in
the file, actual pointer head only after push); required product design documents included in `DESIGN_SUBJECT_PATHS`
and committed before implementation; required independent review PASS, or every low-impact skip predicate recorded;
and that the reviewed content head and subject paths did not change after verdict.

If validation fails, the Advisor routes a bounded Designer revision and never edits the design. A blocking
`OPEN_DECISION` forces `BLOCKED_DECISION_REQUIRED` to Leo/GPT with no review, freeze, or Worker launch.

The Advisor may record `FROZEN` only when:

```text
DESIGN_STATUS_FROM_DESIGNER: READY_FOR_DESIGN_REVIEW
ADVISOR_DESIGN_VALIDATION: PASS
BLOCKING_OPEN_DECISIONS: none
DESIGN_REVIEW_REQUIRED: true -> REVIEWER_VERDICT: PASS
DESIGN_REVIEW_REQUIRED: false -> DESIGN_REVIEW_SKIP_ELIGIBILITY: PASS
FROZEN_DESIGN_HEAD: exact DESIGN_CONTENT_HEAD
FROZEN_DESIGN_PATHS: exact reviewed DESIGN_SUBJECT_PATHS
DESIGN_VERSION: exact version
```

`FROZEN_DESIGN_HEAD` equals the reviewed design content head, never its pointer or review report head.
`PASS_WITH_RISK` is not freezeable until Leo/GPT explicitly accepts every risk and the Advisor records that
acceptance. `NEEDS_PATCH` routes revision. `FAIL` stops. Freeze metadata is Advisor-owned and does not alter the
immutable design content, and the Designer never writes `FROZEN` as its own status.

## 5. Design revision and delta review

The initial design review does not consume a revision attempt. On `NEEDS_PATCH` or failed Advisor validation:

1. The Advisor writes a revision brief/handoff with `REVISION_ID`, `ATTEMPT` 1 or 2, exact finding IDs, previous
   design content head, allowed design paths, forbidden paths, required delta tests, and whether delta review is
   required.
2. The same Designer session changes only the named design subjects. `DESIGN_RESULT.md` remains a complete
   replacement package, increments `DESIGN_VERSION`, records `SUPERSEDES_DESIGN_CONTENT_HEAD` and addressed finding
   IDs, and gets a new content-only commit; its pointer follows in a separate pointer-only commit.
3. The Advisor validates ancestry, exact path diff, no unrelated changes, commit/push, and increments
   `DESIGN_REVISION_ATTEMPTS_USED`.
4. When review is required, the same Reviewer receives `DESIGN_DELTA_REVIEW` with a new unique `REVIEW_ID` and
   verifies previous-content-head ancestry, the path-filtered delta, finding closure, retained prior requirements,
   and unrelated-change absence.
5. PASS permits the freeze gate; PASS_WITH_RISK waits for Leo/GPT; NEEDS_PATCH may consume the next attempt; FAIL
   stops.

At two failed automatic revision attempts, the Advisor records `DESIGN_REVISION_LIMIT_REACHED` and returns to
Leo/GPT. No third automatic attempt, substitute Designer, substitute Reviewer, or Advisor patch is allowed. Expected
interleaved evidence between design content heads is the prior Designer pointer, Reviewer report, and Advisor
revision-routing artifacts; these are not design subjects, and delta review verifies no other path entered the range.

## 6. Immutable design state model

| State | Owner of transition | Required evidence | Permitted next state |
| --- | --- | --- | --- |
| INTAKE | Advisor | intent, preflight, Unknown Gate | DESIGN_ASSIGNED or BLOCKED_DECISION_REQUIRED |
| DESIGN_ASSIGNED | Advisor | brief, handoff, immutable input | DESIGN_DRAFTING |
| DESIGN_DRAFTING | Designer | exclusive write phase | READY_FOR_DESIGN_REVIEW or BLOCKED_DECISION_REQUIRED |
| READY_FOR_DESIGN_REVIEW | Designer reports; Advisor validates | design content/pointer heads | DESIGN_REVIEW_PENDING, ADVISOR_VALIDATION_PENDING for eligible skip, or DESIGN_REVISION_REQUIRED |
| DESIGN_REVIEW_PENDING | Advisor routes Reviewer | unique review ID and immutable subject | DESIGN_REVIEW_PASSED, DESIGN_REVISION_REQUIRED, RISK_ACCEPTANCE_REQUIRED, or FAILED |
| DESIGN_REVISION_REQUIRED | Advisor | finding IDs and attempt count below 2 | DESIGN_DRAFTING |
| DESIGN_REVIEW_PASSED | Reviewer verdict; Advisor validates | PASS report head | ADVISOR_VALIDATION_PENDING |
| ADVISOR_VALIDATION_PENDING | Advisor | all freeze gates | FROZEN or DESIGN_REVISION_REQUIRED |
| FROZEN | Advisor only | exact content head, paths, version, verdict/skip evidence | IMPLEMENTING or UNFROZEN |
| IMPLEMENTING | Worker | brief cites frozen head | IMPLEMENTATION_REVIEW_PENDING, DESIGN_DEFECT_REPORTED, or BLOCKED |
| DESIGN_DEFECT_REPORTED | Worker reports; Advisor owns route | defect evidence and clean transition | UNFROZEN |
| UNFROZEN | Advisor only | reason, previous frozen head, revision ID | DESIGN_ASSIGNED |
| IMPLEMENTATION_REVIEW_PENDING | Advisor routes Reviewer | immutable implementation subject | PASS, implementation rework, risk acceptance, or FAIL |
| RELOAD_PENDING | Advisor after final PASS when required | exact final canonical subject | FINAL_AUDIT_PENDING |
| CLOSED | Advisor after audit and pointer push | complete lineage and clean origin | none |

`FROZEN` is a reference, never a mutable branch label or editable file claim. Unfreezing never changes or erases the
old commit; it records why that version is superseded and creates a new design version and new frozen head through
the complete gates. Any Leo/GPT scope change after freeze requires the Advisor to unfreeze and reroute the Designer;
the Worker cannot treat a verbal or chat change as design authority.

## 7. Implementation-time design-defect return

The Worker reports a design defect when the frozen design is contradictory, incomplete for an implementation choice,
unsafe, incompatible with observed repository facts, or would require a material decision not contained in the
design.

```text
Worker stops at the defect
-> Worker returns BLOCKED_DESIGN_DEFECT evidence only to Advisor
-> Advisor validates and records the defect
-> Advisor unfreezes the old design head
-> Advisor routes a bounded Designer revision
-> Designer publishes a new design content head and pointer
-> same Reviewer performs DESIGN_DELTA_REVIEW when required
-> Advisor validates and freezes the new head
-> Advisor issues a Worker resume brief citing the new frozen head
-> Worker resumes
```

The Worker must not guess, edit design, or message the Designer, and the Designer must not edit implementation. If no
implementation file changed, the Worker makes a result-only defect report. If authorized implementation changes
already exist, the Worker brief must have pre-authorized a clean, non-release checkpoint commit; the Worker commits
only those authorized paths plus its blocked result, records `DESIGN_DEFECT_CHECKPOINT_HEAD` and failed/not-run
tests, pushes, and leaves a clean worktree. No deploy or production action is permitted, and high-risk work that
cannot safely exist as an inert checkpoint stops before the first such change. After refreeze, the resume brief
states whether to keep, adapt, or supersede the checkpoint; no history rewrite occurs. The final
`IMPLEMENTATION_REVIEW` covers the complete implementation range, including any checkpoint, against the latest frozen
design and confirms superseded behavior is absent.

## 8. Design-first mission flow

```text
Leo/GPT
  -> Advisor intake, investigation, Unknown Gate, and bounded Designer brief
  -> Designer design content and pointer
  -> Advisor validation
  -> Reviewer DESIGN_REVIEW when required
  -> Advisor freeze of exact design content head
  -> Worker implementation against that frozen head
  -> Reviewer IMPLEMENTATION_REVIEW
  -> required reloads and Advisor audit
  -> Leo/GPT
```

Every arrow between non-Advisor actors is mediated by the Advisor. A delta or defect loop returns to the relevant
author through the Advisor and then to the same Reviewer through the Advisor. Every transition is stored in
Git-backed Markdown; chat carries only pointers and actual containing heads that cannot safely self-reference inside
their own files.

## 9. Identifiers, loop state, and review IDs

### Required identifiers (never collapsed)

```text
JOB_ID
ORIGINAL_LEO_GPT_INTENT
ADVISOR_INTAKE_BASE
INPUT_HEAD
DESIGN_ID
DESIGN_VERSION
DESIGN_DEPTH
DESIGN_SUBJECT_PATHS
DESIGN_CONTENT_HEAD
DESIGN_POINTER_HEAD
DESIGN_REVIEW_REQUIRED
DESIGN_REVIEW_ID
DESIGN_REVIEW_REPORT_HEAD
DESIGN_REVISION_ATTEMPTS_USED
FROZEN_DESIGN_HEAD
FROZEN_DESIGN_PATHS
WORKER_BASE
WORKER_RESULT_HEAD
IMPLEMENTATION_REVIEW_ID
IMPLEMENTATION_REVIEW_REPORT_HEAD
IMPLEMENTATION_REWORK_ATTEMPTS_USED
FINAL_CONTENT_HEAD
POINTER_PUBLISH_HEAD
```

A design pointer head is not design content, a review report head is not its subject, a freeze record head is not the
frozen design, and a final pointer head is returned only after push.

### Advisor loop-state minimum

```text
MISSION_STATE
ORIGINAL_INTENT_REF
DESIGN_ID
DESIGN_VERSION
DESIGN_DEPTH
DESIGN_CONTENT_HEAD
DESIGN_POINTER_HEAD
DESIGN_REVIEW_REQUIRED
DESIGN_REVIEW_SKIP_REASON
DESIGN_REVIEW_ID
DESIGN_REVIEW_REPORT_HEAD
DESIGN_REVISION_ATTEMPTS_USED
DESIGN_REVISION_ATTEMPTS_MAX: 2
FROZEN_DESIGN_HEAD
FROZEN_DESIGN_PATHS
DESIGN_FREEZE_STATUS
WORKER_RESULT_HEAD
IMPLEMENTATION_REVIEW_ID
IMPLEMENTATION_REVIEW_REPORT_HEAD
IMPLEMENTATION_REWORK_ATTEMPTS_USED
IMPLEMENTATION_REWORK_ATTEMPTS_MAX: 2
ALL_REQUIRED_SESSIONS_RELOADED
NEXT_ACTOR
```

The design-revision and implementation-rework counters are separate and each capped at two automatic attempts.

### Review IDs and collision-free ownership

`REVIEW_ID` is a lower-case stable slug unique within `JOB_ID` and never reused. Required forms are:

```text
design-review-001
design-delta-review-001-a1
design-delta-review-001-a2
implementation-review-001
implementation-delta-review-001-a1
implementation-delta-review-001-a2
```

Every review writes only `runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT.md` and its `REVIEW_RESULT_POINTER.md`.
Each report declares `REVIEW_TYPE`, `REVIEW_ID`, `REVIEW_PASS`, subject base/head/paths, previous subject head for
delta, finding IDs, and the report-head sentinel. A new review never overwrites an old report.

## 10. Interfaces, ownership, and traceability

### Advisor-to-Designer brief (minimum fields)

```text
JOB_ID
DESIGN_ID
DESIGN_VERSION
MISSION
ORIGINAL_LEO_GPT_INTENT
TARGET_ACTOR: VibeNews Designer
TARGET_PROJECT
TARGET_REPO
TARGET_BRANCH
TARGET_SESSION_NAME
INPUT_HEAD
DESIGN_DEPTH
DESIGN_DEPTH_RATIONALE
DESIGN_REVIEW_REQUIRED
DESIGN_REVIEW_SKIP_REASON
DESIGN_SUBJECT_PATHS
DESIGN_AUTHORIZED_WRITE_PATHS
FORBIDDEN_PATHS
REQUIRED_DIRECT_READS
SUCCESS_CRITERIA
CONFIRMED_FACTS
ASSUMPTIONS
UNKNOWNS
OPEN_DECISIONS
REQUIRED_LEO_DECISIONS
SAFE_DEFAULT
REPO_TOPOLOGY_DECISION
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

### Designer result additions

The Designer result preserves every required field and adds `DESIGN_VERSION`, `DESIGN_SUBJECT_PATHS`,
`DESIGN_AUTHORIZED_WRITE_PATHS`, `SUPERSEDES_DESIGN_CONTENT_HEAD`, `REVISION_ID`, `REVIEW_FINDING_IDS_ADDRESSED`, and
`DESIGN_REVIEW_RECOMMENDATION`. For an initial design, supersedes/revision/finding fields are `NOT_APPLICABLE`, and
`DESIGN_STATUS` can be `READY_FOR_DESIGN_REVIEW` only with no blocking open decision. The exact result and pointer
schemas live in `RESULT_REPORTING_PROTOCOL.md`.

### Review interface additions

```text
REVIEW_TYPE: DESIGN_REVIEW | DESIGN_DELTA_REVIEW | IMPLEMENTATION_REVIEW | IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID
DESIGN_ID
FROZEN_DESIGN_HEAD
DESIGN_SUBJECT_PATHS
PREVIOUS_SUBJECT_HEAD
FINDING_IDS_IN_SCOPE
EXPECTED_INTERLEAVED_EVIDENCE_PATHS
DESIGN_CONFORMANCE_CHECK
```

Design review checks completeness, intent preservation, authority, decisions, feasibility, migration, failure and
policy handling, exact boundaries, and executable tests. Implementation review checks the actual implementation
against `FROZEN_DESIGN_HEAD` and confirms the Worker did not change design subjects.

### Worker interface additions

```text
DESIGN_ID
DESIGN_VERSION
FROZEN_DESIGN_HEAD
FROZEN_DESIGN_PATHS
DESIGN_REVIEW_EVIDENCE
DESIGN_CONFORMANCE_REQUIRED: true
DESIGN_DEFECT_CHECKPOINT_ALLOWED
DESIGN_DEFECT_STATUS
DESIGN_DEFECT_DETAILS
DESIGN_DEFECT_CHECKPOINT_HEAD
```

Worker preflight uses `git show <FROZEN_DESIGN_HEAD>:<DESIGN_RESULT_PATH>` and verifies every frozen path object;
mismatch or absence is a safe stop.

### Job artifact paths

Future jobs use these exact Advisor-owned patterns; `REVIEW_ID` and `ATTEMPT` keep repeated artifacts collision-free:

```text
advisor/jobs/<JOB_ID>/00_INTAKE.md
advisor/jobs/<JOB_ID>/01_ADVISOR_BRIEF.md
advisor/jobs/<JOB_ID>/design/DESIGNER_BRIEF.md
advisor/jobs/<JOB_ID>/design/DESIGNER_HANDOFF_PROMPT.md
advisor/jobs/<JOB_ID>/design/DESIGNER_RUN_PROMPT.md
advisor/jobs/<JOB_ID>/design/revisions/<ATTEMPT>/DESIGN_REVISION_BRIEF.md
advisor/jobs/<JOB_ID>/design/revisions/<ATTEMPT>/DESIGN_REVISION_HANDOFF_PROMPT.md
advisor/jobs/<JOB_ID>/design/revisions/<ATTEMPT>/DESIGN_REVISION_RUN_PROMPT.md
advisor/jobs/<JOB_ID>/reviews/<REVIEW_ID>/REVIEWER_BRIEF.md
advisor/jobs/<JOB_ID>/reviews/<REVIEW_ID>/REVIEWER_HANDOFF_PROMPT.md
advisor/jobs/<JOB_ID>/reviews/<REVIEW_ID>/REVIEWER_RUN_PROMPT.md
advisor/jobs/<JOB_ID>/implementation/WORKER_BRIEF.md
advisor/jobs/<JOB_ID>/implementation/WORKER_HANDOFF_PROMPT.md
advisor/jobs/<JOB_ID>/implementation/WORKER_RUN_PROMPT.md
advisor/jobs/<JOB_ID>/implementation/rework/<ATTEMPT>/REWORK_HANDOFF_PROMPT.md
advisor/jobs/<JOB_ID>/implementation/rework/<ATTEMPT>/REWORK_RUN_PROMPT.md
advisor/jobs/<JOB_ID>/reload/SESSION_RELOAD_INSTRUCTIONS.md
advisor/jobs/<JOB_ID>/reload/<ACTOR_ID>_RELOAD_RUN_PROMPT.md
advisor/jobs/<JOB_ID>/04_ADVISOR_VALIDATION.md
advisor/jobs/<JOB_ID>/05_FINAL_AUDIT.md
advisor/jobs/<JOB_ID>/10_LOOP_STATE.md
advisor/jobs/<JOB_ID>/11_FINAL_POINTER.md
advisor/jobs/<JOB_ID>/index.md
```

Already-committed flat Advisor artifacts of an in-flight job remain valid inputs and are not renamed or edited by
Designer or Worker.

## 11. Ownership summary

Designer-only: design authorship and revision. Worker-only: implementation and rework. Reviewer-only: review reports
and verdicts. Advisor-only: investigation, routing, depth selection, validation, freeze/unfreeze, loop state, reload
orchestration, and audit. Leo/GPT-only: material product-policy and risk decisions. No actor approves its own work,
and the expired bootstrap Advisor exception is not reactivated.
