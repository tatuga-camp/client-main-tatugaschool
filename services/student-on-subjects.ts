import { ScoreOnStudent, StudentOnSubject } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

type RequestCreateStudentOnSubjectService = {
  studentId: string;
  subjectId: string;
};

type ResponseCreateStudentOnSubjectService = StudentOnSubject;

export async function CreateStudentOnSubjectService(
  input: RequestCreateStudentOnSubjectService,
): Promise<ResponseCreateStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/student-on-subjects`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create StudentOnSubject request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectReportService = {
  studentOnSubjectId: string;
};

export type ResponseGetStudentOnSubjectReportService = {
  schoolName: string;
  reportTitle: string;
  studentInfo: {
    name: string;
    imageURL: string;
    class: string;
  };
  courseInfo: {
    subject: string;
    description: string;
    educationYear: string;
  };
  teachers: {
    homeroom: string;
    instructor: {
      name: string;
      imageURL: string;
      email: string;
    }[];
  };
  attendance: {
    status: string; // "ผ่านเกณฑ์" - consider using a more specific literal type if other statuses are known e.g., "ผ่านเกณฑ์" | "ไม่ผ่านเกณฑ์"
    totalHours: number;
    summary: {
      status: string;
      value: number;
    }[];
  };
  academicPerformance: {
    overallGrade: string;
    overallScore: number;
    maxScore: string;
    assessments: {
      item: string;
      score: number;
      maxScore: string;
    }[];
  };
  skillAssessment: {
    title: string;
    skills: {
      skill: string;
      percentage: number;
    }[];
  };
  recommendations: string;
  signatureFields: {
    position: string;
    name: string;
  };
};

export async function GetStudentOnSubjectReportService(
  input: RequestGetStudentOnSubjectReportService,
): Promise<ResponseGetStudentOnSubjectReportService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}/report`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create StudentOnSubject request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestSortStudentOnSubjectService = {
  studentOnSubjectIds: string[];
};

type ResponseSortStudentOnSubjectService = StudentOnSubject;

export async function SortStudentOnSubjectService(
  input: RequestSortStudentOnSubjectService,
): Promise<ResponseSortStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/student-on-subjects/sort`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create StudentOnSubject request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectBySubjectService = {
  subjectId: string;
};

type ResponseGetStudentOnSubjectBySubjectService = StudentOnSubject[];

export async function GetStudentOnSubjectBySubjectService(
  input: RequestGetStudentOnSubjectBySubjectService,
): Promise<ResponseGetStudentOnSubjectBySubjectService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/subject/${input.subjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get StudentOnSubject by Subject request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectByStudentService = {
  studentId: string;
};

type ResponseGetStudentOnSubjectByStudentService = StudentOnSubject[];

export async function GetStudentOnSubjectByStudentService(
  input: RequestGetStudentOnSubjectByStudentService,
): Promise<ResponseGetStudentOnSubjectByStudentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/student/${input.studentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get StudentOnSubject by Student request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestGetStudentOnSubjectByIdService = {
  studentOnSubjectId: string;
};

type ResponseGetStudentOnSubjectByIdService = StudentOnSubject;

export async function GetStudentOnSubjectByIdService(
  input: RequestGetStudentOnSubjectByIdService,
): Promise<ResponseGetStudentOnSubjectByIdService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get StudentOnSubject by ID request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type RequestDeleteStudentOnSubjectService = {
  studentOnSubjectId: string;
};

type ResponseDeleteStudentOnSubjectService = {
  message: string;
};

export async function DeleteStudentOnSubjectService(
  input: RequestDeleteStudentOnSubjectService,
): Promise<ResponseDeleteStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/student-on-subjects/${input.studentOnSubjectId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete StudentOnSubject request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}

type ResponseUpdateStudentOnSubjectService = StudentOnSubject;
export type RequestUpdateStudentOnSubjectService = {
  query: {
    id: string;
  };
  data: {
    isActive?: boolean;
  };
};
export async function UpdateStudentOnSubjectService(
  input: RequestUpdateStudentOnSubjectService,
): Promise<ResponseUpdateStudentOnSubjectService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/student-on-subjects`,
      data: input,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete StudentOnSubject request failed:",
      error.response.data,
    );
    throw error?.response?.data;
  }
}
