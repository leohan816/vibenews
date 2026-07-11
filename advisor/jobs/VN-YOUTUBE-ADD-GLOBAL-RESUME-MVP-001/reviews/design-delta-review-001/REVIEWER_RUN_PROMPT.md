# Reviewer Short Launcher — design-delta-review-001

```text
TARGET_ACTOR: VibeNews Reviewer
TARGET_PROJECT: VibeNews
TARGET_REPO: /home/leo/Project/VibeNews
TARGET_BRANCH: master
TARGET_SESSION_NAME: VibeNews-reviewer
REQUIRED_SKILL: agent-reach (official DeepSeek/Fish policy and API sources only)
READ_AND_EXECUTE: advisor/jobs/VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001/reviews/design-delta-review-001/REVIEWER_HANDOFF_PROMPT.md
REVIEW_TYPE: DESIGN_DELTA_REVIEW
REVIEW_ID: design-delta-review-001
REVIEW_PASS: delta
PREVIOUS_SUBJECT_HEAD: f8a0dc01b7eede5ac9cfd0fc39157cb08cd7f984
SUBJECT_HEAD: 5c97382841d00ceb8b18e27998c5e68bbe468555
DESIGN_POINTER_HEAD: 9d130d43d3b14dedc795803ab01ff0a9ea4ef6a7
FINDING_IDS_IN_SCOPE: DR1-F1
INPUT_HEAD: SUPPLY_EXACT_ADVISOR_REVIEW_ROUTING_HEAD_AT_INVOCATION
RETURN_RESULT_TO: Advisor
DO_NOT_EXECUTE_FROM_MEMORY: true
DO_NOT_BROADEN_SCOPE: true
NO_NEW_AGENT_OR_SUBAGENT: true
```

Open `READ_AND_EXECUTE` directly. Perform only the same fixed Reviewer's independent `DESIGN_DELTA_REVIEW`, write
and push only the two declared Reviewer result files, return only the concise pointer block to Advisor, and STOP.
