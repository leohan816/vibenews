# 00 Intake — VN-GOVERNANCE-BOOTSTRAP-001

```text
JOB_ID: VN-GOVERNANCE-BOOTSTRAP-001
TARGET_ACTOR: VibeNews Advisor
TARGET_PROJECT: VibeNews
MISSION_TYPE: GOVERNANCE_BOOTSTRAP
RISK_LEVEL: A_DOCS_ONLY
SPECIAL_IMPLEMENTATION_EXCEPTION: ACTIVE_FOR_THIS_BOOTSTRAP_ONLY
RUNTIME_CHANGE_ALLOWED: false
FILE_FIRST_REPORTING: true
CHAT_OUTPUT_MODE: POINTER_ONLY
FULL_RESULT_IN_CHAT: forbidden
MAX_CHAT_OUTPUT_LINES: 15
```

## Original Leo/GPT instruction preserved

Install a permanent VibeNews operating chain in which Leo/GPT tasks only the Advisor; the Advisor investigates,
briefs, and routes separate existing Worker and Reviewer sessions; Worker and Reviewer return only to Advisor; the
same independent Reviewer verifies the actual files and Git evidence and re-reviews any bounded patch; all required
fixed sessions reload the accepted protocols; the Advisor validates and closes through a final content commit and a
separate pointer-only publish commit. This bootstrap alone authorizes Advisor-authored governance Markdown. It does
not authorize runtime, source, package, environment, UI, database, production, branch, merge, force-push, history
rewrite, branch-protection bypass, new agent/subagent, temporary context, or self-review actions.

Required permanent authority files are the five files under `docs/agent/`. Required root entries are short pointers.
Required templates and job artifacts remain distinct. Bootstrap creates no fake Worker brief, Worker launcher, Worker
run, or Worker result. Reviewer report paths are Reviewer-exclusive. Reporting is file-first and chat is pointer-only.
Unknown Gate, short launchers, immutable subject head/path, subject/report head separation, at most two patch loops,
same-Reviewer delta review, session reload, self-reference sentinels, finalization lineage, and origin verification are
mandatory. Completion requires Reviewer `PASS`, all three reloads, zero runtime change, clean closure state, pushed
`FINAL_CONTENT_HEAD`, pushed `POINTER_PUBLISH_HEAD`, and expiration of the implementation exception.

## Resolved preflight

Commands executed directly before authoring:

```bash
pwd
git rev-parse --show-toplevel
git remote get-url origin
git branch --show-current
git rev-parse HEAD
git status --short
```

```text
TARGET_BRANCH: master
RESOLVED_TARGET_REPO: /home/leo/Project/VibeNews
EXPECTED_ORIGIN_REPOSITORY: https://github.com/leohan816/vibenews.git
ORIGIN: https://github.com/leohan816/vibenews.git
AUTHORING_BASE: 4e47b3f21ca4f41a6da5e835fc2beaf792dc9583
CURRENT_HEAD_BEFORE_AUTHORING: 4e47b3f21ca4f41a6da5e835fc2beaf792dc9583
DIRTY_STATE_BEFORE_AUTHORING: clean
REPO_TOPOLOGY_DECISION: SINGLE_REPO
GOVERNANCE_REPO: NOT_APPLICABLE
MULTIPLE_ORIGIN_MATCHES: false
```

Topology evidence: the only local Git repository under the authorized `/home/leo` search scope whose origin exactly
matched `leohan816/vibenews` was `/home/leo/Project/VibeNews`. This repository already contains product code,
`docs/`, and `설계문서/`. The adjacent `foundation-docs` remote identifies itself as a central mirror for Foundation,
SIASIU, and Cosmile, not as canonical VibeNews governance. No separate VibeNews docs/governance origin was found.

## Git prohibitions and authority

```text
BRANCH_CREATE_ALLOWED: false
BRANCH_SWITCH_ALLOWED: false
MERGE_ALLOWED: false
FORCE_PUSH_ALLOWED: false
HISTORY_REWRITE_ALLOWED: false
PROTECTED_BRANCH_BYPASS_ALLOWED: false
DOCS_ONLY_GOVERNANCE_WRITE_AUTHORIZED: true
COMMIT_AND_PUSH_TO_TARGET_BRANCH_AUTHORIZED: true
```

If branch protection rejects a normal push, stop without bypassing it.
