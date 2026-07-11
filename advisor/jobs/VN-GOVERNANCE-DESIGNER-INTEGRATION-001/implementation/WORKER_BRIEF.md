# Worker Brief — VN-GOVERNANCE-DESIGNER-INTEGRATION-001

```text
JOB_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001
MISSION: Implement the independently passed, frozen permanent Designer governance in Markdown only.
TARGET_ACTOR: VibeNews Worker
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews
WORKER_INPUT_HEAD: RECORDED_AFTER_WORKER_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
DESIGN_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001-DESIGN-001
DESIGN_VERSION: 1
FROZEN_DESIGN_HEAD: b05ad62aa503567f64a36f449c84c31679ba9aee
FROZEN_DESIGN_PATHS: runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md
DESIGN_REVIEW_REQUIRED: true
DESIGN_REVIEW_ID: design-review-001
DESIGN_REVIEW_VERDICT: PASS
DESIGN_REVIEW_REPORT_HEAD: 544a6e8cdfed528acb52758c1aaf5c9d44206b28
DESIGN_CONFORMANCE_REQUIRED: true
DESIGN_DEFECT_CHECKPOINT_ALLOWED: false
RUNTIME_CHANGE_ALLOWED: false
PRODUCT_CODE_CHANGE_ALLOWED: false
DB_ACCESS: false
SECRET_ACCESS: false
PROD_ACCESS: false
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required direct reads

Before writing, directly verify repo root, origin, `master`, launcher-supplied `WORKER_INPUT_HEAD`, `origin/master`,
and clean staged/unstaged/untracked state. Directly read:

- `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, and every canonical protocol it requires;
- the complete frozen design with
  `git show b05ad62aa503567f64a36f449c84c31679ba9aee:runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md`;
- `runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/design-review-001/REVIEW_RESULT.md` at report head
  `544a6e8cdfed528acb52758c1aaf5c9d44206b28`;
- `advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/04_ADVISOR_VALIDATION.md`;
- every existing template in the allowlist below before modifying it.

Do not execute from chat memory or summaries. A mismatch, dirty foreign file, missing object, or conflict with the
frozen design is `BLOCKED_DESIGN_DEFECT` or `BLOCKED_DECISION_REQUIRED` returned only to Advisor; do not guess.

## Exact implementation subject allowlist

Create or modify only these governance Markdown subject paths:

```text
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
```

Worker-owned evidence paths are additionally allowed:

```text
runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT.md
runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT_POINTER.md
```

All other paths are forbidden. In particular, do not change `CLAUDE.md`, `AGENTS.md`, this job's `advisor/jobs/**`,
`runs/designer/**`, `runs/reviewer/**`, `설계문서/**`, application/source/component/asset paths, package or lock files,
Expo/app configuration, environment/secret files, database/schema/migration files, tests, runtime, UI, backend, or
external-provider code. Do not create a branch, session, agent, subagent, repository, merge, amend, force-push,
rewrite history, access production, or reactivate the expired Advisor exception.

## Required implementation

Implement the frozen design without weakening it:

1. Define the permanent five-actor chain and four exact fixed sessions while keeping Leo/GPT input and all actor
   returns Advisor-only.
2. Add canonical `DESIGN_PROTOCOL.md` covering mandatory Designer participation, QUICK/STANDARD/FULL depth, the
   exact review matrix and narrow QUICK-only skip, Advisor validation/freeze, design revisions, immutable design
   identity, implementation-time design defects, IDs, states, interfaces, ownership, and traceability.
3. Update role, run, reporting, reload, and index protocols so they agree with `DESIGN_PROTOCOL.md` and preserve the
   current instruction precedence, Unknown Gate, file-first reporting, pointer-only chat, self-reference rules,
   exclusive write scopes, separate attempt counters, and finalization rules.
4. Add the five Designer/design-revision templates and update all listed Reviewer, Worker, rework, pointer, and final
   audit templates for `REVIEW_TYPE`, collision-free `REVIEW_ID`, frozen-design evidence, separate design and
   implementation reviews, same-Reviewer deltas, design-defect routing, and four-session lineage.
5. Preserve Designer-only design authorship, Worker-only implementation/rework, Reviewer-only reports and verdicts,
   Advisor-only investigation/routing/validation/freeze/audit, and Leo/GPT-only material policy/risk decisions.
6. Preserve `SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED`. Do not create an Advisor implementation exception.
7. Write the governance report with actual frozen-design/review lineage, exact implementation paths, zero runtime
   change, tests, residual watch items, and pending implementation-review/reload/finalization states. Do not claim
   mission completion.
8. Read every new or changed Markdown file directly after editing and reconcile all cross-file terminology.

## Required checks

Execute and record at minimum:

- preflight/root/origin/branch/HEAD and complete dirty-state checks before edits and commits;
- `git merge-base --is-ancestor b05ad62aa503567f64a36f449c84c31679ba9aee <WORKER_CONTENT_HEAD>` after the content commit;
- exact `WORKER_INPUT_HEAD..<WORKER_CONTENT_HEAD>` path comparison against the subject allowlist plus
  `WORKER_RESULT.md`, failing on every undeclared path;
- `git diff --check <WORKER_INPUT_HEAD>..<WORKER_CONTENT_HEAD>`;
- direct link/existence validation for every canonical file listed by `ROLE_INDEX.md`;
- direct term/contract checks for all five actors, four fixed sessions, all three design depths, four review types,
  unique `REVIEW_ID` paths, separate attempt counters, same-Reviewer delta review, immutable freeze, design-defect
  return, and Advisor-only routing;
- a stale-contract search through `docs/agent/**` and `advisor/templates/**` for unqualified three-actor or
  three-session rules;
- exact forbidden-path/runtime-zero comparison from `WORKER_INPUT_HEAD`;
- clean staged/unstaged/untracked state after each push and exact origin commit verification.

No Expo, package, runtime, product, or build command is required for this docs-only mission. Record build as
`NOT_APPLICABLE_DOCS_ONLY`.

## Commit and result contract

Use two additive commits without amend or history rewrite:

1. A Worker content commit containing only the exact implementation subject paths actually changed plus
   `runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT.md`. Inside the result, use
   `RESULT_HEAD: RECORDED_AFTER_RESULT_PUSH_IN_POINTER` and record the launcher-supplied `WORKER_INPUT_HEAD`, frozen
   design/review evidence, exact changed files, commands, checks, access status, dirty state, limitations, and risks.
2. After pushing and verifying the content commit, a pointer-only commit containing only
   `WORKER_RESULT_POINTER.md`. The pointer records the actual Worker content head and uses
   `WORKER_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT`.

The implementation-review subject head is the Worker content commit, and its verdict paths are the implementation
subject allowlist entries actually changed. The pointer commit is evidence only and must not change a subject path.
Push both commits to `master`, verify them on origin, return only the concise pointer block with both actual heads to
Advisor, and STOP.
