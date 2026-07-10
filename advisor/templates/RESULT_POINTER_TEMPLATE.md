# Result Pointer Template

```text
RESULT_WRITTEN
JOB_ID:
ACTOR:
RESULT_STATUS:
RESULT_FILE:
POINTER_FILE:
RESULT_COMMIT: RECORDED_AFTER_RESULT_PUSH_IN_CHAT
PUSHED:
RETURN_TO: Advisor
NEXT_ACTOR: Advisor
STOP
```

For a Reviewer, use `REVIEW_RESULT_WRITTEN`, add `REVIEW_PASS`, `VERDICT`, and `VERDICT_TARGET_HEAD`, and name the
actual post-push commit `REPORT_HEAD` in chat. Never write a containing commit SHA into the files it contains.
