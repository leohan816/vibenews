# 06 D-009 Decision ACK — VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001

```text
DECISION_ID: D-009
DECISION: D-009-A — RECORD WITHOUT BLOCKING
DECISION_SOURCE: Leo/GPT explicit ACK
ACK_STATUS: ACKNOWLEDGED
APPLIES_TO: current private/internal low-risk YouTube technology-video MVP only
SOURCE_REVIEW_FINDING: DR1-F1
SOURCE_REVIEW_REPORT_HEAD: f46ea708d9768ce883effbb97bcd15cbddfa1227
DESIGN_REVISION_REQUIRED: true
DESIGN_REVISION_ID: design-revision-001
DESIGN_REVISION_ATTEMPT: 1
SAME_REVIEWER_DELTA_REVIEW_REQUIRED: true
DESIGN_DELTA_REVIEW_ID: design-delta-review-001
```

## Binding outcome

Provider-side policy uncertainty does not block this private, public-content vertical slice. This is not a claim
that DeepSeek or Fish Audio guarantees provider-side deletion, non-retention, or no-training.

For each provider, the implementation must record:

- provider name;
- official policy URL;
- policy effective or last-updated date;
- date reviewed;
- model/API endpoint used;
- available retention, training, deletion, and data-control statements;
- controls verified; and
- controls not independently verified.

Public policy metadata may be versioned as nonsecret evidence. Runtime configured model/API endpoint evidence must be
recorded in the private server audit/evidence boundary without exposing a credential, secret, configured reference
voice value, provider body, caption text, or private audio in Git, logs, reports, or chat. The revised design must
define the exact safe representation and storage boundary.

## Prohibited claims

No artifact may state or imply:

- that local transcript deletion deletes provider-side copies;
- that provider inputs are never retained;
- that provider inputs are never used for training;
- that provider-side deletion has been verified; or
- that private/internal MVP safeguards establish production privacy compliance.

## Provider data minimization

DeepSeek may receive only public YouTube transcript text required for analysis, public source metadata required for
provenance, and generated structured analysis/scripts required for verification. It must never receive private
project documents, personal notes/conversations, credentials/secrets, user account data, payment data, health
records, children's data, biometric data, confidential business information, or non-public copyrighted material.

Fish Audio may receive only the final approved `SpokenAudioScript`, the configured voice reference identifier, and
minimum synthesis parameters. It must not receive raw transcript, `VideoContentMap`, `AnalyticSummary`, playback
history, private user data, credentials, or secrets.

## Existing safeguards retained

- private/internal MVP only;
- public low-risk technology sources only;
- no public feed or third-party redistribution;
- no login/browser-cookie collection;
- no original video/audio storage;
- raw transcript locally hard-deleted within 24 hours;
- server-only provider calls;
- no secrets in Expo client, Git, logs, reports, or chat;
- sanitized provider errors/logs;
- retained source provenance; and
- user deletion for locally retained derived artifacts.

## Hard escalation gates

A new Leo/GPT decision is required before provider use for private/user-uploaded documents, internal company data,
personal conversations/memory, health/finance/legal/election content containing personal data, children's data,
multi-user production, public commercial launch, third-party customer content, or confidential/regulated
information. In those scopes, unverifiable provider-side controls become a release blocker unless a separately
approved provider or self-hosted model satisfies the required protection.

## Required live-acceptance evidence

```text
PROVIDER_POLICY_ASSURANCE: LIMITED_AND_UNVERIFIED
LOCAL_DATA_CONTROLS: VERIFIED
PROVIDER_SIDE_DELETION: NOT_VERIFIED
PROVIDER_SIDE_NO_TRAINING: NOT_VERIFIED
PRODUCTION_PRIVACY_APPROVAL: NOT_GRANTED
```

D-001 through D-008 remain unchanged and must not be reopened.
