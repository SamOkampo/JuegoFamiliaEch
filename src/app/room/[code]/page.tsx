"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildRoomWebSocketUrl,
  loadRoomSession,
  normalizeRoomCode,
  type RoomSession,
  type RoomSnapshot,
} from "@/lib/realtime";

type ConnectionState = "connecting" | "online" | "offline";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? "");
  const [session, setSession] = useState<RoomSession | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [connection, setConnection] =
    useState<ConnectionState>("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = loadRoomSession(code);
    setSession(saved);

    if (!saved) {
      setConnection("offline");
      setError(
        "Este navegador no tiene credenciales para la sala. Entra otra vez con el código.",
      );
      return;
    }

    let stopped = false;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;

    const connect = () => {
      if (stopped) return;
      setConnection("connecting");

      const ws = new WebSocket(buildRoomWebSocketUrl(saved));
      socket = ws;

      ws.onopen = () => {
        if (stopped) return;
        retryDelay = 1000;
        setConnection("online");
        setError("");
        ws.send(JSON.stringify({ type: "sync" }));
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const payload = JSON.parse(String(event.data)) as {
            type?: string;
            room?: RoomSnapshot;
            error?: string;
          };

          if (payload.type === "snapshot" && payload.room) {
            setRoom(payload.room);
          }
        } catch {
          // Ignore malformed frames and wait for the next snapshot.
        }
      };

      ws.onerror = () => {
        if (!stopped) {
          setConnection("offline");
        }
      };

      ws.onclose = () => {
        if (stopped) return;
        setConnection("offline");
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 8000);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close(1000, "page closed");
    };
  }, [code]);

  const me = useMemo(
    () => room?.players.find((player) => player.id === session?.playerId),
    [room, session],
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // The visible code can still be copied manually.
    }
  }

  if (error && !session) {
    return (
      <main className="shell">
        <section className="panel emptyRoom">
          <p className="eyebrow">SALA {code}</p>
          <h1>No pudimos reconectarte.</h1>
          <p className="lede">{error}</p>
          <Link className="button primary linkButton" href="/online">
            Entrar de nuevo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="shell roomShell">
      <header className="roomHeader">
        <div>
          <p className="eyebrow">SALA</p>
          <button className="roomCode" type="button" onClick={copyCode}>
            {code}
          </button>
          <p className="tapHint">Toca el código para copiarlo.</p>
        </div>

        <span className={"connectionBadge " + connection}>
          <span aria-hidden="true" />
          {connection === "online"
            ? "Conectado"
            : connection === "connecting"
              ? "Conectando"
              : "Reconectando"}
        </span>
      </header>

      <section className="panel lobbyPanel">
        <div className="lobbyIntro">
          <p className="eyebrow">LOBBY EN TIEMPO REAL</p>
          <h2>
            {me ? "Hola, " + me.name + "." : "Esperando tu conexión…"}
          </h2>
          <p className="muted">
            Pide a todos que entren a la misma sala. Verás aparecer sus nombres
            aquí en tiempo real.
          </p>
        </div>

        <div className="memberList" aria-live="polite">
          {room?.players.map((player, index) => (
            <div className="memberRow" key={player.id}>
              <span className={"presenceDot " + (player.connected ? "on" : "")} />
              <div className="memberIdentity">
                <strong>{player.name}</strong>
                <small>
                  {player.id === room.hostId
                    ? "Anfitrión"
                    : "Jugador " + (index + 1)}
                </small>
              </div>
              {player.id === session?.playerId ? (
                <span className="youPill">Tú</span>
              ) : null}
            </div>
          )) ?? <p className="muted">Conectando con la sala…</p>}
        </div>

        <div className="lobbyFooter">
          <strong>{room?.players.length ?? 0} conectados a la sala</strong>
          <p className="muted">
            En el siguiente bloque añadiremos “Listo”, inicio del host y el
            primer turno sincronizado.
          </p>
        </div>
      </section>

      <p className="backLink">
        <Link href="/online">← Salir al inicio multijugador</Link>
      </p>
    </main>
  );
}
