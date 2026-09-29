import { Toast } from "primereact/toast";
import { ErrorMessages, GroupOnSubject } from "../../../interfaces";
import {
  useCreateGroupOnSubject,
  useGetLanguage,
  useUpdateGroupOnSubject,
} from "../../../react-query";
import { groupOnSubjectLanguage } from "../../../data/languages";
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
  const language = useGetLanguage();
  const lang = language.data ?? "en";
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
        throw new Error(groupOnSubjectLanguage.fillOutAllData(lang));
      }
      await create.mutateAsync({
        title: groupOnSubjectData.title,
        description: groupOnSubjectData.description,
        subjectId: subjectId,
        numberOfGroups: groupOnSubjectData.numberOfGroups,
      });

      toast.current?.show({
        severity: "success",
        summary: groupOnSubjectLanguage.createdToastSummary(lang),
        detail: groupOnSubjectLanguage.createdToastDetail(lang),
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
        summary: groupOnSubjectLanguage.updatedToastSummary(lang),
        detail: groupOnSubjectLanguage.updatedToastDetail(lang),
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
  const isSaving = create.isPending || update.isPending;
  return (
    <form
      onSubmit={(e) => {
        if (data) {
          handleUpdateGroup(e, data);
        } else {
          handleCreateGroup(e);
        }
      }}
      className="m-4 flex w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white font-Anuphan shadow-xl"
    >
      {isSaving && <LoadingBar />}
      <header className="flex items-center gap-3 border-b border-gray-100 px-5 pb-3 pt-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-color/10 text-lg text-primary-color">
          <MdGroup />
        </span>
        <h2 className="text-lg font-semibold text-icon-color">
          {data
            ? groupOnSubjectLanguage.updateGroup(lang)
            : groupOnSubjectLanguage.createGroup(lang)}
        </h2>
      </header>
      <main className="flex flex-col gap-4 p-5">
        <label className="flex w-full flex-col gap-1.5">
          <span className="text-sm font-medium text-icon-color">
            {groupOnSubjectLanguage.titleLabel(lang)}
          </span>
          <input
            required
            value={groupOnSubjectData.title ?? ""}
            onChange={(e) => {
              setGroupOnSubjectData((prev) => {
                return {
                  ...prev,
                  title: e.target.value,
                };
              });
            }}
            type="text"
            className="main-input h-10"
          />
        </label>
        <label className="flex w-full flex-col gap-1.5">
          <span className="text-sm font-medium text-icon-color">
            {groupOnSubjectLanguage.descriptionLabel(lang)}
          </span>
          <textarea
            required
            rows={3}
            value={groupOnSubjectData.description ?? ""}
            onChange={(e) => {
              setGroupOnSubjectData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              });
            }}
            className="main-input resize-none"
          />
        </label>
        {!data && (
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-icon-color">
              {groupOnSubjectLanguage.numberOfGroupsLabel(lang)}
            </span>
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
              className="main-input h-10 w-32"
            />
          </label>
        )}
      </main>
      <footer className="flex items-center justify-end gap-2 border-t border-gray-100 p-4">
        <button
          onClick={() => onClose()}
          disabled={isSaving}
          type="button"
          className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color"
        >
          {groupOnSubjectLanguage.cancel(lang)}
        </button>
        <button
          disabled={isSaving}
          type="submit"
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary-color px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:opacity-60"
        >
          {!data && <FiPlus />}
          {data
            ? groupOnSubjectLanguage.updateGroup(lang)
            : groupOnSubjectLanguage.createGroup(lang)}
        </button>
      </footer>
    </form>
  );
}
export default GroupSetting;
