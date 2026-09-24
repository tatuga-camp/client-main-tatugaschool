import axios from "axios";
import {
  IssueGroup,
  IssueReport,
  IssueStatus,
  IssueStatusFilter,
} from "../interfaces";
import { getAccessToken } from "../utils/token";
// "./auth" and "./api-service" import each other, and auth calls
// createAxiosInstance() at module top level, so whichever of the two is
// entered first decides the outcome: auth first works, api-service first
// throws "Cannot access 'createAxiosInstance' before initialization" while
// `next build` collects page data. Every other services module is reached
// through the services barrel (whose first export is "./auth"), but this one
// is imported directly by ErrorBoundary from _app, so it must enter auth
// itself before api-service. Keep this side-effect import above the next one.
import "./auth";
import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type RequestCreateIssueReportService = {
  errorName: string;
  message: string;
  stack: string;
  componentStack: string;
  pageUrl: string;
  userAgent: string;
  capturedAt: string;
};

export type ResponseCreateIssueReportService = {
  reportId: string;
  groupId: string;
};

/**
 * Sent from the crash screen. Deliberately NOT the shared axios instance:
 * that one redirects to /auth/sign-in when no refresh token exists and tries
 * to refresh tokens, neither of which we want while the app is broken.
 * The access token is attached when present so the server can attribute
 * the report; otherwise the report is anonymous.
 */
export async function CreateIssueReportService(
  input: RequestCreateIssueReportService,
): Promise<ResponseCreateIssueReportService> {
  const { access_token } = getAccessToken();
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/issues/reports`,
      input,
      {
        timeout: 15000,
        headers: access_token
          ? { Authorization: `Bearer ${access_token}` }
          : undefined,
      },
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
}

export type RequestGetIssuesService = {
  status?: IssueStatusFilter;
  search?: string;
  page?: number;
  limit?: number;
};

export type ResponseGetIssuesService = {
  items: IssueGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: { open: number; resolved: number };
};

export async function GetIssuesService(
  query: RequestGetIssuesService,
): Promise<ResponseGetIssuesService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: "/v1/issues",
      params: query,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestGetIssueService = {
  groupId: string;
  page?: number;
  limit?: number;
};

export type ResponseGetIssueService = {
  group: IssueGroup;
  reports: {
    items: IssueReport[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function GetIssueService({
  groupId,
  ...query
}: RequestGetIssueService): Promise<ResponseGetIssueService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/issues/${groupId}`,
      params: query,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestUpdateIssueStatusService = {
  groupId: string;
  status: IssueStatus;
};

export async function UpdateIssueStatusService({
  groupId,
  status,
}: RequestUpdateIssueStatusService): Promise<IssueGroup> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: `/v1/issues/${groupId}/status`,
      data: { status },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
