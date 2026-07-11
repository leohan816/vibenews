# Design Result — VN-GOVERNANCE-DESIGNER-INTEGRATION-001

~~~text
DESIGN_RESULT
JOB_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001
DESIGN_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001-DESIGN-001
ACTOR: VibeNews Designer
DESIGN_DEPTH: FULL_DESIGN
ORIGINAL_LEO_GPT_INTENT: Add a permanent independent Designer to every VibeNews mission; keep Advisor-only routing, make design depth variable, keep design and implementation authoring separate, review design and implementation independently, and return every actor result only to Advisor.
USER_VALUE: Every implementation begins from an explicit, reviewed, immutable design while Leo/GPT retains all material product-policy authority.
SUCCESS_CRITERIA: Defined in this report; all are required.
CURRENT_STATE: At immutable input 9e20a28f8cd94f749896461b392eacd263bcfccc, canonical governance has Advisor, Worker, and Reviewer only; the worktree was clean and origin/master matched the input.
CONFIRMED_FACTS: Defined in this report.
ASSUMPTIONS: Defined in this report.
UNKNOWNS: None blocking this design.
OPEN_DECISIONS: None. Material policy choices and their authority basis are exposed in the Policy Decision Register.
PROPOSED_DESIGN: Defined in this report.
ROLE_AND_AUTHORITY_DESIGN: Defined in this report.
MISSION_FLOW: Defined in this report.
USER_FLOW: Defined in this report.
SYSTEM_FLOW: Defined in this report.
DATA_AND_STATE: Defined in this report.
INTERFACES: Defined in this report.
FAILURE_HANDLING: Defined in this report.
SECURITY_AND_PRIVACY: Defined in this report.
COPYRIGHT_OR_POLICY: Defined in this report.
NON_GOALS: Defined in this report.
IMPLEMENTATION_BOUNDARIES: Defined in this report.
TEST_AND_REVIEW_CRITERIA: Defined in this report.
MIGRATION_FROM_CURRENT_GOVERNANCE: Defined in this report.
SESSION_RELOAD_REQUIREMENTS: Defined in this report.
RESIDUAL_RISKS: Defined in this report.
DESIGN_STATUS: READY_FOR_DESIGN_REVIEW
DESIGN_CONTENT_HEAD: RECORDED_AFTER_DESIGN_CONTENT_PUSH_IN_POINTER
RESULT_PATH: runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md
POINTER_PATH: runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
~~~

## 1. Original intent and user value

The permanent command chain remains controlled by Leo/GPT through Advisor. The new Designer is mandatory for every
VibeNews mission after Advisor intake; only the amount of design work varies. Designer turns the preserved intent
and evidence into an implementable design, never implementation. Worker implements only an Advisor-frozen design.
Reviewer independently reviews design and implementation as different subjects and different review passes. No
non-Advisor actor routes to another actor or directly to Leo/GPT.

This gives Leo/GPT one accountable control point, prevents implementation from silently inventing product policy,
and leaves an immutable chain from intent to design, review, implementation, validation, reload, and closure.

## 2. Success criteria

All of the following are required:

1. The permanent actors are Leo/GPT, VibeNews Advisor, VibeNews Designer, VibeNews Worker, and VibeNews Reviewer.
2. Every mission receives a Designer-owned design package at QUICK_DESIGN, STANDARD_DESIGN, or FULL_DESIGN depth.
3. Advisor may investigate, scope, validate, route, freeze, and unfreeze, but may not author or patch design.
4. Designer may author design subjects but may not implement, review, approve, freeze, or route work.
5. Worker receives and implements only an exact FROZEN_DESIGN_HEAD and may not edit frozen design subjects.
6. Reviewer performs independent design and implementation review passes with collision-free REVIEW_ID paths.
7. Design review is required according to the matrix in section 8; only the exact low-impact QUICK_DESIGN rule may
   skip it. The current governance integration cannot skip it.
8. Design revisions are Designer-owned, finding-bounded, reviewed by the same Reviewer, and limited to two automatic
   attempts. Implementation rework retains its separate two-attempt counter.
9. A design defect found during implementation returns through Worker -> Advisor -> Designer -> Reviewer when
   required -> Advisor freeze -> Worker resume. Worker and Designer never negotiate directly.
10. Every freeze identifies an immutable design content commit, exact design subject paths, design version, review
    evidence or an eligible skip record, and zero blocking open decisions.
11. Current three-actor governance migrates without Advisor implementation, self-review, history rewrite, a new
    session, or reactivation of the expired bootstrap exception.
12. This mission changes only governance Markdown in the future Worker phase; product code, runtime, UI, package,
    environment, database, and product design files remain unchanged.
13. The existing VibeNews-advisor, VibeNews-designer, VibeNews, and VibeNews-reviewer sessions all reload the final
    passed canonical protocols before this mission closes.
14. Tests in section 19 pass, origin contains each declared commit, and the final worktree is clean.

## 3. Current state and evidence

### Confirmed facts

- Repository: /home/leo/Project/VibeNews.
- Origin: https://github.com/leohan816/vibenews.git.
- Branch: master.
- Immutable input and local/origin HEAD at entry:
  9e20a28f8cd94f749896461b392eacd263bcfccc.
- Entry worktree: clean, including staged, unstaged, and untracked state.
- Repository topology: SINGLE_REPO.
- Input diff from b69421da59cb4b99683e8196618d1b8ab6eab040 to the immutable input adds only the
  seven Advisor-owned kickoff artifacts for this job.
