// Private API client (설계문서/18 §11, §14). The bearer token is read from SecureStore via an
// injected getter and sent only as an Authorization header; the base URL is the one nonsecret
// EXPO_PUBLIC tailnet Serve URL. No provider keys, DB paths, or transcripts are ever seen here.

import type {
  AutomaticSessionView,
  ChannelView,
  CreateAutomaticSessionRequest,
  CreateChannelRequest,
  CreateManualBatchRequest,
  CursorPage,
  GlobalPlaybackView,
  LibraryItemView,
  ManualBatchView,
  ManualReplayGrant,
  PlaybackMutationRequest,
  PlaybackMutationResponse,
  ReadyView,
} from './contracts';

export class ApiRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly retryable: boolean,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

function uuid(): string {
  // RN-safe UUID v4 without importing node:crypto.
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken: () => Promise<string | null>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getToken = options.getToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(method: string, path: string, opts: { body?: unknown; idempotencyKey?: string; auth?: boolean } = {}): Promise<T> {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (opts.auth !== false) {
      const token = await this.getToken();
      if (!token) throw new ApiRequestError('UNAUTHORIZED', 401, false, 'missing device token');
      headers.authorization = `Bearer ${token}`;
    }
    if (opts.idempotencyKey) headers['idempotency-key'] = opts.idempotencyKey;
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const text = await res.text();
    const parsed = text ? (JSON.parse(text) as { data?: T; error?: { code: string; message: string; retryable: boolean } }) : {};
    if (res.status >= 400 || parsed.error) {
      const err = parsed.error ?? { code: 'INTERNAL_ERROR', message: 'request failed', retryable: false };
      throw new ApiRequestError(err.code, res.status, err.retryable, err.message);
    }
    return parsed.data as T;
  }

  ready(): Promise<ReadyView> {
    return this.request('GET', '/v1/health/ready');
  }
  createManualBatch(req: CreateManualBatchRequest, idempotencyKey = uuid()): Promise<ManualBatchView> {
    return this.request('POST', '/v1/manual-batches', { body: req, idempotencyKey });
  }
  getManualBatch(id: string): Promise<ManualBatchView> {
    return this.request('GET', `/v1/manual-batches/${id}`);
  }
  listChannels(): Promise<ChannelView[]> {
    return this.request('GET', '/v1/channels');
  }
  createChannel(req: CreateChannelRequest, idempotencyKey = uuid()): Promise<ChannelView> {
    return this.request('POST', '/v1/channels', { body: req, idempotencyKey });
  }
  patchChannel(id: string, req: { autoProcessingEnabled: boolean; scopeAttested?: true; scopeAttestationVersion?: string }, idempotencyKey = uuid()): Promise<ChannelView> {
    return this.request('PATCH', `/v1/channels/${id}`, { body: req, idempotencyKey });
  }
  deleteChannel(id: string, idempotencyKey = uuid()): Promise<{ id: string; status: string }> {
    return this.request('DELETE', `/v1/channels/${id}`, { idempotencyKey });
  }
  getLibrary(cursor?: string, limit = 50): Promise<CursorPage<LibraryItemView>> {
    const q = new URLSearchParams({ limit: String(limit) });
    if (cursor) q.set('cursor', cursor);
    return this.request('GET', `/v1/library?${q.toString()}`);
  }
  createAutomaticSession(req: CreateAutomaticSessionRequest, idempotencyKey = uuid()): Promise<AutomaticSessionView> {
    return this.request('POST', '/v1/automatic-sessions', { body: req, idempotencyKey });
  }
  getAutomaticSession(id: string): Promise<AutomaticSessionView> {
    return this.request('GET', `/v1/automatic-sessions/${id}`);
  }
  getGlobalPlayback(): Promise<GlobalPlaybackView> {
    return this.request('GET', '/v1/playback/global');
  }
  postPlaybackMutation(req: PlaybackMutationRequest): Promise<PlaybackMutationResponse> {
    return this.request('POST', '/v1/playback/mutations', { body: req, idempotencyKey: req.clientMutationId });
  }
  createManualReplay(contentItemId: string, clientMutationId = uuid()): Promise<ManualReplayGrant> {
    return this.request('POST', '/v1/manual-replays', { body: { contentItemId, clientMutationId }, idempotencyKey: clientMutationId });
  }
}

export function newClientMutationId(): string {
  return uuid();
}
