export type LineGroupOnSubject = {
  id: string;
  createAt: string;
  updateAt: string;
  lineGroupId: string;
  groupName: string | null;
  isVerify: boolean;
  verifyToken: string | null;
  verifyExpireAt: string | null;
  // Set when the link is verified; the server orders links by it for the caps.
  verifiedAt: string | null;
  allowAssignment: boolean;
  allowMorningSummary: boolean;
  allowAnnouncement: boolean;
  allowAi: boolean;
  subjectId: string;
  schoolId: string;
};

export type LineGroupSwitch =
  | "allowAssignment"
  | "allowMorningSummary"
  | "allowAnnouncement"
  | "allowAi";