- Current canonical governance defines Advisor, Worker, and Reviewer, three fixed sessions, one implementation review
  loop, and three post-PASS reloads. It does not define Designer, design depth, design review, or design freezing.
- Product design rules already require a relevant 설계문서 document to be committed before implementation, one
  major feature block per design document, and no implementation of undocumented features.
- The bootstrap Reviewer issued PASS, all three then-required sessions reloaded, runtime change was zero, and the
  one-time Advisor implementation exception is EXPIRED.
- The current explicit mission authorizes one-time onboarding of the existing VibeNews-designer context. This
  higher-precedence mission authority permits this Designer result before permanent canonical integration.

### Assumptions

- A mission means an Advisor-created VibeNews job that proceeds beyond intake toward a repository, product,
  governance, operational, or design deliverable. Advisor may investigate enough to prepare intake before Designer
  routing, but may not send implementation to Worker without a frozen design.
- Existing fixed session names remain VibeNews-advisor, VibeNews-designer, VibeNews, and VibeNews-reviewer. Advisor
  must re-verify them before each launch and reload.
- Git commits are the immutable content identity. A pointer commit, review report commit, or freeze-record commit does
  not replace the design content identity.
- Product design documents authorized in a future Designer brief are part of the design subject. Post-implementation
  records under docs/ remain Worker implementation evidence unless a brief says otherwise.

### Unknowns

None blocks design review. The exact later Worker base and the actual review, freeze, implementation, report, reload,
final-content, and pointer heads do not exist yet and must be recorded only after their commits are pushed.

### Open decisions

None. If Advisor or Reviewer believes any rule below changes Leo/GPT's stated policy rather than making it
executable, it must identify that rule as BLOCKED_DECISION_REQUIRED instead of weakening or silently replacing it.

## 4. Policy Decision Register

This register makes every material governance choice visible.

| Decision | Rule | Authority basis | Blocking decision now |
| --- | --- | --- | --- |
| Designer participation | Designer is mandatory in every mission, including docs, governance, hotfix, and no-code missions. Urgency changes depth, not participation. | Explicit Leo/GPT intent | No |
| Designer routing | Only Advisor launches Designer and receives Designer results. | Explicit Leo/GPT intent | No |
| Design authorship | Advisor and Worker never author or patch design; Designer does. | Explicit Leo/GPT intent | No |
| Review separation | Design and implementation are different review subjects and review passes. | Explicit Leo/GPT intent | No |
| Low-impact skip | Only QUICK_DESIGN satisfying every predicate in section 8 may omit DESIGN_REVIEW. Ambiguity forces review. | Designer brief expressly requires a narrow skip rule | No |
| Freeze owner | Advisor records freeze after validation; Designer and Reviewer cannot freeze. | Explicit Advisor freezes / no self-approval intent | No |
| Freeze identity | FROZEN_DESIGN_HEAD equals the reviewed design content head, never its pointer or review report head. | Existing immutable-head and self-reference rules | No |
| Product design docs | When a product mission needs 설계문서 changes, Advisor authorizes exact paths to Designer and freezes them with the design result. Worker cannot edit them. | Existing design-before-implementation rule plus Designer authors design | No |
| Revision owner | Only Designer changes a design subject; same Reviewer reviews its delta. | Explicit brief | No |
| Attempt limits | Initial review is not an attempt; at most two automatic design revisions and two separate implementation reworks are allowed. | Explicit brief and current patch-loop precedent | No |
| Reload scope | This canonical-governance migration reloads all four fixed sessions after final implementation PASS. Future canonical-governance changes do the same. | Explicit mission requirement | No |
| Migration effectiveness | No new job starts under the five-actor protocol until this mission's final pointer is published after PASS and four reloads. | Migration safety; does not change actor authority | No |

## 5. Proposed design

Add a canonical DESIGN_PROTOCOL.md and integrate it by reference into the existing role, run, reporting, reload, and
role-index protocols. The new protocol owns design depth, design artifacts, review eligibility, validation, freeze,
revision, and implementation-defect return semantics. Existing protocols retain their current specialties and are
updated only where the new actor changes cross-cutting authority, sequence, reporting, lineage, or reload behavior.

The durable mission shape is:

~~~text
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
~~~

Every arrow between non-Advisor actors is mediated by Advisor. A delta or defect loop returns to the relevant author
through Advisor and then to the same Reviewer through Advisor.

## 6. Role and authority design

### Leo/GPT

- Owns mission intent, material product policy, risk acceptance, and decisions escalated by the Unknown Gate.
- Tasks and receives results only through Advisor.
- May explicitly override lower-level governance under the existing precedence rule; no actor may infer an override.

### VibeNews Advisor

May:

- investigate repository and external facts using authorized read-only methods;
- preserve the original instruction, create intake and briefs, set design depth with rationale, and record the
  Unknown Gate;
- launch the existing Designer, Worker, and Reviewer sessions;
- validate actor-owned evidence, route bounded revisions, and maintain loop state;
- freeze or unfreeze an exact design content head after the gates below;
- perform final validation, reload orchestration, audit, and pointer-only return.

May not:

- author, rewrite, patch, or silently complete Designer design content or product design documents;
- implement product, runtime, canonical governance, templates, tests, or general features;
- author Worker or Reviewer results;
- change a Reviewer verdict or accept material risk without Leo/GPT;
- freeze a design with blocking open decisions, missing evidence, or a required review that has not passed.

### VibeNews Designer

May:

- translate the Advisor-preserved intent and confirmed evidence into an implementable design package;
- expose assumptions, unknowns, material choices, failure modes, migration, exact paths, interfaces, and executable
  acceptance criteria;
