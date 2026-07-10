# VibeNews Result Reporting Protocol

Status: canonical

## 1. Global reporting rules

```text
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
FULL_RESULT_IN_CHAT: forbidden
MAX_CHAT_OUTPUT_LINES: 15
```

Every actor directly reads all new and changed Markdown in its scope. Memory and chat summaries are not evidence.
Full evidence lives in the result file; chat contains only status and exact paths. The result and pointer must both
exist before return.

## 2. Paths

```text
Worker:   runs/worker/<JOB_ID>/WORKER_RESULT.md
          runs/worker/<JOB_ID>/WORKER_RESULT_POINTER.md
Reviewer: runs/reviewer/<JOB_ID>/REVIEW_RESULT.md
          runs/reviewer/<JOB_ID>/REVIEW_RESULT_POINTER.md
Rework:   runs/rework/<JOB_ID>/REWORK_RESULT.md
          runs/rework/<JOB_ID>/REWORK_RESULT_POINTER.md
Advisor:  advisor/jobs/<JOB_ID>/05_FINAL_AUDIT.md
          advisor/jobs/<JOB_ID>/11_FINAL_POINTER.md
```

## 3. Worker result

```text
WORK_RESULT
JOB_ID:
ACTOR:
REPO:
WORKSPACE:
BRANCH:
BASE_COMMIT:
RESULT_HEAD:
RESULT_STATUS:
CHANGED_FILES:
FORBIDDEN_FILES_UNTOUCHED:
COMMANDS_EXECUTED:
TEST_RESULTS:
BUILD_RESULTS:
STAGED_FILES:
UNSTAGED_FILES:
UNTRACKED_FILES:
RUNTIME_ACCESS:
DB_ACCESS:
SECRET_ACCESS:
PROD_ACCESS:
KNOWN_LIMITATIONS:
RESIDUAL_RISKS:
RESULT_PATH:
POINTER_PATH:
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

Worker chat:

```text
RESULT_WRITTEN
JOB_ID:
ACTOR: VibeNews Worker
RESULT_STATUS:
RESULT_FILE:
POINTER_FILE:
RESULT_COMMIT:
PUSHED:
RETURN_TO: Advisor
NEXT_ACTOR: Advisor
STOP
```

When the result files are inside the result commit, their internal `RESULT_HEAD` uses
`RECORDED_AFTER_RESULT_PUSH_IN_CHAT`.

## 4. Reviewer result

```text
REVIEW_RESULT
JOB_ID:
ACTOR: VibeNews Reviewer
REVIEW_PASS:
SUBJECT_BASE:
VERDICT_TARGET_HEAD:
VERDICT_TARGET_PATHS:
REPORT_PATHS:
REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT
FILES_READ:
DIFF_READ:
COMMANDS_EXECUTED:
VERDICT:
BLOCKING_FINDINGS:
NON_BLOCKING_FINDINGS:
AUTHORITY_CONFLICTS:
RUNTIME_CHANGE_CHECK:
DIRTY_FILE_CHECK:
RELOAD_READINESS:
REQUIRED_PATCHES:
RESIDUAL_RISKS:
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

Reviewer chat:

```text
REVIEW_RESULT_WRITTEN
JOB_ID:
ACTOR: VibeNews Reviewer
REVIEW_PASS:
VERDICT:
VERDICT_TARGET_HEAD:
RESULT_FILE:
POINTER_FILE:
REPORT_HEAD:
PUSHED:
RETURN_TO: Advisor
NEXT_ACTOR: Advisor
STOP
```

Valid verdicts are `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, and `FAIL`.

## 5. Rework result

Rework uses the Worker evidence fields, changes the heading to `REWORK_RESULT`, and records the original finding IDs,
previous subject head, new subject head sentinel, exact changed paths, and confirmation that unrelated changes are
absent. It returns only to Advisor and stops.

## 6. Advisor final chat

```text
MISSION_RESULT
MISSION:
VERDICT:
FINAL_AUDIT:
FINAL_POINTER:
FINAL_CONTENT_HEAD:
POINTER_PUBLISH_HEAD:
PUSHED:
DECISION_REQUIRED:
SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED
NEXT_ACTOR: Leo/GPT
STOP
```
