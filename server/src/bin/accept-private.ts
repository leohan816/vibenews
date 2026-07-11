// Redacted real private acceptance runner (설계문서/18 §14, §18). In this implementation/test pass it
// performs NO live YouTube/DeepSeek/Fish call and mutates no runtime state; it records exactly
// LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW. It never opens .env.server.local,
// never prints any secret or model/reference value, and asserts no LOCAL_DATA_CONTROLS: VERIFIED
// (that label is only emitted after a verified live run in a later, separately routed phase).

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function arg(name: string): string | null {
  const argv = process.argv.slice(2);
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? (argv[i + 1] as string) : null;
}

function main(): void {
  const videoId = arg('--video-id');
  const channelId = arg('--channel-id');
  process.stdout.write('LIVE_PRIVATE_ACCEPTANCE: NOT_RUN_PENDING_IMPLEMENTATION_REVIEW\n');
  process.stdout.write(`SELECTED_VIDEO_ID: ${videoId ?? '(none)'}\n`);
  process.stdout.write(`SELECTED_CHANNEL_ID: ${channelId ?? '(none)'}\n`);
  process.stdout.write('NOTE: no live provider/YouTube call performed; five assurance labels are emitted only after a verified live run.\n');
  process.exit(0);
}

const HERE = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].startsWith(join(HERE, 'accept-private')))) {
  main();
}