- write the two exclusive result paths:
  runs/designer/<JOB_ID>/DESIGN_RESULT.md and
  runs/designer/<JOB_ID>/DESIGN_RESULT_POINTER.md;
- when the brief expressly authorizes them, write exact product design subject paths under 설계문서/ before
  implementation;
- revise only the design subject paths and finding IDs named by an Advisor revision handoff.

May not:

- implement source, runtime, UI, tests, packages, configuration, environment, database, deployment, or canonical
  governance;
- change Advisor, Worker, Reviewer, or other mission-owned artifacts;
- launch or message Worker or Reviewer, approve its own design, assign a verdict, freeze/unfreeze, or report directly
  to Leo/GPT;
- conceal a policy choice inside an implementation detail;
- use QUICK_DESIGN to omit required substance or self-declare review eligibility.

The result paths are permanently Designer-exclusive. Additional design subject paths are phase-exclusive only when
an Advisor brief lists them exactly. No other actor changes a frozen design path.

### VibeNews Worker

- Implements only the current Advisor brief and exact FROZEN_DESIGN_HEAD.
- Opens the design with Git evidence and treats it as immutable.
- Changes only explicit implementation paths and Worker-owned result paths.
- Records design conformance and every divergence.
- On a design defect, stops, returns the defect only to Advisor, and follows section 12.
- Never edits design subjects, Reviewer reports, Advisor artifacts, or another actor's results.

### VibeNews Reviewer

- Independently reviews the immutable subject and actual Git diff, not author summaries.
- Uses the same existing fixed Reviewer context for initial and delta review.
- Performs DESIGN_REVIEW, DESIGN_DELTA_REVIEW, IMPLEMENTATION_REVIEW, and
  IMPLEMENTATION_DELTA_REVIEW as distinct review passes.
- Writes only the collision-free report paths for the declared REVIEW_ID.
- Never patches a subject, freezes it, implements it, or communicates a route directly to Designer or Worker.

No actor approves its own work. A Reviewer PASS is independent evidence; Advisor still owns validation and freeze,
and only Leo/GPT resolves material policy or risk decisions.

## 7. Design depth

Advisor selects depth in the intake and Designer brief, records the rationale, and may only escalate depth when new
facts appear. A downgrade after routing requires an Advisor record showing why no required content or review is
lost. Depth never changes actor participation.

### QUICK_DESIGN

Use only for one small, reversible, well-understood, low-risk subject with no new behavior or cross-module contract.
The complete package still includes original intent, exact subject and implementation paths, scope/non-goals,
acceptance criteria, risks, rollback, assumptions, open decisions, and tests. Typical examples are a typo, broken
internal link, formatting-only Markdown repair, or non-normative wording clarification.

QUICK_DESIGN is not permission to skip design. It is the only depth that can be evaluated for the low-impact design
review skip in section 8.

### STANDARD_DESIGN

Default for bounded product behavior, UI/UX behavior, several related files, a new component, or a meaningful
documentation/operations change. It includes user and system flows, state changes, interfaces, failure behavior,
security/privacy/copyright/cost considerations, migration or rollout when relevant, exact implementation boundaries,
and executable review criteria. DESIGN_REVIEW is mandatory.

### FULL_DESIGN

Required for cross-cutting architecture, canonical governance or actor authority, new data/schema/migration, external
providers, permissions/auth, irreversible operations, security/privacy/copyright exposure, ranking/personalization,
automatic publishing/notifications, high-risk content, material recurring cost, or multiple modules. It includes
alternatives and decision exposure, complete state and lineage models, recovery/rollback, staged migration, and
strong audit criteria. DESIGN_REVIEW is mandatory.

If any trigger points to a deeper level, the deeper level wins. Uncertainty never justifies a shallower depth.

## 8. Design review matrix and low-impact skip

### Matrix

| Design depth | DESIGN_REVIEW_REQUIRED default | Skip permitted |
| --- | --- | --- |
| QUICK_DESIGN | true | Only when every low-impact predicate below is true |
| STANDARD_DESIGN | true | Never |
| FULL_DESIGN | true | Never |

Review is mandatory at any depth when the subject affects product/runtime behavior, UI interaction or meaning,
public contracts, navigation, data/schema/migrations, dependencies/build/configuration, credentials/permissions,
security/privacy/copyright, source collection or attribution, external providers, cost/rate limits,
ranking/personalization, automatic actions, high-risk content, canonical governance, actor authority, freeze or
ownership rules, or more than one functional module.

### All-of low-impact predicate

Advisor may set DESIGN_REVIEW_REQUIRED: false only when all are directly evidenced:

1. DESIGN_DEPTH is QUICK_DESIGN.
2. The change is non-behavioral, reversible, and confined to an exact small Markdown/text allowlist.
3. It changes no normative governance, product requirement, user promise, UX meaning, public API, data, code,
   configuration, dependency, generated artifact, test behavior, security/privacy/copyright posture, or cost.
4. The Unknown Gate has no unresolved item and no mandatory-review trigger.
5. No assumption or open decision can change the implementation.
6. The design has exact acceptance tests and rollback.
7. Advisor records DESIGN_REVIEW_SKIP_REASON: LOW_IMPACT_QUICK_DESIGN, the predicates and evidence, the exact
   DESIGN_CONTENT_HEAD, and the exact DESIGN_SUBJECT_PATHS in an Advisor-owned validation artifact.

