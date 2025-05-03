import { StudentOnGroup } from "../interfaces";
import createAxiosInstance from "./apiService";

const axiosInstance = createAxiosInstance();

export type ResponseCreateStudentOnGroupService = StudentOnGroup;

export type RequestCreateStudentOnGroupService = {
  unitOnGroupId: string;
  studentOnSubjectId: string;
};

export async function CreateStudentOnGroupService(
  request: RequestCreateStudentOnGroupService
): Promise<ResponseCreateStudentOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/v1/student-on-groups`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseReorderStudentOnGroupService = StudentOnGroup[];

export type RequestReorderStudentOnGroupService = {
  studentOnGroupIds: string[];
};

export async function ReorderStudentOnGroupService(
  request: RequestReorderStudentOnGroupService
): Promise<ResponseReorderStudentOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/student-on-groups/reorder`,
      data: request,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type ResponseDeleteStudentOnGroupService = StudentOnGroup;

export type RequestDeleteStudentOnGroupService = {
  studentOnGroupId: string;
};

export async function DeleteStudentOnGroupService(
  request: RequestDeleteStudentOnGroupService
): Promise<ResponseDeleteStudentOnGroupService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/student-on-groups/${request.studentOnGroupId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
