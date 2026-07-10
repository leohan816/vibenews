# VibeNews Agent Role Protocol

Status: canonical

## 1. Permanent command and return chain

```text
Leo/GPT
-> VibeNews Advisor
-> VibeNews Worker or VibeNews Reviewer
-> VibeNews Advisor
-> Leo/GPT
```

- Leo/GPT sends VibeNews mission instructions only to the Advisor.
- GPT does not directly task a Worker or Reviewer.
- The Advisor writes separate Worker and Reviewer briefs and launchers.
- Worker and Reviewer return only to the Advisor, never directly to Leo/GPT.
- Worker and Reviewer do not negotiate scope, patches, or verdicts with each other.
- The Advisor owns every transition between implementation, review, patch, re-review, validation, and closure.

## 2. Session and review separation

- Advisor, Worker, and Reviewer use three different existing fixed sessions and separate contexts.
- Authoring and review never share a session or context.
- A mission may not create a replacement reviewer, temporary context, or subagent unless Leo/GPT explicitly
  authorizes that exact action.
- No actor approves its own work. Reviewer independence is mandatory.
- The same Reviewer performs delta re-review after a patch.

## 3. Advisor authority and duties

The Advisor preserves Leo/GPT's exact instruction and success criteria, reads the actual repository and relevant
documents, separates facts from assumptions and unknowns, writes bounded handoffs, routes independent review,
validates the actual diff/tests/build/commits/origin, and reports completion only after the original mission is
fully satisfied.

The Advisor normally does not implement product code, UI, runtime behavior, tests, or general features. The
one-time exception for `VN-GOVERNANCE-BOOTSTRAP-001` permits the Advisor to author and, only after a Reviewer
finding, patch the approved governance Markdown set. The exception expires at mission closure and must be recorded
as:

```text
SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED
```

## 4. Worker authority

The Worker implements only the current Advisor brief. It may not broaden scope, revise the mission, approve its
own result, route directly to Leo/GPT, edit Reviewer-owned files, or perform actions that the brief forbids. It
writes and commits only its declared result and pointer paths plus the explicitly authorized implementation paths.

## 5. Reviewer authority and exclusive scope

The Reviewer independently reads the subject files and Git evidence. Author summaries, result reports, and commit
messages are not substitutes for direct inspection. The Reviewer must not modify subject files or implement a
patch.

Reviewer-exclusive paths are:

```text
runs/reviewer/<JOB_ID>/REVIEW_RESULT.md
runs/reviewer/<JOB_ID>/REVIEW_RESULT_POINTER.md
```

Only the Reviewer session authors, stages, commits, and pushes those files. The report commit must be report-only.
The Advisor must never create, edit, commit, amend, or impersonate a Reviewer result.

## 6. Instruction precedence

```text
1. The current explicit mission decision from Leo/GPT
2. docs/agent/AGENT_ROLE_PROTOCOL.md
3. The current Advisor brief and current actor handoff
4. Repository-local CLAUDE.md and scope-local AGENTS.md
5. Historical implementation logs, reports, and documents
```

Historical material is evidence, not current authority. A lower-precedence instruction may narrow safe behavior but
cannot expand actor permissions. If a conflict or ambiguity remains, record the files and exact conflicting text,
return `BLOCKED_DECISION_REQUIRED`, and stop without guessing.

## 7. Completion integrity

Partial, inferred, temporary, substituted, or unreviewed results are never `MISSION_COMPLETE`. Only the Advisor may
return the mission result to Leo/GPT, and only after independently validating all required evidence.