Examples that may qualify are typo-only correction, broken relative-link repair, whitespace/format-only Markdown,
or clarification that provably changes no normative meaning. Product copy, legal/trust copy, visual behavior,
feature-index status, canonical protocol text, and any ambiguous change do not qualify.

Designer may recommend but cannot decide eligibility. If any predicate is false or uncertain, review is required.
Skipping design review never skips implementation review for a changed implementation subject.

For this job:

~~~text
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
DESIGN_REVIEW_SKIP_REASON: NOT_APPLICABLE
DESIGN_REVIEW_ID: design-review-001
~~~

## 9. Advisor design validation and freeze gate

Advisor validates directly after each Designer return:

1. repo, origin, branch, input ancestry, clean state, commit, push, and exclusive path ownership;
2. DESIGN_RESULT schema, exact original intent, selected depth, success criteria, and required direct reads;
3. confirmed facts versus assumptions, Unknown Gate coverage, and zero blocking open decisions;
4. complete user/system flows, state, interfaces, failure/recovery, policy, non-goals, implementation allowlist,
   and executable tests proportional to depth;
5. safe self-reference: content head in the pointer, pointer-head sentinel in the file, and actual pointer head only
   after push;
6. required product design documents are included in DESIGN_SUBJECT_PATHS and committed before implementation;
7. required independent review has PASS, or every low-impact skip predicate is recorded;
8. the reviewed content head and subject paths have not changed after verdict.

If validation fails, Advisor routes a bounded Designer revision; Advisor never edits the design. If a blocking
OPEN_DECISION exists, Advisor records BLOCKED_DECISION_REQUIRED, returns the exact decision to Leo/GPT, and does not
review, freeze, or launch Worker.

Advisor may record FROZEN only when:

~~~text
DESIGN_STATUS_FROM_DESIGNER: READY_FOR_DESIGN_REVIEW
ADVISOR_DESIGN_VALIDATION: PASS
BLOCKING_OPEN_DECISIONS: none
DESIGN_REVIEW_REQUIRED: true -> REVIEWER_VERDICT: PASS
DESIGN_REVIEW_REQUIRED: false -> DESIGN_REVIEW_SKIP_ELIGIBILITY: PASS
FROZEN_DESIGN_HEAD: exact DESIGN_CONTENT_HEAD
FROZEN_DESIGN_PATHS: exact reviewed DESIGN_SUBJECT_PATHS
DESIGN_VERSION: exact version
~~~

PASS_WITH_RISK is not freezeable until Leo/GPT explicitly accepts every risk and Advisor records that acceptance.
NEEDS_PATCH routes revision. FAIL stops. Freeze metadata is Advisor-owned and does not alter the immutable design
content. Designer never writes FROZEN as its own status.

## 10. Design revision and delta review

The initial design review does not consume a revision attempt. On NEEDS_PATCH or failed Advisor validation:

1. Advisor writes a revision brief/handoff with REVISION_ID, ATTEMPT 1 or 2, exact finding IDs, previous design
   content head, allowed design paths, forbidden paths, required delta tests, and whether delta review is required.
2. The same Designer session changes only the named design subjects. DESIGN_RESULT.md remains a complete replacement
   package, increments DESIGN_VERSION, records SUPERSEDES_DESIGN_CONTENT_HEAD and addressed finding IDs, and gets a
   new content-only commit. Its pointer is then updated in a separate pointer-only commit.
3. Advisor validates ancestry, exact path diff, no unrelated changes, commit/push, and increments
   DESIGN_REVISION_ATTEMPTS_USED.
4. When review is required, the same Reviewer receives DESIGN_DELTA_REVIEW with a new unique REVIEW_ID. It verifies
   previous content head ancestry, the path-filtered delta, finding closure, retained prior requirements, and
   unrelated-change absence.
5. PASS permits the freeze gate. PASS_WITH_RISK waits for Leo/GPT. NEEDS_PATCH may consume the next attempt. FAIL
   stops.

At two failed automatic revision attempts, Advisor records DESIGN_REVISION_LIMIT_REACHED and returns to Leo/GPT.
No third automatic attempt, substitute Designer, substitute Reviewer, or Advisor patch is allowed.

Expected interleaved evidence paths between design content heads are the prior Designer pointer, Reviewer report,
and Advisor revision-routing artifacts. They are not design subjects. Delta review separately verifies that no path
outside the declared design changes and expected evidence/routing paths entered the range.

## 11. Immutable design state model

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

FROZEN is a reference, never a mutable branch label or editable file claim. Unfreezing never changes or erases the
old commit. It records why that version is superseded and creates a new design version and new frozen head through
the complete gates.

Any Leo/GPT scope change after freeze requires Advisor to unfreeze and reroute Designer. Worker cannot treat a verbal
or chat change as design authority.

## 12. Implementation-time design-defect return

Worker reports a design defect when the frozen design is contradictory, incomplete for an implementation choice,
unsafe, incompatible with observed repository facts, or would require a material decision not contained in the
design.

Required flow:

~~~text
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
~~~

Worker must not guess, edit design, or message Designer. Designer must not edit implementation. If no implementation
file changed, Worker makes a result-only defect report. If authorized implementation changes already exist, the
Worker brief must have pre-authorized a clean, non-release checkpoint commit. Worker commits only those authorized
paths plus its blocked result, records DESIGN_DEFECT_CHECKPOINT_HEAD and failed/not-run tests, pushes, and leaves a
clean worktree. No deploy or production action is permitted. After refreeze, the resume brief states whether to keep,
adapt, or supersede that checkpoint; no history rewrite occurs. High-risk work that cannot safely exist as an inert
checkpoint must stop before the first such change.

