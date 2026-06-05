import { Toast } from "primereact/toast";
import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdDelete, MdEdit } from "react-icons/md";
import { ErrorMessages, Rubric } from "../../../interfaces";
import { useDeleteRubric, useGetLanguage, useGetRubricsBySubject } from "../../../react-query";
import ConfirmDeleteMessage from "../../common/ConfirmDeleteMessage";
import LoadingSpinner from "../../common/LoadingSpinner";
import PopupLayout from "../../layout/PopupLayout";
import RubricBuilder from "./RubricBuilder";

type Props = {
  subjectId: string;
  toast: React.RefObject<Toast>;
};

function RubricList({ subjectId, toast }: Props) {
  const rubrics = useGetRubricsBySubject({ subjectId });
  const deleteRubric = useDeleteRubric();
  const language = useGetLanguage();

  // null = closed, "create" = create modal, otherwise the rubricId being edited.
  const [builderTarget, setBuilderTarget] = useState<"create" | string | null>(
    null,
  );

  const handleDelete = async (rubric: Rubric) => {
    await ConfirmDeleteMessage({
      language: language.data ?? "en",
      callback: async () => {
        try {
          await deleteRubric.mutateAsync({ rubricId: rubric.id });
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Rubric has been deleted",
            life: 3000,
          });
        } catch (error) {
          console.log(error);
          const result = (error as { response?: { data?: ErrorMessages } })
            ?.response?.data ?? (error as ErrorMessages);
          toast.current?.show({
            severity: "error",
            summary: result?.error ? result.error : "Something Went Wrong",
            detail: result?.message
              ? result.message.toString()
              : "Could not delete rubric",
            life: 5000,
          });
        }
      },
    });
  };

  return (
    <div className="mt-5 flex min-h-80 flex-col gap-5 rounded-2xl border bg-white p-4">
      <header className="flex items-center justify-between border-b py-3">
        <h2 className="text-base font-medium sm:text-lg">Rubrics</h2>
        <button
          type="button"
          onClick={() => setBuilderTarget("create")}
          className="main-button flex w-max items-center justify-center gap-1 py-1"
        >
          <FiPlus /> Create rubric
        </button>
      </header>

      {rubrics.isLoading ? (
        <div className="flex w-full items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : !rubrics.data || rubrics.data.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center gap-1 py-8 text-center">
          <h4 className="text-sm font-medium text-gray-600">No rubrics yet</h4>
          <p className="text-xs text-gray-400">
            Create a rubric to grade assignments by criteria.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rubrics.data.map((rubric) => (
            <li
              key={rubric.id}
              className="flex items-center justify-between gap-3 rounded-2xl border bg-gray-50 p-3"
            >
              <div className="flex min-w-0 flex-col">
                <h3 className="truncate text-sm font-semibold">
                  {rubric.title}
                </h3>
                {rubric.description && (
                  <p className="truncate text-xs text-gray-500">
                    {rubric.description}
                  </p>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  title="Edit rubric"
                  onClick={() => setBuilderTarget(rubric.id)}
                  className="second-button flex items-center justify-center gap-1 border py-1"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  type="button"
                  title="Delete rubric"
                  disabled={deleteRubric.isPending}
                  onClick={() => handleDelete(rubric)}
                  className="reject-button flex items-center justify-center gap-1 py-1"
                >
                  <MdDelete /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {builderTarget !== null && (
        <PopupLayout
          onClose={() => {
            document.body.style.overflow = "auto";
            setBuilderTarget(null);
          }}
        >
          <div className="h-max max-h-[90vh] w-[95vw] max-w-3xl overflow-auto rounded-2xl border bg-background-color p-2">
            <RubricBuilder
              subjectId={subjectId}
              rubricId={builderTarget === "create" ? undefined : builderTarget}
              toast={toast}
              onSaved={() => {
                document.body.style.overflow = "auto";
                setBuilderTarget(null);
              }}
              onCancel={() => {
                document.body.style.overflow = "auto";
                setBuilderTarget(null);
              }}
            />
          </div>
        </PopupLayout>
      )}
    </div>
  );
}

export default RubricList;
