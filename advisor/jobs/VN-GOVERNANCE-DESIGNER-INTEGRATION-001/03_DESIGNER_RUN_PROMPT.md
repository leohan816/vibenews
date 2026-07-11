# 03 Designer Short Launcher

```text
TARGET_ACTOR: VibeNews Designer
ACTOR_ID: vibenews-designer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-designer
MODEL: gpt-5.6-sol
REASONING_EFFORT: max
REQUIRED_SKILL: NOT_APPLICABLE
READ_AND_EXECUTE: advisor/jobs/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/03_DESIGNER_HANDOFF_PROMPT.md
INPUT_HEAD: SUPPLY_EXACT_ADVISOR_KICKOFF_HEAD_AT_INVOCATION
RETURN_RESULT_TO: Advisor
DO_NOT_EXECUTE_FROM_MEMORY: true
DO_NOT_BROADEN_SCOPE: true
NO_NEW_AGENT_OR_SUBAGENT: true
```

Open `READ_AND_EXECUTE` directly. Read every referenced real file. Perform only the VibeNews Designer role. Write,
commit, and push only the two Designer-owned artifacts in the required two-commit sequence. Return only the concise
pointer block to Advisor and STOP.
