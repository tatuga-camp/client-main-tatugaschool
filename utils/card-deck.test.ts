import { test } from "node:test";
import assert from "node:assert/strict";
import {
  confirmReveal,
  deckReducer,
  draw,
  initDeck,
  moveToDeck,
  moveToPicked,
  normalizeStoredPickedIds,
  putBack,
  savedPickedIds,
  seededRandom,
  shuffleIds,
  syncActive,
  type DeckState,
} from "./card-deck";

const keep = (ids: string[]) => [...ids];
const ACTIVE = ["a", "b", "c", "d", "e"];

// Every active student must be in exactly one place.
function assertPartition(state: DeckState, activeIds: string[]) {
  const all = [
    ...state.deck,
    ...state.picked,
    ...(state.revealedId ? [state.revealedId] : []),
  ];
  assert.equal(all.length, new Set(all).size, "no duplicates");
  assert.deepEqual([...all].sort(), [...activeIds].sort(), "exact partition");
}

test("shuffleIds is a permutation and deterministic with a seed", () => {
  const out = shuffleIds(ACTIVE, seededRandom(42));
  assert.deepEqual([...out].sort(), ACTIVE);
  assert.deepEqual(out, shuffleIds(ACTIVE, seededRandom(42)));
  assert.deepEqual(ACTIVE, ["a", "b", "c", "d", "e"], "input not mutated");
});

test("normalizeStoredPickedIds accepts only {id:string}[] and dedupes", () => {
  assert.deepEqual(
    normalizeStoredPickedIds([{ id: "a" }, { id: "b" }, { id: "a" }]),
    ["a", "b"],
  );
  assert.deepEqual(normalizeStoredPickedIds(null), []);
  assert.deepEqual(normalizeStoredPickedIds("garbage"), []);
  assert.deepEqual(normalizeStoredPickedIds({}), []);
  assert.deepEqual(normalizeStoredPickedIds([1, 2]), []);
  assert.deepEqual(
    normalizeStoredPickedIds([{ id: 5 }, null, { id: "c" }]),
    ["c"],
  );
});

test("initDeck drops stale stored ids and deals the rest", () => {
  const s = initDeck(ACTIVE, ["b", "zz", "d", "b"], keep);
  assert.deepEqual(s.picked, ["b", "d"]);
  assert.deepEqual(s.deck, ["a", "c", "e"]);
  assert.equal(s.revealedId, null);
  assertPartition(s, ACTIVE);
});

test("draw moves only the drawn id and refuses a second draw", () => {
  const s0 = initDeck(ACTIVE, [], keep);
  const s1 = draw(s0, "c");
  assert.equal(s1.revealedId, "c");
  assert.deepEqual(s1.deck, ["a", "b", "d", "e"], "others keep their order");
  assertPartition(s1, ACTIVE);
  assert.equal(draw(s1, "a"), s1, "second draw while revealed is refused");
  assert.equal(draw(s0, "zz"), s0, "unknown id refused");
});

test("confirmReveal appends to picked; putBack reinserts at the random slot", () => {
  const s1 = draw(initDeck(ACTIVE, ["e"], keep), "b");
  const confirmed = confirmReveal(s1);
  assert.deepEqual(confirmed.picked, ["e", "b"]);
  assert.equal(confirmed.revealedId, null);
  assertPartition(confirmed, ACTIVE);

  const top = putBack(s1, 0);
  assert.deepEqual(top.deck, ["b", "a", "c", "d"]);
  const bottom = putBack(s1, 0.999);
  assert.deepEqual(bottom.deck, ["a", "c", "d", "b"]);
  assertPartition(bottom, ACTIVE);
  const noop = initDeck(ACTIVE, [], keep);
  assert.equal(confirmReveal(noop), noop);
  assert.equal(putBack(noop, 0.5), noop);
});

test("moveToPicked / moveToDeck touch only their student", () => {
  const s0 = initDeck(ACTIVE, ["e"], keep);
  const s1 = moveToPicked(s0, "b");
  assert.deepEqual(s1.deck, ["a", "c", "d"]);
  assert.deepEqual(s1.picked, ["e", "b"]);
  const s2 = moveToDeck(s1, "e");
  assert.deepEqual(s2.deck, ["a", "c", "d", "e"], "returns to the bottom");
  assert.deepEqual(s2.picked, ["b"]);
  assertPartition(s2, ACTIVE);
  assert.equal(moveToPicked(s0, "e"), s0, "already picked: no-op");
  assert.equal(moveToDeck(s0, "a"), s0, "already in deck: no-op");
});

test("moves while a card is revealed never touch the revealed card", () => {
  const s1 = draw(initDeck(ACTIVE, [], keep), "a");
  const s2 = moveToPicked(s1, "a");
  assert.equal(s2, s1);
  const s3 = moveToPicked(s1, "b");
  assert.equal(s3.revealedId, "a");
  assertPartition(s3, ACTIVE);
});

test("syncActive drops removed students, appends new ones, keeps identity when unchanged", () => {
  const s1 = draw(initDeck(ACTIVE, ["e"], keep), "c");
  assert.equal(syncActive(s1, ACTIVE), s1, "unchanged list returns same object");

  const next = ["a", "b", "d", "e", "f"]; // c removed (was revealed), f added
  const s2 = syncActive(s1, next);
  assert.equal(s2.revealedId, null);
  assert.deepEqual(s2.deck, ["a", "b", "d", "f"]);
  assert.deepEqual(s2.picked, ["e"]);
  assertPartition(s2, next);

  const s3 = syncActive(s2, ["a", "f"]); // e (picked) removed
  assert.deepEqual(s3.picked, []);
  assertPartition(s3, ["a", "f"]);
});

test("savedPickedIds includes the revealed card", () => {
  const s1 = draw(initDeck(ACTIVE, ["e"], keep), "c");
  assert.deepEqual(savedPickedIds(s1), ["e", "c"]);
  assert.deepEqual(savedPickedIds(confirmReveal(s1)), ["e", "c"]);
});

test("deckReducer: shuffle keeps membership, restart empties picked", () => {
  const s0 = initDeck(ACTIVE, ["e"], keep);
  const shuffled = deckReducer(s0, { type: "shuffle", seed: 7 });
  assert.deepEqual([...shuffled.deck].sort(), [...s0.deck].sort());
  assert.deepEqual(shuffled.picked, ["e"]);

  const revealed = deckReducer(s0, { type: "draw", id: "a" });
  const restarted = deckReducer(revealed, {
    type: "restart",
    activeIds: ACTIVE,
    seed: 3,
  });
  assert.deepEqual(restarted.picked, []);
  assert.equal(restarted.revealedId, null);
  assertPartition(restarted, ACTIVE);

  const synced = deckReducer(s0, { type: "sync", activeIds: ["a", "e"] });
  assertPartition(synced, ["a", "e"]);
  assert.equal(deckReducer(s0, { type: "confirm" }), s0);
  assert.deepEqual(
    deckReducer(revealed, { type: "putBack", random: 0 }).deck[0],
    "a",
  );
  assert.deepEqual(
    deckReducer(s0, { type: "moveToPicked", id: "a" }).picked,
    ["e", "a"],
  );
  assert.deepEqual(
    deckReducer(s0, { type: "moveToDeck", id: "e" }).deck.at(-1),
    "e",
  );
});
