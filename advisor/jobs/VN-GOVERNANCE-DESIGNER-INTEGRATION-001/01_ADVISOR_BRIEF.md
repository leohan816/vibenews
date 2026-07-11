# 01 Advisor Brief — VN-GOVERNANCE-DESIGNER-INTEGRATION-001

## Mission success

Use normal role separation to obtain a Designer-owned design package, independent `DESIGN_REVIEW`, Worker-owned
governance Markdown implementation from the frozen design, independent `IMPLEMENTATION_REVIEW`, any bounded same-
Reviewer delta loops, four fixed-session reloads, and Advisor final audit. Completion requires all required commits
on origin, final Reviewer `PASS`, zero runtime/product-code change, and no unresolved blocker.

Advisor may write only Advisor-owned intake, briefs, handoffs, validation, loop, audit, index, and final pointer
artifacts. Advisor may not author Designer results, canonical governance implementation, Worker results, Reviewer
results, or actor-owned patches.

## Unknown register

```text
CONFIRMED_FACTS:
- Repo, origin, master branch, clean base, and SINGLE_REPO topology are directly verified.
- Existing Designer fixed session is present at the exact workspace with gpt-5.6-sol and max effort.
- Current canonical governance contains Advisor, Worker, Reviewer but no Designer actor.
- The prior bootstrap implementation exception is EXPIRED and remains expired.
- Leo/GPT explicitly requires Designer on every future mission and separate design/implementation review semantics.

ASSUMPTIONS:
- `VibeNews` is the existing Worker fixed session, `VibeNews-reviewer` the existing Reviewer fixed session, and the
  current Advisor context corresponds to the permanent Advisor role; exact session state will be rechecked before use.
- The design package includes an explicit `MIGRATION_FROM_CURRENT_GOVERNANCE` section because migration safety is
  required by the mission flow and success criteria; no additional product policy is inferred.

UNKNOWNS:
- Exact canonical file split for Designer-specific protocol is intentionally delegated to Designer and then reviewed.
- Exact implementation path set is not fixed until Designer design is validated and passes DESIGN_REVIEW.

OPEN_DECISIONS:
- None requiring Leo/GPT before design. Designer must expose any policy choice that would change actor authority,
  review skipping, freeze semantics, ownership, or migration behavior instead of deciding it silently.

COST_IF_WRONG:
- Weak role separation could let Advisor or Worker bypass design, permit self-approval, overwrite review evidence,
  or create an unfrozen implementation target.
- Incorrect migration could conflict with current canonical authority and invalidate future missions.

REVERSIBILITY:
- Governance Markdown commits are reversible by a later authorized commit; history rewrite remains forbidden.

REQUIRED_LEO_DECISIONS:
- None now. Any Designer `OPEN_DECISIONS` that materially changes the explicit Leo/GPT policy stops the mission.

REQUIRED_EXTERNAL_REVIEW:
- DESIGN_REVIEW by the existing Reviewer is mandatory.
- IMPLEMENTATION_REVIEW by the same fixed Reviewer is mandatory.
- Design and implementation delta review use that same Reviewer when triggered.

SAFE_DEFAULT:
- No Worker handoff before frozen design PASS; no canonical write by Advisor; no inferred policy expansion; stop on
  unresolved authority, ownership, or migration conflict.

REPO_TOPOLOGY_DECISION: SINGLE_REPO
```

## Exclusive ownership

```text
Designer only:
- runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT.md
- runs/designer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/DESIGN_RESULT_POINTER.md

Reviewer only, by REVIEW_ID:
- runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/<REVIEW_ID>/REVIEW_RESULT.md
- runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/<REVIEW_ID>/REVIEW_RESULT_POINTER.md

Worker only:
- runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT.md
- runs/worker/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/WORKER_RESULT_POINTER.md
```

Advisor reads and audits these paths but never writes, stages, commits, amends, or impersonates them.
