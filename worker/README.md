# Cloudflare realtime backend

The multiplayer backend lives in the Cloudflare Worker `juego-familia-ech`.

## Architecture

- Cloudflare Worker: HTTP API and WebSocket router.
- Durable Object `GameRoom`: one object per six-character room code.
- SQLite-backed Durable Object storage.
- WebSocket Hibernation API via `ctx.acceptWebSocket()`.
- Room expiration alarm: 12 hours.
- Query-string redaction enabled in observability because WebSocket credentials travel in the upgrade URL.

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

- `snapshot`: authoritative public room/game state.
- `error`: rejected command with a machine-readable code.

Client -> server:

- `sync`
- `ready`
- `start`
- `reveal`
- `skip-question`
- `next-turn`
- `finish`
- `leave`
- text `ping` -> text `pong`

Turn-mutating commands carry `expectedTurnNumber`; stale commands are rejected to prevent duplicate taps or delayed messages from advancing the game twice.

## Game state rules

- Minimum two players to start.
- Everyone must be connected and ready.
- Only the host starts/finishes the game.
- Current player or host can control the active turn.
- A question becomes public only after `reveal`.
- Skipped/used questions are not selected again during the same game.
- The deck ending automatically finishes the session.
- Explicit leave removes the player; host ownership is transferred when necessary.

## Production endpoint

`https://juego-familia-ech.socampoecheverry.workers.dev`

The frontend reads `NEXT_PUBLIC_GAME_API_URL` when present and otherwise uses the production Worker endpoint above.
