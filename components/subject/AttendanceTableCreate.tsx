import React from "react";
import { CiSaveUp2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { useSound } from "../../hook";
import { Toast } from "primereact/toast";
import { useCreateAttendanceTable } from "../../react-query";
import { useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "primereact/progressbar";
type Props = {
  onClose: () => void;
  toast: React.RefObject<Toast>;
  subjectId: string;
};
function AttendanceTableCreate({ onClose, toast, subjectId }: Props) {
  const queryClient = useQueryClient();
  const [createData, setCreateData] = React.useState<{
    title?: string;
    description?: string;
  }>();
  const successSong = useSound("/sounds/ding.mp3");
  const create = useCreateAttendanceTable();
  const handleCreate = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      if (!createData?.title || !createData?.description) {
        throw new Error("Title and Description is required");
      }
      await create.mutateAsync({
        request: {
          title: createData?.title,
          description: createData?.description,
          subjectId: subjectId,
        },
        queryClient,
      });
      show();
      successSong?.play();

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
  const show = () => {
    toast.current?.show({
      severity: "success",
      summary: "Created",
      detail: "Attendance Table Created",
    });
  };
  return (
    <form onSubmit={handleCreate} className="w-full flex  flex-col">
      <div className="w-full flex justify-end">
        <button
          onClick={() => onClose()}
          className="text-lg hover:bg-gray-300/50 w-6  h-6  rounded
         flex items-center justify-center font-semibold"
        >
          <IoMdClose />
        </button>
      </div>
      <div className="text-lg font-semibold border-b">
        New Attendance Table{" "}
        <span className="text-xs text-gray-400 font-normal">( create )</span>
      </div>
      <div className="flex flex-col mt-5 gap-2">
        <label className="font-medium   flex flex-col gap-1">
          <span className="text-xs ">Title</span>
          <input
            max={99}
            required
            value={createData?.title}
            onChange={(e) =>
              setCreateData((prev) => {
                return { ...prev, title: e.target.value };
              })
            }
            type="text"
            className="main-input"
            placeholder="type your title here"
          />
        </label>
        <label className="font-medium   flex flex-col gap-1">
          <span className="text-xs ">Description</span>
          <textarea
            required
            maxLength={99}
            value={createData?.description}
            onChange={(e) =>
              setCreateData((prev) => {
                return { ...prev, description: e.target.value };
              })
            }
            className="main-input h-40 resize-none"
          />
        </label>
        {create.isPending && (
          <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        )}
        <button
          disabled={create.isPending}
          className="second-button flex items-center justify-center gap-1 py-1 border "
        >
          <CiSaveUp2 />
          Save Change
        </button>
      </div>
    </form>
  );
}

export default AttendanceTableCreate;
