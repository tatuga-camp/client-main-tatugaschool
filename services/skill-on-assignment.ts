import { SkillOnAssignment } from "@/interfaces";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateSkillOnAssignmentService = {
  skillId: string;
  assignmentId: string;
};

type ResponseCreateSkillOnAssignmentService = SkillOnAssignment;

export async function CreateSkillOnAssignmentService(
  input: RequestCreateSkillOnAssignmentService
): Promise<ResponseCreateSkillOnAssignmentService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/skill-on-assignments`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Create Skill on Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestGetSkillOnAssignmentByAssignmentIdService = {
  assignmentId: string;
};

type ResponseGetSkillOnAssignmentByAssignmentIdService = SkillOnAssignment;

export async function GetSkillOnAssignmentByAssignmentIdService(
  input: RequestGetSkillOnAssignmentByAssignmentIdService
): Promise<ResponseGetSkillOnAssignmentByAssignmentIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/skill-on-assignments/assignment/${input.assignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Get Skill on Assignment by AssignmentId request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}

type RequestDeleteSkillOnAssignmentService = {
  skillOnAssignmentId: string;
};

type ResponseDeleteSkillOnAssignmentService = {
  message: string;
};

export async function DeleteSkillOnAssignmentService(
  input: RequestDeleteSkillOnAssignmentService
): Promise<ResponseDeleteSkillOnAssignmentService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/skill-on-assignments/${input.skillOnAssignmentId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Delete Skill on Assignment request failed:",
      error.response.data
    );
    throw error?.response?.data;
  }
}
