import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateMemberOnSchoolService,
  DeleteMemberOnSchoolService,
  GetMemberOnScholByUserIdService,
  GetMembersBySchoolIdService,
  RequestCreateMemberOnSchoolService,
  RequestDeleteMemberOnSchoolService,
  RequestUpdateMemberInvitationService,
  RequestUpdateMemberOnSchoolService,
  UpdateMemberInvitationService,
  UpdateMemberOnSchoolService,
} from "../services";
import { MemberOnSchool } from "../interfaces";

export function useGetMemberOnSchoolBySchool(request: { schoolId: string }) {
  return useQuery({
    queryKey: ["member-on-schools", { schoolId: request.schoolId }],
    queryFn: () => GetMembersBySchoolIdService({ schoolId: request.schoolId }),
  });
}

export function useGetMemberOnSchoolByUser() {
  return useQuery({
    queryKey: ["member-on-schools"],
    queryFn: () => GetMemberOnScholByUserIdService(),
  });
}

export function useCreateMemberOnSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-member-on-school"],
    mutationFn: (input: RequestCreateMemberOnSchoolService) =>
      CreateMemberOnSchoolService(input),
    onSuccess(data, _variables, _context) {
      queryClient.setQueryData(
        ["member-on-schools", { schoolId: data.schoolId }],
        (oldData: MemberOnSchool[]) => {
          return [...oldData, data];
        }
      );
    },
  });
}

export function useUpdateMemberOnSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-member-on-school"],
    mutationFn: (input: RequestUpdateMemberOnSchoolService) =>
      UpdateMemberOnSchoolService(input),
    onSuccess(data, variables, context) {
      const exsitingData = queryClient.getQueryData([
        "member-on-schools",
        { schoolId: data.schoolId },
      ]);

      if (!exsitingData) return;

      queryClient.setQueryData(
        ["member-on-schools", { schoolId: data.schoolId }],
        (oldData: MemberOnSchool[]) => {
          return oldData.map((member) => {
            if (member.id === data.id) {
              return data;
            }
            return member;
          });
        }
      );
    },
  });
}

export function useUpdateInviteMemberOnSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-invite-member-on-school"],
    mutationFn: (
      request: RequestUpdateMemberInvitationService & { schoolId: string }
    ) => UpdateMemberInvitationService(request),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ["member-on-schools", { schoolId: variables.schoolId }],
      });
    },
  });
}

export function useDeleteMemberOnSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-member-on-school"],
    mutationFn: (input: RequestDeleteMemberOnSchoolService) =>
      DeleteMemberOnSchoolService(input),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["member-on-schools", { schoolId: data.schoolId }],
        (oldData: MemberOnSchool[]) => {
          return oldData.filter((member) => member.id !== data.id);
        }
      );
    },
  });
}
