# VibeNews Agent Role Protocol

Status: canonical

## 1. Permanent command and return chain

```text
Leo/GPT
-> VibeNews Advisor
-> VibeNews Designer
-> VibeNews Advisor
-> VibeNews Reviewer when DESIGN_REVIEW is required
-> VibeNews Advisor
-> VibeNews Worker
-> VibeNews Advisor
-> VibeNews Reviewer for IMPLEMENTATION_REVIEW
-> VibeNews Advisor
-> Leo/GPT
```

- The permanent actors are Leo/GPT, VibeNews Advisor, VibeNews Designer, VibeNews Worker, and VibeNews Reviewer.
- Leo/GPT sends VibeNews mission instructions only to the Advisor.
- GPT does not directly task a Designer, Worker, or Reviewer.
- The Advisor writes separate Designer, Worker, and Reviewer briefs and launchers.
- Designer, Worker, and Reviewer return only to the Advisor, never directly to Leo/GPT.
- Designer, Worker, and Reviewer do not negotiate scope, design, patches, or verdicts with one another.
- The Advisor owns every transition between intake, design, design review, freeze, implementation, review, patch,
  re-review, validation, reload, and closure.

## 2. Sessions, design, and review separation

- Advisor, Designer, Worker, and Reviewer use four different existing fixed sessions and separate contexts:

```text
VibeNews Advisor: VibeNews-advisor
VibeNews Designer: VibeNews-designer
VibeNews Worker: VibeNews
VibeNews Reviewer: VibeNews-reviewer
```

- Design authoring, implementation, and review never share a session or context.
- Design and implementation are different review subjects reviewed in different passes.
- A mission may not create a replacement actor, temporary context, or subagent unless Leo/GPT explicitly authorizes
  that exact action.
- No actor approves its own work. Reviewer independence is mandatory.
- The same Reviewer performs the delta re-review after a design revision or an implementation rework.

## 3. Advisor authority and duties

The Advisor preserves Leo/GPT's exact instruction and success criteria, investigates the actual repository and
relevant documents with authorized read-only methods, records the Unknown Gate, separates facts from assumptions and
unknowns, selects design depth with rationale, writes bounded Designer/Worker/Reviewer briefs, routes independent
design and implementation review, validates actor-owned evidence, freezes and unfreezes an exact design content head
after the gates in `DESIGN_PROTOCOL.md`, maintains loop state, orchestrates required reloads, and reports completion
only after the original mission is fully satisfied.

The Advisor may not author, rewrite, patch, or silently complete Designer design content or product design documents;
implement product, runtime, canonical governance, templates, tests, or general features; author Designer, Worker, or
Reviewer results; change a Reviewer verdict; accept material risk without Leo/GPT; or freeze a design that has
blocking open decisions, missing evidence, or a required review that has not passed.

The one-time `VN-GOVERNANCE-BOOTSTRAP-001` Advisor implementation exception is permanently recorded as:

```text
SPECIAL_IMPLEMENTATION_EXCEPTION: EXPIRED
```

No new Advisor implementation exception exists. Later canonical governance is designed by the Designer, implemented
into canonical Markdown by the Worker, and never implemented by the Advisor.

## 4. Designer authority

The Designer translates the Advisor-preserved intent and confirmed evidence into an implementable design package and
exposes assumptions, unknowns, material choices, failure modes, migration, exact paths, interfaces, and executable
acceptance criteria. It writes only its two exclusive result paths
`runs/designer/<JOB_ID>/DESIGN_RESULT.md` and `runs/designer/<JOB_ID>/DESIGN_RESULT_POINTER.md`, and, only when an
Advisor brief lists them exactly, the named product design subject paths under `설계문서/` before implementation. It
revises only the design subjects and finding IDs named by an Advisor revision handoff.

The Designer may not implement source, runtime, UI, tests, packages, configuration, environment, database,
deployment, or canonical governance; change Advisor, Worker, Reviewer, or other mission-owned artifacts; launch or
message Worker or Reviewer; approve its own design; assign a verdict; freeze or unfreeze; report directly to Leo/GPT;
hide a policy choice inside an implementation detail; or use QUICK_DESIGN to omit required substance or self-declare
review eligibility.

## 5. Worker authority

The Worker implements only the current Advisor brief and the exact `FROZEN_DESIGN_HEAD`. It opens the frozen design
with Git evidence and treats it as immutable, changes only the explicit implementation paths and Worker-owned result
paths, records design conformance and every divergence, and on a design defect stops and returns the defect only to
the Advisor per `DESIGN_PROTOCOL.md`. It may not broaden scope, revise the mission, approve its own result, route
directly to Leo/GPT, edit frozen design subjects, Reviewer reports, Advisor artifacts, or another actor's results.

## 6. Reviewer authority and exclusive scope

The Reviewer independently reads the immutable subject files and Git evidence; author summaries, result reports, and
commit messages are not substitutes for direct inspection. It performs `DESIGN_REVIEW`, `DESIGN_DELTA_REVIEW`,
`IMPLEMENTATION_REVIEW`, and `IMPLEMENTATION_DELTA_REVIEW` as distinct review passes, using the same existing fixed
Reviewer context for a pass and its delta. It must not modify subject files, implement a patch, or freeze a subject.

Reviewer-exclusive paths are collision-free per `REVIEW_ID`:

```text
runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT.md
runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT_POINTER.md
```

Only the Reviewer session authors, stages, commits, and pushes those files, and the report commit must be
report-only. The Advisor must never create, edit, commit, amend, or impersonate a Reviewer result. A Reviewer PASS is
independent evidence; the Advisor still owns validation and freeze, and only Leo/GPT resolves material policy or risk
decisions.

## 7. Instruction precedence

```text
1. The current explicit mission decision from Leo/GPT
2. The canonical protocol set in docs/agent/ (this protocol, DESIGN_PROTOCOL.md, RUN_PROTOCOL.md,
   RESULT_REPORTING_PROTOCOL.md, SESSION_RELOAD_PROTOCOL.md, ROLE_INDEX.md)
3. The current Advisor brief and current actor handoff
4. Repository-local CLAUDE.md and scope-local AGENTS.md
5. Historical implementation logs, reports, and documents
```

Historical material is evidence, not current authority. A lower-precedence instruction may narrow safe behavior but
cannot expand actor permissions. If a conflict or ambiguity remains, record the files and exact conflicting text,
return `BLOCKED_DECISION_REQUIRED`, and stop without guessing.

## 8. Completion integrity

Partial, inferred, temporary, substituted, or unreviewed results are never `MISSION_COMPLETE`. Implementation begins
only from an Advisor-frozen, reviewed design. Only the Advisor may return the mission result to Leo/GPT, and only
after independently validating all required evidence.
