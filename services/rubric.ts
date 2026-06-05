import {
  Rubric,
  RubricBreakdown,
  RubricDraft,
  RubricWithTree,
} from "../interfaces";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RubricCriterionInput = {
  title: string;
  description?: string;
  weight: number;
  order: number;
  levels: { title: string; description?: string; points: number; order: number }[];
};

export type RequestCreateRubricService = {
  title: string;
  description?: string;
  subjectId: string;
  criteria: RubricCriterionInput[];
};

export async function CreateRubricService(
  input: RequestCreateRubricService,
): Promise<Rubric> {
  try {
    const res = await axiosInstance({ method: "POST", url: `/v1/rubrics`, data: input });
    return res.data;
  } catch (error: any) {
    console.error("Create rubric failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGetRubricsBySubjectService = { subjectId: string };
export async function GetRubricsBySubjectService(
  input: RequestGetRubricsBySubjectService,
): Promise<Rubric[]> {
  try {
    const res = await axiosInstance({
      method: "GET",
      url: `/v1/rubrics/subject/${input.subjectId}`,
    });
    return res.data;
  } catch (error: any) {
    console.error("Get rubrics failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGetRubricByIdService = { rubricId: string };
export async function GetRubricByIdService(
  input: RequestGetRubricByIdService,
): Promise<RubricWithTree> {
  try {
    const res = await axiosInstance({ method: "GET", url: `/v1/rubrics/${input.rubricId}` });
    return res.data;
  } catch (error: any) {
    console.error("Get rubric failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateRubricService = RequestCreateRubricService & { rubricId: string };
export async function UpdateRubricService(
  input: RequestUpdateRubricService,
): Promise<Rubric> {
  try {
    const res = await axiosInstance({ method: "PATCH", url: `/v1/rubrics`, data: input });
    return res.data;
  } catch (error: any) {
    console.error("Update rubric failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteRubricService = { rubricId: string };
export async function DeleteRubricService(
  input: RequestDeleteRubricService,
): Promise<{ id: string }> {
  try {
    const res = await axiosInstance({ method: "DELETE", url: `/v1/rubrics/${input.rubricId}` });
    return res.data;
  } catch (error: any) {
    console.error("Delete rubric failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGradeRubricService = {
  studentOnAssignmentId: string;
  items: { criterionId: string; selectedLevelId: string; comment?: string }[];
};
export async function GradeRubricService(
  input: RequestGradeRubricService,
): Promise<{ studentOnAssignmentId: string; score: number }> {
  try {
    const res = await axiosInstance({ method: "PUT", url: `/v1/rubric-scores`, data: input });
    return res.data;
  } catch (error: any) {
    console.error("Grade rubric failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGetRubricBreakdownService = { studentOnAssignmentId: string };
export async function GetRubricBreakdownService(
  input: RequestGetRubricBreakdownService,
): Promise<RubricBreakdown> {
  try {
    const res = await axiosInstance({
      method: "GET",
      url: `/v1/rubric-scores/student-on-assignment/${input.studentOnAssignmentId}`,
    });
    return res.data;
  } catch (error: any) {
    console.error("Get rubric breakdown failed:", error?.response?.data);
    throw error?.response?.data;
  }
}

export type RequestGenerateRubricDraftService = {
  subjectId: string;
  topic: string;
  gradeLevel: string;
  learningGoal: string;
  levelCount?: number;
  criteriaCount?: number;
  maxPointsPerLevel?: number;
  language?: "th" | "en";
  curriculum?: { url: string; type: string };
};
export async function GenerateRubricDraftService(
  input: RequestGenerateRubricDraftService,
): Promise<{ curriculumSummary?: string; draft: RubricDraft }> {
  try {
    const res = await axiosInstance({ method: "POST", url: `/v1/rubrics/ai-draft`, data: input });
    return res.data;
  } catch (error: any) {
    console.error("Generate rubric draft failed:", error?.response?.data);
    throw error?.response?.data;
  }
}
