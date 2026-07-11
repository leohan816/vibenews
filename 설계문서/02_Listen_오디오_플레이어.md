# 02. Listen · 오디오 플레이어

## 목적

VibeNews의 첫 화면이자 심장이다. 뉴스를 읽는 feed가 아니라 준비된 개인용 브리핑을 한 번에 시작하고,
어느 화면에서 돌아와도 같은 항목·위치에서 이어 듣는 AI radio다.

## 사용자 경험

- 첫 화면은 큰 중앙 재생 버튼과 `Leo님을 위한 뉴스가 준비되어 있어요.` 문구를 중심으로 한다.
- 준비된 개수/시간, 오늘의 흐름을 보여주되 별도 filter queue를 만들지 않는다.
- 중앙 play, 오늘의 브리핑, Category, Tag, 오늘의 흐름 play는 모두 같은 user-global automatic state를
  시작하거나 resume한다.
- active incomplete가 있으면 `이어듣기 · 2:14 / 6:40`처럼 현재/전체 시간을 보여주고 그 위치에서
  먼저 재생한다.
- 하나의 briefing은 여러 `ContentItem`/chapter로 구성되며 immutable session snapshot 순서를 따른다.

### BriefingSession

- 상단: entry context와 `CHAPTER n / total`; context는 queue filter가 아니다.
- 중앙: Neo-Retro AI Radio signal visual/cover art, 제목과 한 줄 요약만 노출한다.
- 진행바: 현재/전체 시간, accessible seek.
- controls: 이전, 재생/일시정지, `다음으로 건너뛰기`.
- actions: 저장, 더 알아보기, 깊게 듣기, history에서는 manual `다시 듣기`.
- raw caption, source 본문, provider output은 표시하지 않는다.

## 현재 상태와 MVP 전환

입력 head의 재생기는 화면별 `useAudioPlayer` hook과 원격 fallback audio에 의존하는 partial skeleton이다.
그 상태는 현재 사실일 뿐 `VN-YOUTUBE-ADD-GLOBAL-RESUME-MVP-001`의 목표 계약이 아니다.

이 MVP는 다음으로 교체한다.

- 실제 Fish Audio 결과이며 server에서 `audio_ready`가 된 private AudioAsset만 automatic play 가능
- root-lifetime singleton `createAudioPlayer`와 하나의 status listener
- server canonical state + Expo SQLite device journal/outbox
- authorized Range audio route와 SecureStore의 opaque device token
- app restart, tab/push 전환, network interruption을 넘어가는 global resume

원격 sample/fallback audio는 automatic source resolution에서 제거한다. `audio_ready`가 아니면 재생 버튼을
disabled/pending/error로 표시한다. sample-only 또는 mock-only 재생은 acceptance가 아니다.

## Expo SDK 57 player 계약

공식 문서: <https://docs.expo.dev/versions/v57.0.0/sdk/audio/>

- root provider가 `createAudioPlayer(null, { updateInterval: 500 })`로 player 하나를 만들고 unmount 시
  `release()`한다.
- item 전환은 authorized `AudioSource { uri, headers: { Authorization } }`를 `replace`한 뒤 load를 확인하고
  `seekTo(lastPositionSec)`한다.
- `playbackStatusUpdate`의 `playing`, `currentTime`, `duration`, `didJustFinish`, `isLoaded`, `error`를
  controller state machine에 넣는다.
- `playing=true`가 처음 확인될 때만 unheard -> in_progress mutation을 보낸다. tap/load/buffer는 상태를
  바꾸지 않는다.
- `didJustFinish=true`일 때만 completed mutation을 보내고 snapshot의 다음 eligible item으로 간다.
- background playback은 SDK 57 config plugin, `setAudioModeAsync({ playsInSilentMode: true,
  shouldPlayInBackground: true, interruptionMode: 'doNotMix' })`, Android lock-screen activation 계약을
  함께 적용한다.
- App config는 playback only로 `enableBackgroundPlayback: true`, `enableBackgroundRecording: false`,
  `recordAudioAndroid: false`, `microphonePermission: false`를 사용한다.
- title/artist에 source transcript나 private provider detail을 넣지 않고 derived title과 `VibeNews`만 쓴다.

## 전역 automatic state

상태는 정확히 다음 네 가지다.

```text
unheard | in_progress | completed | skipped
```

| 현재 | event | 다음 | 결과 |
| --- | --- | --- | --- |
| unheard | 실제 player start | in_progress | user의 유일 active item |
| in_progress | pause/seek/background/exit | in_progress | position 저장, active 유지 |
| in_progress | didJustFinish | completed | 모든 자동 surface에서 제외 |
| unheard/in_progress | 명시적 skip | skipped | 모든 자동 surface에서 제외 |
| completed/skipped | manual replay | 동일 | automatic pointer/queue 불변 |

이전 five-second exclusion 규칙은 삭제되었다. 경과 청취 시간이나 duration 비율로 exclude하지 않는다.

### snapshot

새 automatic session은 transaction에서 다음 순서로 membership을 고정한다.

1. active `in_progress` 하나가 있으면 첫 번째
2. snapshot 시각까지 `audio_ready`인 `unheard`
3. 정렬은 `audioReadyAt ASC`, tie-break `contentItemId ASC`

session 시작 뒤 준비된 항목은 active snapshot에 들어오지 않는다. process cold start/명시적 새 session에서
새 snapshot을 만들 때만 들어온다. snapshot member가 그 뒤 completed/skipped/deleted되면 membership은
audit상 유지하되 traversal에서는 제외한다.

### persistence cadence와 conflict

- device Expo SQLite: 재생 중 2초마다, play/pause/seek/item change/skip/completion/background마다 exclusive
  transaction checkpoint
