# VibeNews Run Protocol

Status: canonical

## 1. Entry and preflight

Every actor opens `CLAUDE.md`, `AGENTS.md`, and all canonical files in `docs/agent/` directly. Do not act from
memory or a prior chat summary.

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
recent history. Never guess a repository, create or switch a branch, create or clone a repository, merge, force
push, or rewrite history to satisfy preflight. A branch/origin/topology mismatch or unresolved topology requires a
safe stop before any write.

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

Before any Worker brief, the Advisor records:

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

Escalate discovery and do not create a Worker handoff when the mission involves unresolved PII/identity; copyright,
licensing, or redistribution; article/video/social source storage; credentials, cookies, or accounts; WAF/login
bypass; database/schema/migration; irreversible collection, deletion, or publication; provider retention/training;
ranking, recommendation, or personalization; automatic publishing or notifications; AI-news factuality; source
attribution/provenance; deletion/correction requests; provider cost/rate limits; election, medical, financial, or
legal high-risk content; cross-module canonical conflicts; or repository-topology conflicts.

Wait for Leo/GPT decisions and any required external review. The safe default is no implementation and no risky
state change.

## 4. Standard mission sequence

1. Advisor preflight and evidence-based diagnosis.
2. Advisor brief with success criteria, allowed paths, forbidden paths, and Unknown Gate.
3. Worker handoff and short launcher when implementation is required.
4. Worker result/pointer commit and push, returned only to Advisor.
5. Advisor validates repository, diff, tests/build, result ownership, commit, push, and origin.
6. Independent Reviewer handoff and short launcher against an immutable subject head and path set.
7. Reviewer direct inspection and report-only result/pointer commit and push.
8. Advisor handles verdict and routes a bounded patch when allowed.
9. Same Reviewer performs ancestry-checked, path-filtered delta re-review.
10. Required fixed sessions reload canonical protocols.
11. Advisor final validation, final audit, content commit, pointer-only publish commit, origin verification, and
    pointer-only return to Leo/GPT.

Actors may not skip or combine role-owned phases.

## 5. Verdict and patch loop

- `PASS`: proceed to Advisor validation and required reloads.
- `PASS_WITH_RISK`: do not close. Return every risk to Leo/GPT and wait for explicit acceptance.
- `NEEDS_PATCH`: route only the required bounded patch. Re-review must use the same Reviewer.
- `FAIL`: stop immediately. Do not substitute another Reviewer or improvise a patch.

Automatic patch/re-review is limited to two attempts. A delta review verifies the previous subject as an ancestor,
reads the exact path-filtered diff from previous subject to new subject, confirms unrelated changes are absent, and
issues its verdict only for the declared new subject head and paths.

For the one-time governance bootstrap, a `NEEDS_PATCH` verdict permits only an Advisor-authored governance-Markdown
patch. The Advisor creates `advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/09_ADVISOR_PATCH_RECORD.md` only when a patch
actually occurs, with:

```text
PATCH_ATTEMPT:
REVIEW_FINDING_IDS:
FILES_CHANGED:
WHY_IN_SCOPE:
PREVIOUS_SUBJECT_HEAD:
NEW_SUBJECT_HEAD: RECORDED_AFTER_PATCH_PUSH
UNRELATED_CHANGES: none
RETURN_TO: same VibeNews Reviewer
```

The Advisor stages only that bounded patch, commits and pushes `PATCH_HEAD`, and routes the same Reviewer to the
new immutable subject. It must not use a future Worker `09_REWORK_HANDOFF_PROMPT.md` as an Advisor patch record.

## 6. Git and exclusive write ownership

- Write only on the verified target branch and only when the current mission explicitly authorizes it.
- Never create/switch branches, merge, force push, rewrite history, or bypass branch protection without explicit
  authority.
- One actor owns writes during a phase. Before transition, verify local HEAD, origin HEAD, staged, unstaged, and
  untracked state.
- Do not use blanket staging. Stage only the declared paths and inspect the cached diff.
- Include no unrelated dirty file, secret, credential, cookie, private raw data, or full copyrighted source.
- Briefs, handoffs, launchers, results, pointers, reviews, loop state, validation, final audit, and governance reports
  are versioned unless excluded for security, privacy, copyright, or size.
- Reviewer result commits are Reviewer-owned and report-only. Advisor may not create or amend them.

## 7. Subject and report lineage

Keep these identities separate:

```text
SUBJECT_BASE
SUBJECT_HEAD
SUBJECT_PATHS
REPORT_PATHS
REPORT_HEAD
```

A verdict covers only the declared subject head and subject paths. The Reviewer report commit does not change the
subject. If a report-only commit changes a subject path, independence is violated and the review fails.

No versioned file may claim the exact SHA of the commit that contains that file. Use
`RECORDED_AFTER_REPORT_PUSH_IN_CHAT` or `RECORDED_AFTER_RESULT_PUSH_IN_CHAT`, then capture the actual containing SHA
in the post-push pointer and a later Advisor audit.

After final Reviewer `PASS`, canonical subject paths are frozen. Any later canonical change creates a new subject
head and requires the same Reviewer to review it. Post-PASS additions to a final content commit are limited to
validation, audit, reload, loop-state, index final state, and governance-summary artifacts.

## 8. Finalization lineage

```text
AUTHORING_BASE
AUTHORING_HEAD
INITIAL_REVIEW_REPORT_HEAD
PATCH_HEAD
DELTA_REVIEW_REPORT_HEAD
FINAL_CONTENT_HEAD
POINTER_PUBLISH_HEAD
```

Use `NOT_APPLICABLE` for absent patch/delta heads. `FINAL_CONTENT_HEAD` contains the Reviewer-passed canonical
subject plus reload records, Advisor validation, final audit, loop state, governance report, and final index state.
`POINTER_PUBLISH_HEAD` is a separate final commit containing only `11_FINAL_POINTER.md`.

Because the final audit is inside `FINAL_CONTENT_HEAD`, it records:

```text
FINAL_CONTENT_HEAD: RECORDED_AFTER_THIS_AUDIT_IN_FINAL_POINTER
POINTER_PUBLISH_HEAD: RECORDED_ONLY_IN_FINAL_CHAT_AFTER_POINTER_PUSH
```

The final pointer records the actual `FINAL_CONTENT_HEAD` but never contains `POINTER_PUBLISH_HEAD`; that value is
returned only after the pointer commit is pushed.

## 9. File-first and launcher contract

All actors use file-first reporting. Full briefs, evidence, findings, results, and audits go into declared Markdown
files. Chat returns only the concise pointer block, never the full report. Result and pointer files must both exist
before an actor reports completion.

Every Worker, Reviewer, rework, and reload run begins from a short launcher with:

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

The actor opens `READ_AND_EXECUTE`, reads every referenced real file, performs only its named role, writes both
declared files when applicable, returns only the pointer block, and stops.

## 10. VibeNews product safeguards

For product work, write or update the relevant `설계문서/` design before implementation, discuss material product
decisions with Leo/GPT, and implement only after approval. One major feature block gets one design document. Update
the implementation documentation after implementation.

Before writing Expo code, read the exact Expo SDK 57 documentation at
`https://docs.expo.dev/versions/v57.0.0/`. Never commit `.env`, credentials, service-role keys, raw transcripts,
private user data, or full copyrighted source. Validate runtime, tests, build, route count, and sensitive-data state
in proportion to the mission.

## 11. Conflict stop

Record the conflicting files, exact statements, unresolved consequences, safe default, and required Leo/GPT
decision. Then return `BLOCKED_DECISION_REQUIRED` and stop. Never resolve authority conflicts through assumption.
