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
  }>({
    title: data?.title,
    description: data?.description,
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
    data: GroupOnSubject
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
      className="w-96 h-96 p-5 flex flex-col pb-2 rounded-md border bg-white"
    >
      <header className="w-full  flex items-center justify-start text-lg text-black gap-1 border-b">
        <MdGroup /> {data ? "Update Group" : "Create Group"}
      </header>
      {(create.isPending || update.isPending) && <LoadingBar />}
      <main className="grow  flex pb-2 flex-col gap-2">
        <label className="flex mt-2 flex-col w-full">
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
        <label className="flex  flex-col w-full grow">
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
            className="main-input resize-none grow"
          />
        </label>
      </main>
      <footer className="flex items-center border-t pt-3 justify-end gap-2">
        <button
          onClick={() => onClose()}
          disabled={create.isPending || update.isPending}
          type="button"
          className="second-button border flex items-center justify-center gap-1"
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