The final IMPLEMENTATION_REVIEW covers the complete implementation range, including any checkpoint, against the
latest frozen design and confirms superseded behavior is absent.

## 13. Mission, user, and system flows

### Mission flow

1. Leo/GPT sends mission to Advisor.
2. Advisor verifies repo/topology/state, investigates facts, records original intent and Unknown Gate, selects depth,
   and writes a bounded Designer brief.
3. Designer verifies input and writes design content only, then pointer only, returning to Advisor.
4. Advisor validates. Blocking decision returns to Leo/GPT. Otherwise Advisor routes required design review.
5. Reviewer independently reports the design verdict to Advisor.
6. Advisor routes at most two Designer revisions and same-Reviewer delta reviews as needed.
7. Advisor records the exact frozen design head only after the freeze gate.
8. Advisor briefs Worker with exact frozen head, subject paths, implementation paths, tests, and access limits.
9. Worker implements and returns to Advisor, or uses the design-defect flow.
10. Advisor validates implementation evidence and routes IMPLEMENTATION_REVIEW.
11. Reviewer independently reviews design conformance and implementation. At most two Worker rework/delta cycles use
    their own counter and unique IDs.
12. After final PASS, Advisor performs required four-session reloads for canonical governance changes, validates
    lineage and origin, publishes final audit/content and pointer-only commits, and returns to Leo/GPT.

### User flow

- Leo/GPT sees material decisions before implementation, receives no actor-to-user side channel, and gets one final
  Advisor pointer with immutable lineage.
- Urgent or tiny work still receives a QUICK_DESIGN, so scope and tests stay explicit without forcing a full
  architecture package.
- Material work receives STANDARD_DESIGN or FULL_DESIGN plus independent design review before implementation.
- When implementation reveals a flaw, the user sees a truthful blocked/design-revision state rather than an
  undocumented implementation decision.

### System flow

~~~text
INTENT_REF
 -> DESIGN_ID + DESIGN_VERSION + DESIGN_CONTENT_HEAD
 -> DESIGN_REVIEW_ID + DESIGN_REVIEW_REPORT_HEAD
 -> FROZEN_DESIGN_HEAD
 -> WORKER_BRIEF_HEAD + IMPLEMENTATION_HEAD
 -> IMPLEMENTATION_REVIEW_ID + IMPLEMENTATION_REVIEW_REPORT_HEAD
 -> RELOAD_EVIDENCE
 -> FINAL_CONTENT_HEAD
 -> POINTER_PUBLISH_HEAD
~~~

Every transition is stored in Git-backed Markdown. Chat carries only pointers and actual containing heads that
cannot safely self-reference inside their own files.

## 14. Data, state, and traceability

### Required identifiers

~~~text
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
~~~

These identities are never collapsed. A design pointer head is not design content. A review report head is not its
subject. A freeze record head is not the frozen design. A final pointer head is returned only after push.

### Advisor loop-state minimum

The Advisor-owned loop state records:

~~~text
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
~~~

### Review IDs and collision-free ownership

REVIEW_ID is a lower-case stable slug unique within JOB_ID and never reused. Required forms are:

~~~text
design-review-001
design-delta-review-001-a1
design-delta-review-001-a2
implementation-review-001
implementation-delta-review-001-a1
implementation-delta-review-001-a2
~~~

Every review writes:

~~~text
runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT.md
runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT_POINTER.md
~~~

Only Reviewer owns those paths. Each report declares REVIEW_TYPE, REVIEW_ID, REVIEW_PASS, subject base/head/paths,
previous subject head for delta, finding IDs, and report-head sentinel. A new review never overwrites an old report.

## 15. Interfaces and file contracts

### Advisor-to-Designer brief

Minimum fields:

~~~text
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
~~~

The handoff requires direct preflight and reads, schema completion, exclusive writes, content-only then pointer-only
commits, push verification, pointer-only return, and stop. The short launcher includes the standard target fields,
REQUIRED_SKILL, READ_AND_EXECUTE, immutable INPUT_HEAD, memory/scope/subagent prohibitions, Advisor return, and stop.

### Designer result

The permanent Designer result preserves every field required by this job and adds:

~~~text
DESIGN_VERSION
DESIGN_SUBJECT_PATHS
DESIGN_AUTHORIZED_WRITE_PATHS
SUPERSEDES_DESIGN_CONTENT_HEAD
REVISION_ID
REVIEW_FINDING_IDS_ADDRESSED
DESIGN_REVIEW_RECOMMENDATION
~~~

For an initial design, supersedes/revision/finding fields are NOT_APPLICABLE. DESIGN_STATUS can be
READY_FOR_DESIGN_REVIEW only with no blocking open decision.

The pointer file contains:

~~~text
DESIGN_RESULT_WRITTEN
JOB_ID:
DESIGN_ID:
DESIGN_VERSION:
ACTOR: VibeNews Designer
DESIGN_STATUS:
DESIGN_CONTENT_HEAD: actual content commit
RESULT_FILE:
POINTER_FILE:
DESIGN_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT
PUSHED: true
RETURN_TO: Advisor
NEXT_ACTOR: Advisor
STOP
~~~

### Review interface

Reviewer brief/result adds:

~~~text
REVIEW_TYPE: DESIGN_REVIEW | DESIGN_DELTA_REVIEW | IMPLEMENTATION_REVIEW | IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID
DESIGN_ID
FROZEN_DESIGN_HEAD
DESIGN_SUBJECT_PATHS
PREVIOUS_SUBJECT_HEAD
FINDING_IDS_IN_SCOPE
EXPECTED_INTERLEAVED_EVIDENCE_PATHS
DESIGN_CONFORMANCE_CHECK
~~~

