# Reviewer Handoff Template

1. Verify repo root, origin, branch, immutable subject head, and current dirty state.
2. Open both entry files, all canonical protocols, the Reviewer brief, and every subject file directly.
3. Read the actual base-to-subject diff and verify subject paths, runtime changes, and unrelated dirty files.
4. Independently assess authority boundaries, review separation, routing, Unknown Gate, reporting, launcher,
   reload, commit-lineage, and self-reference rules required by the brief.
5. Do not edit or patch subject files.
6. Write only `runs/reviewer/<JOB_ID>/REVIEW_RESULT.md` and `REVIEW_RESULT_POINTER.md`.
7. Stage only those two report paths, inspect the cached diff, make a report-only commit, push, and return its
   actual SHA in chat as `REPORT_HEAD`.
8. Return only to Advisor and stop.
