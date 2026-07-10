# VibeNews Session Reload Protocol

Status: canonical

## 1. Gate and required sessions

Do not reload sessions before the Reviewer issues final `PASS`. After `PASS`, the Advisor sends a short launcher to
each existing fixed session:

```text
VibeNews Advisor
VibeNews Worker
VibeNews Reviewer
```

Creating a substitute session or reusing the authoring context for review does not count.

## 2. Required direct reads

Each session opens and reads:

```text
CLAUDE.md
AGENTS.md
docs/agent/AGENT_ROLE_PROTOCOL.md
docs/agent/RUN_PROTOCOL.md
docs/agent/RESULT_REPORTING_PROTOCOL.md
docs/agent/SESSION_RELOAD_PROTOCOL.md
docs/agent/ROLE_INDEX.md
```

The launcher points to the actor-specific `08_*_RELOAD_RUN_PROMPT.md`. The session acts only as the named actor,
does not use memory as a substitute, does not broaden scope, creates no agent/subagent, returns only to Advisor,
and stops.

## 3. Reload return

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

The Advisor validates all three returns and records their exact session names and evidence in
`04_ADVISOR_VALIDATION.md`. Missing, partial, self-reported-from-another-session, or pre-PASS reloads do not count.
All three must complete before bootstrap closure.
