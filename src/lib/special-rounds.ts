import specialContent from "../../worker/src/special-content.json";
import type { AgeBand, GroupType, QuestionIntensity } from "./questions";

export const SPECIAL_KINDS = ["likely", "everyone", "challenge", "chain", "gold"] as const;
export type SpecialKind = (typeof SPECIAL_KINDS)[number];

export const SPECIAL_LABELS: Record<SpecialKind, string> = {
  likely: "¿Quién es más probable?",
  everyone: "Todos responden",
  challenge: "Reto sorpresa",
  chain: "Recuerdo en cadena",
  gold: "Carta dorada",
};

export const SPECIAL_EMOJI: Record<SpecialKind, string> = {
  likely: "🗳️", everyone: "⚡", challenge: "🎭", chain: "🧩", gold: "✨",
};

export const SPECIAL_PACKS = ["classic", "fiesta", "conexiones"] as const;
export type SpecialPack = (typeof SPECIAL_PACKS)[number];
export const SPECIAL_PACK_LABELS: Record<SpecialPack, string> = {
  classic: "Clásicos", fiesta: "Fiesta", conexiones: "Conexiones",
};
export const SPECIAL_PACK_DESCRIPTIONS: Record<SpecialPack, string> = {
  classic: "Para romper el hielo y compartir recuerdos.",
  fiesta: "Para reír, votar e improvisar juntos.",
  conexiones: "Para conversaciones y momentos significativos.",
};
export const SPECIAL_DECK_VERSION = specialContent.version;

export type SpecialCard = {
  id: string;
  prompt: string;
  hint: string;
  choices?: readonly [string, string];
  seconds: number;
  minAge: AgeBand;
  intensity: QuestionIntensity;
  audiences: readonly GroupType[];
  pack: SpecialPack;
};

export type SpecialCardFilters = {
  groupType: GroupType;
  youngestAge: AgeBand;
  maxIntensity: QuestionIntensity;
  specialPacks?: readonly SpecialPack[];
};

export const SPECIAL_CARDS = specialContent.cards as unknown as Record<SpecialKind, readonly SpecialCard[]>;

export function specialCard(kind: SpecialKind, index: number): SpecialCard | null {
  return SPECIAL_CARDS[kind]?.[index] ?? null;
}

export function eligibleSpecialCardIndexes(
  kind: SpecialKind,
  settings: SpecialCardFilters,
): number[] {
  const packs = settings.specialPacks ?? SPECIAL_PACKS;
  return (SPECIAL_CARDS[kind] ?? []).flatMap((card, index) =>
    card.minAge <= settings.youngestAge &&
    card.intensity <= settings.maxIntensity &&
    card.audiences.includes(settings.groupType) &&
    packs.includes(card.pack)
      ? [index]
      : [],
  );
}

export function countSpecialCards(settings: SpecialCardFilters, kind?: SpecialKind): number {
  return (kind ? [kind] : SPECIAL_KINDS).reduce(
    (total, current) => total + eligibleSpecialCardIndexes(current, settings).length,
    0,
  );
}
