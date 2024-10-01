import { CommentOnAssignment } from "@/interfaces";

import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

type RequestCreateCommentStudent = {
  content: string;
  studentOnAssignmentId: string;
  studentId: string;
};

type RequestCreateCommentTeacher = {
  content: string;
  studentOnAssignmentId: string;
};

type RequestUpdateCommentService = {
  commentAssignmentId: string;
  content: string;
};

type RequestDeleteCommentService = {
  commentAssignmentId: string;
};

type ResponseCommentOnAssignmentComment = CommentOnAssignment;

export async function CreateCommentStudentService(
  input: RequestCreateCommentStudent
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/comment-assignments/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function CreateCommentTeacherService(
  input: RequestCreateCommentTeacher
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/comment-assignments/teacher`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetCommentService = {
  studentOnAssignmentId: string;
};
export type ResponseGetCommentService = CommentOnAssignment[];
export async function GetCommentStudentService(
  input: RequestGetCommentService
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/comment-assignments/studentOnAssignmentId/${input.studentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function GetCommentTeacherService(
  input: RequestGetCommentService
): Promise<ResponseGetCommentService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/comment-assignments/studentOnAssignmentId/${input.studentOnAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function UpdateCommentStudentService(
  input: RequestUpdateCommentService
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/comment-assignments/student`,
      data: {
        query: { commentAssignmentId: input.commentAssignmentId },
        body: { content: input.content },
      },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function UpdateCommentTeacherService(
  input: RequestUpdateCommentService
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/comment-assignments/teacher`,
      data: {
        query: { commentAssignmentId: input.commentAssignmentId },
        body: { content: input.content },
      },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type ResponseDeleteCommentService = {
  message: string;
};

export async function DeleteCommentStudentService(
  input: RequestDeleteCommentService
): Promise<ResponseDeleteCommentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/comment-assignments/${input.commentAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export async function DeleteCommentTeacherService(
  input: RequestDeleteCommentService
): Promise<ResponseDeleteCommentService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/comment-assignments/${input.commentAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
