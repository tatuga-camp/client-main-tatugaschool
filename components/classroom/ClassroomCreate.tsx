import React from "react";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";
import { classroomUiLanguage } from "../../data/languages";
import { Classroom, ErrorMessages } from "../../interfaces";
import { useCreateClassroom, useGetLanguage } from "../../react-query";
import { fieldInputClass, FormField } from "../common/FormField";
import InputClassLevel from "../common/InputClassLevel";
import ClassLevelBadge from "./ClassLevelBadge";

type Props = {
  schoolId: string;
  toast: React.RefObject<Toast>;
  onClose?: () => void;
  onSuccess?: (classroom: Classroom) => void;
};

function ClassesCreate({ schoolId, toast, onClose, onSuccess }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const createClassroom = useCreateClassroom();
  const [data, setData] = React.useState({
    title: "",
    description: "",
    level: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createClassroom.mutateAsync({
        title: data.title.trim(),
        description: data.description.trim(),
        level: data.level,
        schoolId,
      });
      toast.current?.show({
        severity: "success",
        summary: classroomUiLanguage.created(lang),
        life: 3000,
      });
      setData({ title: "", description: "", level: "" });
      onClose?.();
      onSuccess?.(created);
    } catch (error) {
      const result = error as ErrorMessages | undefined;
      Swal.fire({
        title: result?.error ? result.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <form onSubmit={handleCreate} className="flex w-full flex-col gap-5">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <InputClassLevel
            required
            title={classroomUiLanguage.fieldLevel(lang)}
            value={data.level}
            onChange={(value) => setData((prev) => ({ ...prev, level: value }))}
          />
        </div>
        <ClassLevelBadge level={data.level} />
      </div>
      <FormField id="classroom-create-title" label={classroomUiLanguage.fieldTitle(lang)}>
        <input
          id="classroom-create-title"
          required
          value={data.title}
          onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={classroomUiLanguage.titlePlaceholder(lang)}
          className={fieldInputClass()}
        />
      </FormField>
      <FormField
        id="classroom-create-description"
        label={classroomUiLanguage.fieldDescription(lang)}
      >
        <input
          id="classroom-create-description"
          required
          value={data.description}
          onChange={(e) =>
            setData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder={classroomUiLanguage.descriptionPlaceholder(lang)}
          className={fieldInputClass()}
        />
      </FormField>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-xl border border-icon-color/15 font-semibold text-icon-color transition-colors hover:bg-background-color"
        >
          {classroomUiLanguage.cancel(lang)}
        </button>
        <button
          type="submit"
          disabled={createClassroom.isPending}
          aria-busy={createClassroom.isPending}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-color font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-wait disabled:opacity-80"
        >
          {createClassroom.isPending && (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
          )}
          {createClassroom.isPending
            ? classroomUiLanguage.creating(lang)
            : classroomUiLanguage.createClassroom(lang)}
        </button>
      </div>
    </form>
  );
}

export default ClassesCreate;
