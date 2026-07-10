# Worker Handoff Template

1. Verify repo root, origin, branch, base HEAD, and dirty state against the brief.
2. Open `CLAUDE.md`, `AGENTS.md`, all canonical `docs/agent/` files, and the Worker brief directly.
3. Stop on mismatch, authority conflict, or unresolved Unknown Gate.
4. Change only allowed paths; leave forbidden paths untouched.
5. Run the declared tests/build and inspect staged, unstaged, and untracked files.
6. Write `WORKER_RESULT.md` and `WORKER_RESULT_POINTER.md` under `runs/worker/<JOB_ID>/`.
7. Stage only declared paths, inspect the cached diff, commit, push the verified branch, and record the actual result
   commit in the chat pointer after push.
8. Return only the pointer block to Advisor and stop.
