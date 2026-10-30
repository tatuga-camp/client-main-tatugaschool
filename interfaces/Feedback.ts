export type Feedback = {
  id: string;
  body: string;
  tag: FeedbackTag;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};
export type FeedbackTag = "COMPLIMENT" | "BUG" | "REQUEST_FEATURE";

export type FeedbackRewardResult =
  | { status: "ISSUED"; code: string; expiresAt: string }
  | { status: "ALREADY_ISSUED"; code?: string; expiresAt?: string }
  | { status: "UNAVAILABLE" }
  | { status: "TOO_SHORT" };
