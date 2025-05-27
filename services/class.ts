import { Classroom, EducationYear, Student, Subject, User } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateClassService = {
  schoolId: string;
  title: string;
  level: string;
  description: string;
};

type ResponseCreateClassService = Classroom;

export async function CreateClassService(
  input: RequestCreateClassService,
): Promise<ResponseCreateClassService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/classes`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Classroom request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestetClassesBySchoolIdService = {
  schoolId: string;
  isAchieved: boolean;
};

export type ResponseGetClassesBySchoolIdService = (Classroom & {
  studentNumbers: number;
  creator: User | null;
})[];

export async function GetClassesBySchoolIdService(
  input: RequestetClassesBySchoolIdService,
): Promise<ResponseGetClassesBySchoolIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/classes/school/${input.schoolId}`,
      params: {
        isAchieved: input.isAchieved,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Classes request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestGetClassByIdService = {
  classId: string;
};

export type ResponseGetClassByIdService = Classroom & { students: Student[] };

export async function GetClassByIdService(
  input: RequestGetClassByIdService,
): Promise<ResponseGetClassByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/classes/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Classroom by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestGetGradeSummaryOnClassroomService = {
  classId: string;
  educationYear: EducationYear;
};

export type ResponseGetGradeSummaryOnClassroomService = (Subject & {
  students: {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    assignmentId: string;
    totalScore: number;
  }[];
})[];

export async function GetGradeSummaryOnClassroomService(
  input: RequestGetGradeSummaryOnClassroomService,
): Promise<ResponseGetGradeSummaryOnClassroomService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/classes/${input.classId}/grade-summary`,
      params: { educationYear: input.educationYear },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Classroom by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}
export type RequestUpdateClassService = {
  query: {
    classId: string;
  };
  body: {
    title?: string;
    description?: string;
    level?: string;
    isAchieved?: boolean;
  };
};

type ResponseUpdateClassService = Classroom;

export async function UpdateClassService(
  input: RequestUpdateClassService,
): Promise<ResponseUpdateClassService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/classes`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Classroom request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export type RequestDeleteClassService = {
  classId: string;
};

type ResponseDeleteClassService = Classroom;

export async function DeleteClassService(
  input: RequestDeleteClassService,
): Promise<ResponseDeleteClassService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/classes/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Classroom request failed:", error);
    throw error?.response?.data;
  }
}

export type RequestReorderClassesService = {
  classIds: string[];
};

type ResponseReorderClassesService = Classroom[];

export async function ReorderClassesService(
  input: RequestReorderClassesService,
): Promise<ResponseReorderClassesService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/classes/reorder`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Classes request failed:", error.response.data);
    throw error?.response?.data;
  }
}
