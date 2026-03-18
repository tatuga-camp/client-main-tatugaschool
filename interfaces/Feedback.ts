export type Feedback = {
  id: string;
  body: string;
  tag: FeedbackTag;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};
export type FeedbackTag = "COMPLIMENT" | "BUG" | "REQUEST_FEATURE";
