# VibeNews Role Index

Status: canonical entry point

## Required read order

1. [`AGENT_ROLE_PROTOCOL.md`](AGENT_ROLE_PROTOCOL.md) — authority, roles, routing, independence, precedence.
2. [`RUN_PROTOCOL.md`](RUN_PROTOCOL.md) — preflight, Unknown Gate, execution, review loop, Git, lineage, closure.
3. [`RESULT_REPORTING_PROTOCOL.md`](RESULT_REPORTING_PROTOCOL.md) — file-first evidence and pointer-only formats.
4. [`SESSION_RELOAD_PROTOCOL.md`](SESSION_RELOAD_PROTOCOL.md) — post-PASS fixed-session reload contract.

Then read the current Advisor brief and the handoff for the named actor. Historical reports and implementation logs
are evidence only.

## Role routing

| Actor | Receives from | Returns to | May approve own work |
| --- | --- | --- | --- |
| VibeNews Advisor | Leo/GPT | Leo/GPT | No |
| VibeNews Worker | Advisor | Advisor | No |
| VibeNews Reviewer | Advisor | Advisor | No |

Advisor, Worker, and Reviewer are separate existing fixed sessions with separate contexts. Worker and Reviewer do
not route to one another. Conflict or ambiguity requires `BLOCKED_DECISION_REQUIRED` and a safe stop.
