# Worker Handoff — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

1. Open `WORKER_BRIEF.md` directly, then perform every preflight and required direct read in that file.
2. Require the actual launcher `WORKER_INPUT_HEAD` to equal local `HEAD` and `origin/master` before writing. Require a
   clean worktree and exact frozen design and `PASS` delta-review objects.
3. Perform only the fixed VibeNews Worker implementation role. Implement the frozen design only in the exact
   repository allowlist and write only the two Worker-owned result paths. Do not edit design, Reviewer, Advisor,
   canonical governance, secret, runtime-state, or undeclared files.
4. This is the implementation authoring/test pass before independent review. Do not open `.env.server.local`, make
   live YouTube/DeepSeek/Fish calls, install/start systemd units, alter `/var/lib/vibenews-dev`, or change Tailscale.
   Use only synthetic non-secret local test configuration and fixtures.
5. If implementation exposes a frozen-design defect, follow only the pre-authorized checkpoint rule and return
   `BLOCKED_DESIGN_DEFECT` to Advisor. Do not guess, redesign, add a path, or continue around it.
6. Directly read every changed file, execute every required build/test/security/path/lineage check, and record truthful
   failures. No mock, sample audio, partial connection, or skipped test may be reported as real acceptance.
7. Create and push the Worker content/result commit, then the separate pointer-only commit exactly as specified. Do
   not merge, amend, rewrite, switch/create branches, or blanket-stage.
8. Return only the concise Worker pointer block with actual content/pointer heads to Advisor, then STOP. Do not launch
   or message Designer, Reviewer, Leo/GPT, another agent, or another session.
