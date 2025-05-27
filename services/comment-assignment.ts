import { CommentOnAssignment } from "@/interfaces";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateCommentTeacher = {
  content: string;
  studentOnAssignmentId: string;
};

export type RequestUpdateCommentService = {
  query: {
    commentOnAssignmentId: string;
  };
  body: {
    content?: string;
  };
};

export type RequestDeleteCommentService = {
  commentAssignmentId: string;
};

type ResponseCommentOnAssignmentComment = CommentOnAssignment;

export async function CreateCommentTeacherService(
  input: RequestCreateCommentTeacher,
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

export async function GetCommentTeacherService(
  input: RequestGetCommentService,
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

export async function UpdateCommentTeacherService(
  input: RequestUpdateCommentService,
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/comment-assignments/teacher`,
      data: {
        ...input,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseDeleteCommentService = CommentOnAssignment;

export async function DeleteCommentTeacherService(
  input: RequestDeleteCommentService,
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