Design review checks completeness, intent preservation, authority, decisions, feasibility, migration, failure and
policy handling, exact boundaries, and executable tests. Implementation review checks the actual implementation
against FROZEN_DESIGN_HEAD and confirms design subjects were not changed by Worker.

### Worker interface

Worker brief/result adds:

~~~text
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
~~~

Worker preflight uses git show <FROZEN_DESIGN_HEAD>:<DESIGN_RESULT_PATH> and verifies every frozen path object.
Mismatch or absence is a safe stop.

### Job artifact paths

Future jobs use these exact Advisor-owned patterns; REVIEW_ID and ATTEMPT make repeated artifacts collision-free:

~~~text
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
~~~

The present integration job's already-committed flat Advisor artifacts remain valid migration inputs and are not
renamed or edited by Designer or Worker.

## 16. Failure handling and recovery

- Preflight mismatch, dirty foreign file, wrong origin/branch/head, or unresolved topology: safe stop before write.
- Blocking open decision: BLOCKED_DECISION_REQUIRED to Advisor, then Leo/GPT; no review/freeze/implementation.
- Missing or incomplete design: Advisor routes Designer revision; never fills it in.
- Design review NEEDS_PATCH: bounded Designer revision and same-Reviewer delta review.
- Design review FAIL: stop; no substitution or improvised patch.
- PASS_WITH_RISK: wait for explicit Leo/GPT acceptance.
- Revision attempt limit: stop after two automatic revisions.
- Frozen subject mutation: invalidate freeze, stop Worker, create a new design subject and review.
- Worker design defect: use section 12; old frozen head remains evidence.
- Implementation NEEDS_PATCH: bounded same-Worker rework, separate attempt count, same-Reviewer implementation delta.
- Missing Reviewer independence or report path collision: review invalid; do not freeze or close.
- Session reload missing or performed before final PASS: invalid; repeat only in the exact fixed session after PASS.
- Push failure: do not claim completion; retain local evidence, report not pushed, and stop safely.
- Pointer self-reference error: create a later corrective pointer-only commit; never amend or rewrite history.
- Unexpected runtime/product path in this migration: fail implementation review and route only a bounded Worker patch.

Recovery is additive. No merge, force push, reset, amend, branch creation/switch, history rewrite, replacement actor,
or silent evidence deletion is part of this design.

## 17. Security, privacy, copyright, policy, and cost

### Security and privacy

- Governance artifacts contain no credentials, cookies, tokens, .env content, private user data, raw transcripts, or
  production access.
- Designer briefs declare runtime, database, secret, and production access; default is false unless Leo/GPT and the
  mission explicitly authorize otherwise.
- Exact allowlists, single-writer phases, clean transitions, immutable heads, and origin verification reduce
  cross-session contamination.
- A design must cover security/privacy impacts before freeze when the mission touches identity, permissions,
  providers, telemetry, storage, deletion, or user content.

### Copyright and policy

- This integration uses only original governance Markdown and repository-local evidence.
- No external article, video, social content, transcript, or redistributed source is needed or allowed.
- Future source collection, retention, provenance, attribution, AI factuality, high-risk content, and correction or
  deletion behavior remain Unknown Gate triggers and force at least FULL_DESIGN plus review.
- Reviewer and Advisor cannot convert a design recommendation into material policy without Leo/GPT authority.

### Cost

- The permanent Designer and design review add deliberate process cost. QUICK_DESIGN limits artifact depth for truly
  small work; the all-of skip rule avoids a separate design review only when risk is provably negligible.
- No mission may use QUICK_DESIGN or the skip rule merely to reduce model/runtime cost.
- Provider costs, rate limits, retention, and paid actions remain explicit design fields and Unknown Gate items.
- This migration performs no provider call, build, runtime access, database access, or production action.

## 18. Implementation boundaries

### Exact canonical implementation set

The future Worker for this job may create or modify only the following governance content paths:

~~~text
docs/agent/AGENT_ROLE_PROTOCOL.md
docs/agent/DESIGN_PROTOCOL.md
docs/agent/RUN_PROTOCOL.md
docs/agent/RESULT_REPORTING_PROTOCOL.md
docs/agent/SESSION_RELOAD_PROTOCOL.md
docs/agent/ROLE_INDEX.md

advisor/templates/DESIGNER_BRIEF_TEMPLATE.md
advisor/templates/DESIGNER_HANDOFF_TEMPLATE.md
advisor/templates/DESIGNER_RUN_PROMPT_TEMPLATE.md
advisor/templates/DESIGN_REVISION_HANDOFF_TEMPLATE.md
advisor/templates/DESIGN_REVISION_RUN_PROMPT_TEMPLATE.md
advisor/templates/FINAL_AUDIT_TEMPLATE.md
advisor/templates/RESULT_POINTER_TEMPLATE.md
advisor/templates/REVIEWER_BRIEF_TEMPLATE.md
advisor/templates/REVIEWER_HANDOFF_TEMPLATE.md
advisor/templates/REVIEWER_RUN_PROMPT_TEMPLATE.md
advisor/templates/REWORK_HANDOFF_TEMPLATE.md
advisor/templates/REWORK_RUN_PROMPT_TEMPLATE.md
advisor/templates/WORKER_BRIEF_TEMPLATE.md
advisor/templates/WORKER_HANDOFF_TEMPLATE.md
advisor/templates/WORKER_RUN_PROMPT_TEMPLATE.md

