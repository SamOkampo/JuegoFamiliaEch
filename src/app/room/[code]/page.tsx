"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { SpecialRoundCard } from "@/components/special-round-card";
import { SPECIAL_KINDS, SPECIAL_LABELS, type SpecialKind } from "@/lib/special-rounds";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useResilientWebSocket } from "@/hooks/use-resilient-websocket";
import {
  getQuestionPoolIndexes,
  GROUP_TYPE_LABELS,
  QUESTION_DECK_VERSION,
  QUESTIONS,
  type AgeBand,
  type GroupType,
  type QuestionIntensity,
} from "@/lib/questions";
import {
  buildRoomWebSocketUrl,
  clearRoomSession,
  loadRoomSession,
  normalizeRoomCode,
  roomErrorMessage,
  sendRoomEvent,
  type ReactionType,
  type PrivatePlayerState,
  type RoomSession,
  type RoomSnapshot,
  type RoomSettings,
} from "@/lib/realtime";
import {
  buildCentralDisplayUrl,
  buildRoomInviteUrl,
  buildRoomShareText,
  HAPTICS_STORAGE_KEY,
} from "@/lib/presential";


const AGE_LABELS: Record<AgeBand, string> = {
  8: "8–11 años",
  12: "12–15 años",
  16: "16+ años",
};

