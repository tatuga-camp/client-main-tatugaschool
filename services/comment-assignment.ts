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

type ResponseCreateComment = {
  id: string;
  createAt: string;
  updateAt: string;
  content: string;
  title: string;
  firstName: string;
  lastName: string;
  picture: string;
  role: string;
  status: string;
  schoolId: string;
  studentId: string;
  studentOnAssignmentId: string;
  teacherOnSubjectId?: string;
  userId?: string;
};

export async function CreateCommentStudentService(
  input: RequestCreateCommentStudent
): Promise<ResponseCreateComment> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/comment-assignments/student`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create Comment Student request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export async function CreateCommentTeacherService(
  input: RequestCreateCommentTeacher
): Promise<ResponseCreateComment> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/comment-assignments/teacher`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create Comment Teacher request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export async function GetCommentStudentService(
  studentOnAssignmentId: string
): Promise<ResponseCreateComment> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/comment-assignments/studentOnAssignmentId/${studentOnAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Comment Student request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function GetCommentTeacherService(
  studentOnAssignmentId: string
): Promise<ResponseCreateComment> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/comment-assignments/studentOnAssignmentId/${studentOnAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Comment Teacher request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function UpdateCommentStudentService(
  commentAssignmentId: string,
  content: string
): Promise<ResponseCreateComment> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/comment-assignments/student`,
      data: {
        query: { commentAssignmentId },
        body: { content },
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Comment Student request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export async function UpdateCommentTeacherService(
  commentAssignmentId: string,
  content: string
): Promise<ResponseCreateComment> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/comment-assignments/teacher`,
      data: {
        query: { commentAssignmentId },
        body: { content },
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Update Comment Teacher request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export async function DeleteCommentStudentService(
  commentAssignmentId: string
): Promise<{ message: string }> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/comment-assignments/${commentAssignmentId}/student`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Comment Student request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

export async function DeleteCommentTeacherService(
  commentAssignmentId: string
): Promise<{ message: string }> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/comment-assignments/${commentAssignmentId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Comment Teacher request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
