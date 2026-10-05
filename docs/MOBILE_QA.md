# Mobile / multi-device QA

Automated CI covers the protocol with two independent WebSocket clients against the deployed Cloudflare Worker, plus mobile UI checks in:

- WebKit using the Playwright iPhone 13 profile.
- Chromium using the Playwright Pixel 7 profile.

Before the production beta (Fase 10), run one short physical-device pass:

1. Open the hosted frontend on an iPhone using Safari.
2. Create a room, show the QR and scan it from an Android phone using Chrome.
3. Join with a different name.
4. Verify connected/listo state on both devices.
5. Start the game and verify both devices see the same turn.
6. Reveal a question and confirm it appears on both devices.
7. Enable haptics on Android and verify vibration when its turn arrives.
8. Open/close “Modo escuchar”.
9. Lock/unlock each phone once and confirm reconnection.
10. Finish the game and confirm recap on both devices.

This physical pass is a production-readiness check, not a substitute for CI.
