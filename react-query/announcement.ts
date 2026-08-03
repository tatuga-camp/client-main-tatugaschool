import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAnnouncementCommentTeacherService,
  CreateAnnouncementService,
  DeleteAnnouncementCommentTeacherService,
  DeleteAnnouncementService,
  GetAnnouncementCommentsTeacherService,
  GetAnnouncementsTeacherService,
  RequestCreateAnnouncementCommentTeacherService,
  RequestCreateAnnouncementService,
  RequestDeleteAnnouncementCommentTeacherService,
  RequestDeleteAnnouncementService,
  RequestToggleAnnouncementReactionTeacherService,
  RequestUpdateAnnouncementService,
  ToggleAnnouncementReactionTeacherService,
  UpdateAnnouncementService,
} from "../services";

export function useGetAnnouncementsTeacher(input: { subjectId: string }) {
  return useQuery({
    queryKey: ["announcements-teacher", { subjectId: input.subjectId }],
    queryFn: () =>
      GetAnnouncementsTeacherService({ subjectId: input.subjectId }),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-announcement"],
    mutationFn: (input: RequestCreateAnnouncementService) =>
      CreateAnnouncementService(input),
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["announcements-teacher", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-announcement"],
    mutationFn: (input: RequestUpdateAnnouncementService) =>
      UpdateAnnouncementService(input),
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["announcements-teacher", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-announcement"],
    mutationFn: (input: RequestDeleteAnnouncementService) =>
      DeleteAnnouncementService(input),
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["announcements-teacher", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useGetAnnouncementCommentsTeacher(input: {
  announcementId: string;
}) {
  return useQuery({
    queryKey: [
      "announcement-comments-teacher",
      { announcementId: input.announcementId },
    ],
    queryFn: () =>
      GetAnnouncementCommentsTeacherService({
        announcementId: input.announcementId,
      }),
  });
}

export function useCreateAnnouncementCommentTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-announcement-comment-teacher"],
    mutationFn: (input: RequestCreateAnnouncementCommentTeacherService) =>
      CreateAnnouncementCommentTeacherService(input),
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: [
          "announcement-comments-teacher",
          { announcementId: data.announcementId },
        ],
      });
    },
  });
}

export function useDeleteAnnouncementCommentTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-announcement-comment-teacher"],
    mutationFn: (input: RequestDeleteAnnouncementCommentTeacherService) =>
      DeleteAnnouncementCommentTeacherService(input),
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: [
          "announcement-comments-teacher",
          { announcementId: data.announcementId },
        ],
      });
    },
  });
}

export function useToggleAnnouncementReactionTeacher(input: {
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["toggle-announcement-reaction-teacher"],
    mutationFn: (request: RequestToggleAnnouncementReactionTeacherService) =>
      ToggleAnnouncementReactionTeacherService(request),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["announcements-teacher", { subjectId: input.subjectId }],
      });
    },
  });
}
