import { Team } from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";
import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();
const access_token = cookies.access_token;

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
axios.defaults.headers.common["Content-Type"] = "application/json";

type RequestCreateTeamService = Team;

type ResponseCreateTeamService = Team;

export async function CreateTeamService(
  input: RequestCreateTeamService
): Promise<ResponseCreateTeamService> {
  try {
    const response = await axios({
      method: "POST",
      url: `/v1/teams`,
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Create Team request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetTeamsService = {
  schoolId: string;
};

type ResponseGetTeamsService = Team;

export async function GetTeamsBySchoolIdService(
  input: RequestGetTeamsService
): Promise<ResponseGetTeamsService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/teams`,
      params: { ...input },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Teams request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestGetTeamByIdService = {
  teamId: string;
};

type ResponseGetTeamByIdService = Pagination<Team>;

export async function GetTeamByIdService(
  input: RequestGetTeamByIdService
): Promise<ResponseGetTeamByIdService> {
  try {
    const response = await axios({
      method: "GET",
      url: `/v1/teams/${input.teamId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Get Team by ID request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestUpdateTeamService = {
    query: { teamId: string };
    body: {
        schoolId: string;
        title: string;
        description: string;
        icon: string;
    };
  };

type ResponseUpdateTeamService = Team;

export async function UpdateTeamService(
  input: RequestUpdateTeamService
): Promise<ResponseUpdateTeamService> {
  try {
    const response = await axios({
      method: "PATCH",
      url: `/v1/teams/${input.query.teamId}`,
      data: { ...input.body },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update Team request failed:", error.response.data);
    throw error?.response?.data;
  }
}

type RequestDeleteTeamService = {
  teamId: string;
};

type ResponseDeleteTeamService = Team;

export async function DeleteTeamService(
  input: RequestDeleteTeamService
): Promise<ResponseDeleteTeamService> {
  try {
    const response = await axios({
      method: "DELETE",
      url: `/v1/teams/${input.teamId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Team request failed:", error.response.data);
    throw error?.response?.data;
  }
}
