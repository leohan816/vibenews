# Worker Short Launcher Template

```text
TARGET_ACTOR: VibeNews Worker
TARGET_PROJECT: VibeNews
TARGET_REPO: <RESOLVED_EXACT_REPO_PATH>
TARGET_BRANCH: <EXACT_BRANCH>
TARGET_SESSION_NAME: <EXISTING_EXACT_WORKER_SESSION_NAME>
REQUIRED_SKILL: <EXACT_SKILL_OR_NOT_APPLICABLE>
READ_AND_EXECUTE: <JOB_WORKER_HANDOFF_PATH>
RETURN_RESULT_TO: Advisor
DO_NOT_EXECUTE_FROM_MEMORY: true
DO_NOT_BROADEN_SCOPE: true
NO_NEW_AGENT_OR_SUBAGENT: true

Open READ_AND_EXECUTE directly. Read every referenced real file. Perform only the VibeNews Worker role. Write the
declared result and pointer files. Return only the concise pointer block to Advisor and STOP.
```
