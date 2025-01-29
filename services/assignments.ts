import {
  Assignment,
  AssignmentStatus,
  AssignmentType,
  FileOnAssignment,
  StudentOnAssignment,
} from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type RequestCreateAssignmentService = {
  title: string;
  description: string;
  maxScore?: number;
  weight?: number | null;
  beginDate: string;
  dueDate?: string;
  subjectId: string;
  type: AssignmentType;
  status: AssignmentStatus;
};

type ResponseCreateAssignmentService = Assignment;

export async function CreateAssignmentService(
  input: RequestCreateAssignmentService
): Promise<ResponseCreateAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/assignments`,
      data: { ...input },
    });

    return response.data;
  } catch (error: any) {
    console.error("Create Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type ResponseGetAssignmentsService = (Assignment & {
  files: FileOnAssignment[];
})[];

export async function GetAssignmentsBySubjectIdService(input: {
  subjectId: string;
}): Promise<ResponseGetAssignmentsService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/assignments/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignments request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestGetOverviewAssignmentService = {
  subjectId: string;
};
export type ResponseGetOverviewAssignmentService = {
  assignment: Assignment;
  students: StudentOnAssignment[];
}[];

export async function GetOverviewAssignmentService(
  input: RequestGetOverviewAssignmentService
): Promise<ResponseGetOverviewAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/assignments/subject/${input.subjectId}/overview`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignments request failed:", error.response.data);
    throw error?.response?.data;
  }
}
type RequestGetAssignmentByIdService = {
  assignmentId: string;
};

export type ResponseGetAssignmentByIdService = Assignment & {
  files: FileOnAssignment[];
};

export async function GetAssignmentByIdService(
  input: RequestGetAssignmentByIdService
): Promise<ResponseGetAssignmentByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/assignments/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Assignment by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestUpdateAssignmentService = {
  query: {
    assignmentId: string;
  };
  data: {
    title?: string;
    description?: string;
    maxScore?: number;
    weight?: number | null;
    beginDate?: string;
    dueDate?: string | null;
    status?: AssignmentStatus;
  };
};

type ResponseUpdateAssignmentService = Assignment;

export async function UpdateAssignmentService(
  input: RequestUpdateAssignmentService
): Promise<ResponseUpdateAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/assignments`,
      data: {
        query: {
          assignmentId: input.query.assignmentId,
        },
        data: input.data,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestReorderAssignmentService = {
  assignmentIds: string[];
};

type ResponseReorderAssignmentService = Assignment[];

export async function ReorderAssignmentService(
  input: RequestReorderAssignmentService
): Promise<ResponseReorderAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/assignments/reorder`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteAssignmentService = {
  assignmentId: string;
};

type ResponseDeleteAssignmentService = Assignment;
export async function DeleteAssignmentService(
  input: RequestDeleteAssignmentService
): Promise<ResponseDeleteAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/assignments/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestExportAssignmentService = {
  subjectId: string;
};

type ResponseExportAssignmentService = string;

export async function ExportAssignmentService(
  input: RequestExportAssignmentService
): Promise<ResponseExportAssignmentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/assignments/export-excel/?subjectId=${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Export Assignment request failed:", error.response.data);
    throw error?.response?.data;
  }
}
