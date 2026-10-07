/**
 * Pure state for the student card picker. Every active student is in exactly
 * one place: the face-down `deck` (index 0 is the top card), the spotlight
 * (`revealedId`), or `picked`. Each function touches only the student it acts
 * on, and randomness arrives as arguments so the reducer stays pure.
 */
export type DeckState = {
  deck: string[];
  revealedId: string | null;
  picked: string[];
};

export type ShuffleFn = (ids: string[]) => string[];

export type DeckAction =
  | { type: "draw"; id: string }
  | { type: "confirm" }
  | { type: "putBack"; random: number }
  | { type: "moveToPicked"; id: string }
  | { type: "moveToDeck"; id: string }
  | { type: "shuffle"; seed: number }
  | { type: "restart"; activeIds: string[]; seed: number }
  | { type: "sync"; activeIds: string[] };

const unique = (ids: string[]) => Array.from(new Set(ids));

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

export function shuffleIds(
  ids: string[],
  random: () => number = Math.random,
): string[] {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** mulberry32 — small deterministic PRNG so shuffles can travel in actions. */
export function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Accepts the stored `{ id: string }[]` shape; anything else becomes []. */
export function normalizeStoredPickedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const item of value) {
    const id =
      typeof item === "object" && item !== null
        ? (item as { id?: unknown }).id
        : undefined;
    if (typeof id === "string" && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function initDeck(
  activeIds: string[],
  storedPickedIds: string[],
  shuffleFn: ShuffleFn,
): DeckState {
  const active = new Set(activeIds);
  const picked = unique(storedPickedIds).filter((id) => active.has(id));
  const pickedSet = new Set(picked);
  return {
    deck: shuffleFn(unique(activeIds).filter((id) => !pickedSet.has(id))),
    revealedId: null,
    picked,
  };
}

export function draw(state: DeckState, id: string): DeckState {
  if (state.revealedId !== null || !state.deck.includes(id)) return state;
  return {
    ...state,
    deck: state.deck.filter((d) => d !== id),
    revealedId: id,
  };
}

export function confirmReveal(state: DeckState): DeckState {
  if (state.revealedId === null) return state;
  return {
    ...state,
    revealedId: null,
    picked: [...state.picked, state.revealedId],
  };
}

/** `random` in [0, 1) picks the slot; 0 = top of the deck. */
export function putBack(state: DeckState, random: number): DeckState {
  if (state.revealedId === null) return state;
  const slot = Math.min(
    state.deck.length,
    Math.floor(random * (state.deck.length + 1)),
  );
  const deck = [...state.deck];
  deck.splice(slot, 0, state.revealedId);
  return { ...state, deck, revealedId: null };
}

export function moveToPicked(state: DeckState, id: string): DeckState {
  if (!state.deck.includes(id)) return state;
  return {
    ...state,
    deck: state.deck.filter((d) => d !== id),
    picked: [...state.picked, id],
  };
}

export function moveToDeck(state: DeckState, id: string): DeckState {
  if (!state.picked.includes(id)) return state;
  return {
    ...state,
    picked: state.picked.filter((p) => p !== id),
    deck: [...state.deck, id],
  };
}

/** Reconcile with the live roster: drop students who left, append newcomers. */
export function syncActive(state: DeckState, activeIds: string[]): DeckState {
  const active = new Set(activeIds);
  const known = new Set([
    ...state.deck,
    ...state.picked,
    ...(state.revealedId ? [state.revealedId] : []),
  ]);
  const added = unique(activeIds).filter((id) => !known.has(id));
  const deck = state.deck.filter((id) => active.has(id)).concat(added);
  const picked = state.picked.filter((id) => active.has(id));
  const revealedId =
    state.revealedId && active.has(state.revealedId) ? state.revealedId : null;
  if (
    sameIds(deck, state.deck) &&
    sameIds(picked, state.picked) &&
    revealedId === state.revealedId
  ) {
    return state;
  }
  return { deck, revealedId, picked };
}

/** What gets persisted: a card in the spotlight already counts as picked. */
export function savedPickedIds(state: DeckState): string[] {
  return state.revealedId ? [...state.picked, state.revealedId] : state.picked;
}

export function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case "draw":
      return draw(state, action.id);
    case "confirm":
      return confirmReveal(state);
    case "putBack":
      return putBack(state, action.random);
    case "moveToPicked":
      return moveToPicked(state, action.id);
    case "moveToDeck":
      return moveToDeck(state, action.id);
    case "shuffle":
      return {
        ...state,
        deck: shuffleIds(state.deck, seededRandom(action.seed)),
      };
    case "restart":
      return initDeck(action.activeIds, [], (ids) =>
        shuffleIds(ids, seededRandom(action.seed)),
      );
    case "sync":
      return syncActive(state, action.activeIds);
  }
}
