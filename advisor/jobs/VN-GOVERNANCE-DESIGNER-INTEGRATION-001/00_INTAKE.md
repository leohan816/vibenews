# 00 Intake — VN-GOVERNANCE-DESIGNER-INTEGRATION-001

```text
JOB_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001
TARGET_ACTOR: VibeNews Advisor
TARGET_PROJECT: VibeNews
MISSION_TYPE: GOVERNANCE_EVOLUTION
DISCOVERY_DEPTH: HIGH
AUDIT_STRENGTH: HIGH
RUNTIME_CHANGE_ALLOWED: false
PRODUCT_CODE_CHANGE_ALLOWED: false
NEW_TMUX_SESSION_ALLOWED: false
NEW_AGENT_OR_SUBAGENT_ALLOWED: false
SELF_REVIEW_ALLOWED: false
CHAT_OUTPUT_MODE: POINTER_ONLY
RETURN_RESULT_TO: Leo/GPT
SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED_AND_NOT_REACTIVATED
```

## Leo/GPT intent

Add a permanent, independent VibeNews Designer actor to the existing Advisor/Worker/Reviewer governance. Every
future mission uses Designer; only design depth varies among `QUICK_DESIGN`, `STANDARD_DESIGN`, and `FULL_DESIGN`.
Advisor investigates, defines, routes, validates, and freezes design but does not author design. Designer converts
Leo/GPT intent into an implementable design package but does not implement. Worker implements only a frozen design.
Reviewer independently reviews design and implementation as separate passes. All results return only to Advisor,
and Advisor owns every transition and rework route.

This mission must use the existing `VibeNews-designer`, `VibeNews-advisor`, `VibeNews`, and
`VibeNews-reviewer` fixed sessions; create no tmux session, temporary agent, subagent, or substitute context.

## Resolved preflight

```text
RESOLVED_TARGET_REPO: /home/leo/Project/VibeNews
EXPECTED_ORIGIN: https://github.com/leohan816/vibenews.git
ORIGIN: https://github.com/leohan816/vibenews.git
TARGET_BRANCH: master
ADVISOR_INTAKE_BASE: b69421da59cb4b99683e8196618d1b8ab6eab040
DIRTY_STATE_BEFORE_WRITE: clean
REPO_TOPOLOGY_DECISION: SINGLE_REPO
```

Direct preflight commands included repository top-level, origin, branch, HEAD, short and porcelain status, and the
last five commits. Current canonical files, latest relevant design documents, and the prior bootstrap final audit
and pointer were opened directly; commit messages and conversation memory were not used as substitutes.

## Existing Designer session evidence

```text
SESSION_NAME: VibeNews-designer
PANE_CURRENT_PATH: /home/leo/Project/VibeNews
PANE_CURRENT_COMMAND: codex
MODEL: gpt-5.6-sol
REASONING_EFFORT: max
CONTEXT_STATE: existing permanent Codex context, awaiting actor onboarding
ONE_TIME_EXISTING_DESIGNER_CONTEXT_ONBOARDING_AUTHORIZED: true
```

No new tmux session or context is authorized or required.

## Mission design gates

```text
DESIGN_REQUIRED: true
DESIGN_DEPTH: FULL_DESIGN
DESIGN_REVIEW_REQUIRED: true
DESIGN_REVIEW_SKIP_REASON: NOT_APPLICABLE
DESIGN_REVIEW_ID: design-review-001
IMPLEMENTATION_REVIEW_ID: implementation-review-001
```

This is a governance, actor-authority, and canonical-design change, so independent design review is mandatory.
