# Design Revision Handoff Template

```text
JOB_ID:
DESIGN_ID:
REVISION_ID:
ATTEMPT: 1 | 2
TARGET_ACTOR: VibeNews Designer
TARGET_SESSION_NAME: VibeNews-designer
REVIEW_FINDING_IDS:
PREVIOUS_DESIGN_CONTENT_HEAD:
ALLOWED_DESIGN_PATHS:
FORBIDDEN_PATHS:
REQUIRED_DELTA_TESTS:
DESIGN_DELTA_REVIEW_REQUIRED:
RETURN_TO: Advisor
```

Open the previous design result at `PREVIOUS_DESIGN_CONTENT_HEAD`, the Reviewer report, the canonical protocols
including `DESIGN_PROTOCOL.md`, and the Advisor revision brief directly. The same VibeNews-designer session changes
only the named design subjects. `DESIGN_RESULT.md` remains a complete replacement package, increments
`DESIGN_VERSION`, records `SUPERSEDES_DESIGN_CONTENT_HEAD` and the addressed finding IDs, and takes a new
content-only commit followed by a separate pointer-only commit. Confirm unrelated changes are none. The initial
review is not an attempt; at most two automatic revisions are allowed. After the Advisor validates the revised
content, the same Reviewer performs `DESIGN_DELTA_REVIEW` when required. Return only the Designer pointer block to
Advisor and stop.
