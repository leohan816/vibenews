# Session Reload Instructions — VN-GOVERNANCE-DESIGNER-INTEGRATION-001

```text
JOB_ID: VN-GOVERNANCE-DESIGNER-INTEGRATION-001
RELOAD_REASON: Permanent Designer governance passed final IMPLEMENTATION_REVIEW.
SUBJECT_HEAD: 00074e3828bfe7d8fc967f1d5c012dbc1542e2c5
IMPLEMENTATION_REVIEW_ID: implementation-review-001
IMPLEMENTATION_REVIEW_REPORT_HEAD: 531ab045bb110f6eb1b48b638c99bfa9f2d924eb
REVIEWER_VERDICT: PASS
WRITE_ALLOWED: false
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

Perform only the named actor's protocol reload in its existing fixed session. Verify the exact workspace, repo,
origin, `master` branch, subject object, review report object, and that the working tree has no staged, unstaged, or
untracked file. Do not write, stage, commit, push, switch/create a branch, launch another actor, or broaden scope.

Open and read all of these files directly from the current working tree, which must match the Reviewer-passed subject
for every canonical path:

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

Then return only this complete block to Advisor and STOP:

```text
ROLE_PROTOCOL_RELOADED
ACTOR:
ACTOR_ID:
SESSION_NAME:
WORKSPACE:
FILES_READ:
ENTRY_FILES_READ:
CANONICAL_FILES_READ:
DESIGN_PROTOCOL_READ:
ROLE_SUMMARY:
DESIGN_GATE_SUMMARY:
FORBIDDEN_SUMMARY:
READINESS_MARKER: READY_UNDER_FIVE_ACTOR_PROTOCOL
SUBJECT_HEAD: 00074e3828bfe7d8fc967f1d5c012dbc1542e2c5
RETURN_TO: Advisor
STOP_AFTER_RETURN: true
```

Actor-specific requirements:

- Advisor: preserve intent, investigate and route; select depth, validate, freeze/unfreeze, audit; never design,
  implement, patch actor-owned content, self-review, or accept material risk without Leo/GPT.
- Designer: participate in every mission at QUICK/STANDARD/FULL depth; design only; expose material decisions; own
  design results/revisions; never implement, review, freeze, route, or return outside Advisor.
- Worker: implement only the exact Advisor-frozen design and allowlist; return design defects to Advisor; never edit
  design/Reviewer/Advisor paths, self-approve, or route outside Advisor.
- Reviewer: independently review immutable design or implementation subjects in distinct unique `REVIEW_ID` paths;
  never patch, implement, freeze, or route outside Advisor.
