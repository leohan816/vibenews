# Reviewer Brief — design-review-001

```text
JOB_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001
MISSION: Independently review the permanent VibeNews Designer governance design before any canonical implementation.
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: DESIGN_REVIEW
REVIEW_ID: design-review-001
REVIEW_PASS: initial
DESIGN_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001-DESIGN-001
SUBJECT_BASE: 9e20a28f8cd94f749896461b392eacd263bcfccc
SUBJECT_HEAD: b05ad62aa503567f64a36f449c84c31679ba9aee
SUBJECT_PATHS: runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md
PREVIOUS_SUBJECT_HEAD: NOT_APPLICABLE
PATCH_HEAD: NOT_APPLICABLE
DESIGN_POINTER_HEAD: f8e7ed29286d7846a0d216c7745bf4e3633b00fe
REPORT_PATHS: runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/design-review-001/REVIEW_RESULT.md; runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/design-review-001/REVIEW_RESULT_POINTER.md
REQUIRED_DIFF: git diff 9e20a28f8cd94f749896461b392eacd263bcfccc..b05ad62aa503567f64a36f449c84c31679ba9aee -- runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md
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
- `advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/00_INTAKE.md`
- `advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/01_ADVISOR_BRIEF.md`
- `advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/02_DESIGNER_BRIEF.md`
- `advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/04_ADVISOR_VALIDATION.md`
- the immutable subject with
  `git show b05ad62aa503567f64a36f449c84c31679ba9aee:runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md`
- the Designer pointer and its actual commit evidence
- the prior bootstrap final audit and final pointer
- all relevant current governance templates named by the proposed implementation boundaries

## Independent review requirements

Verify directly, without using the Designer or Advisor summary as evidence:

1. The design preserves the complete Leo/GPT intent and all success criteria.
2. Five actor authorities are mutually consistent; Advisor does not design/implement, Designer does not implement,
   Worker implements only frozen design, Reviewer does not patch, and all routing returns through Advisor.
3. Designer participates in every future mission; only QUICK/STANDARD/FULL depth varies.
4. The review-required matrix cannot waive governance, canonical, behavioral, high-risk, or ambiguous designs.
5. Advisor validation and freeze gates cannot self-approve or freeze unresolved/risky design.
6. Designer revision and same-Reviewer `DESIGN_DELTA_REVIEW` are bounded to two attempts.
7. Worker design-defect handling unfreezes, revises, re-reviews when required, refreezes, and resumes without direct
   Designer/Worker coordination.
8. All four review types use unique `REVIEW_ID` result paths and separate design/implementation attempt counters.
9. Subject, pointer, review report, frozen head, implementation head, final content head, and publish head remain
   distinct and self-reference safe.
10. The migration is implementable by Worker using the exact Markdown allowlist, and the tests detect stale
    three-actor/three-session language, ownership violations, unrelated changes, and runtime/product changes.
11. Four existing fixed sessions reload only after final implementation `PASS`.
12. No material policy choice, authority conflict, unknown, infeasible requirement, path collision, or unsafe
    migration is hidden.

Review the actual Git base-to-subject diff, ancestry, origin, branch, staged/unstaged/untracked state, and exact
subject paths. The verdict applies only to `SUBJECT_HEAD` and `SUBJECT_PATHS`; the pointer and Advisor files are
context/evidence, not verdict subjects.

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`. `PASS_WITH_RISK` must enumerate every risk;
`NEEDS_PATCH` must use stable finding IDs and exact required patches. Do not edit or patch any subject or Advisor,
Designer, Worker, canonical, template, runtime, or product file.