docs/reports/governance/2026-07-11_designer_governance_integration.md
runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT.md
runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT_POINTER.md
~~~

Root AGENTS.md and CLAUDE.md already route through ROLE_INDEX and need no content change. They remain mandatory direct
reads and are explicitly forbidden implementation paths for this job.

### Required canonical distribution

- AGENT_ROLE_PROTOCOL.md: five-actor chain, four fixed sessions, Designer authority, Advisor-only routing,
  no-self-review, precedence, and expired exception.
- DESIGN_PROTOCOL.md: sections 7 through 15 of this design as the canonical concise contract.
- RUN_PROTOCOL.md: preflight/Unknown Gate plus design-first sequence, separate design and implementation loops,
  freeze/defect flow, lineage, file-first launchers, product design ownership, and finalization.
- RESULT_REPORTING_PROTOCOL.md: Designer result/pointer schema and chat, REVIEW_TYPE/REVIEW_ID paths, frozen-design
  fields in Worker/Reviewer/Advisor reporting, and pointer-safe heads.
- SESSION_RELOAD_PROTOCOL.md: four fixed sessions, DESIGN_PROTOCOL direct read, Designer return schema, and the
  post-PASS gate.
- ROLE_INDEX.md: DESIGN_PROTOCOL in required read order and a routing row for Designer.

### Required template distribution

- Add the five Designer/design-revision templates listed above.
- Update Reviewer templates for REVIEW_TYPE, REVIEW_ID, collision-free paths, design subjects, design conformance,
  and delta semantics.
- Update Worker templates to require FROZEN_DESIGN_HEAD and forbid design-subject edits.
- Update rework templates to identify IMPLEMENTATION_DELTA_REVIEW and keep its counter separate.
- Update result-pointer and final-audit templates with design lineage and four-session evidence.
- Preserve pointer self-reference sentinels and pointer-only chat.

### Forbidden paths and actions

