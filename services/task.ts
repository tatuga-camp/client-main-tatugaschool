import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";
import { Task } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateTaskService = {
  title: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  assigneeId: string;
  teamId: string;
  schoolId: string;
  boardId: string;
  columId: string;
};

type ResponseCreateTaskService = Task;

export async function CreateTaskService(
  input: RequestCreateTaskService
): Promise<ResponseCreateTaskService> {
  try {
    const user = await axios({
      method: "POST",
      url: `/v1/tasks`,
      data: { ...input },
    });
    return user.data;
  } catch (error: any) {
    console.error("Create Task request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateTaskService = {
  taskId: string;
  title: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  assigneeId: string;
  teamId: string;
  schoolId: string;
  boardId: string;
  columId: string;
};

type ResponseUpdateTaskService = Task;

export async function UpdateTaskService(
  input: RequestUpdateTaskService
): Promise<ResponseUpdateTaskService> {
  try {
    const user = await axios({
      method: "PATCH",
      url: `/v1/tasks`,
      data: { ...input },
    });
    return user.data;
  } catch (error: any) {
    console.error("Update Task request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function GetTaskByIdService(
  taskId: string
): Promise<ResponseCreateTaskService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/tasks/${taskId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Task by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function GetTasksByColumnService(
  columnId: string
): Promise<ResponseCreateTaskService[]> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/tasks/column/${columnId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Tasks by Column request failed:", error.response.data);
    throw error?.response?.data;
  }
}

export async function DeleteTaskService(
  taskId: string
): Promise<{ message: string }> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/tasks`,
      data: { taskId },
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Task request failed:", error.response.data);
    throw error?.response?.data;
  }
}
