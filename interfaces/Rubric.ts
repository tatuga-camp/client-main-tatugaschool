export interface RubricLevel {
  id: string;
  title: string;
  description?: string;
  points: number;
  order: number;
}

export interface RubricCriterion {
  id: string;
  title: string;
  description?: string;
  weight: number;
  order: number;
  levels: RubricLevel[];
}

export interface Rubric {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description?: string;
  subjectId: string;
  schoolId: string;
  userId?: string;
}

export interface RubricWithTree extends Rubric {
  criteria: RubricCriterion[];
}

export interface RubricDraft {
  title: string;
  description?: string;
  criteria: Array<{
    title: string;
    description?: string;
    weight: number;
    levels: Array<{ title: string; description?: string; points: number }>;
  }>;
}

export interface RubricBreakdownCriterion {
  id: string;
  title: string;
  description?: string;
  weight: number;
  levels: RubricLevel[];
  selectedLevelId: string | null;
  points: number | null;
  comment: string | null;
}

export interface RubricBreakdown {
  studentOnAssignmentId: string;
  finalScore: number | null;
  maxScore: number | null;
  rubric: { id: string; title: string; criteria: RubricBreakdownCriterion[] } | null;
}
