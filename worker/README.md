# Cloudflare realtime backend

The multiplayer backend lives in the Cloudflare Worker `juego-familia-ech`.

## Architecture

- Cloudflare Worker: HTTP API and WebSocket router.
- Durable Object `GameRoom`: one object per six-character room code.
- SQLite-backed Durable Object storage.
- WebSocket Hibernation API via `ctx.acceptWebSocket()`.
- Room expiration alarm: 12 hours.
- Query-string redaction enabled in observability because WebSocket credentials travel in the upgrade URL.
- Question deck version: `core-v2-160`.

## HTTP API

### Create a room

`POST /api/rooms`

```json
{ "name": "Samuel" }
```

### Join a room

`POST /api/rooms/:code/join`

```json
{ "name": "Andrea" }
```

Both endpoints return browser-session room credentials. Player tokens must never be committed to the repository or logged.

### Connect realtime

`GET /api/rooms/:code/ws?playerId=...&token=...` with a WebSocket upgrade.

## WebSocket protocol

Server -> client:

- `snapshot`: authoritative public room/game state, including synchronized content filters.
- `error`: rejected command with a machine-readable code.

Client -> server (player socket):

- `sync`
- `display-token` — host-only; returns the read-only central-display token.
- `ready`
- `settings` — host-only lobby filters: group type, youngest age and maximum intensity.
- `start` — includes `deckVersion` and a validated array of eligible question indexes.
- `reveal`
- `skip-question`
- `next-turn`
- `finish`
- `leave`
- text `ping` -> text `pong`

Turn-mutating commands carry `expectedTurnNumber`; stale commands are rejected to prevent duplicate taps or delayed messages from advancing the game twice.

## Content synchronization

The browser owns the editorial catalog and computes a question pool from the synchronized room settings. The host sends that pool with `QUESTION_DECK_VERSION` when starting.

The Worker validates that:

- the client deck version is `core-v2-160`;
- all indexes are integers between 0 and 159;
- the pool is unique and contains at least two questions.

The Worker then stores the pool in the Durable Object and chooses only from unused entries. Existing `core-v1` ephemeral rooms are normalized during the transition so a Worker deployment does not crash active rooms.

## Game state rules

- Minimum two players to start.
- Everyone must be connected and ready.
- Only the host changes content settings and starts/finishes the game.
- Changing content filters resets everyone's ready state.
- Current player or host can control the active turn.
- A question becomes public only after `reveal`.
- Skipped/used questions are not selected again during the same game.
- The filtered deck ending automatically finishes the session.
- Explicit leave removes the player; host ownership is transferred when necessary.

## Production endpoint

`https://juego-familia-ech.socampoecheverry.workers.dev`

The frontend reads `NEXT_PUBLIC_GAME_API_URL` when present and otherwise uses the production Worker endpoint above.


## Central display

The central display uses a separate WebSocket endpoint:

`GET /api/rooms/:code/display/ws?token=...`

The frontend receives the token only after the authenticated current host sends `display-token`. The shareable frontend URL stores that token in the URL fragment:

`/display/:code#token=...`

Fragments are not included in normal HTTP requests to the frontend server. The display client then uses the token only for the Cloudflare WebSocket upgrade; Worker observability has query-string redaction enabled.

Display sockets:

- receive the same public `snapshot` broadcasts as players;
- may send only `sync` and text `ping`;
- receive `DISPLAY_READ_ONLY` for game-mutating commands;
- have no `playerId`;
- never affect player presence, readiness, host transfer or turns.


## Reactions and ephemeral memories

Phase 7 keeps conversation memories inside the room Durable Object only.

Player commands:

- `react` with one of `heart`, `laugh`, `clap`, `wow`, or `null` to clear.
- `save-moment` with an explicit boolean `saved`.

Rules:

- reactions and saves are accepted only after the current question is revealed;
- both carry `expectedTurnNumber` to reject stale interactions;
- one reaction per player per turn is stored;
- saved moments keep only turn number, current player ID, question index, saver IDs and timestamp;
- public snapshots expose aggregate reaction counts and only the number of people who saved a moment;
- no answer text, audio, photo or video is captured;
- all of this data is deleted with the room when its 12-hour Durable Object alarm expires.

The central display receives aggregates in the normal public snapshot but remains read-only.


## Phase 9 security boundary

The Worker treats every browser as untrusted.

Input limits:

- HTTP bodies: JSON objects only, maximum 4 KiB.
- WebSocket application frames: maximum 2 KiB.
- Player names: normalized, 1–24 characters, invisible control/BiDi characters rejected.
- Event types, booleans, settings, turn numbers, reactions and question pools are validated before game logic.

Rate limits are enforced by a separate SQLite-backed Durable Object binding named `RATE_LIMITS`. Network identifiers are SHA-256 hashed before choosing the limiter object; plaintext IP addresses are not written to application storage. Limiter storage is deleted after 20 minutes of inactivity.

Authenticated room state and player WebSockets require both `playerId` and the opaque player token. Room codes are locators, not credentials. Display tokens remain independent and read-only.

See `docs/SECURITY_AUDIT.md` for the authorization matrix and abuse review.


## Phase 10 product analytics

The production Worker can bind `PRODUCT_ANALYTICS` to the Workers Analytics Engine dataset `juego_familia_ech_product`.

Server-side events:

- `room_created`;
- `player_joined`;
- `game_started`;
- `game_finished`.

The data point schema deliberately excludes room codes, names, player IDs, tokens and response content.

The public `POST /api/telemetry` endpoint accepts only a closed allowlist of coarse client events/surfaces and uses the existing HTTP rate limiter. It does not accept arbitrary messages or stacks.
