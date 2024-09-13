import { CommentOnAssignmentStudent, CommentOnAssignmentTeacher } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

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

type ResponseCommentOnAssignmentComment = CommentOnAssignmentStudent | CommentOnAssignmentTeacher;

export async function CreateCommentStudentService(
  input: RequestCreateCommentStudent
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axios({
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
    const response = await axios({
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

export async function GetCommentStudentService(
  input: RequestGetCommentService
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axios({
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
): Promise<ResponseCommentOnAssignmentComment> {
  try {
    const response = await axios({
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
    const response = await axios({
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
    const response = await axios({
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
    const response = await axios({
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
    const response = await axios({
      method: "DELETE",
      url: `/v1/comment-assignments/${input.commentAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}