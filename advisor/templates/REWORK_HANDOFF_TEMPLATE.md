# Rework Handoff Template

```text
JOB_ID:
TARGET_ACTOR: VibeNews Worker
REVIEW_FINDING_IDS:
PREVIOUS_SUBJECT_HEAD:
ALLOWED_PATCH_PATHS:
FORBIDDEN_PATHS:
REQUIRED_DELTA_TESTS:
PATCH_ATTEMPT: 1 | 2
RETURN_TO: Advisor
```

Open the original brief, review result, canonical protocols, and affected files. Patch only the listed findings and
paths. Write results under `runs/rework/<JOB_ID>/`; do not edit Reviewer reports. Confirm unrelated changes are none.
After the Advisor validates the patch commit, the same Reviewer must perform delta re-review.