- server: 15초 coalesced checkpoint와 control/lifecycle event 즉시 전송
- device DB는 즉시 durable journal/outbox, server는 queue/status/revision 정본
- `clientMutationId`와 device-run monotonic sequence로 retry/order를 idempotent하게 하고 optimistic
  `baseRevision` mismatch는 409로 받는다.
- 같은 active item이면 outbox를 sequence 순으로 rebase해 explicit backward `SEEK`와 PAUSE/COMPLETE/SKIP
  의미를 보존한다. Active item/session이 바뀌었으면 이전 item mutation을 stale로 폐기한다. 단순 max
  position merge는 deliberate rewind를 망가뜨리므로 사용하지 않는다.

공식 SQLite 계약: <https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/>. DB는 restart를 넘어 지속되며
WAL, foreign keys, migration, `withExclusiveTransactionAsync`를 사용한다.

## 재생 command

```ts
type AutomaticEntryPoint =
  | 'today_briefing'
  | 'listen_global'
  | 'category'
  | 'tag'
  | 'today_flow';

interface GlobalPlaybackController {
  startOrResumeAutomatic(input: {
    entryPoint: AutomaticEntryPoint;
    entryContextId?: string;
  }): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seekTo(positionSec: number): Promise<void>;
  previous(): Promise<void>;
  skipToNext(): Promise<void>;
  startManualReplay(contentItemId: string): Promise<void>;
  stopManualReplay(): Promise<void>;
}
```

- `previous`: current position이 3초보다 크면 현재 item의 0초로 간다. 3초 이하면 이전 automatic item은
  이미 completed/skipped이므로 비활성화하고, history의 manual replay로만 다시 듣는다.
- `next`/`skip`: UI label과 accessibility hint를 `다음으로 건너뛰기`로 명시한다. 이 action은 현재
  unheard/in_progress를 `skipped`로 transaction 처리한 뒤 snapshot의 다음 eligible item으로 이동한다.
- manual replay: 재생 중 automatic item을 pause/checkpoint하고 같은 singleton player를 사용한다. 별도
  mode로 play count/last played만 갱신하며 global active/session/position을 보존하고, 종료 뒤 automatic을
  자동 시작하지 않고 resume prompt를 복원한다.

## generated audio source

```text
public YouTube captions (temporary)
  -> DeepSeek Builder
  -> separate DeepSeek Verifier (>=9.0, no critical)
  -> Fish Audio
  -> exactly one private AudioAsset per ContentItem
  -> authorized /v1/audio-assets/:id/file Range stream
```

앱은 provider를 호출하지 않고 server secret/model/reference를 모른다. `AudioAsset.status='ready'`,
non-deleted, user `leo` authorization을 모두 만족해야 URL 대신 opaque audio ID를 받는다. 원본 YouTube
video/audio는 다운로드하거나 재생 source로 쓰지 않는다.

## failure/empty/recovery

- active audio load 실패: position/active를 유지하고 `다시 시도`; 다음 item으로 자동 skip하지 않는다.
- auth missing/expired: player를 시작하지 않고 Settings의 `서버 연결 코드` 안내.
- network offline: last durable state를 표시하고 server mutation을 outbox에 유지. audio cache를 새로 영구
  저장하지 않는다.
- snapshot eligible item 없음: `아직 준비된 브리핑이 없어요`와 Add 진입.
- server conflict: latest global state를 reload하고 동일 controller에서 reconcile; 두 audio를 동시에 틀지
  않는다.
- deleted/corrected audio: current source를 정지하고 latest allowed version 또는 다음 eligible item을
  명시적으로 선택한다.

## EventLog

`automatic_session_started`, `automatic_resume_started`, `audio_play_started`, `audio_paused`, `audio_seeked`,
`audio_completed`, `audio_skipped`, `automatic_item_advanced`, `manual_replay_started`,
`manual_replay_completed`, `playback_checkpoint_deferred`, `playback_conflict_reconciled`를 safe ID/status/time
metadata로만 남긴다. URL, caption, script, token, provider body는 payload에 없다.

## 구현 경계

- `src/audio/global-audio-controller.ts`
- `src/audio/global-playback-context.tsx`
- `src/audio/global-playback-machine.ts`
- `src/storage/device-db.ts`
- `src/storage/playback-journal.ts`
- `src/api/client.ts`, `src/api/contracts.ts`
- `src/app/(tabs)/index.tsx`, `src/app/briefing-session.tsx`, root provider
- 기존 `src/hooks/use-audio-player-controller.ts`의 screen-local ownership은 제거한다. 호출부를 한 번에
  옮기기 위해 남길 경우 root context를 읽는 compatibility facade만 허용하며 player를 만들 수 없다.

상세 server/API/schema/security/acceptance 정본은
[18_YouTube_Add_Global_Resume_MVP](18_YouTube_Add_Global_Resume_MVP.md)다.

## 구현/acceptance 체크리스트

- [ ] 모든 automatic entry point가 같은 active/session/revision 사용
- [ ] A 2:14 resume, D active-snapshot 제외와 cold-start 새 snapshot 포함
- [ ] completed/skipped가 Listen/Today/Category/Tag/Flow 모두에서 제외
- [ ] manual replay가 automatic state를 바꾸지 않음
- [ ] process exit/network loss/outbox conflict 뒤 position 복구
- [ ] 한 native player/listener만 존재하고 screen switch에서 중복 음성 없음
- [ ] background/lock-screen 실제 device 동작
- [ ] private generated AudioAsset만 재생; mock/sample acceptance 0
- [ ] current/total time, controls, errors, screen reader, reduce-motion 검증
