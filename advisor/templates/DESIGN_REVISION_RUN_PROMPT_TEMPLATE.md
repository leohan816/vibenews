# Design Revision Short Launcher Template

```text
TARGET_ACTOR: VibeNews Designer
TARGET_PROJECT: VibeNews
TARGET_REPO: <RESOLVED_EXACT_REPO_PATH>
TARGET_BRANCH: <EXACT_BRANCH>
TARGET_SESSION_NAME: <EXISTING_EXACT_DESIGNER_SESSION_NAME>
REQUIRED_SKILL: <EXACT_SKILL_OR_NOT_APPLICABLE>
READ_AND_EXECUTE: <JOB_DESIGN_REVISION_HANDOFF_PATH>
REVISION_ID: <REVISION_ID>
ATTEMPT: 1 | 2
PREVIOUS_DESIGN_CONTENT_HEAD: <IMMUTABLE_PREVIOUS_DESIGN_HEAD>
RETURN_RESULT_TO: Advisor
DO_NOT_EXECUTE_FROM_MEMORY: true
DO_NOT_BROADEN_SCOPE: true
NO_NEW_AGENT_OR_SUBAGENT: true

Open READ_AND_EXECUTE directly. Read every referenced real file and the immutable previous design head. Perform only
the bounded VibeNews Designer revision for the named finding IDs. Author revised design content, then the pointer.
Return only the concise Designer pointer block to Advisor and STOP.
```
