export type IssueStatus = "OPEN" | "RESOLVED";
export type IssueStatusFilter = IssueStatus | "ALL";

export type IssueGroup = {
  id: string;
  createAt: string;
  updateAt: string;
  fingerprint: string;
  status: IssueStatus;
  errorName: string;
  message: string;
  samplePageUrl: string;
  sampleStack: string;
  sampleComponentStack: string;
  count: number;
  affectedUserCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt?: string | null;
  resolvedByUserId?: string | null;
};

export type IssueReporter = {
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
};

export type IssueReport = {
  id: string;
  createAt: string;
  groupId: string;
  fingerprint: string;
  errorName: string;
  message: string;
  stack: string;
  componentStack: string;
  pageUrl: string;
  userAgent: string;
  capturedAt: string;
  userId?: string | null;
  userEmail?: string | null;
  user?: IssueReporter | null;
};
