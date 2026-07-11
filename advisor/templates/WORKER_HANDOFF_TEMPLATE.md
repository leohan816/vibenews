# Worker Handoff Template

1. Verify repo root, origin, branch, base HEAD against the brief, `origin/master`, and clean dirty state.
2. Open `CLAUDE.md`, `AGENTS.md`, all canonical `docs/agent/` files including `DESIGN_PROTOCOL.md`, and the Worker
   brief directly.
3. Read the frozen design with `git show <FROZEN_DESIGN_HEAD>:<DESIGN_RESULT_PATH>` and verify every frozen path
   object exists. Mismatch or absence is a safe stop.
4. Stop on preflight mismatch, authority conflict, or unresolved Unknown Gate. A contradictory, incomplete, unsafe, or
   materially undecided frozen design returns `BLOCKED_DESIGN_DEFECT` only to Advisor; do not guess or edit design.
5. Change only allowed implementation paths and Worker-owned result paths; leave forbidden and frozen design paths
   untouched.
6. Run the declared tests/build and inspect staged, unstaged, and untracked files.
7. Write `WORKER_RESULT.md` and `WORKER_RESULT_POINTER.md` under `runs/worker/<JOB_ID>/`, recording design
   conformance and every divergence.
8. Stage only declared paths, inspect the cached diff, make the Worker content commit and push, then the separate
   pointer-only commit and push, and record the actual heads in chat after each push.
9. Return only the pointer block to Advisor and stop.
