# Reviewer Handoff — implementation-review-001

1. Verify the exact repo, origin, `master`, `origin/master`, immutable subject/frozen-design/report objects, ancestry,
   and clean staged/unstaged/untracked state.
2. Open `REVIEWER_BRIEF.md`, both root entries, all canonical protocols including `DESIGN_PROTOCOL.md`, every frozen
   design and subject path, and every evidence artifact named by the brief directly.
3. Read the complete base-to-subject path-filtered implementation diff and the correction delta. Independently check
   the implementation against the frozen design and original Leo/GPT success criteria.
4. Perform only `IMPLEMENTATION_REVIEW`. Do not edit, patch, freeze, implement, route another actor, or treat author
   summaries/results/commit messages as evidence.
5. Write only:
   - `runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/implementation-review-001/REVIEW_RESULT.md`
   - `runs/reviewer/VN-GOVERNANCE-DESIGNER-INTEGRATION-001/implementation-review-001/REVIEW_RESULT_POINTER.md`
6. Use every canonical Reviewer result field, including `REVIEW_TYPE`, `REVIEW_ID`, `DESIGN_CONTENT_HEAD`,
   `DESIGN_SUBJECT_PATHS`, `FROZEN_DESIGN_HEAD`, and `DESIGN_CONFORMANCE_CHECK`. Use
   `REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT` inside both containing files.
7. Stage only those two Reviewer paths, inspect the cached diff, create one report-only commit, push `master`, verify
   its actual SHA on origin, and return that actual `REPORT_HEAD` only to Advisor.
8. Return only the concise `REVIEW_RESULT_WRITTEN` pointer block and STOP. Do not launch another session, context,
   agent, subagent, Designer, or Worker.
