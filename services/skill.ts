import { Skill } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateSkillService = {
  title: string;
  description: string;
  keywords: string[];
};

type ResponseCreateSkillService = Skill;

export async function CreateSkillService(
  input: RequestCreateSkillService
): Promise<ResponseCreateSkillService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/skills`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Skill request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateSkillService = {
  query: { skillId: string };
  body: {
    title: string;
    description: string;
    keywords: string[];
  };
};

type ResponseUpdateSkillService = Skill;

export async function UpdateSkillService(
  input: RequestUpdateSkillService
): Promise<ResponseUpdateSkillService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/skills/${input.query.skillId}`,
      data: { ...input.body },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Skill request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteSkillService = {
  skillId: string;
};

type ResponseDeleteSkillService = {
  message: string;
};

export async function DeleteSkillService(
  input: RequestDeleteSkillService
): Promise<ResponseDeleteSkillService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/skills/${input.skillId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Skill request failed:", error.response.data);
    throw error?.response?.data;
  }
}
