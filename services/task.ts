import axios from "axios";
import { parseCookies } from "nookies";
import { Task } from "../interfaces";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateTaskService = Task;

type ResponseCreateTaskService = Task;

export async function CreateTaskService(
  input: RequestCreateTaskService
): Promise<ResponseCreateTaskService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/tasks`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestUpdateTaskService = Task;
type ResponseUpdateTaskService = Task;

export async function UpdateTaskService(
  input: RequestUpdateTaskService
): Promise<ResponseUpdateTaskService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/tasks/${input.id}`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetTaskByIdService = {
  taskId: string;
};

type ResponseGetTaskByIdService = Task;

export async function GetTaskByIdService(
  input: RequestGetTaskByIdService
): Promise<ResponseGetTaskByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/tasks/${input.taskId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestGetTasksByColumnService = {
  columnId: string;
};

type ResponseGetTasksByColumnService = Task[];

export async function GetTasksByColumnService(
  input: RequestGetTasksByColumnService
): Promise<ResponseGetTasksByColumnService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/tasks/column/${input.columnId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

type RequestDeleteTaskService = {
  taskId: string;
};

type ResponseDeleteTaskService = {
  message: string;
};

export async function DeleteTaskService(
  input: RequestDeleteTaskService
): Promise<ResponseDeleteTaskService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/tasks/${input.taskId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}