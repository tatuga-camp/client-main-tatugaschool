import { useEffect, useMemo, useReducer, useRef } from "react";
import {
  localStorageGetRemoveRandomStudents,
  localStorageSetRemoveRandomStudents,
} from "../../../utils";
import {
  deckReducer,
  initDeck,
  normalizeStoredPickedIds,
  savedPickedIds,
  shuffleIds,
  type DeckState,
} from "../../../utils/card-deck";

export type CardDeckActions = {
  draw: (id: string) => void;
  confirm: () => void;
  putBack: () => void;
  moveToPicked: (id: string) => void;
  moveToDeck: (id: string) => void;
  shuffle: () => void;
  restart: () => void;
};

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

function readStoredPicked(subjectId: string): string[] {
  try {
    return normalizeStoredPickedIds(
      localStorageGetRemoveRandomStudents({ subjectId }),
    );
  } catch {
    // Corrupted JSON or storage blocked: start with nobody picked.
    return [];
  }
}

function writeStoredPicked(subjectId: string, ids: string[]) {
  try {
    localStorageSetRemoveRandomStudents({
      subjectId,
      studentIds: ids.map((id) => ({ id })),
    });
  } catch {
    // Storage full or blocked — the picker still works for this session.
  }
}

export function useCardDeck(
  subjectId: string,
  activeIds: string[],
): { state: DeckState; actions: CardDeckActions } {
  const [state, dispatch] = useReducer(deckReducer, undefined, () =>
    initDeck(activeIds, readStoredPicked(subjectId), (ids) => shuffleIds(ids)),
  );

  const activeIdsRef = useRef(activeIds);
  activeIdsRef.current = activeIds;

  // The roster prop is live (react-query); keep the deck in step with it.
  const activeKey = activeIds.join(",");
  useEffect(() => {
    dispatch({ type: "sync", activeIds: activeIdsRef.current });
  }, [activeKey]);

  // Persist on every change (also rewrites stale stored ids on first mount).
  const savedKey = savedPickedIds(state).join(",");
  useEffect(() => {
    writeStoredPicked(subjectId, savedKey ? savedKey.split(",") : []);
  }, [subjectId, savedKey]);

  const actions = useMemo<CardDeckActions>(
    () => ({
      draw: (id) => dispatch({ type: "draw", id }),
      confirm: () => dispatch({ type: "confirm" }),
      putBack: () => dispatch({ type: "putBack", random: Math.random() }),
      moveToPicked: (id) => dispatch({ type: "moveToPicked", id }),
      moveToDeck: (id) => dispatch({ type: "moveToDeck", id }),
      shuffle: () => dispatch({ type: "shuffle", seed: newSeed() }),
      restart: () =>
        dispatch({
          type: "restart",
          activeIds: activeIdsRef.current,
          seed: newSeed(),
        }),
    }),
    [],
  );

  return { state, actions };
}
