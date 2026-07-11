# Rework Handoff Template

```text
JOB_ID:
TARGET_ACTOR: VibeNews Worker
TARGET_SESSION_NAME: VibeNews
DESIGN_ID:
FROZEN_DESIGN_HEAD:
REVIEW_FINDING_IDS:
PREVIOUS_SUBJECT_HEAD:
ALLOWED_PATCH_PATHS:
FORBIDDEN_PATHS:
REQUIRED_DELTA_TESTS:
IMPLEMENTATION_REWORK_ATTEMPT: 1 | 2
IMPLEMENTATION_DELTA_REVIEW_ID:
RETURN_TO: Advisor
```

This is a Worker-owned implementation rework with its own counter, separate from the design-revision counter. Open
the original Worker brief, the implementation review result, the canonical protocols including `DESIGN_PROTOCOL.md`,
the frozen design at `FROZEN_DESIGN_HEAD`, and the affected files directly. Patch only the listed findings and paths,
never editing frozen design or Reviewer reports. Write results under `runs/rework/<JOB_ID>/` and confirm unrelated
changes are none. At most two automatic reworks are allowed. After the Advisor validates the patch commit, the same
Reviewer performs `IMPLEMENTATION_DELTA_REVIEW` under the unique `IMPLEMENTATION_DELTA_REVIEW_ID`.
