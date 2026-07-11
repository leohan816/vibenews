# VibeNews Session Reload Protocol

Status: canonical

## 1. Gate and required sessions

Do not reload sessions before the Reviewer issues final `IMPLEMENTATION_REVIEW` `PASS` against the canonical
implementation subject. After that PASS, the Advisor sends a short launcher to each existing fixed session:

```text
VibeNews Advisor: VibeNews-advisor
VibeNews Designer: VibeNews-designer
VibeNews Worker: VibeNews
VibeNews Reviewer: VibeNews-reviewer
```

Creating a substitute session or reusing an authoring context for another actor's reload does not count.

## 2. Required direct reads

Each session opens and reads:

```text
CLAUDE.md
AGENTS.md
docs/agent/ROLE_INDEX.md
docs/agent/AGENT_ROLE_PROTOCOL.md
docs/agent/DESIGN_PROTOCOL.md
docs/agent/RUN_PROTOCOL.md
docs/agent/RESULT_REPORTING_PROTOCOL.md
docs/agent/SESSION_RELOAD_PROTOCOL.md
```

The launcher points to the actor-specific reload run prompt. The session acts only as the named actor, does not use
memory as a substitute, does not broaden scope, creates no agent/subagent, returns only to Advisor, and stops.

## 3. Reload return

```text
ROLE_PROTOCOL_RELOADED
ACTOR:
ACTOR_ID:
SESSION_NAME:
WORKSPACE:
ENTRY_FILES_READ:
CANONICAL_FILES_READ:
DESIGN_PROTOCOL_READ:
ROLE_SUMMARY:
DESIGN_GATE_SUMMARY:
FORBIDDEN_SUMMARY:
SUBJECT_HEAD:
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

The Designer reload additionally confirms mandatory all-depth participation, design-only authority, exclusive result
paths, material-decision exposure, no implementation/review/freeze, Advisor-only return, and revision obligations.

The Advisor validates all four returns and records their exact session names and evidence in the job validation
artifact. Missing, partial, pre-PASS, self-reported-from-another-session, or substitute-context reloads do not count.
All four must complete before a canonical-governance mission closes.
