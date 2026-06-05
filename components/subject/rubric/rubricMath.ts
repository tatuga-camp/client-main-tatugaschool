export type RubricMathCriterion = { weight: number; maxPoints: number };
export type RubricMathSelection = { points: number; weight: number };

export function computeRubricScore(input: {
  criteria: RubricMathCriterion[];
  selections: RubricMathSelection[];
  maxScore: number | null;
}): number {
  const rawMax = input.criteria.reduce((s, c) => s + c.maxPoints * c.weight, 0);
  const rawScore = input.selections.reduce((s, x) => s + x.points * x.weight, 0);
  if (rawMax <= 0) return 0;
  if (input.maxScore == null) return rawScore;
  return (rawScore / rawMax) * input.maxScore;
}
