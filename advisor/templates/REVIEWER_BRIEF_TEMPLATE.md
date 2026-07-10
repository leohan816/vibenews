# Reviewer Brief Template

```text
JOB_ID:
MISSION:
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO:
TARGET_BRANCH:
SUBJECT_BASE:
SUBJECT_HEAD:
SUBJECT_PATHS:
REPORT_PATHS:
REVIEW_PASS: initial | delta
PREVIOUS_SUBJECT_HEAD:
PATCH_HEAD:
REQUIRED_DIRECT_READS:
REQUIRED_DIFF:
SUCCESS_CRITERIA:
FORBIDDEN_REVIEW_ACTIONS:
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

The Reviewer uses repository evidence, not author summaries or commit messages. For delta review, verify ancestry and
read the exact path-filtered diff between the previous and new subject heads.
