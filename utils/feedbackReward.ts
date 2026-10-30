import type { Language } from "../interfaces";

export const REWARD_MIN_CHARS = 30;

// Mirrors the server: trimmed Unicode code points, not UTF-16 units.
export function rewardCharCount(body: string): number {
  return Array.from(body.trim()).length;
}

export type RewardFormState = {
  hint: "show" | "muted" | "hidden";
  counter: { remaining: number } | "ready" | null;
  showAnonymousWarning: boolean;
};

export function rewardFormState(input: {
  hasReward: boolean | undefined;
  isAnonymous: boolean;
  body: string;
}): RewardFormState {
  // Unknown (loading) or already rewarded: make no promise.
  if (input.hasReward !== false) {
    return { hint: "hidden", counter: null, showAnonymousWarning: false };
  }
  if (input.isAnonymous) {
    return { hint: "muted", counter: null, showAnonymousWarning: true };
  }
  const remaining = REWARD_MIN_CHARS - rewardCharCount(input.body);
  return {
    hint: "show",
    counter: remaining > 0 ? { remaining } : "ready",
    showAnonymousWarning: false,
  };
}

export function formatRewardDate(iso: string, language: Language): string {
  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date(iso));
}
