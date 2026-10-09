"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useResilientWebSocket } from "@/hooks/use-resilient-websocket";
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


export default function CentralDisplayPage() {
  const params = useParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? "");
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState("");
  const [displayToken, setDisplayToken] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token") ?? "";

    if (!token) {
      setError(
        "Esta pantalla necesita un enlace generado por el anfitrión de la sala.",
      );
      return;
    }

    setDisplayToken(token);
  }, []);

  function handleDisplaySocketMessage(event: MessageEvent) {
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
  }

  const displaySocketUrl = displayToken
    ? buildDisplayWebSocketUrl(code, displayToken)
    : null;
  const { connection } = useResilientWebSocket({
    url: displaySocketUrl,
    onReady: (socket) => {
      socket.send(JSON.stringify({ type: "sync" }));
    },
    onMessage: handleDisplaySocketMessage,
  });

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
            key={`${room.game.turnNumber}-${room.game.revealed ? room.game.questionIndex : "hidden"}`}
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
                <div className="displayReactionBar" aria-label="Reacciones">
                  <span className="reactionCount" key={"heart-"+room.game.currentReactions.heart}>❤️ {room.game.currentReactions.heart}</span>
                  <span className="reactionCount" key={"laugh-"+room.game.currentReactions.laugh}>😂 {room.game.currentReactions.laugh}</span>
                  <span className="reactionCount" key={"clap-"+room.game.currentReactions.clap}>👏 {room.game.currentReactions.clap}</span>
                  <span className="reactionCount" key={"wow-"+room.game.currentReactions.wow}>😮 {room.game.currentReactions.wow}</span>
                </div>
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
              <strong>{room.game.savedMoments.length}</strong>
              <span>momentos guardados</span>
            </div>
          </div>

          <div className="displayReactionBar displayReactionRecap">
            <span>❤️ {room.game.reactionTotals.heart}</span>
            <span>😂 {room.game.reactionTotals.laugh}</span>
            <span>👏 {room.game.reactionTotals.clap}</span>
            <span>😮 {room.game.reactionTotals.wow}</span>
          </div>

          {room.game.savedMoments.length > 0 ? (
            <div className="displaySavedMoments">
              {room.game.savedMoments.slice(0, 3).map((moment) => {
                const question = QUESTIONS[moment.questionIndex];
                const player = room.players.find(
                  (item) => item.id === moment.playerId,
                );

                return (
                  <article key={moment.turnNumber}>
                    <span>
                      Turno {moment.turnNumber} ·{" "}
                      {player?.name ?? "Alguien del grupo"}
                    </span>
                    <strong>
                      {question?.text ?? "Momento de la conversación"}
                    </strong>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className="displayFooter">
        Esta pantalla no puede controlar la partida.
      </footer>
    </main>
  );
}
