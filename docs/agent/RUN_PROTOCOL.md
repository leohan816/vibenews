# VibeNews Run Protocol

Status: canonical

## 1. Entry and preflight

Every actor opens `CLAUDE.md`, `AGENTS.md`, and all canonical files in `docs/agent/` directly, including
`DESIGN_PROTOCOL.md`. Do not act from memory or a prior chat summary.

Before writes, the Advisor records and verifies:

```text
TARGET_BRANCH
RESOLVED_TARGET_REPO
EXPECTED_ORIGIN_REPOSITORY
REPO_TOPOLOGY_DECISION
HEAD
DIRTY_STATE
```

Required read-only checks include repository top-level, origin, current branch, HEAD, short/porcelain status, and
recent history. Never guess a repository, create or switch a branch, create or clone a repository, merge, force push,
or rewrite history to satisfy preflight. A branch/origin/topology mismatch or unresolved topology requires a safe stop
before any write.

## 2. Repository topology

Use exactly one decision:

```text
SINGLE_REPO
SPLIT_PRODUCT_AND_GOVERNANCE_REPOS
BLOCKED_UNRESOLVED
```

Use `SINGLE_REPO` only when product code, design documents, and operations documents are maintained together and no
separate canonical VibeNews governance/docs repository exists. Do not duplicate canonical governance into a product
repository when a separate canonical governance repository exists. `BLOCKED_UNRESOLVED` forbids writes.

## 3. Unknown Gate

Before any Designer or Worker brief, the Advisor records:

```text
CONFIRMED_FACTS
ASSUMPTIONS
UNKNOWNS
COST_IF_WRONG
REVERSIBILITY
REQUIRED_LEO_DECISIONS
REQUIRED_EXTERNAL_REVIEW
SAFE_DEFAULT
REPO_TOPOLOGY_DECISION
```

Escalate discovery and do not route past intake when the mission involves unresolved PII/identity; copyright,
licensing, or redistribution; article/video/social source storage; credentials, cookies, or accounts; WAF/login
bypass; database/schema/migration; irreversible collection, deletion, or publication; provider retention/training;
ranking, recommendation, or personalization; automatic publishing or notifications; AI-news factuality; source
attribution/provenance; deletion/correction requests; provider cost/rate limits; election, medical, financial, or
legal high-risk content; cross-module canonical conflicts; or repository-topology conflicts. Any such trigger forces
at least `FULL_DESIGN` and mandatory design review under `DESIGN_PROTOCOL.md`.

Wait for Leo/GPT decisions and any required external review. The safe default is no design freeze, no implementation,
and no risky state change.

## 4. Standard mission sequence

1. Advisor preflight, evidence-based diagnosis, Unknown Gate, and design-depth selection with rationale.
2. Advisor bounded Designer brief, handoff, and short launcher against an immutable input head.
3. Designer writes design content only, then pointer only, and returns to Advisor.
4. Advisor validates the design; a blocking decision returns to Leo/GPT, otherwise the Advisor routes required
   `DESIGN_REVIEW`.
5. Reviewer independently reports the design verdict to Advisor.
6. Advisor routes at most two Designer revisions and same-Reviewer `DESIGN_DELTA_REVIEW` passes as needed.
7. Advisor records the exact `FROZEN_DESIGN_HEAD` only after the freeze gate in `DESIGN_PROTOCOL.md`.
8. Advisor briefs Worker with the exact frozen head, subject paths, implementation paths, tests, and access limits.
9. Worker implements against the frozen head and returns to Advisor, or uses the design-defect flow.
10. Advisor validates implementation evidence and routes `IMPLEMENTATION_REVIEW` against an immutable subject.
11. Reviewer directly inspects design conformance and implementation and reports a report-only verdict.
12. Advisor handles the verdict and routes a bounded same-Worker rework with its own counter and unique review ID
    when allowed; the same Reviewer performs `IMPLEMENTATION_DELTA_REVIEW`.
13. After final PASS, required fixed sessions reload the canonical protocols.
14. Advisor final validation, final audit, content commit, pointer-only publish commit, origin verification, and
    pointer-only return to Leo/GPT.

Actors may not skip or combine role-owned phases. Design authoring, implementation, and review never share a session.

## 5. Verdict and patch loops

