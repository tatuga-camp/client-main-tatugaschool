import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateClassService = {
  title: string;
  level: string;
  description: string;
  educationYear: string;
  schoolId: string;
};

type ResponseCreateClassService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  level: string;
  description: string;
  educationYear: string;
  order: number;
  schoolId: string;
};

export async function CreateClassService(
  input: RequestCreateClassService
): Promise<ResponseCreateClassService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/classes`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Class request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetClassService = {
  schoolId: string;
};

type ResponseGetClassService = {
  data: Array<{
    id: string;
    createAt: string;
    updateAt: string;
    title: string;
    level: string;
    description: string;
    educationYear: string;
    order: number;
    schoolId: string;
  }>;
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    prev: number;
    next: number;
  };
};

export async function GetClassesBySchoolIdService(
  input: RequestGetClassService
): Promise<ResponseGetClassService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/classes`,
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Classes request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetClassByIdService = {
  classId: string;
};

type ResponseGetClassByIdService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  level: string;
  description: string;
  educationYear: string;
  order: number;
  schoolId: string;
};

export async function GetClassByIdService(
  input: RequestGetClassByIdService
): Promise<ResponseGetClassByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/classes/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Class by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateClassService = {
  classId: string;
  schoolId: string;
  title: string;
  level: string;
  description: string;
  educationYear: string;
};

type ResponseUpdateClassService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  level: string;
  description: string;
  educationYear: string;
  order: number;
  schoolId: string;
};

export async function UpdateClassService(
  input: RequestUpdateClassService
): Promise<ResponseUpdateClassService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/classes/${input.classId}`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Class request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteClassService = {
  classId: string;
};

type ResponseDeleteClassService = {
  message: string;
};

export async function DeleteClassService(
  input: RequestDeleteClassService
): Promise<ResponseDeleteClassService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/classes/${input.classId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Class request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestReorderClassesService = {
  classIds: string[];
};

type ResponseReorderClassesService = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  level: string;
  description: string;
  educationYear: string;
  order: number;
  schoolId: string;
};

export async function ReorderClassesService(
  input: RequestReorderClassesService
): Promise<ResponseReorderClassesService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/classes/reorder`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Reorder Classes request failed:", error.response.data);
    throw error?.response?.data;
  }
}
