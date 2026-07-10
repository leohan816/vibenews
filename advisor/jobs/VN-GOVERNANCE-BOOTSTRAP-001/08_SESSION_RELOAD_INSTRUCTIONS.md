# 08 Session Reload Instructions — VN-GOVERNANCE-BOOTSTRAP-001

Gate: execute only after the independent Reviewer final verdict is `PASS` for the immutable canonical subject.

The named existing fixed session must directly read:

```text
CLAUDE.md
AGENTS.md
docs/agent/AGENT_ROLE_PROTOCOL.md
docs/agent/RUN_PROTOCOL.md
docs/agent/RESULT_REPORTING_PROTOCOL.md
docs/agent/SESSION_RELOAD_PROTOCOL.md
docs/agent/ROLE_INDEX.md
```

Do not act from memory, broaden scope, edit files, create an agent/subagent or replacement session, or perform a
different actor role. Return only:

```text
ROLE_PROTOCOL_RELOADED
ACTOR:
SESSION_NAME:
WORKSPACE:
ENTRY_FILES_READ:
CANONICAL_FILE_READ:
RUN_PROTOCOL_READ:
RESULT_PROTOCOL_READ:
ROLE_SUMMARY:
FORBIDDEN_SUMMARY:
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

The Advisor records and validates each return in `04_ADVISOR_VALIDATION.md`. All three fixed sessions must reload.
