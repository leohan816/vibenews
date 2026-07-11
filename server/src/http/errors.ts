// API error envelope and safe status mapping (설계문서/18 §11.1). Messages are allowlisted templates;
// raw upstream/user text is never reflected.

export const ERROR_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  IDEMPOTENCY_CONFLICT: 409,
  PLAYBACK_REVISION_CONFLICT: 409,
  BATCH_LIMIT_EXCEEDED: 409,
  CHANNEL_LIMIT_EXCEEDED: 409,
  UNSUPPORTED_YOUTUBE_URL: 400,
  PUBLIC_CAPTION_UNAVAILABLE: 502,
  SOURCE_DURATION_REJECTED: 400,
  OUTPUT_TOO_LARGE: 400,
  APPROVAL_REVOKED: 409,
  DAILY_TTS_CAP_DEFERRED: 202,
  HUMAN_REVIEW_REQUIRED: 200,
  SCOPE_ESCALATION_REQUIRED: 409,
  PAYLOAD_GUARD_REJECTED: 409,
  RUNTIME_BINDING_REJECTED: 409,
  PROVIDER_UNAVAILABLE: 503,
  STORAGE_UNAVAILABLE: 503,
  MIGRATION_MISMATCH: 503,
  RANGE_NOT_SATISFIABLE: 416,
  INTERNAL_ERROR: 500,
};

const SAFE_MESSAGE: Record<string, string> = {
  VALIDATION_ERROR: 'Request failed validation.',
  UNAUTHORIZED: 'Authentication is required.',
  FORBIDDEN: 'Not permitted.',
  NOT_FOUND: 'Not found.',
  IDEMPOTENCY_CONFLICT: 'This idempotency key was used with a different request.',
  PLAYBACK_REVISION_CONFLICT: 'Playback state changed; reload and retry.',
  BATCH_LIMIT_EXCEEDED: 'A batch accepts at most 10 links.',
  CHANNEL_LIMIT_EXCEEDED: 'At most 5 channels can be registered.',
  UNSUPPORTED_YOUTUBE_URL: 'Only public YouTube video URLs are supported.',
  APPROVAL_REVOKED: 'The source approval was revoked.',
  SCOPE_ESCALATION_REQUIRED: 'This scope requires a new decision before processing.',
  PAYLOAD_GUARD_REJECTED: 'The request payload was rejected by the local guard.',
  RUNTIME_BINDING_REJECTED: 'The provider runtime binding failed verification.',
  PROVIDER_UNAVAILABLE: 'A provider is temporarily unavailable.',
  STORAGE_UNAVAILABLE: 'Storage is temporarily unavailable.',
  MIGRATION_MISMATCH: 'Server is not ready.',
  RANGE_NOT_SATISFIABLE: 'Requested range is not satisfiable.',
  INTERNAL_ERROR: 'An internal error occurred.',
};

export class AppError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors?: Array<{ path: string; code: string }>;
  constructor(code: string, retryable = false, fieldErrors?: Array<{ path: string; code: string }>) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.retryable = retryable;
    if (fieldErrors) this.fieldErrors = fieldErrors;
  }
}

export function statusForCode(code: string): number {
  return ERROR_STATUS[code] ?? 500;
}

export function errorEnvelope(code: string, requestId: string, retryable = false, fieldErrors?: Array<{ path: string; code: string }>) {
  const message = SAFE_MESSAGE[code] ?? SAFE_MESSAGE.INTERNAL_ERROR;
  const error: { code: string; message: string; retryable: boolean; fieldErrors?: Array<{ path: string; code: string }> } = {
    code,
    message: message as string,
    retryable,
  };
  if (fieldErrors && fieldErrors.length > 0) error.fieldErrors = fieldErrors;
  return { error, requestId };
}
