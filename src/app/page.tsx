"use client";

import Link from "next/link";\nimport { FormEvent, useMemo, useState } from "react";
import {
  cleanPlayerName,
  getQuestion,
  nextPlayerIndex,
  nextQuestionIndex,
  type Player,
} from "@/lib/game";
import { QUESTIONS } from "@/lib/questions";

function makePlayer(name: string): Player {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name,
  };
}

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const currentPlayer = players[currentPlayerIndex];
  const question = useMemo(
    () => getQuestion(QUESTIONS, questionIndex),
    [questionIndex],
  );

  function addPlayer(event: FormEvent) {
    event.preventDefault();
    const cleaned = cleanPlayerName(name);
    if (!cleaned) return;
    if (players.some((player) => player.name.toLowerCase() === cleaned.toLowerCase())) {
      return;
    }

    setPlayers((current) => [...current, makePlayer(cleaned)]);
    setName("");
  }

  function startGame() {
    if (players.length < 2) return;
    setStarted(true);
    setRevealed(false);
    setCurrentPlayerIndex(0);
    setQuestionIndex(0);
  }

  function skipQuestion() {
    setQuestionIndex((current) => nextQuestionIndex(current, QUESTIONS.length));
    setRevealed(false);
  }

  function nextTurn() {
    setCurrentPlayerIndex((current) => nextPlayerIndex(current, players.length));
    setQuestionIndex((current) => nextQuestionIndex(current, QUESTIONS.length));
    setRevealed(false);
  }

  function resetGame() {
    setStarted(false);
    setRevealed(false);
    setCurrentPlayerIndex(0);
    setQuestionIndex(0);
  }

  if (!started) {
    return (
      <main className="shell">
        <section className="hero">
          <p className="eyebrow">JUEGOFAMILIAECH</p>
          <h1>Una ronda para conocernos mejor.</h1>
          <p className="lede">
            Prueba el modo local en un solo teléfono o crea una sala online para
            que cada persona juegue desde su propio dispositivo.
          </p>
          <div className="modeActions">
            <Link className="button primary linkButton" href="/online">
              Jugar online
            </Link>
            <span className="muted">Cloudflare realtime · sin cuenta</span>
          </div>
        </section>

        <section className="panel">
          <form className="playerForm" onSubmit={addPlayer}>
            <label htmlFor="player-name">Nombre del jugador</label>
            <div className="formRow">
              <input
                id="player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Andrea"
                maxLength={24}
                autoComplete="off"
              />
              <button type="submit" className="button secondary">
                Añadir
              </button>
            </div>
          </form>

          <div className="players">
            {players.length === 0 ? (
              <p className="muted">Agrega al menos 2 personas para empezar.</p>
            ) : (
              players.map((player, index) => (
                <div className="playerChip" key={player.id}>
                  <span>{index + 1}</span>
                  {player.name}
                  <button
                    type="button"
                    aria-label={`Quitar a ${player.name}`}
                    onClick={() =>
                      setPlayers((current) =>
                        current.filter((item) => item.id !== player.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="button primary wide"
            disabled={players.length < 2}
            onClick={startGame}
          >
            Comenzar ronda
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell gameShell">
      <header className="gameHeader">
        <div>
          <p className="eyebrow">TURNO DE</p>
          <h1>{currentPlayer?.name}</h1>
        </div>
        <button className="textButton" type="button" onClick={resetGame}>
          Salir
        </button>
      </header>

      <section className={`questionCard ${revealed ? "revealed" : ""}`}>
        <div className="cardMeta">
          <span>{question?.category}</span>
          <span>nivel {question?.intensity}</span>
        </div>

        {revealed ? (
          <>
            <p className="questionText">{question?.text}</p>
            <p className="listenHint">
              Ahora dejen el teléfono y escuchen la historia.
            </p>
          </>
        ) : (
          <>
            <p className="hiddenPrompt">
              {currentPlayer?.name}, cuando estés listo revela la pregunta y
              léela en voz alta.
            </p>
            <button
              type="button"
              className="button primary"
              onClick={() => setRevealed(true)}
            >
              Revelar pregunta
            </button>
          </>
        )}
      </section>

      <section className="controls">
        <button type="button" className="button secondary" onClick={skipQuestion}>
          Cambiar pregunta
        </button>
        <button
          type="button"
          className="button primary"
          onClick={nextTurn}
          disabled={!revealed}
        >
          Siguiente persona
        </button>
      </section>

      <p className="progress">
        {currentPlayerIndex + 1} de {players.length} · pregunta{" "}
        {(questionIndex % QUESTIONS.length) + 1} de {QUESTIONS.length}
      </p>
    </main>
  );
}
