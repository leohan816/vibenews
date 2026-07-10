# 03 Reviewer Brief — VN-GOVERNANCE-BOOTSTRAP-001

```text
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
SUBJECT_BASE: 4e47b3f21ca4f41a6da5e835fc2beaf792dc9583
SUBJECT_HEAD: EXACT_SHA_SUPPLIED_IN_SHORT_LAUNCHER_AFTER_AUTHORING_PUSH
REVIEW_PASS: initial
REPORT_PATHS:
- runs/reviewer/VN-GOVERNANCE-BOOTSTRAP-001/REVIEW_RESULT.md
- runs/reviewer/VN-GOVERNANCE-BOOTSTRAP-001/REVIEW_RESULT_POINTER.md
RETURN_RESULT_TO: Advisor
STOP_AFTER_RETURN: true
```

## Verdict target paths

```text
CLAUDE.md
AGENTS.md
docs/agent/**
docs/reports/governance/2026-07-10_governance_bootstrap.md
advisor/templates/**
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/00_INTAKE.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/01_ADVISOR_BRIEF.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/03_REVIEWER_BRIEF.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/04_ADVISOR_VALIDATION.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/05_FINAL_AUDIT.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/07_REVIEWER_HANDOFF_PROMPT.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/07_REVIEWER_RUN_PROMPT.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/08_SESSION_RELOAD_INSTRUCTIONS.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/08_ADVISOR_RELOAD_RUN_PROMPT.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/08_WORKER_RELOAD_RUN_PROMPT.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/08_REVIEWER_RELOAD_RUN_PROMPT.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/10_LOOP_STATE.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/11_FINAL_POINTER.md
advisor/jobs/VN-GOVERNANCE-BOOTSTRAP-001/index.md
```

## Required independent checks

Directly read every new/modified file above, both root entry files, every canonical protocol, every template, the
bootstrap job set, and the governance report. Read the real base-to-subject diff. Verify repo root, exact origin,
branch, base, immutable subject HEAD, origin state, staged/unstaged/untracked state, and report-only ownership.

Check all of the following without relying on author summaries or commit messages:

- runtime/src/package/env/UI/assets/config changes are zero and unrelated dirty files are absent;
- canonical authority, instruction precedence, exact conflict STOP, and lower-scope non-expansion are explicit;
- Leo/GPT tasks only Advisor; separate fixed sessions are required; Worker/Reviewer return only to Advisor;
- Reviewer result files and their report commit are Reviewer-exclusive; Advisor cannot self-review or impersonate;
- the bootstrap exception is docs-only, one-time, and expires at closure;
- Unknown Gate fields and all high-risk discovery categories are present;
- file-first, pointer-only, maximum chat size, result+pointer completeness, and direct reads are enforced;
- templates are separated from actual artifacts; no fake bootstrap Worker files/result exist;
- worker/reviewer/rework result paths are separated under `runs/`;
- short launcher fields, direct file reads, no memory execution, no scope broadening, and no new context are enforced;
- verdict handling, same-Reviewer delta re-review, ancestry/path-filtered diff, and two-attempt maximum are explicit;
- immutable subject/path and subject/report head separation, exclusive commit ownership, and report-only commit rules
  are correct;
- session reload cannot occur before PASS and all three existing fixed sessions are required;
- final content/pointer commit lineage and every self-reference sentinel rule are executable;
- `11_FINAL_POINTER.md` excludes `POINTER_PUBLISH_HEAD`;
- Advisor final validation can verify actual commits, pushes, origin, dirty state, and prohibited files.

The current `04`, `05`, `10`, governance report, index, and `11` files may contain clearly marked pending
finalization state. After `PASS`, only allowed validation/audit/reload/loop/report/index finalization may change;
canonical subject paths are frozen. Any canonical subject change requires a new subject and same-Reviewer review.

## Reviewer prohibitions and output

Do not edit subject files or implement fixes. Write only the two Reviewer-owned report paths, stage only those paths,
inspect the cached diff, make and push a report-only commit, and return its actual SHA in chat. Inside the result and
pointer, use `REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT`.

Valid verdicts: `PASS`, `PASS_WITH_RISK`, `NEEDS_PATCH`, `FAIL`.