Valid verdicts for every review pass are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`.

- `PASS`: proceed to Advisor validation, then freeze (design) or required reloads (implementation).
- `PASS_WITH_RISK`: do not close or freeze. Return every risk to Leo/GPT and wait for explicit acceptance.
- `NEEDS_PATCH`: route only the required bounded change. Re-review must use the same Reviewer.
- `FAIL`: stop immediately. Do not substitute another Reviewer or improvise a change.

Design and implementation keep separate two-attempt counters:

- A design `NEEDS_PATCH` routes a Designer-owned revision under `DESIGN_PROTOCOL.md`; the Advisor never patches
  design. The initial design review is not an attempt; at most two automatic revisions are allowed, then
  `DESIGN_REVISION_LIMIT_REACHED` returns to Leo/GPT.
- An implementation `NEEDS_PATCH` routes a Worker-owned bounded rework; at most two automatic reworks are allowed,
  then the Advisor returns to Leo/GPT.

A delta review verifies the previous subject as an ancestor, reads the exact path-filtered diff from previous to new
subject, confirms unrelated changes and unexpected paths are absent, and issues its verdict only for the declared new
subject head and paths. No Advisor implementation exception exists; the bootstrap exception remains
`SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED`.

## 6. Git and exclusive write ownership

- Write only on the verified target branch and only when the current mission explicitly authorizes it.
- Never create/switch branches, merge, force push, rewrite history, or bypass branch protection without explicit
  authority.
- One actor owns writes during a phase. Before transition, verify local HEAD, origin HEAD, staged, unstaged, and
  untracked state.
- Do not use blanket staging. Stage only the declared paths and inspect the cached diff.
- Include no unrelated dirty file, secret, credential, cookie, private raw data, or full copyrighted source.
- Designer results, Reviewer reports, Worker results, briefs, handoffs, launchers, pointers, loop state, validation,
  final audit, and governance reports are versioned unless excluded for security, privacy, copyright, or size.
- Designer results are Designer-owned; Reviewer results at `runs/reviewer/<JOB_ID>/<REVIEW_ID>/` are Reviewer-owned
  and report-only; the Advisor may not create or amend either.

## 7. Subject and report lineage

Keep these identities separate:

```text
SUBJECT_BASE
SUBJECT_HEAD
SUBJECT_PATHS
REPORT_PATHS
REPORT_HEAD
```

The design adds `DESIGN_CONTENT_HEAD`, `DESIGN_POINTER_HEAD`, `DESIGN_REVIEW_REPORT_HEAD`, `FROZEN_DESIGN_HEAD`,
`WORKER_RESULT_HEAD`, and `IMPLEMENTATION_REVIEW_REPORT_HEAD` as distinct identities. A verdict covers only the
declared subject head and subject paths. `FROZEN_DESIGN_HEAD` equals the reviewed design content head, never a
pointer or report head. A Reviewer report commit does not change its subject; if a report-only commit changes a
subject path, independence is violated and the review fails.

No versioned file may claim the exact SHA of the commit that contains that file. Use
`RECORDED_AFTER_REPORT_PUSH_IN_CHAT`, `RECORDED_AFTER_RESULT_PUSH_IN_POINTER`, or
`RECORDED_AFTER_POINTER_PUSH_IN_CHAT`, then capture the actual containing SHA in the post-push pointer and a later
Advisor audit.

After final Reviewer `PASS`, canonical subject paths are frozen. Any later canonical change creates a new subject head
and requires the same Reviewer to review it. Post-PASS additions to a final content commit are limited to validation,
audit, reload, loop-state, index final state, and governance-summary artifacts.

## 8. Finalization lineage

```text
DESIGN_CONTENT_HEAD
DESIGN_REVIEW_REPORT_HEAD
FROZEN_DESIGN_HEAD
AUTHORING_BASE
AUTHORING_HEAD
INITIAL_REVIEW_REPORT_HEAD
PATCH_HEAD
DELTA_REVIEW_REPORT_HEAD
FINAL_CONTENT_HEAD
POINTER_PUBLISH_HEAD
```

Use `NOT_APPLICABLE` for absent patch/delta heads. `FINAL_CONTENT_HEAD` contains the Reviewer-passed canonical subject
plus reload records, Advisor validation, final audit, loop state, governance report, and final index state.
`POINTER_PUBLISH_HEAD` is a separate final commit containing only the final pointer.

Because the final audit is inside `FINAL_CONTENT_HEAD`, it records:

```text
FINAL_CONTENT_HEAD: RECORDED_AFTER_THIS_AUDIT_IN_FINAL_POINTER
POINTER_PUBLISH_HEAD: RECORDED_ONLY_IN_FINAL_CHAT_AFTER_POINTER_PUSH
```

The final pointer records the actual `FINAL_CONTENT_HEAD` but never contains `POINTER_PUBLISH_HEAD`; that value is
returned only after the pointer commit is pushed.

## 9. File-first and launcher contract

All actors use file-first reporting. Full briefs, designs, evidence, findings, results, and audits go into declared
Markdown files. Chat returns only the concise pointer block, never the full report. Result and pointer files must both
exist before an actor reports completion.

Every Designer, design-revision, Worker, Reviewer, rework, and reload run begins from a short launcher with:

```text
TARGET_ACTOR
TARGET_PROJECT
TARGET_REPO
TARGET_BRANCH
TARGET_SESSION_NAME
REQUIRED_SKILL
READ_AND_EXECUTE
RETURN_RESULT_TO: Advisor
DO_NOT_EXECUTE_FROM_MEMORY: true
DO_NOT_BROADEN_SCOPE: true
NO_NEW_AGENT_OR_SUBAGENT: true
```

Designer, Worker, and Reviewer launchers additionally carry their immutable input head (`INPUT_HEAD`,
`FROZEN_DESIGN_HEAD`, or `SUBJECT_HEAD`). The actor opens `READ_AND_EXECUTE`, reads every referenced real file,
performs only its named role, writes both declared files when applicable, returns only the pointer block, and stops.

## 10. VibeNews product safeguards

Product design authorship belongs to the Designer under an Advisor brief; the relevant `설계문서/` design is written
and frozen before implementation, one major feature block gets one design document, and material product decisions are
routed to Leo/GPT before implementation. The Worker implements product code only against a frozen design and updates
the implementation documentation after implementation.

Before writing Expo code, read the exact Expo SDK 57 documentation at
`https://docs.expo.dev/versions/v57.0.0/`. Never commit `.env`, credentials, service-role keys, raw transcripts,
private user data, or full copyrighted source. Validate runtime, tests, build, route count, and sensitive-data state
in proportion to the mission.

## 11. Conflict stop

Record the conflicting files, exact statements, unresolved consequences, safe default, and required Leo/GPT decision.
Then return `BLOCKED_DECISION_REQUIRED` and stop. A frozen design that is contradictory, incomplete, unsafe, or
materially undecided at implementation time is instead returned as `BLOCKED_DESIGN_DEFECT` to the Advisor per
`DESIGN_PROTOCOL.md`. Never resolve authority conflicts through assumption.
