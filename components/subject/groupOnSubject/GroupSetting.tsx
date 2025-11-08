import { Toast } from "primereact/toast";
import { ErrorMessages, GroupOnSubject } from "../../../interfaces";
import {
  useCreateGroupOnSubject,
  useUpdateGroupOnSubject,
} from "../../../react-query";
import { useState } from "react";
import Swal from "sweetalert2";
import { MdGroup } from "react-icons/md";
import LoadingBar from "../../common/LoadingBar";
import { FiPlus } from "react-icons/fi";

type GroupSettingProps = {
  subjectId: string;
  data?: GroupOnSubject | undefined;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};
function GroupSetting({ subjectId, data, onClose, toast }: GroupSettingProps) {
  const create = useCreateGroupOnSubject();
  const update = useUpdateGroupOnSubject();
  const [groupOnSubjectData, setGroupOnSubjectData] = useState<{
    title?: string | undefined;
    description?: string | undefined;
    numberOfGroups: number;
  }>({
    title: data?.title,
    description: data?.description,
    numberOfGroups: 4,
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!groupOnSubjectData.title || !groupOnSubjectData.description) {
        throw new Error("Fill out all data");
      }
      await create.mutateAsync({
        title: groupOnSubjectData.title,
        description: groupOnSubjectData.description,
        subjectId: subjectId,
        numberOfGroups: groupOnSubjectData.numberOfGroups,
      });

      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Group has been created",
      });

      onClose();
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleUpdateGroup = async (
    e: React.FormEvent,
    data: GroupOnSubject,
  ) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        query: {
          groupOnSubjectId: data.id,
        },
        body: {
          title: groupOnSubjectData.title,
          description: groupOnSubjectData.description,
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Group has been updated",
      });

      onClose();
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <form
      onSubmit={(e) => {
        if (data) {
          handleUpdateGroup(e, data);
        } else {
          handleCreateGroup(e);
        }
      }}
      className="flex h-96 w-96 flex-col rounded-2xl border bg-white p-5 pb-2"
    >
      <header className="flex w-full items-center justify-start gap-1 border-b text-lg text-black">
        <MdGroup /> {data ? "Update Group" : "Create Group"}
      </header>
      {(create.isPending || update.isPending) && <LoadingBar />}
      <main className="flex grow flex-col gap-2 pb-2">
        <label className="mt-2 flex w-full flex-col">
          <span className="text-sm">title</span>
          <input
            required
            value={groupOnSubjectData.title}
            onChange={(e) => {
              setGroupOnSubjectData((prev) => {
                return {
                  ...prev,
                  title: e.target.value,
                };
              });
            }}
            type="text"
            className="main-input"
          />
        </label>
        <label className="flex w-full grow flex-col">
          <span className="text-sm">description</span>
          <textarea
            required
            value={groupOnSubjectData.description}
            onChange={(e) => {
              setGroupOnSubjectData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              });
            }}
            className="main-input grow resize-none"
          />
        </label>
        {!data && (
          <label className="flex w-full grow flex-col">
            <span className="text-sm">numbers of groups</span>
            <input
              required
              type="number"
              min={1}
              max={20}
              value={groupOnSubjectData.numberOfGroups}
              onChange={(e) => {
                setGroupOnSubjectData((prev) => {
                  return {
                    ...prev,
                    numberOfGroups: Number(e.target.value),
                  };
                });
              }}
              className="main-input grow resize-none"
            />
          </label>
        )}
      </main>
      <footer className="flex items-center justify-end gap-2 border-t pt-3">
        <button
          onClick={() => onClose()}
          disabled={create.isPending || update.isPending}
          type="button"
          className="second-button flex items-center justify-center gap-1 border"
        >
          Cancel
        </button>
        <button
          disabled={create.isPending || update.isPending}
          type="submit"
          className="main-button flex items-center justify-center gap-1"
        >
          <FiPlus /> {data ? "Update Group" : "Create Group"}
        </button>
      </footer>
    </form>
  );
}
export default GroupSetting;
