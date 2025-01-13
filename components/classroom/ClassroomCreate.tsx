import React from "react";
import { SiGoogleclassroom } from "react-icons/si";
import InputWithIcon from "../common/InputWithIcon";
import { TbFileDescription } from "react-icons/tb";
import ClassLevel from "../common/InputClassLevel";
import { useCreateClassroom } from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { useSound } from "../../hook";
import { Toast } from "primereact/toast";

type Props = {
  schoolId: string;
  toast: React.RefObject<Toast>;
  onClose?: () => void;
};
function ClassesCreate({ schoolId, toast, onClose }: Props) {
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const createClassroom = useCreateClassroom();
  const [data, setData] = React.useState<{
    title: string;
    description: string;
    level: string;
  }>({
    title: "",
    description: "",
    level: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await createClassroom.mutateAsync({
        title: data.title,
        description: data.description,
        level: data.level,
        schoolId: schoolId,
      });
      sound.play();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Classroom created",
        life: 3000,
      });
      setData({
        title: "",
        description: "",
        level: "",
      });
      onClose?.();
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
    <form onSubmit={handleCreate} className="w-full flex flex-col gap-1">
      <ClassLevel
        required={true}
        value={data.level}
        onChange={(value) => setData((prev) => ({ ...prev, level: value }))}
      />
      <InputWithIcon
        value={data.title}
        onChange={(value) => setData((prev) => ({ ...prev, title: value }))}
        title="Title"
        icon={<SiGoogleclassroom />}
        required
        placeholder="Enter class title"
      />
      <InputWithIcon
        required
        value={data.description}
        onChange={(value) =>
          setData((prev) => ({ ...prev, description: value }))
        }
        title="Description"
        icon={<TbFileDescription />}
        placeholder="Enter class description"
      />

      <button
        disabled={createClassroom.isPending}
        className="main-button rounded-full mt-5 flex items-center justify-center"
      >
        {createClassroom.isPending ? <LoadingSpinner /> : "Create"}
      </button>
    </form>
  );
}

export default ClassesCreate;
