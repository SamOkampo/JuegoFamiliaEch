# Cloudflare realtime backend

The multiplayer backend lives in the Cloudflare Worker `juego-familia-ech`.

## Architecture

- Cloudflare Worker: HTTP API and WebSocket router.
- Durable Object `GameRoom`: one object per six-character room code.
- SQLite-backed Durable Object storage.
- WebSocket Hibernation API via `ctx.acceptWebSocket()`.
- Room expiration alarm: 12 hours.

## API

### Create a room

`POST /api/rooms`

Body:

```json
{ "name": "Samuel" }
```

### Join a room

`POST /api/rooms/:code/join`

Body:

```json
{ "name": "Andrea" }
```

Both endpoints return short-lived room credentials for that browser session. The player token must never be committed to the repository.

### Connect realtime

`GET /api/rooms/:code/ws?playerId=...&token=...` with a WebSocket upgrade.

Current socket events:

- server -> client: `snapshot`
- client -> server: `sync`
- client -> server: `leave`
- client -> server: text `ping` receives text `pong`

## Production endpoint

`https://juego-familia-ech.socampoecheverry.workers.dev`

The frontend reads `NEXT_PUBLIC_GAME_API_URL` when present and otherwise uses the production Worker endpoint above.
