"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import {
  buildRoomWebSocketUrl,
  clearRoomSession,
  loadRoomSession,
  normalizeRoomCode,
  roomErrorMessage,
  sendRoomEvent,
  type RoomSession,
  type RoomSnapshot,
} from "@/lib/realtime";

type ConnectionState = "connecting" | "online" | "offline";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = normalizeRoomCode(params.code ?? "");
  const [session, setSession] = useState<RoomSession | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [connection, setConnection] =
    useState<ConnectionState>("connecting");
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

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
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;

    const connect = () => {
      if (stopped) return;
      setConnection("connecting");

      const ws = new WebSocket(buildRoomWebSocketUrl(saved));
      socketRef.current = ws;

      ws.onopen = () => {
        if (stopped) return;
        retryDelay = 1000;
        setConnection("online");
        setError("");
        sendRoomEvent(ws, { type: "sync" });
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
            setError("");
            return;
          }

          if (payload.type === "error" && payload.error) {
            setError(roomErrorMessage(payload.error));
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
        socketRef.current = null;
        setConnection("offline");
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 8000);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      socketRef.current?.close(1000, "page closed");
      socketRef.current = null;
    };
  }, [code]);

  const me = useMemo(
    () => room?.players.find((player) => player.id === session?.playerId),
    [room, session],
  );

  const currentPlayer = useMemo(
    () =>
      room?.game
        ? room.players.find((player) => player.id === room.game?.currentPlayerId)
        : undefined,
    [room],
  );

  const currentQuestion = useMemo(() => {
    if (!room?.game || QUESTIONS.length === 0) return undefined;
    return QUESTIONS[room.game.questionIndex % QUESTIONS.length];
  }, [room]);

  const isHost = Boolean(session && room && session.playerId === room.hostId);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // The visible code can still be copied manually.
    }
  }

  function toggleReady() {
    if (!me) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "ready",
      ready: !me.ready,
    });
    if (!sent) {
      setError("Todavía no estás conectado a la sala.");
    }
  }

  function startGame() {
    const sent = sendRoomEvent(socketRef.current, { type: "start" });
    if (!sent) {
      setError("Todavía no estás conectado a la sala.");
    }
  }

  function leaveRoom() {
    sendRoomEvent(socketRef.current, { type: "leave" });
    clearRoomSession(code);
    socketRef.current?.close(1000, "explicit leave");
    socketRef.current = null;
    router.push("/online");
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

      {error ? <p className="errorBanner">{error}</p> : null}

      {room?.status === "playing" && room.game ? (
        <section className="panel synchronizedGame">
          <div className="syncGameTop">
            <div>
              <p className="eyebrow">PARTIDA SINCRONIZADA · TURNO {room.game.turnNumber}</p>
              <h2>
                {currentPlayer?.id === session?.playerId
                  ? "Es tu turno."
                  : "Turno de " + (currentPlayer?.name ?? "otro jugador") + "."}
              </h2>
            </div>
            <span className="syncPill">En vivo</span>
          </div>

          <div className="syncedQuestionCard">
            <div className="cardMeta">
              <span>{currentQuestion?.category ?? "pregunta"}</span>
              <span>nivel {currentQuestion?.intensity ?? "—"}</span>
            </div>
            <p className="questionText">
              {currentQuestion?.text ?? "Preparando la pregunta…"}
            </p>
          </div>

          <p className="muted syncedNote">
            Todos los teléfonos de la sala reciben el mismo jugador y la misma
            pregunta desde Cloudflare. En el siguiente bloque añadiremos
            revelar, cambiar pregunta y pasar turno.
          </p>
        </section>
      ) : (
        <section className="panel lobbyPanel">
          <div className="lobbyIntro">
            <p className="eyebrow">LOBBY EN TIEMPO REAL</p>
            <h2>
              {me ? "Hola, " + me.name + "." : "Esperando tu conexión…"}
            </h2>
            <p className="muted">
              Cuando todos estén conectados, cada persona marca “Estoy listo”.
              El anfitrión podrá iniciar cuando el grupo completo esté listo.
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
                <span className={"readyPill " + (player.ready ? "isReady" : "")}>
                  {player.ready ? "Listo" : "No listo"}
                </span>
                {player.id === session?.playerId ? (
                  <span className="youPill">Tú</span>
                ) : null}
              </div>
            )) ?? <p className="muted">Conectando con la sala…</p>}
          </div>

          <div className="lobbyActions">
            <button
              type="button"
              className={"button " + (me?.ready ? "secondary" : "primary")}
              disabled={!me || connection !== "online"}
              onClick={toggleReady}
            >
              {me?.ready ? "Ya no estoy listo" : "Estoy listo"}
            </button>

            {isHost ? (
              <button
                type="button"
                className="button primary"
                disabled={!room?.canStart || connection !== "online"}
                onClick={startGame}
              >
                Iniciar partida
              </button>
            ) : (
              <p className="muted waitingHost">
                Esperando a que el anfitrión inicie.
              </p>
            )}
          </div>

          <div className="lobbyFooter">
            <strong>
              {room?.players.filter((player) => player.connected).length ?? 0} de{" "}
              {room?.players.length ?? 0} conectados
            </strong>
            <p className="muted">
              Para empezar se necesitan al menos 2 personas, todas conectadas y
              marcadas como listas.
            </p>
          </div>
        </section>
      )}

      <div className="backLink">
        <button type="button" className="textButton" onClick={leaveRoom}>
          ← Salir de la sala
        </button>
      </div>
    </main>
  );
}
