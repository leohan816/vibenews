# Reviewer Handoff — design-review-001

1. Verify the exact repo, origin, `master`, immutable subject commit, ancestry, `origin/master`, and current
   staged/unstaged/untracked state.
2. Open `CLAUDE.md`, `AGENTS.md`, `docs/agent/ROLE_INDEX.md`, every canonical protocol it requires, this handoff, and
   `REVIEWER_BRIEF.md` directly. Then open every required file and every immutable subject named by the brief directly.
3. Read the actual base-to-subject diff. Treat only declared `SUBJECT_HEAD` and `SUBJECT_PATHS` as verdict targets;
   pointer and Advisor routing commits are context only.
4. Perform only independent `DESIGN_REVIEW`. Do not edit or patch design subjects, canonical governance, Advisor
   artifacts, Worker artifacts, runtime/product files, or any other actor-owned result.
5. Never open or print `.env.server.local` values. Do not retrieve or retain caption text, provider bodies, private
   audio, original media, or secrets. Use names/metadata/official documentation only.
6. Write only:
   - `runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/design-review-001/REVIEW_RESULT.md`
   - `runs/reviewer/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/design-review-001/REVIEW_RESULT_POINTER.md`
7. Use the current canonical Reviewer result fields plus `REVIEW_TYPE`, `REVIEW_ID`, `DESIGN_ID`,
   `DESIGN_CONTENT_HEAD`, and `DESIGN_SUBJECT_PATHS`. Inside both files use
   `REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT` for the containing report commit.
8. Stage only those two Reviewer paths, inspect the cached diff, create one report-only commit, push `master`, verify
   its actual SHA on `origin/master`, and return that SHA in chat as `REPORT_HEAD`.
9. Return only the concise `REVIEW_RESULT_WRITTEN` pointer block to Advisor and STOP. Do not launch another agent,
   subagent, session, Worker, or Designer.
