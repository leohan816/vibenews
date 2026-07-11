# Result Pointer Template

Worker pointer (separate pointer-only commit after the content commit is pushed):

```text
RESULT_WRITTEN
JOB_ID:
ACTOR: VibeNews Worker
RESULT_STATUS:
RESULT_FILE:
POINTER_FILE:
WORKER_CONTENT_HEAD:
WORKER_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT
PUSHED:
RETURN_TO: Advisor
NEXT_ACTOR: Advisor
STOP
```

Designer pointer uses `DESIGN_RESULT_WRITTEN` with `DESIGN_ID`, `DESIGN_VERSION`, `DESIGN_STATUS`, the actual
`DESIGN_CONTENT_HEAD`, and `DESIGN_POINTER_HEAD: RECORDED_AFTER_POINTER_PUSH_IN_CHAT`.

Reviewer pointer uses `REVIEW_RESULT_WRITTEN` with `REVIEW_TYPE`, `REVIEW_ID`, `REVIEW_PASS`, `VERDICT`,
`VERDICT_TARGET_HEAD`, and the actual post-push commit named `REPORT_HEAD` in chat.

Never write a containing commit SHA into the files it contains. Record the actual containing head only after push,
using `RECORDED_AFTER_RESULT_PUSH_IN_POINTER`, `RECORDED_AFTER_POINTER_PUSH_IN_CHAT`, or
`RECORDED_AFTER_REPORT_PUSH_IN_CHAT` as the sentinel. Chat stays pointer-only.
