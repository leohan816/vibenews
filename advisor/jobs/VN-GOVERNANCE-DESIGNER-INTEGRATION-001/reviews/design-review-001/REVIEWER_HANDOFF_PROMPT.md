# Reviewer Handoff — design-review-001

1. Verify the exact repo, origin, `master` branch, immutable subject commit, ancestry, `origin/master`, and current
   staged/unstaged/untracked state.
2. Open `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, every canonical protocol it requires, this handoff, and
   `REVIEWER_BRIEF.md` directly. Then open every required file and immutable subject named by the brief directly.
3. Read the actual base-to-subject diff. Treat only the declared `SUBJECT_HEAD` and `SUBJECT_PATHS` as the verdict
   target; do not review the pointer/report-routing commits as if they changed the design subject.
4. Perform only independent `DESIGN_REVIEW`. Do not edit or patch the design, canonical governance, templates,
   Advisor artifacts, Worker artifacts, runtime/product files, or any other actor-owned result.
5. Write only:
   - `runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/design-review-001/REVIEW_RESULT.md`
   - `runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/design-review-001/REVIEW_RESULT_POINTER.md`
6. Use the current canonical Reviewer result fields plus `REVIEW_TYPE`, `REVIEW_ID`, `DESIGN_ID`,
   `DESIGN_CONTENT_HEAD`, and `DESIGN_SUBJECT_PATHS`. Inside both files use
   `REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT` for the containing report commit.
7. Stage only those two Reviewer paths, inspect the cached diff, create one report-only commit, push `master`, verify
   its actual SHA on `origin/master`, and return that SHA in chat as `REPORT_HEAD`.
8. Return only the concise `REVIEW_RESULT_WRITTEN` pointer block to Advisor and STOP. Do not launch another agent,
   session, context, Worker, or Designer.
