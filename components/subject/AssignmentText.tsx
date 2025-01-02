import React from "react";
import TextEditor from "../common/TextEditor";
import { ErrorMessages, FileOnStudentOnAssignment } from "../../interfaces";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";

import { ProgressSpinner } from "primereact/progressspinner";
import useEscKey from "../../hook/useKeyboard";
import { useUpdateFileStudentOnAssignment } from "../../react-query";

type Props = {
  toast: React.RefObject<Toast>;
  studentOnAssignmentId: string;
  text: FileOnStudentOnAssignment;
  onClose: () => void;
};
function AssignmentText({
  studentOnAssignmentId,
  text,
  toast,
  onClose,
}: Props) {
  const [value, setValue] = React.useState(text ? text.body : "");
  const [title, setTitle] = React.useState<string | null>(
    text ? text.name : ""
  );
  const update = useUpdateFileStudentOnAssignment();

  useEscKey(onClose);

  const handleSave = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await update.mutateAsync({
        query: {
          id: text.id,
        },
        body: {
          body: value,
          name: title ?? "",
        },
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Document updated successfully",
        life: 3000,
      });
      onClose();
    } catch (error) {
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
    <form className="w-full h-full flex flex-col gap-2">
      <div className="w-full flex justify-between mt-2">
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title ?? ""}
          type="text"
          placeholder="Add Your Title"
          required
          className="w-72 h-10 main-input"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={update.isPending}
          className="main-button w-60 flex items-center justify-center"
        >
          {update.isPending ? (
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="w-5 h-5"
              strokeWidth="8"
            />
          ) : (
            "Save"
          )}
        </button>
      </div>
      <div className="h-96">
        <TextEditor value={value} onChange={(content) => setValue(content)} />
      </div>
    </form>
  );
}

export default AssignmentText;
