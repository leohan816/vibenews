# Worker Validation Correction Brief — validation-correction-001

```text
JOB_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001
CORRECTION_ID: validation-correction-001
MISSION: Correct three Advisor validation defects before the initial IMPLEMENTATION_REVIEW.
TARGET_ACTOR: VibeNews Worker
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews
CORRECTION_INPUT_HEAD: RECORDED_AFTER_CORRECTION_ROUTING_PUSH_IN_ACTUAL_LAUNCHER
PREVIOUS_IMPLEMENTATION_SUBJECT_HEAD: 647efaa47cb5eda5c7e90ea2304fa00d0c23776b
PREVIOUS_WORKER_POINTER_HEAD: f4b318a0059992a06512d4dc033110bd3d2bb988
FROZEN_DESIGN_HEAD: b05ad62aa503567f64a36f449c84c31679ba9aee
DESIGN_REVIEW_REPORT_HEAD: 544a6e8cdfed528acb52758c1aaf5c9d44206b28
FINDING_IDS: AIV-001; AIV-002; AIV-003
ALLOWED_PATCH_PATHS: docs/agent/AGENT_ROLE_PROTOCOL.md; docs/agent/RESULT_REPORTING_PROTOCOL.md
RESULT_PATH: runs/rework/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/REWORK_RESULT.md
POINTER_PATH: runs/rework/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/REWORK_RESULT_POINTER.md
IMPLEMENTATION_REWORK_ATTEMPTS_USED: 0
RUNTIME_CHANGE_ALLOWED: false
PRODUCT_CODE_CHANGE_ALLOWED: false
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Required bounded corrections

### AIV-001 — preserve the complete Designer result schema

In `docs/agent/RESULT_REPORTING_PROTOCOL.md`, replace the contracted `DESIGN_RESULT` schema with an explicit schema
that preserves every minimum field from this mission and retains all frozen-design additions. It must include exact,
separate lines for at least:

```text
JOB_ID
DESIGN_ID
DESIGN_VERSION
ACTOR
DESIGN_DEPTH
ORIGINAL_LEO_GPT_INTENT
USER_VALUE
SUCCESS_CRITERIA
CURRENT_STATE
CONFIRMED_FACTS
ASSUMPTIONS
UNKNOWNS
OPEN_DECISIONS
PROPOSED_DESIGN
ROLE_AND_AUTHORITY_DESIGN
MISSION_FLOW
USER_FLOW
SYSTEM_FLOW
DATA_AND_STATE
INTERFACES
FAILURE_HANDLING
SECURITY_AND_PRIVACY
COPYRIGHT_OR_POLICY
COST
NON_GOALS
IMPLEMENTATION_BOUNDARIES
TEST_AND_REVIEW_CRITERIA
MIGRATION_FROM_CURRENT_GOVERNANCE
SESSION_RELOAD_REQUIREMENTS
RESIDUAL_RISKS
DESIGN_SUBJECT_PATHS
DESIGN_AUTHORIZED_WRITE_PATHS
SUPERSEDES_DESIGN_CONTENT_HEAD
REVISION_ID
REVIEW_FINDING_IDS_ADDRESSED
DESIGN_REVIEW_RECOMMENDATION
DESIGN_STATUS
DESIGN_CONTENT_HEAD
RESULT_PATH
POINTER_PATH
RETURN_TO
STOP_AFTER_RETURN
```

Do not collapse distinct required fields into aggregate names. Keep initial/revision semantics and the
`DESIGN_CONTENT_HEAD` self-reference sentinel intact.

### AIV-002 — make design review subject identity explicit

In the canonical `REVIEW_RESULT` schema, add distinct `DESIGN_CONTENT_HEAD:` and `DESIGN_SUBJECT_PATHS:` fields next
to `DESIGN_ID:`/`FROZEN_DESIGN_HEAD:`. State that design passes require the design content head and subject paths and
use `FROZEN_DESIGN_HEAD: NOT_APPLICABLE`, while implementation passes require the frozen design head and retain the
design subject paths for immutability/conformance checks. Keep `DESIGN_CONFORMANCE_CHECK` rules intact.

### AIV-003 — remove authority ambiguity

In `docs/agent/AGENT_ROLE_PROTOCOL.md`:

1. Replace the abbreviated first chain with the explicit permanent flow:

```text
Leo/GPT
-> VibeNews Advisor
-> VibeNews Designer
-> VibeNews Advisor
-> VibeNews Reviewer when DESIGN_REVIEW is required
-> VibeNews Advisor
-> VibeNews Worker
-> VibeNews Advisor
-> VibeNews Reviewer for IMPLEMENTATION_REVIEW
-> VibeNews Advisor
-> Leo/GPT
```

2. Replace the sentence implying Designer authors canonical governance with unambiguous wording that later canonical
   governance is designed by Designer, implemented into canonical Markdown by Worker, and never implemented by
   Advisor.

Do not weaken any existing authority, mandatory-Designer, review, freeze, or routing rule.

## Forbidden changes and verification

Change no path except the two canonical patch paths and the two Worker-owned correction result paths. Do not change
the frozen design, any Reviewer report, Advisor artifact, template, governance report, root entry file, runtime,
product, package, environment, DB, or `설계문서/` path. Do not create/switch a branch, merge, amend, rewrite history,
force-push, or launch another agent/session.

Directly read the two patched canonical files and both correction evidence files. Run anchored field checks for every
AIV-001/AIV-002 field, exact-flow/authority phrase checks for AIV-003, `git diff --check`, exact path comparison,
frozen-design and prior Reviewer-report immutability checks, runtime-zero check, clean dirty-state checks, and origin
verification.

Create a correction content commit containing only the two canonical files plus `REWORK_RESULT.md`, with the new
subject head represented by a self-reference sentinel inside the result. Push and verify it. Then create a separate
pointer-only commit containing only `REWORK_RESULT_POINTER.md`, record the actual corrected content head there, push,
and return both actual heads only to Advisor. This pre-review correction keeps
`IMPLEMENTATION_REWORK_ATTEMPTS_USED: 0`.
