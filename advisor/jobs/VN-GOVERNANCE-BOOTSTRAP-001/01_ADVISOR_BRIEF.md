# 01 Advisor Brief — VN-GOVERNANCE-BOOTSTRAP-001

## Mission and success

Author only the approved VibeNews governance Markdown, commit and push an immutable authoring subject on verified
`master`, obtain an independent report-only review from the existing `VibeNews Reviewer` session, route at most two
bounded docs-only patch attempts if required, obtain final `PASS`, reload the three existing fixed sessions, validate
the full Git lineage and forbidden-path state, publish the final audit/content commit and separate final pointer-only
commit, and return only the final pointer to Leo/GPT.

Completion is forbidden until every success criterion preserved in `00_INTAKE.md` is supported by direct evidence.

## Scope

Allowed authoring paths:

```text
CLAUDE.md
AGENTS.md
docs/agent/**
docs/reports/governance/2026-07-10_governance_bootstrap.md
advisor/templates/**
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/**
```

Reviewer-exclusive paths, never Advisor-authored or Advisor-committed:

```text
runs/reviewer/VN-GOVERNANCE-BOOTSTRAP-001/REVIEW_RESULT.md
runs/reviewer/VN-GOVERNANCE-BOOTSTRAP-001/REVIEW_RESULT_POINTER.md
```

Forbidden paths include all runtime/source/package/environment/UI/assets/configuration files and every unrelated
existing document. The bootstrap must not create `02_WORKER_BRIEF.md`, `06_WORKER_HANDOFF_PROMPT.md`,
`06_WORKER_RUN_PROMPT.md`, or `runs/worker/VN-GOVERNANCE-BOOTSTRAP-001/`.

## Repository diagnosis

- Product code, design documents, and operating documents are held in one VibeNews repository.
- Root `CLAUDE.md` previously held detailed general coding guidance; root `AGENTS.md` held the Expo SDK 57 rule.
- The canonical run protocol preserves the VibeNews design-first, Expo version, and security safeguards while the
  two root files become short entries.
- Existing product documents contain historical/future implementation guidance. They remain evidence and do not
  become actor-authority sources.
- The worktree was clean at the resolved authoring base.

## Unknown Gate

```text
CONFIRMED_FACTS:
- Exact repository, origin, master branch, clean base HEAD, and SINGLE_REPO topology were directly verified.
- Leo/GPT explicitly authorized governance Markdown writes and normal commit/push to master.
- Runtime changes, branch operations, branch-protection bypass, self-review, and new contexts are forbidden.
- This execution environment currently exposes only the VibeNews Advisor context; no separate Reviewer session is
  attached to the Advisor's session-routing interface at authoring time.

ASSUMPTIONS:
- The named existing fixed Reviewer and Worker sessions exist outside this Advisor context and can be addressed by
  Leo/GPT or by an approved session-routing surface using the stored short launchers.
- A normal push to master is accepted without a protection bypass.

UNKNOWNS:
- The external fixed-session identifiers beyond the mandated names `VibeNews Reviewer` and `VibeNews Worker` are
  not visible inside this Advisor context.
- Reviewer verdict and reload results do not exist before their independent phases run.

COST_IF_WRONG:
- Treating an unavailable or substitute context as the Reviewer would invalidate independence and the mission.
- Treating a rejected protected-branch push as permission to bypass would violate explicit Git constraints.

REVERSIBILITY:
- Markdown-only commits are reviewable and reversible through a new authorized commit; history rewrite is forbidden.

REQUIRED_LEO_DECISIONS:
- None before authoring. If no approved mechanism can deliver the stored launcher to the existing Reviewer session,
  Leo/GPT must route it; the Advisor must not create a replacement session.

REQUIRED_EXTERNAL_REVIEW:
- Independent initial review and any delta re-review by the same existing VibeNews Reviewer session.
- Protocol reload by the existing Advisor, Worker, and Reviewer sessions after final PASS.

SAFE_DEFAULT:
- Do not impersonate Reviewer output, do not create a new context, do not self-review, and do not close without PASS.

REPO_TOPOLOGY_DECISION: SINGLE_REPO
```

Product high-risk items (source collection, copyright, attribution, user identity, ranking/personalization, AI-news
factuality, provider cost/retention, and medical/financial/legal content) are present in future product designs but
are not implemented or changed by this docs-only bootstrap. Future missions must reopen the Unknown Gate before a
Worker handoff.
