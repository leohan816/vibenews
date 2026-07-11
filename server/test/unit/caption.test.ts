import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertCaptionArgsSafe,
  buildCaptionArgs,
  canonicalizeChannelInput,
  canonicalizeVideoUrl,
  channelFeedUrl,
  chunkCues,
  parseVtt,
} from '../../src/providers/caption';

test('video canonicalization accepts watch/youtu.be/shorts and rebuilds a canonical url', () => {
  assert.deepEqual(canonicalizeVideoUrl('https://www.youtube.com/watch?v=5JqK9JLD140&list=PL1'), {
    videoId: '5JqK9JLD140',
    canonicalUrl: 'https://www.youtube.com/watch?v=5JqK9JLD140',
  });
  assert.equal(canonicalizeVideoUrl('https://youtu.be/5JqK9JLD140?t=30').videoId, '5JqK9JLD140');
  assert.equal(canonicalizeVideoUrl('https://www.youtube.com/shorts/5JqK9JLD140').videoId, '5JqK9JLD140');
});

test('video canonicalization rejects SSRF / non-canonical forms', () => {
  const bad = [
    'http://www.youtube.com/watch?v=5JqK9JLD140', // not https
    'https://youtube.com.evil.com/watch?v=5JqK9JLD140', // lookalike host
    'https://www.youtube.com:8443/watch?v=5JqK9JLD140', // custom port
    'https://user:pass@www.youtube.com/watch?v=5JqK9JLD140', // userinfo
    'https://127.0.0.1/watch?v=5JqK9JLD140', // IP host
    'https://www.youtube.com/embed/5JqK9JLD140', // embed
    'https://www.youtube.com/playlist?list=PL1', // playlist-only
    'https://www.youtube.com/watch?v=short', // bad id length
    'javascript:alert(1)',
    'https://www.youtube.com/watch', // no id
  ];
  for (const url of bad) {
    assert.throws(() => canonicalizeVideoUrl(url), /unsupported youtube url/, `should reject ${url}`);
  }
});

test('channel canonicalization resolves channel id and handle, and the feed url is exact', () => {
  const byId = canonicalizeChannelInput('https://www.youtube.com/channel/UCx_YiR733cfqVPRsQ1n8Fag');
  assert.equal(byId.kind, 'id');
  const byHandle = canonicalizeChannelInput('https://www.youtube.com/@expo');
  assert.equal(byHandle.kind, 'handle');
  assert.equal(
    channelFeedUrl('UCx_YiR733cfqVPRsQ1n8Fag'),
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCx_YiR733cfqVPRsQ1n8Fag',
  );
  assert.throws(() => canonicalizeChannelInput('https://www.youtube.com/watch?v=5JqK9JLD140'));
});

test('caption argument profile contains no login/cookie/media/arbitrary-path capability', () => {
  const args = buildCaptionArgs('5JqK9JLD140', '/var/lib/vibenews-dev/tmp/job-1');
  assert.doesNotThrow(() => assertCaptionArgsSafe(args));
  assert.ok(args.includes('--skip-download'));
  assert.ok(args.includes('--ignore-config'));
  assert.ok(args[args.length - 1] === 'https://www.youtube.com/watch?v=5JqK9JLD140');
  for (const forbidden of ['--cookies', '--cookies-from-browser', '--netrc', '--username', '--format', '--exec']) {
    assert.ok(!args.includes(forbidden), `must not include ${forbidden}`);
  }
});

test('VTT parsing preserves order and strips markup', () => {
  const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
<c>Hello</c> world

00:00:02.000 --> 00:00:04.000
second line`;
  const cues = parseVtt(vtt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0]?.text, 'Hello world');
  assert.equal(cues[0]?.startMs, 0);
  assert.equal(cues[1]?.startMs, 2000);
  assert.equal(cues[1]?.text, 'second line');
});

test('cue chunking produces stable evidence refs and an index', () => {
  const cues = Array.from({ length: 5 }, (_, i) => ({ index: i, startMs: i * 1000, endMs: (i + 1) * 1000, text: `cue ${i}` }));
  const { chunks, index } = chunkCues(cues, { chunkChars: 12, maxChunks: 20 });
  assert.ok(chunks.length >= 2);
  assert.equal(chunks[0]?.evidenceRefs[0]?.ref, index[0]?.ref);
  assert.match(chunks[0]?.evidenceRefs[0]?.ref ?? '', /^cap:\d{6}-\d{6}$/);
});
