"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  GROUP_TYPE_LABELS,
  QUESTION_CATEGORY_LABELS,
  QUESTIONS,
} from "@/lib/questions";
import {
  buildDisplayWebSocketUrl,
  normalizeRoomCode,
  roomErrorMessage,
  type RoomSnapshot,
} from "@/lib/realtime";

type DisplayConnection = "connecting" | "online" | "offline";

export default function CentralDisplayPage() {
  const params = useParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? "");
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [connection, setConnection] =
    useState<DisplayConnection>("connecting");
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token") ?? "";

    if (!token) {
      setConnection("offline");
      setError(
        "Esta pantalla necesita un enlace generado por el anfitrión de la sala.",
      );
      return;
    }

    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;

    const connect = () => {
      if (stopped) return;
      setConnection("connecting");

      const ws = new WebSocket(buildDisplayWebSocketUrl(code, token));
      socketRef.current = ws;

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
            setError("");
            return;
          }

          if (payload.type === "error" && payload.error) {
            setError(roomErrorMessage(payload.error));
          }
        } catch {
          // Keep the last valid snapshot visible.
        }
      };

      ws.onerror = () => {
        if (!stopped) setConnection("offline");
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
      socketRef.current?.close(1000, "display closed");
      socketRef.current = null;
    };
  }, [code]);

  const currentPlayer = useMemo(
    () =>
      room?.game
        ? room.players.find((player) => player.id === room.game?.currentPlayerId)
        : undefined,
    [room],
  );

  const currentQuestion = useMemo(() => {
    if (
      !room?.game ||
      !room.game.revealed ||
      room.game.questionIndex === null
    ) {
      return undefined;
    }

    return QUESTIONS[room.game.questionIndex];
  }, [room]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen is optional; the display remains fully usable.
    }
  }

  if (error && !room) {
    return (
      <main className="centralDisplay centralDisplayError">
        <div className="displayErrorCard">
          <p className="displayKicker">PANTALLA CENTRAL</p>
          <h1>No pudimos abrir esta sala.</h1>
          <p>{error}</p>
          <p className="displaySmall">
            Vuelve al teléfono del anfitrión y genera un nuevo enlace de
            pantalla central.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="centralDisplay">
      <header className="displayTopbar">
        <div>
          <p className="displayKicker">PANTALLA CENTRAL · SOLO LECTURA</p>
          <strong className="displayRoomCode">{code}</strong>
        </div>

        <div className="displayTopActions">
          <span className={"displayConnection " + connection} role="status">
            <span aria-hidden="true" />
            {connection === "online"
              ? "En vivo"
              : connection === "connecting"
                ? "Conectando"
                : "Reconectando"}
          </span>
          <button
            type="button"
            className="displayFullscreenButton"
            onClick={toggleFullscreen}
          >
            Pantalla completa
          </button>
        </div>
      </header>

      {error ? <p className="displayInlineError">{error}</p> : null}

      {!room ? (
        <section className="displayCenter">
          <p className="displayEyebrow">CONECTANDO</p>
          <h1>Preparando la sala…</h1>
        </section>
      ) : room.status === "lobby" ? (
        <section className="displayLobby">
          <div className="displayHeroBlock">
            <p className="displayEyebrow">ENTREN A LA SALA</p>
            <h1>{code}</h1>
            <p>
              {GROUP_TYPE_LABELS[room.settings.groupType]} ·{" "}
              {room.players.filter((player) => player.ready).length} de{" "}
              {room.players.length} listos
            </p>
          </div>

          <div className="displayPlayerGrid">
            {room.players.map((player) => (
              <div className="displayPlayer" key={player.id}>
                <span
                  className={
                    "displayPresence " + (player.connected ? "online" : "")
                  }
                  aria-hidden="true"
                />
                <strong>{player.name}</strong>
                <span>{player.ready ? "Listo" : "Preparándose"}</span>
              </div>
            ))}
          </div>
        </section>
      ) : room.status === "playing" && room.game ? (
        <section className="displayGame">
          <div className="displayTurn">
            <p className="displayEyebrow">
              TURNO {room.game.turnNumber}
            </p>
            <h1>{currentPlayer?.name ?? "Siguiente persona"}</h1>
          </div>

          <div
            className={
              "displayQuestion " + (room.game.revealed ? "revealed" : "hidden")
            }
          >
            {room.game.revealed && currentQuestion ? (
              <>
                <p className="displayQuestionMeta">
                  {QUESTION_CATEGORY_LABELS[currentQuestion.category]} · nivel{" "}
                  {currentQuestion.intensity}
                </p>
                <p className="displayQuestionText">{currentQuestion.text}</p>
                <p className="displayListen">
                  Dejen los teléfonos. Escuchen la historia.
                </p>
              </>
            ) : (
              <>
                <p className="displayQuestionMeta">PREGUNTA OCULTA</p>
                <p className="displayQuestionText">
                  Esperando a que {currentPlayer?.name ?? "la persona del turno"}{" "}
                  revele la pregunta.
                </p>
              </>
            )}
          </div>
        </section>
      ) : room.status === "finished" && room.game ? (
        <section className="displayCenter displayFinished">
          <p className="displayEyebrow">RONDA TERMINADA</p>
          <h1>Gracias por conversar.</h1>
          <div className="displayRecap">
            <div>
              <strong>{room.players.length}</strong>
              <span>personas</span>
            </div>
            <div>
              <strong>{room.game.turnNumber}</strong>
              <span>turnos</span>
            </div>
            <div>
              <strong>{room.game.usedQuestionCount}</strong>
              <span>preguntas</span>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="displayFooter">
        Esta pantalla no puede controlar la partida.
      </footer>
    </main>
  );
}
