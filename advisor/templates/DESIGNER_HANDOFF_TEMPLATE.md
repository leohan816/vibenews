# Designer Handoff Template

1. Verify repo root, origin, branch, the brief `INPUT_HEAD` against local HEAD and `origin/master`, and clean
   staged/unstaged/untracked state.
2. Open `CLAUDE.md`, `AGENTS.md`, all canonical `docs/agent/` files including `DESIGN_PROTOCOL.md`, and the Designer
   brief directly.
3. Stop on mismatch, authority conflict, or unresolved Unknown Gate; a blocking open decision returns
   `BLOCKED_DECISION_REQUIRED` only to Advisor.
4. Author design only. Complete every `DESIGN_RESULT.md` field, expose assumptions/unknowns/material choices, and
   write only `runs/designer/<JOB_ID>/DESIGN_RESULT.md` plus any exact `설계문서/` paths the brief authorizes. Do not
   implement, review, freeze, or route.
5. Commit the design content only, push, and verify origin. Then update `runs/designer/<JOB_ID>/DESIGN_RESULT_POINTER.md`
   in a separate pointer-only commit and push.
6. Use the content-head sentinel in the result and the pointer-head sentinel in the pointer; never write a containing
   SHA into the file it contains.
7. Return only the Designer pointer block to Advisor with the actual content head, and stop.
