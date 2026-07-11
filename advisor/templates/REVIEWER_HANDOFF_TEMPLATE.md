# Reviewer Handoff Template

1. Verify repo root, origin, branch, immutable subject head, and current dirty state.
2. Open both entry files, all canonical protocols including `DESIGN_PROTOCOL.md`, the Reviewer brief, and every
   subject file directly. For a design pass, read the design content head; for an implementation pass, also read
   `FROZEN_DESIGN_HEAD`.
3. Read the actual base-to-subject diff and verify subject paths, runtime changes, and unrelated dirty files. For a
   delta pass, verify previous-subject-head ancestry and read the exact path-filtered delta.
4. Independently assess the review for its `REVIEW_TYPE`: design completeness/intent/authority/feasibility for a
   design pass, or design conformance and implementation correctness for an implementation pass, plus routing,
   Unknown Gate, reporting, launcher, reload, commit-lineage, and self-reference rules.
5. Do not edit or patch subject files, freeze a subject, or implement.
6. Write only `runs/reviewer/<JOB_ID>/<REVIEW_ID>/REVIEW_RESULT.md` and `REVIEW_RESULT_POINTER.md`.
7. Stage only those two report paths, inspect the cached diff, make a report-only commit, push, and return its actual
   SHA in chat as `REPORT_HEAD`.
8. Return only to Advisor and stop.
