import { Team } from "@/interfaces";
import { Pagination } from "@/interfaces/Pagination";

import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

type RequestCreateTeamService = Team;

type ResponseCreateTeamService = Team;

export async function CreateTeamService(
  input: RequestCreateTeamService,
): Promise<ResponseCreateTeamService> {
  try {
    const response = await axiosInstance({
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
  input: RequestGetTeamsService,
): Promise<ResponseGetTeamsService> {
  try {
    const response = await axiosInstance({
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
  input: RequestGetTeamByIdService,
): Promise<ResponseGetTeamByIdService> {
  try {
    const response = await axiosInstance({
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
  input: RequestUpdateTeamService,
): Promise<ResponseUpdateTeamService> {
  try {
    const response = await axiosInstance({
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
  input: RequestDeleteTeamService,
): Promise<ResponseDeleteTeamService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/teams/${input.teamId}`,
    });
    return response.data;
  } catch (error: any) {
    console.error("Delete Team request failed:", error.response.data);
    throw error?.response?.data;
  }
}
