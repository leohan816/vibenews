# 02 Designer Brief — VN-GOVERNANCE-DESIGNER-INTEGRATION-001

```text
TARGET_ACTOR: VibeNews Designer
ACTOR_ID: vibenews-designer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-designer
MODEL: gpt-5.6-sol
REASONING_EFFORT: max
DESIGN_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001-DESIGN-001
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
DESIGN_REVIEW_ID: design-review-001
INPUT_HEAD: EXACT_SHA_SUPPLIED_IN_SHORT_LAUNCHER_AFTER_ADVISOR_KICKOFF_PUSH
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Objective

Design an implementable, migration-safe governance package that adds VibeNews Designer as a permanent actor while
preserving Advisor-only Leo/GPT routing, independent ownership, Worker implementation boundaries, Reviewer
independence, file-first evidence, immutable heads, and current safe-stop rules.

Designer authors design only. Do not modify `CLAUDE.md`, `AGENTS.md`, `docs/agent/**`, `advisor/templates/**`,
Advisor job artifacts, product design documents, source/runtime/UI/package/env/DB files, Worker results, or Reviewer
results.

## Required direct reads

- `CLAUDE.md`, `AGENTS.md`, and every current canonical file in `docs/agent/`.
- This job's `00_INTAKE.md`, `01_ADVISOR_BRIEF.md`, `02_DESIGNER_BRIEF.md`, and Designer handoff.
- Prior bootstrap `05_FINAL_AUDIT.md` and `11_FINAL_POINTER.md`.
- Current relevant product design index and latest design documents needed to understand existing design-first rules.
- Actual Git state and base-to-input diff.

## Required design content

The design must specify at least:

1. Permanent actors: Leo/GPT, Advisor, Designer, Worker, Reviewer.
2. Designer authority, prohibitions, exclusive result paths, and Advisor-only return.
3. Advisor-to-Designer brief/handoff/short-launcher contract.
4. `QUICK_DESIGN`, `STANDARD_DESIGN`, and `FULL_DESIGN` definitions; Designer remains mandatory at every depth.
5. Mandatory `DESIGN_REVIEW_REQUIRED` matrix and narrowly documented skip rule for low-impact review only.
6. Advisor design validation gate and blocking-open-decision behavior.
7. Designer-owned bounded revision and same-Reviewer `DESIGN_DELTA_REVIEW`, maximum two automatic attempts.
8. Immutable `FROZEN` design head and freeze/unfreeze/revision state model.
9. Worker handoff gate requiring the exact frozen design content head.
10. Implementation-time design-defect return: Worker -> Advisor -> Designer revision -> design review when required
    -> new frozen head -> Worker resume.
11. Distinct review passes: `DESIGN_REVIEW`, `DESIGN_DELTA_REVIEW`, `IMPLEMENTATION_REVIEW`, and
    `IMPLEMENTATION_DELTA_REVIEW`.
12. Collision-free `REVIEW_ID` result paths and ownership for multiple reviews in one job.
13. End-to-end traceability from Leo/GPT intent through design, review, frozen head, implementation, implementation
    review, reload, and Advisor audit.
14. Four fixed-session reload contract, including Designer actor readiness.
15. Migration from current three-actor canonical governance without reactivating the expired Advisor exception.
16. Exact proposed canonical/template/job/report path set and bounded Worker implementation instructions.
17. Failure, recovery, non-goals, security/privacy/copyright/cost considerations, and executable tests/review criteria.

## Required result schema

```text
DESIGN_RESULT
JOB_ID:
DESIGN_ID:
ACTOR: VibeNews Designer
DESIGN_DEPTH:
ORIGINAL_LEO_GPT_INTENT:
USER_VALUE:
SUCCESS_CRITERIA:
CURRENT_STATE:
CONFIRMED_FACTS:
ASSUMPTIONS:
UNKNOWNS:
OPEN_DECISIONS:
PROPOSED_DESIGN:
ROLE_AND_AUTHORITY_DESIGN:
MISSION_FLOW:
USER_FLOW:
SYSTEM_FLOW:
DATA_AND_STATE:
INTERFACES:
FAILURE_HANDLING:
SECURITY_AND_PRIVACY:
COPYRIGHT_OR_POLICY:
NON_GOALS:
IMPLEMENTATION_BOUNDARIES:
TEST_AND_REVIEW_CRITERIA:
MIGRATION_FROM_CURRENT_GOVERNANCE:
SESSION_RELOAD_REQUIREMENTS:
RESIDUAL_RISKS:
DESIGN_STATUS:
DESIGN_CONTENT_HEAD: RECORDED_AFTER_DESIGN_CONTENT_PUSH_IN_POINTER
RESULT_PATH: runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md
POINTER_PATH: runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT_POINTER.md
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

`DESIGN_STATUS` may be `READY_FOR_DESIGN_REVIEW` only when no blocking open decision remains. Otherwise return a
truthful blocked status and identify the exact Leo/GPT decision needed.

## Commit and self-reference contract

1. Write only `DESIGN_RESULT.md`; stage only it; inspect the cached diff; commit and push the design content.
2. Record its actual SHA as `DESIGN_CONTENT_HEAD` in `DESIGN_RESULT_POINTER.md`.
3. The pointer must use `DESIGN_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT` and must not claim its own
   containing SHA.
4. Stage only the pointer; commit and push a pointer-only commit.
5. Return only a concise pointer block with both actual SHAs to Advisor and stop.

Designer does not freeze or approve its own design. Advisor validates; Reviewer decides the independent verdict.