const INTENSITY_LABELS: Record<QuestionIntensity, string> = {
  1: "Ligero",
  2: "Conectar",
  3: "Profundo",
};

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = normalizeRoomCode(params.code ?? "");
  const [session, setSession] = useState<RoomSession | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<RoomSettings | null>(null);
  const settingsDraftRef = useRef<RoomSettings | null>(null);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState("");
  const [hapticsEnabled, setHapticsEnabled] = useState(false);
  const [listenMode, setListenMode] = useState(false);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [momentSaved, setMomentSaved] = useState(false);
  const [mySpecialChoice, setMySpecialChoice] = useState<string | null>(null);
  const [specialContributed, setSpecialContributed] = useState(false);
  const [chosenSpecial, setChosenSpecial] = useState<SpecialKind>("likely");
  const [displayUrl, setDisplayUrl] = useState("");
  const [displayFeedback, setDisplayFeedback] = useState("");
  const turnSignatureRef = useRef<string | null>(null);
  const personalStateRef = useRef<PrivatePlayerState | null>(null);

  useEffect(() => {
    const saved = loadRoomSession(code);
    setSession(saved);

    if (!saved) {
      setError(
        "Este navegador no tiene credenciales para la sala. Entra otra vez con el código.",
      );
    }
  }, [code]);

  function handleRoomSocketMessage(event: MessageEvent) {
    try {
      const payload = JSON.parse(String(event.data)) as {
        type?: string;
        room?: RoomSnapshot;
        error?: string;
        token?: string;
        reaction?: ReactionType | null;
        saved?: boolean;
        turnNumber?: number;
        choice?: string;
        specialChoice?: string | null;
        contributed?: boolean;
      };

      if (payload.type === "private-state") {
        const privateState = payload as PrivatePlayerState & { type: "private-state" };
        personalStateRef.current = privateState;
        if (privateState.turnNumber !== null) {
          setMyReaction(privateState.reaction);
          setMomentSaved(privateState.saved);
          setMySpecialChoice(privateState.specialChoice);
          setSpecialContributed(privateState.contributed);
        }
        return;
      }

      if (payload.type === "snapshot" && payload.room) {
        setRoom(payload.room);
        if (
          settingsDraftRef.current &&
          JSON.stringify(payload.room.settings) ===
            JSON.stringify(settingsDraftRef.current)
        ) {
          settingsDraftRef.current = null;
          setSettingsDraft(null);
        }
        setError("");
        return;
      }

      if (
        payload.type === "reaction-set" &&
        typeof payload.turnNumber === "number"
      ) {
        setMyReaction(payload.reaction ?? null);
        return;
      }

      if (
        payload.type === "moment-saved" &&
        typeof payload.turnNumber === "number"
      ) {
        setMomentSaved(Boolean(payload.saved));
        return;
      }

      if (payload.type === "special-vote-set" && payload.choice) {
        setMySpecialChoice(payload.choice);
        return;
      }
      if (payload.type === "special-contributed") {
        setSpecialContributed(true);
        return;
      }

      if (payload.type === "display-token" && payload.token) {
        setDisplayUrl(
          buildCentralDisplayUrl(window.location.origin, code, payload.token),
        );
        setDisplayFeedback(
          "Pantalla central preparada. Puedes abrirla o copiar su enlace.",
        );
        return;
      }

      if (payload.type === "error" && payload.error) {
        settingsDraftRef.current = null;
        setSettingsDraft(null);
        setError(roomErrorMessage(payload.error));
      }
    } catch {
      // Keep the last valid room snapshot if a frame is malformed.
    }
  }

  const roomSocketUrl = session ? buildRoomWebSocketUrl(session) : null;
  const { socketRef, connection } = useResilientWebSocket({
    url: roomSocketUrl,
    onReady: (socket) => {
      sendRoomEvent(socket, { type: "sync" });
    },
    onMessage: handleRoomSocketMessage,
  });

  useEffect(() => {
    setInviteUrl(buildRoomInviteUrl(window.location.origin, code));
    setHapticsEnabled(
      window.localStorage.getItem(HAPTICS_STORAGE_KEY) === "true",
    );
  }, [code]);

  useEffect(() => {
    if (!inviteUrl) return;

    let active = true;
    void QRCode.toDataURL(inviteUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });

    return () => {
      active = false;
    };
  }, [inviteUrl]);

  useEffect(() => {
    if (!room?.game || room.status !== "playing") {
      turnSignatureRef.current = null;
      return;
    }

    const signature =
      room.game.turnNumber + ":" + room.game.currentPlayerId;
    if (turnSignatureRef.current === signature) return;

    turnSignatureRef.current = signature;
    setListenMode(false);
    const prior = personalStateRef.current;
    const sameTurn = prior?.turnNumber === room.game.turnNumber;
    setMyReaction(sameTurn ? prior.reaction : null);
    setMomentSaved(sameTurn ? prior.saved : false);
    setMySpecialChoice(sameTurn ? prior.specialChoice : null);
    setSpecialContributed(sameTurn ? prior.contributed : false);

    if (
      hapticsEnabled &&
      room.game.currentPlayerId === session?.playerId
    ) {
      navigator.vibrate?.([90, 60, 90]);
    }
  }, [
    hapticsEnabled,
    room?.game?.currentPlayerId,
    room?.game?.turnNumber,
    room?.status,
    session?.playerId,
  ]);

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
    if (
      !room?.game ||
      !room.game.revealed ||
      room.game.questionIndex === null ||
      QUESTIONS.length === 0
    ) {
      return undefined;
    }
    return QUESTIONS[room.game.questionIndex % QUESTIONS.length];
  }, [room]);

  const questionPool = useMemo(
    () =>
      room
        ? getQuestionPoolIndexes(QUESTIONS, room.settings)
        : [],
    [room],
  );

  const isHost = Boolean(session && room && session.playerId === room.hostId);
  const canControlTurn = Boolean(
    session &&
      room?.game &&
      (session.playerId === room.game.currentPlayerId || isHost),
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setInviteFeedback("Código copiado.");
    } catch {
      setInviteFeedback("No pudimos copiarlo automáticamente.");
    }
  }

  async function shareInvite() {
    if (!inviteUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Únete a mi sala",
          text: buildRoomShareText(code),
          url: inviteUrl,
        });
        setInviteFeedback("Invitación compartida.");
        return;
      }

      await navigator.clipboard.writeText(inviteUrl);
      setInviteFeedback("Enlace copiado.");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setInviteFeedback("No pudimos compartir. Copia el código manualmente.");
    }
  }

  function toggleHaptics() {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    window.localStorage.setItem(HAPTICS_STORAGE_KEY, String(next));
    if (next) navigator.vibrate?.(45);
  }

  function requestDisplay() {
    const sent = sendRoomEvent(socketRef.current, { type: "display-token" });
    if (!sent) {
      setDisplayFeedback("Todavía no estás conectado a la sala.");
    } else {
      setDisplayFeedback("Preparando enlace seguro…");
    }
  }

  async function copyDisplayUrl() {
    if (!displayUrl) return;

    try {
      await navigator.clipboard.writeText(displayUrl);
      setDisplayFeedback("Enlace de pantalla copiado.");
    } catch {
      setDisplayFeedback("No pudimos copiar el enlace automáticamente.");
    }
  }

  function toggleReady() {
    if (!me) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "ready",
      ready: !me.ready,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function updateRoomSettings(patch: Partial<RoomSettings>) {
    if (!room || !isHost) return;

    const settings = {
      ...(settingsDraftRef.current ?? room.settings),
      ...patch,
    };
    const sent = sendRoomEvent(socketRef.current, {
      type: "settings",
      settings,
    });

    if (sent) {
      settingsDraftRef.current = settings;
      setSettingsDraft(settings);
    } else {
      settingsDraftRef.current = null;
      setSettingsDraft(null);
      setError("Todavía no estás conectado a la sala.");
    }
  }

  function startGame() {
    if (!room) return;

    const pool = getQuestionPoolIndexes(QUESTIONS, room.settings);
    if (pool.length < 2) {
      setError("Los filtros dejaron muy pocas preguntas. Ajusta la ronda.");
      return;
    }

    const sent = sendRoomEvent(socketRef.current, {
      type: "start",
      deckVersion: QUESTION_DECK_VERSION,
      questionPool: pool,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function launchSpecial(kind: SpecialKind) {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "special-now",
      kind,
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function voteSpecial(choice: string) {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "special-vote",
      choice,
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function revealSpecial() {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "special-reveal",
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function contributeSpecial() {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "special-contribute",
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function revealQuestion() {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "reveal",
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function skipQuestion() {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "skip-question",
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function nextTurn() {
    if (!room?.game) return;
    const sent = sendRoomEvent(socketRef.current, {
      type: "next-turn",
      expectedTurnNumber: room.game.turnNumber,
    });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function reactToMoment(reaction: ReactionType) {
    if (!room?.game || !room.game.revealed) return;

    const nextReaction = myReaction === reaction ? null : reaction;
    const sent = sendRoomEvent(socketRef.current, {
      type: "react",
      reaction: nextReaction,
      expectedTurnNumber: room.game.turnNumber,
    });

    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function toggleSavedMoment() {
    if (!room?.game || !room.game.revealed) return;

    const sent = sendRoomEvent(socketRef.current, {
      type: "save-moment",
      saved: !momentSaved,
      expectedTurnNumber: room.game.turnNumber,
    });

    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function finishGame() {
    const sent = sendRoomEvent(socketRef.current, { type: "finish" });
    if (!sent) setError("Todavía no estás conectado a la sala.");
  }

  function playAgain() {
    const sent = sendRoomEvent(socketRef.current, { type: "play-again" });
    if (!sent) setError("Todavía no estás conectado a la sala.");
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
      <main className="shell" id="main-content">
        <section className="panel emptyRoom">
          <p className="eyebrow">SALA {code}</p>
          <h1>No pudimos reconectarte.</h1>
          <p className="lede">{error}</p>
          <Link className="button primary linkButton" href={"/online?room=" + code}>
            Entrar de nuevo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="shell roomShell" id="main-content">
      <header className="roomHeader">
        <div>
          <p className="eyebrow">SALA</p>
          <button
            className="roomCode"
            type="button"
            onClick={copyCode}
            aria-label={"Copiar código de sala " + code}
          >
            {code}
          </button>
          <p className="tapHint">Toca el código para copiarlo.</p>
        </div>

        <div className="roomUtilities">
          <span
            className={"connectionBadge " + connection}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true" />
            {connection === "online"
              ? "Conectado"
              : connection === "connecting"
                ? "Conectando"
                : "Reconectando"}
          </span>

          <button
            type="button"
            className={"hapticToggle " + (hapticsEnabled ? "enabled" : "")}
            onClick={toggleHaptics}
            aria-pressed={hapticsEnabled}
          >
            {hapticsEnabled ? "Vibración activada" : "Activar vibración"}
          </button>
        </div>
      </header>

      {error ? (
        <p className="errorBanner" role="alert">
          {error}
        </p>
      ) : null}

      {room?.status === "finished" && room.game ? (
        <section className="panel synchronizedGame">
          <div className="syncGameTop">
            <div>
              <p className="eyebrow">RONDA TERMINADA</p>
              <h2>Gracias por sentarse a conversar.</h2>
            </div>
            <span className="syncPill">Completada</span>
          </div>

          <div className="recapGrid">
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

          {room.game.specialHistory.length > 0 ? (
            <p className="specialRecapCount">🎲 {room.game.specialHistory.length} rondas sorpresa compartidas</p>
          ) : null}

          <section className="reactionRecap" aria-label="Reacciones de la ronda">
            <span>❤️ {room.game.reactionTotals.heart}</span>
            <span>😂 {room.game.reactionTotals.laugh}</span>
            <span>👏 {room.game.reactionTotals.clap}</span>
            <span>😮 {room.game.reactionTotals.wow}</span>
          </section>

          {room.game.savedMoments.length > 0 ? (
            <section className="savedMomentsRecap">
              <p className="eyebrow">LA HUELLA DE ESTA RONDA</p>
              <div className="savedMomentList">
                {room.game.savedMoments.map((moment) => {
                  const savedQuestion = QUESTIONS[moment.questionIndex];
                  const savedPlayer = room.players.find(
                    (player) => player.id === moment.playerId,
                  );

                  return (
                    <article
                      className="savedMomentCard"
                      key={moment.turnNumber}
                    >
                      <span>
                        Turno {moment.turnNumber} ·{" "}
                        {savedPlayer?.name ?? "Alguien del grupo"}
                      </span>
                      <strong>
                        {savedQuestion?.text ?? "Momento de la conversación"}
                      </strong>
                      <small>
                        Guardado por {moment.savedCount}{" "}
                        {moment.savedCount === 1 ? "persona" : "personas"}
                      </small>
                    </article>
                  );
                })}
              </div>
              <p className="retentionNote">
                Estos recuerdos solo guardan la pregunta y el turno. No
                grabamos audio, fotos ni lo que alguien respondió.
              </p>
            </section>
          ) : null}

          <p className="muted syncedNote">
            {room.game.finishReason === "deck-complete"
              ? "El mazo de esta versión llegó a su final."
              : "El anfitrión decidió cerrar la ronda."}
          </p>

          {isHost ? (
            <button type="button" className="button primary wide" onClick={playAgain}>
              ↻ Jugar otra ronda en esta sala
            </button>
          ) : (
            <p className="muted syncedNote" role="status">
              ¿Otra ronda? El anfitrión puede reunirlos de nuevo sin cambiar el código.
            </p>
          )}
          <button type="button" className="button secondary wide" onClick={leaveRoom}>
            Salir de la sala
          </button>
        </section>
      ) : room?.status === "playing" && room.game ? (
        <section className="panel synchronizedGame">
          <div className="syncGameTop">
            <div>
              <p className="eyebrow">
                PARTIDA EN VIVO · TURNO {room.game.turnNumber}
              </p>
              <h2>
                {currentPlayer?.id === session?.playerId
                  ? "Es tu turno."
                  : "Turno de " + (currentPlayer?.name ?? "otro jugador") + "."}
              </h2>
            </div>
            <span className="syncPill">En vivo</span>
          </div>

          {room.game.special ? (
            <SpecialRoundCard
              key={room.game.turnNumber}
              special={room.game.special}
              players={room.players}
              isHost={isHost}
              myChoice={mySpecialChoice}
              contributed={specialContributed}
              onVote={voteSpecial}
              onReveal={revealSpecial}
              onContribute={contributeSpecial}
            />
          ) : (
          <div
            key={`${room.game.turnNumber}-${room.game.revealed ? room.game.questionIndex : "hidden"}`}
            className={
              "syncedQuestionCard " + (room.game.revealed ? "revealed" : "")
            }
          >
            {room.game.revealed ? (
              <>
                <div className="cardMeta">
                  <span>{currentQuestion?.category ?? "pregunta"}</span>
                  <span>nivel {currentQuestion?.intensity ?? "—"}</span>
                </div>
                <p className="questionText">
                  {currentQuestion?.text ?? "Preparando la pregunta…"}
                </p>
                <p className="listenHint">
                  Ahora dejen el teléfono y escuchen la historia.
                </p>
                <button
                  type="button"
                  className="button secondary listenModeButton"
                  onClick={() => setListenMode(true)}
                >
                  Modo escuchar
                </button>
              </>
            ) : (
              <>
                <div className="cardMeta">
                  <span>pregunta oculta</span>
                  <span>
                    {room.game.usedQuestionCount} de {room.game.questionPoolSize}
                  </span>
                </div>
                <p className="hiddenPrompt">
                  {canControlTurn
                    ? "Cuando estén listos, revela la pregunta para todo el grupo."
                    : "Esperando a que la persona del turno revele la pregunta."}
                </p>
                {canControlTurn ? (
                  <button
                    type="button"
                    className="button primary"
                    onClick={revealQuestion}
                  >
                    Revelar pregunta
                  </button>
                ) : null}
              </>
            )}
          </div>
          )}

          {room.game.revealed && !room.game.special ? (
            <section className="momentActions" aria-label="Reacciones y recuerdos">
              <div className="reactionBar">
                <button
                  type="button"
                  className={"reactionButton " + (myReaction === "heart" ? "selected" : "")}
                  aria-pressed={myReaction === "heart"}
                  onClick={() => reactToMoment("heart")}
                >
                  ❤️ <span className="reactionCount" key={room.game.currentReactions.heart}>{room.game.currentReactions.heart}</span>
                </button>
                <button
                  type="button"
                  className={"reactionButton " + (myReaction === "laugh" ? "selected" : "")}
                  aria-pressed={myReaction === "laugh"}
                  onClick={() => reactToMoment("laugh")}
                >
                  😂 <span className="reactionCount" key={room.game.currentReactions.laugh}>{room.game.currentReactions.laugh}</span>
                </button>
                <button
                  type="button"
                  className={"reactionButton " + (myReaction === "clap" ? "selected" : "")}
                  aria-pressed={myReaction === "clap"}
                  onClick={() => reactToMoment("clap")}
                >
                  👏 <span className="reactionCount" key={room.game.currentReactions.clap}>{room.game.currentReactions.clap}</span>
                </button>
                <button
                  type="button"
                  className={"reactionButton " + (myReaction === "wow" ? "selected" : "")}
                  aria-pressed={myReaction === "wow"}
                  onClick={() => reactToMoment("wow")}
                >
                  😮 <span className="reactionCount" key={room.game.currentReactions.wow}>{room.game.currentReactions.wow}</span>
                </button>
              </div>

              <button
                type="button"
                className={"saveMomentButton " + (momentSaved ? "saved" : "")}
                aria-pressed={momentSaved}
                onClick={toggleSavedMoment}
              >
                {momentSaved ? "✓ Momento guardado" : "Guardar este momento"}
              </button>

              <p className="momentPrivacy">
                Guardar solo conserva la pregunta, el turno y cuántas personas
                quisieron recordarlo. No graba la conversación.
              </p>
            </section>
          ) : null}

          {canControlTurn ? (
            <div className="gameActionGrid">
              {!room.game.special ? (
              <button
                type="button"
                className="button secondary"
                onClick={skipQuestion}
              >
                Cambiar pregunta
              </button>
              ) : null}
              <button
                type="button"
                className="button primary"
                disabled={!room.game.revealed && !room.game.special}
                onClick={nextTurn}
              >
                {room.game.special ? "Continuar · siguiente persona" : "Siguiente persona"}
              </button>
            </div>
          ) : (
            <p className="muted syncedNote">
              Escucha la respuesta. Los controles de turno aparecen en el
              teléfono de la persona que está jugando.
            </p>
          )}

          {isHost && !room.game.revealed && !room.game.special && room.settings.specialModes.length > 0 ? (
            <div className="specialManual">
              <label htmlFor="special-mode-select">Sorpresa adicional</label>
              <select
                id="special-mode-select"
                value={room.settings.specialModes.includes(chosenSpecial) ? chosenSpecial : room.settings.specialModes[0]}
                onChange={(event) => setChosenSpecial(event.target.value as SpecialKind)}
              >
                {room.settings.specialModes.map((kind) => (
                  <option key={kind} value={kind}>{SPECIAL_LABELS[kind]}</option>
                ))}
              </select>
              <button
                type="button"
                className="button secondary"
                onClick={() => launchSpecial(room.settings.specialModes.includes(chosenSpecial) ? chosenSpecial : room.settings.specialModes[0])}
              >
                🎲 Lanzar sorpresa ahora
              </button>
            </div>
          ) : null}

          {isHost ? (
            <button
              type="button"
              className="textButton dangerTextButton"
              onClick={finishGame}
            >
              Terminar partida
            </button>
          ) : null}
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

          <section className="contentSettings" aria-label="Configurar preguntas">
            <div>
              <p className="eyebrow">TIPO DE RONDA</p>
              <strong>El mazo se adapta al grupo antes de empezar.</strong>
              <p className="muted">
                Si el anfitrión cambia un filtro, todos vuelven a “No listo”
                para confirmar la nueva ronda.
              </p>
            </div>

            {room ? (
              isHost ? (
                <div className="filterGrid">
                  <label>
                    Grupo
                    <select
                      value={room.settings.groupType}
                      onChange={(event) =>
                        updateRoomSettings({
                          groupType: event.target.value as GroupType,
                        })
                      }
                    >
                      {(
                        Object.entries(GROUP_TYPE_LABELS) as Array<
                          [GroupType, string]
                        >
                      ).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Persona más joven
                    <select
                      value={room.settings.youngestAge}
                      onChange={(event) =>
                        updateRoomSettings({
                          youngestAge: Number(event.target.value) as AgeBand,
                        })
                      }
                    >
                      {(
                        Object.entries(AGE_LABELS) as Array<[string, string]>
                      ).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Profundidad máxima
                    <select
                      value={room.settings.maxIntensity}
                      onChange={(event) =>
                        updateRoomSettings({
                          maxIntensity: Number(
                            event.target.value,
                          ) as QuestionIntensity,
                        })
                      }
                    >
                      {(
                        Object.entries(INTENSITY_LABELS) as Array<
                          [string, string]
                        >
                      ).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <p className="filterSummary">
                  {GROUP_TYPE_LABELS[room.settings.groupType]} ·{" "}
                  {AGE_LABELS[room.settings.youngestAge]} · hasta{" "}
                  {INTENSITY_LABELS[room.settings.maxIntensity]}
                </p>
              )
            ) : null}

            <p className="poolCount" role="status">
              <strong>{questionPool.length}</strong> preguntas disponibles con
              estos filtros.
            </p>
          </section>

          {room ? (
            <section className="contentSettings specialSettings" aria-label="Rondas especiales">
              <div>
                <p className="eyebrow">RONDA SORPRESA</p>
                <strong>Cinco maneras de romper la rutina.</strong>
                <p className="muted">
                  Votaciones secretas, decisiones de todo el grupo, retos opcionales, recuerdos en cadena y cartas doradas.
                </p>
              </div>
              {isHost ? (
                <>
                  <label className="specialSchedule">
                    Frecuencia
                    <select
                      value={settingsDraft?.specialEvery ?? room.settings.specialEvery}
                      onChange={(event) => updateRoomSettings({ specialEvery: Number(event.target.value) as 0 | 3 })}
                    >
                      <option value={3}>Sorpresa automática cada 3 turnos</option>
                      <option value={0}>Solo sorpresas manuales</option>
                    </select>
                  </label>
                  <div className="specialModeGrid">
                    {SPECIAL_KINDS.map((kind) => (
                      <label className="specialToggle" key={kind}>
                        <input
                          type="checkbox"
                          checked={(settingsDraft?.specialModes ?? room.settings.specialModes).includes(kind)}
                          onChange={(event) => {
                            const selectedModes = settingsDraftRef.current?.specialModes ?? room.settings.specialModes;
                            const modes = event.target.checked
                              ? SPECIAL_KINDS.filter((item) => selectedModes.includes(item) || item === kind)
                              : selectedModes.filter((item) => item !== kind);
                            updateRoomSettings({ specialModes: [...modes] });
                          }}
                        />
                        <span>{SPECIAL_LABELS[kind]}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <p className="filterSummary">
                  {room.settings.specialModes.length === 0
                    ? "Sin rondas especiales"
                    : room.settings.specialModes.map((kind) => SPECIAL_LABELS[kind]).join(" · ")}
                  {" · "}
                  {room.settings.specialEvery === 3 ? "Cada 3 turnos" : "Manual"}
                </p>
              )}
              <p className="momentPrivacy">
                Todas las rondas se pueden omitir. Los votos solo se muestran cuando el anfitrión revela los resultados.
              </p>
            </section>
          ) : null}

          <section className="invitePanel" aria-label="Invitar personas">
            <div>
              <p className="eyebrow">INVITAR</p>
              <strong>Comparte el código o deja que escaneen el QR.</strong>
              <p className="muted inviteUrlText">{inviteUrl}</p>
            </div>

            <div className="inviteActions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setShowInvite((current) => !current)}
                aria-expanded={showInvite}
              >
                {showInvite ? "Ocultar QR" : "Mostrar QR"}
              </button>
              <button
                type="button"
                className="button primary"
                onClick={shareInvite}
              >
                Compartir invitación
              </button>
            </div>

            {showInvite ? (
              <div className="qrWrap">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    width={240}
                    height={240}
                    alt={"Código QR para entrar a la sala " + code}
                  />
                ) : (
                  <p className="muted">Generando QR…</p>
                )}
                <p>
                  Al escanearlo se abre la sala <strong>{code}</strong> lista
                  para escribir el nombre.
                </p>
              </div>
            ) : null}

            {inviteFeedback ? (
              <p className="inviteFeedback" role="status">
                {inviteFeedback}
              </p>
            ) : null}
          </section>

          {isHost ? (
            <section className="displayLaunchPanel" aria-label="Pantalla central">
              <div>
                <p className="eyebrow">PANTALLA CENTRAL</p>
                <strong>Usa un TV, computador o iPad como pantalla del grupo.</strong>
                <p className="muted">
                  Es solo lectura: muestra la sala, el turno y la pregunta, pero
                  no puede marcar jugadores listos ni controlar la partida.
                </p>
              </div>

              {!displayUrl ? (
                <button
                  type="button"
                  className="button secondary"
                  onClick={requestDisplay}
                >
                  Preparar pantalla central
                </button>
              ) : (
                <div className="displayLaunchActions">
                  <a
                    className="button primary linkButton"
                    href={displayUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir pantalla
                  </a>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={copyDisplayUrl}
                  >
                    Copiar enlace
                  </button>
                </div>
              )}

              {displayFeedback ? (
                <p className="inviteFeedback" role="status">
                  {displayFeedback}
                </p>
              ) : null}
            </section>
          ) : null}

          <div className="memberList" aria-live="polite">
            {room?.players.map((player, index) => (
              <div className="memberRow" key={player.id}>
                <span
                  className={"presenceDot " + (player.connected ? "on" : "")}
                  aria-hidden="true"
                />
                <span className="srOnly">
                  {player.connected ? "Conectado" : "Desconectado"}
                </span>
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

      {room?.status !== "finished" ? (
        <div className="backLink">
          <button type="button" className="textButton" onClick={leaveRoom}>
            ← Salir de la sala
          </button>
        </div>
      ) : null}

      {listenMode ? (
        <div
          className="listenOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="listen-mode-title"
        >
          <div className="listenOverlayCard">
            <p className="eyebrow">MODO ESCUCHAR</p>
            <h2 id="listen-mode-title">Pon el teléfono boca abajo.</h2>
            <p>
              La tecnología ya hizo su parte. Ahora mira a la persona que está
              hablando y escucha su historia.
            </p>
            <button
              type="button"
              className="button secondary"
              onClick={() => setListenMode(false)}
            >
              Volver a la ronda
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
