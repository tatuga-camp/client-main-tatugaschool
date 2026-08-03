import createAxiosInstance from "./api-service";

const axiosInstance = createAxiosInstance();

export type FileOnAnnouncement = {
  id: string;
  createAt: string;
  updateAt: string;
  type?: string;
  url: string;
  name?: string;
  size: number;
  blurHash?: string;
  announcementId: string;
  subjectId: string;
  schoolId: string;
};

export type ReactionOnAnnouncement = {
  id: string;
  createAt: string;
  updateAt: string;
  emoji: string;
  firstName: string;
  photo?: string;
  announcementId: string;
  subjectId: string;
  schoolId: string;
  studentId?: string;
  userId?: string;
};

export type CommentOnAnnouncement = {
  id: string;
  createAt: string;
  updateAt: string;
  content: string;
  title: string;
  firstName: string;
  lastName: string;
  photo?: string;
  blurHash?: string;
  number?: string;
  role?: string;
  email?: string;
  announcementId: string;
  subjectId: string;
  schoolId: string;
  studentId?: string;
  userId?: string;
};

export type Announcement = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  content: string;
  firstName: string;
  lastName: string;
  photo?: string;
  blurHash?: string;
  userId: string;
  subjectId: string;
  schoolId: string;
  files: FileOnAnnouncement[];
  reactions: ReactionOnAnnouncement[];
  _count: { comments: number };
};

export type RequestCreateAnnouncementService = {
  title: string;
  content: string;
  subjectId: string;
};

export type ResponseCreateAnnouncementService = Announcement;
export async function CreateAnnouncementService(
  input: RequestCreateAnnouncementService,
): Promise<ResponseCreateAnnouncementService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/announcements",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestGetAnnouncementsTeacherService = { subjectId: string };
export type ResponseGetAnnouncementsTeacherService = Announcement[];
export async function GetAnnouncementsTeacherService(
  input: RequestGetAnnouncementsTeacherService,
): Promise<ResponseGetAnnouncementsTeacherService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/announcements/subject/${input.subjectId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestUpdateAnnouncementService = {
  query: { announcementId: string };
  body: { title?: string; content?: string };
};
export type ResponseUpdateAnnouncementService = Announcement;
export async function UpdateAnnouncementService(
  input: RequestUpdateAnnouncementService,
): Promise<ResponseUpdateAnnouncementService> {
  try {
    const response = await axiosInstance({
      method: "PATCH",
      url: "/v1/announcements",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestDeleteAnnouncementService = { announcementId: string };
export type ResponseDeleteAnnouncementService = Announcement;
export async function DeleteAnnouncementService(
  input: RequestDeleteAnnouncementService,
): Promise<ResponseDeleteAnnouncementService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/announcements/${input.announcementId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestGetAnnouncementCommentsTeacherService = {
  announcementId: string;
};
export type ResponseGetAnnouncementCommentsTeacherService =
  CommentOnAnnouncement[];
export async function GetAnnouncementCommentsTeacherService(
  input: RequestGetAnnouncementCommentsTeacherService,
): Promise<ResponseGetAnnouncementCommentsTeacherService> {
  try {
    const response = await axiosInstance({
      method: "GET",
      url: `/v1/comment-on-announcements/announcement/${input.announcementId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestCreateAnnouncementCommentTeacherService = {
  announcementId: string;
  content: string;
};
export type ResponseCreateAnnouncementCommentTeacherService =
  CommentOnAnnouncement;
export async function CreateAnnouncementCommentTeacherService(
  input: RequestCreateAnnouncementCommentTeacherService,
): Promise<ResponseCreateAnnouncementCommentTeacherService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/comment-on-announcements/teacher",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestDeleteAnnouncementCommentTeacherService = {
  commentOnAnnouncementId: string;
};
export type ResponseDeleteAnnouncementCommentTeacherService =
  CommentOnAnnouncement;
export async function DeleteAnnouncementCommentTeacherService(
  input: RequestDeleteAnnouncementCommentTeacherService,
): Promise<ResponseDeleteAnnouncementCommentTeacherService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/comment-on-announcements/${input.commentOnAnnouncementId}/teacher`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestToggleAnnouncementReactionTeacherService = {
  announcementId: string;
  emoji: string;
};
export type ResponseToggleAnnouncementReactionTeacherService = {
  action: "added" | "removed" | "switched";
  reaction: ReactionOnAnnouncement | null;
};
export async function ToggleAnnouncementReactionTeacherService(
  input: RequestToggleAnnouncementReactionTeacherService,
): Promise<ResponseToggleAnnouncementReactionTeacherService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/reaction-on-announcements/toggle/teacher",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestCreateFileOnAnnouncementService = {
  announcementId: string;
  url: string;
  type?: string;
  name?: string;
  size: number;
  blurHash?: string;
};
export type ResponseCreateFileOnAnnouncementService = FileOnAnnouncement;
export async function CreateFileOnAnnouncementService(
  input: RequestCreateFileOnAnnouncementService,
): Promise<ResponseCreateFileOnAnnouncementService> {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/v1/file-on-announcements",
      data: { ...input },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}

export type RequestDeleteFileOnAnnouncementService = {
  fileOnAnnouncementId: string;
};
export type ResponseDeleteFileOnAnnouncementService = FileOnAnnouncement;
export async function DeleteFileOnAnnouncementService(
  input: RequestDeleteFileOnAnnouncementService,
): Promise<ResponseDeleteFileOnAnnouncementService> {
  try {
    const response = await axiosInstance({
      method: "DELETE",
      url: `/v1/file-on-announcements/${input.fileOnAnnouncementId}`,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
}
