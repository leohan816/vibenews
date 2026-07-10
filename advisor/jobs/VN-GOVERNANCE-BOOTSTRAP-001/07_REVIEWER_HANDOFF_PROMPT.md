# 07 Reviewer Handoff — VN-GOVERNANCE-BOOTSTRAP-001

Perform the independent initial governance review described in `03_REVIEWER_BRIEF.md`.

1. Open `CLAUDE.md`, `AGENTS.md`, all five `docs/agent/` canonical files, `00_INTAKE.md`,
   `01_ADVISOR_BRIEF.md`, `03_REVIEWER_BRIEF.md`, and every declared subject file directly.
2. Verify `/home/leo/Project/VibeNews`, origin `https://github.com/leohan816/vibenews.git`, branch `master`,
   subject base `4e47b3f21ca4f41a6da5e835fc2beaf792dc9583`, and the immutable subject HEAD supplied in the launcher.
3. Confirm local and origin subject state before writing. Read the actual base-to-subject Git diff and inspect
   staged, unstaged, and untracked state.
4. Execute every check in `03_REVIEWER_BRIEF.md`. Do not rely on the Advisor's summaries or commit message.
5. Do not modify or patch any subject file.
6. Write only:
   - `runs/reviewer/VN-GOVERNANCE-BOOTSTRAP-001/REVIEW_RESULT.md`
   - `runs/reviewer/VN-GOVERNANCE-BOOTSTRAP-001/REVIEW_RESULT_POINTER.md`
7. Use the exact Reviewer schema in `docs/agent/RESULT_REPORTING_PROTOCOL.md`, including
   `REPORT_HEAD: RECORDED_AFTER_REPORT_PUSH_IN_CHAT` inside both versioned report files.
8. Stage only those two files, inspect the cached diff, create a report-only commit, and push `master` normally.
   Never bypass protection, amend the subject, or include subject changes.
9. After push, return only the Reviewer pointer block with the actual report commit SHA to Advisor and stop.

If the target head, branch, origin, ancestry, ownership, or dirty state does not support an independent review,
record the exact blocker and issue the appropriate non-PASS verdict. Never create another Reviewer or context.
