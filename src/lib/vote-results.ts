export type VoteOutcome = {
  winners: string[];
  abstentions: number;
  ballots: number;
  highestVotes: number;
  isTie: boolean;
  isEmpty: boolean;
};

export function calculateVoteOutcome(
  tally: Record<string, number> | null,
  choices: readonly { id: string; label: string }[],
): VoteOutcome {
  const votes = tally ?? {};
  const ballotCounts = choices.map(({ id }) => Math.max(0, votes[id] ?? 0));
  const abstentions = Math.max(0, votes.abstain ?? 0);
  const highestVotes = Math.max(0, ...ballotCounts);
  const winners = highestVotes > 0
    ? choices.filter(({ id }) => (votes[id] ?? 0) === highestVotes).map(({ label }) => label)
    : [];

  return {
    winners,
    abstentions,
    ballots: ballotCounts.reduce((a, b) => a + b, 0) + abstentions,
    highestVotes,
    isTie: winners.length > 1,
    isEmpty: highestVotes === 0,
  };
}
