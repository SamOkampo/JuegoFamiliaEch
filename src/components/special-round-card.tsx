"use client";

import { useEffect, useState } from "react";
import { calculateVoteOutcome } from "@/lib/vote-results";
import { SPECIAL_CARDS, SPECIAL_EMOJI, SPECIAL_LABELS, type SpecialKind } from "@/lib/special-rounds";
import type { RoomPlayer, SpecialSnapshot } from "@/lib/realtime";

type Props = {
  special: SpecialSnapshot;
  players: RoomPlayer[];
  readonly?: boolean;
  isHost?: boolean;
  myChoice?: string | null;
  contributed?: boolean;
  onVote?: (choice: string) => void;
  onReveal?: () => void;
  onContribute?: () => void;
};

export function SpecialRoundCard({
  special,
  players,
  readonly = false,
  isHost = false,
  myChoice = null,
  contributed = false,
  onVote,
  onReveal,
  onContribute,
}: Props) {
  const card = SPECIAL_CARDS[special.kind]?.[special.cardIndex];
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!card) return;
    const recalculate = () => {
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - new Date(special.startedAt).getTime()) / 1000),
      );
      setRemaining(Math.max(0, card.seconds - elapsed));
    };
    recalculate();
    const timer = window.setInterval(recalculate, 1000);
    return () => window.clearInterval(timer);
  }, [card, special.startedAt]);

  if (!card) return null;

  const voting = special.kind === "likely" || special.kind === "everyone";
  const choices = special.kind === "likely"
    ? players.map((player) => ({ id: player.id, label: player.name }))
    : special.kind === "everyone"
      ? (card.choices ?? []).map((label, index) => ({ id: String(index), label }))
      : [];

  const tallies = special.revealed ? special.tally ?? {} : {};
  const maximum = Math.max(1, ...Object.values(tallies));
  const outcome = calculateVoteOutcome(special.revealed ? tallies : null, choices);
  const accent = special.kind === "gold" ? "gold" : special.kind;
  const totalVoters = players.length;

  return (
    <section
      className={"specialRound specialRound-" + accent}
      aria-label={"Ronda especial: " + SPECIAL_LABELS[special.kind]}
    >
      <div className="specialRoundTop">
        <span className="specialKindLabel">
          <span aria-hidden="true">{SPECIAL_EMOJI[special.kind]}</span>
          {SPECIAL_LABELS[special.kind]}
        </span>
        <span className="specialTimer" aria-label={"Tiempo orientativo restante: " + remaining + " segundos"}>
          {remaining > 0 ? remaining + " s" : "Sin prisa"}
        </span>
      </div>

      <div className="specialRoundBody" key={special.turnNumber + "-" + special.kind + "-" + special.cardIndex}>
        <span className="specialEyebrow">RONDA SORPRESA</span>
        <h3 className="specialPrompt">{card.prompt}</h3>
        <p className="specialHint">{card.hint}</p>
      </div>

      {special.kind === "gold" || special.revealed ? (
        <div className="specialSparkles" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} style={{ animationDelay: index * 90 + "ms" }}>✦</span>
          ))}
        </div>
      ) : null}

      {voting ? (
        <div className="specialVoteArea">
          <p className="specialProgress" role="status">
            {special.voteCount} de {totalVoters} personas votaron
          </p>
          {special.revealed ? (
            <div className="specialResults" aria-label="Resultados de la votación">
              <div className="specialOutcome" role="status" aria-live="polite">
                <span className="specialOutcomeEyebrow">RESULTADO REVELADO</span>
                <strong>
                  {outcome.isEmpty
                    ? "Esta vez no hubo votos por opciones"
                    : outcome.isTie
                      ? "¡Tenemos empate!"
                      : "La opción más votada"}
                </strong>
                {!outcome.isEmpty ? (
                  <p>{outcome.winners.join(" · ")}</p>
                ) : null}
                {outcome.abstentions > 0 ? (
                  <p className="specialAbstentions">
                    {outcome.abstentions} {outcome.abstentions === 1 ? "persona prefirió pasar" : "personas prefirieron pasar"}.
                  </p>
                ) : null}
              </div>
              {choices
                .slice()
                .sort((a, b) => (tallies[b.id] ?? 0) - (tallies[a.id] ?? 0))
                .map(({ id, label }) => (
                  <div className="specialResult" key={id}>
                    <div className="specialResultTitle">
                      <span>{label}</span>
                      <strong>{tallies[id] ?? 0}</strong>
                    </div>
                    <div className="specialResultTrack">
                      <span style={{ width: Math.round(((tallies[id] ?? 0) / maximum) * 100) + "%" }} />
                    </div>
                  </div>
                ))}
              <p className="specialHint">¡Ahora sí, suelten el cuento! ¿Por qué votaron así?</p>
            </div>
          ) : readonly ? (
            <p className="specialWaiting">Los votos están guardaditos. Quien armó la sala revela cuando estén listos.</p>
          ) : (
            <>
              <div className="specialVoteGrid">
                {choices.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={"specialVoteChoice " + (myChoice === id ? "selected" : "")}
                    aria-pressed={myChoice === id}
                    onClick={() => onVote?.(id)}
                  >
                    {myChoice === id ? "✓ " : ""}{label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={"specialVoteChoice specialAbstain " + (myChoice === "abstain" ? "selected" : "")}
                aria-pressed={myChoice === "abstain"}
                onClick={() => onVote?.("abstain")}
              >
                {myChoice === "abstain" ? "✓ " : ""}Prefiero pasar
              </button>
              {myChoice ? (
                <p className="specialHint" role="status">
                  {myChoice === "abstain"
                    ? "Has decidido pasar. Puedes cambiar tu elección antes de revelar."
                    : "Tu voto está enviado. Puedes cambiarlo antes de revelar."}
                </p>
              ) : null}
            </>
          )}
          {isHost && !readonly && !special.revealed ? (
            <button
              type="button"
              className="button primary wide"
              onClick={onReveal}
            >
              ✨ Revelar los resultados
            </button>
          ) : null}
        </div>
      ) : special.kind === "chain" ? (
        <div className="specialChainFooter">
          <p className="specialProgress">{special.contributorCount} personas aportaron un recuerdo</p>
          {!readonly ? (
            <button
              type="button"
              className="button secondary wide"
              disabled={contributed}
              onClick={onContribute}
            >
              {contributed ? "✓ Ya participé" : "Ya participé"}
            </button>
          ) : null}
        </div>
      ) : (
        <p className="specialFootnote">
          {special.kind === "challenge" ? "Participar es opcional. Puedes pasar sin dar explicaciones." : "Un momento para escucharse con calma."}
        </p>
      )}
    </section>
  );
}
