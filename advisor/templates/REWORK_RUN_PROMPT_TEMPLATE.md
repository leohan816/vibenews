# Rework Short Launcher Template

```text
TARGET_ACTOR: VibeNews Worker
TARGET_PROJECT: VibeNews
TARGET_REPO: <RESOLVED_EXACT_REPO_PATH>
TARGET_BRANCH: <EXACT_BRANCH>
TARGET_SESSION_NAME: <EXISTING_EXACT_WORKER_SESSION_NAME>
REQUIRED_SKILL: <EXACT_SKILL_OR_NOT_APPLICABLE>
READ_AND_EXECUTE: <JOB_REWORK_HANDOFF_PATH>
FROZEN_DESIGN_HEAD: <IMMUTABLE_FROZEN_DESIGN_HEAD>
PREVIOUS_SUBJECT_HEAD: <IMMUTABLE_PREVIOUS_SUBJECT_HEAD>
IMPLEMENTATION_REWORK_ATTEMPT: 1 | 2
RETURN_RESULT_TO: Advisor
DO_NOT_EXECUTE_FROM_MEMORY: true
DO_NOT_BROADEN_SCOPE: true
NO_NEW_AGENT_OR_SUBAGENT: true

Open READ_AND_EXECUTE directly. Read every referenced real file and the immutable frozen design and previous subject.
Perform only the bounded VibeNews Worker implementation rework for the named finding IDs. Write the declared rework
result and pointer files. Return only the concise pointer block to Advisor and STOP.
```
