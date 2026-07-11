# VibeNews Role Index

Status: canonical entry point

## Required read order

1. [`AGENT_ROLE_PROTOCOL.md`](AGENT_ROLE_PROTOCOL.md) — five actors, four fixed sessions, authority, routing,
   independence, precedence, expired exception.
2. [`DESIGN_PROTOCOL.md`](DESIGN_PROTOCOL.md) — mandatory Designer, design depth, design review matrix and skip,
   Advisor validation and freeze, revision and delta review, immutable design state, implementation-time design
   defects, identifiers, interfaces, ownership, and traceability.
3. [`RUN_PROTOCOL.md`](RUN_PROTOCOL.md) — preflight, Unknown Gate, design-first sequence, separate design and
   implementation loops, freeze/defect flow, Git, lineage, launchers, product design ownership, finalization.
4. [`RESULT_REPORTING_PROTOCOL.md`](RESULT_REPORTING_PROTOCOL.md) — file-first evidence, Designer/Reviewer/Worker
   schemas, `REVIEW_TYPE`/`REVIEW_ID` paths, frozen-design fields, and pointer-only formats.
5. [`SESSION_RELOAD_PROTOCOL.md`](SESSION_RELOAD_PROTOCOL.md) — four fixed sessions and the post-PASS reload contract.

Then read the current Advisor brief and the handoff for the named actor. Historical reports and implementation logs
are evidence only.

## Role routing

| Actor | Receives from | Returns to | May approve own work |
| --- | --- | --- | --- |
| VibeNews Advisor | Leo/GPT | Leo/GPT | No |
| VibeNews Designer | Advisor | Advisor | No |
| VibeNews Worker | Advisor | Advisor | No |
| VibeNews Reviewer | Advisor | Advisor | No |

The permanent actors are Leo/GPT, VibeNews Advisor, VibeNews Designer, VibeNews Worker, and VibeNews Reviewer. They
run in four separate existing fixed sessions with separate contexts:

```text
VibeNews Advisor: VibeNews-advisor
VibeNews Designer: VibeNews-designer
VibeNews Worker: VibeNews
VibeNews Reviewer: VibeNews-reviewer
```

Designer, Worker, and Reviewer never route to one another; every transition is mediated by the Advisor, and no
non-Advisor actor returns directly to Leo/GPT. Conflict or ambiguity requires `BLOCKED_DECISION_REQUIRED` and a safe
stop.
