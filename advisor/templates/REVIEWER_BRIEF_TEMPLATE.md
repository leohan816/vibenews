# Reviewer Brief Template

```text
JOB_ID:
MISSION:
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO:
TARGET_BRANCH:
TARGET_SESSION_NAME: VibeNews-reviewer
REVIEW_TYPE: DESIGN_REVIEW | DESIGN_DELTA_REVIEW | IMPLEMENTATION_REVIEW | IMPLEMENTATION_DELTA_REVIEW
REVIEW_ID:
REVIEW_PASS: initial | delta
DESIGN_ID:
FROZEN_DESIGN_HEAD:
SUBJECT_BASE:
SUBJECT_HEAD:
SUBJECT_PATHS:
DESIGN_SUBJECT_PATHS:
PREVIOUS_SUBJECT_HEAD:
FINDING_IDS_IN_SCOPE:
EXPECTED_INTERLEAVED_EVIDENCE_PATHS:
DESIGN_CONFORMANCE_CHECK:
REPORT_PATHS:
REQUIRED_DIRECT_READS:
REQUIRED_DIFF:
SUCCESS_CRITERIA:
FORBIDDEN_REVIEW_ACTIONS:
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

`REVIEW_ID` is unique within `JOB_ID` and its report paths are `runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT.md`
and `REVIEW_RESULT_POINTER.md`. The Reviewer uses repository evidence, not author summaries or commit messages. A
design pass checks the immutable design content head; an implementation pass checks the implementation against
`FROZEN_DESIGN_HEAD` and confirms the Worker did not change design subjects. For a delta pass, verify ancestry and
read the exact path-filtered diff between the previous and new subject heads. `DESIGN_CONFORMANCE_CHECK` is
`NOT_APPLICABLE` for design passes.