~~~text
CLAUDE.md
AGENTS.md
advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/**
runs/designer/**
runs/reviewer/**
설계문서/**
app/**
src/**
components/**
assets/**
package.json
package-lock.json
app.json
env and secret files
database/schema/migration files
all paths not explicitly allowed above
~~~

Worker must not create a branch/session/subagent, modify product/runtime behavior, use Expo tooling, access DB,
secrets, or production, or reactivate the Advisor exception. Worker stages exact paths only, inspects the cached
diff, commits/pushes its authorized implementation/result, then publishes its pointer according to the canonical
result contract.

## 19. Tests and review criteria

The Worker and implementation Reviewer must execute or directly inspect the following in addition to exact brief
tests:

1. Preflight:
   git rev-parse --show-toplevel; git remote get-url origin; git branch --show-current; git rev-parse HEAD;
   git status --short; git status --porcelain=v1 --untracked-files=all.
2. Ancestry:
   git merge-base --is-ancestor 9e20a28f8cd94f749896461b392eacd263bcfccc <SUBJECT_HEAD>.
3. Exact path allowlist:
   compare git diff --name-only 9e20a28f8cd94f749896461b392eacd263bcfccc..<SUBJECT_HEAD> with the
   complete declared mission-lineage allowlist and fail on any undeclared path; separately compare
   WORKER_BASE..<SUBJECT_HEAD> against the exact implementation and Worker-result allowlist.
4. Markdown integrity:
   git diff --check 9e20a28f8cd94f749896461b392eacd263bcfccc..<SUBJECT_HEAD>.
5. Canonical reachability:
   ROLE_INDEX directly links every canonical file including DESIGN_PROTOCOL; every linked file exists.
6. Actor coverage:
   direct inspection confirms Leo/GPT, Advisor, Designer, Worker, Reviewer, all four exact fixed sessions, Advisor-only
   return, and no self-approval.
7. Design depth coverage:
   exact definitions for QUICK_DESIGN, STANDARD_DESIGN, FULL_DESIGN and an all-of QUICK-only skip rule.
8. Review coverage:
   all four REVIEW_TYPE values, unique REVIEW_ID paths, separate attempt counters, same-Reviewer delta, and verdict
   behavior exist in canonical and templates.
9. Freeze coverage:
   FROZEN_DESIGN_HEAD is the content head, freeze owner is Advisor, blocking decisions forbid freeze, and Worker
   launchers require the exact frozen head.
10. Defect coverage:
    Worker -> Advisor -> Designer -> Reviewer when required -> Advisor -> Worker is explicit, with no direct
    Worker/Designer route.
11. Reporting coverage:
    Designer result/pointer/chat schema, self-reference sentinel, Reviewer report path, Worker design fields, final
    audit lineage, and pointer-only limits agree across canonical and templates.
12. Ownership coverage:
    no canonical text permits Advisor to design/implement, Designer to implement/review/freeze, Worker to edit frozen
    design, or Reviewer to patch.
13. Migration coverage:
    SPECIAL_IMPLEMENTATION_EXCEPTION remains EXPIRED; current change is Worker-authored; four reloads occur only after
    final implementation PASS.
14. Runtime-zero coverage:
    no source, runtime, UI, asset, package, environment, database, schema, migration, or product design file changes.
15. Stale-contract search:
    inspect every remaining three-actor-only or three-session-only statement under docs/agent and advisor/templates;
    retain only explicitly historical text.
16. Dirty-state coverage:
    cached, unstaged, and untracked state are inspected before each commit and clean after each push.
17. Origin coverage:
    every content, pointer, report, freeze/finalization, and final pointer commit is verified on origin/master.

### DESIGN_REVIEW criteria for this result

Reviewer must directly read this result at its immutable content head and verify:

- all 17 required brief topics are present and implementable;
- the explicit Leo/GPT intent is preserved without an actor bypass;
- material policy rules are visible and none requires an unrecorded Leo/GPT decision;
- proposed paths are sufficient and bounded;
- the low-impact skip cannot cover this mission or any behavioral/governance change;
- Designer product-design authorship reconciles the existing design-before-implementation rule;
- freeze, unfreeze, revision, defect, review IDs, lineage, and four-session migration are internally consistent;
- implementation tests can detect stale three-actor rules, forbidden paths, and runtime changes.

Valid verdicts remain PASS, PASS_WITH_RISK, NEEDS_PATCH, and FAIL.

## 20. Migration from current governance

1. The present Designer content and pointer commits are authorized by the explicit one-time onboarding instruction.
   They do not claim current canonical Designer authority as their basis.
2. Advisor validates this result and routes DESIGN_REVIEW_ID design-review-001 to the existing
   VibeNews-reviewer session at the immutable design content head and exact design subject path.
3. NEEDS_PATCH uses the same VibeNews-designer and VibeNews-reviewer contexts, at most twice. Advisor never patches.
4. After design PASS and Advisor validation, Advisor records FROZEN_DESIGN_HEAD and writes a bounded Worker brief
   containing exactly the paths and tests in sections 18 and 19.
5. The existing VibeNews Worker authors canonical/template/report Markdown. The expired Advisor exception stays
   expired and is not needed.
6. Advisor validates the Worker commit and routes IMPLEMENTATION_REVIEW_ID implementation-review-001 to the same
   existing Reviewer as a separate immutable subject and report path.
7. Any implementation patch is Worker-owned, bounded, limited to two attempts, and receives
   IMPLEMENTATION_DELTA_REVIEW from that Reviewer.
8. After final PASS, canonical subject paths freeze. Advisor launches post-PASS reloads in VibeNews-advisor,
   VibeNews-designer, VibeNews, and VibeNews-reviewer. No substitute session counts.
9. Advisor validates all four returns, exact origin lineage, zero runtime change, final audit/content, and
   pointer-only publish commit.
10. The five-actor governance becomes available for new missions only after the final pointer is published. During
    this integration, no parallel mission may mix old and new role rules.

This is an additive, review-gated migration. It renames no existing session, rewrites no history, changes no product
design or runtime, and grants Advisor no implementation exception.

## 21. Session reload requirements

Gate: final IMPLEMENTATION_REVIEW PASS against the canonical implementation subject. Never reload before this PASS.

Required existing fixed sessions:

~~~text
VibeNews Advisor: VibeNews-advisor
VibeNews Designer: VibeNews-designer
VibeNews Worker: VibeNews
VibeNews Reviewer: VibeNews-reviewer
~~~

Each directly opens:

~~~text
CLAUDE.md
AGENTS.md
docs/agent/ROLE_INDEX.md
docs/agent/AGENT_ROLE_PROTOCOL.md
docs/agent/DESIGN_PROTOCOL.md
docs/agent/RUN_PROTOCOL.md
docs/agent/RESULT_REPORTING_PROTOCOL.md
docs/agent/SESSION_RELOAD_PROTOCOL.md
~~~

Each returns only to Advisor:

~~~text
ROLE_PROTOCOL_RELOADED
ACTOR:
ACTOR_ID:
SESSION_NAME:
WORKSPACE:
ENTRY_FILES_READ:
CANONICAL_FILES_READ:
DESIGN_PROTOCOL_READ:
ROLE_SUMMARY:
DESIGN_GATE_SUMMARY:
FORBIDDEN_SUMMARY:
SUBJECT_HEAD:
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
~~~

Designer readiness additionally confirms: mandatory all-depth participation; design-only authority; exclusive result
paths; material-decision exposure; no implementation/review/freeze; Advisor-only return; and revision obligations.
Advisor records all four exact session returns in validation. Missing, partial, pre-PASS, relayed by another
session, or substitute-context evidence does not count.

## 22. Non-goals

- No canonical, template, product design, source, runtime, UI, test, package, environment, database, or Advisor job
  implementation by Designer in this phase.
- No product feature, visual design, source ingestion, model/provider choice, TTS, ranking, personalization, or
  content-policy decision.
- No general emergency bypass, self-review, direct actor-to-actor route, or design-review waiver beyond section 8.
- No new session, tmux context, agent, subagent, branch, repository, deployment, or production action.
- No retroactive relabeling of the bootstrap as Designer-authored and no reactivation of its expired exception.
- No guarantee that a reviewed design makes implementation correct; independent implementation review remains
  mandatory when implementation exists.

## 23. Residual risks

- A larger governance surface increases maintenance and may leave stale three-actor language. The exact-file search,
  canonical cross-reference tests, and four-session reload mitigate this.
- QUICK_DESIGN skip eligibility involves judgment. The all-of predicate, explicit evidence, Advisor ownership, and
  default-to-review rule constrain it; Reviewer should reject any broader wording.
- Shared master/workspace transitions can be contaminated by dirty state. Single-writer phases, clean handoffs,
  exact staging, checkpoint rules, and origin verification are mandatory.
- A design can be internally complete but conflict with new repository facts during implementation. The explicit
  defect/unfreeze/review/refreeze flow prevents Worker from silently deciding.
- Permanent Designer participation adds latency. Depth scaling is the approved control; role bypass is not.

These risks are non-blocking for design review because the design contains enforceable gates and tests for each.
