import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { ErrorMessages, Grade, GradeRule } from "../../interfaces";
import InputNumber from "../common/InputNumber";
import { FiPlus } from "react-icons/fi";
import { useCreateGrade, useUpdateGrade } from "../../react-query";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import { defaultGradeRule } from "../../utils";

type Props = {
  onClose: () => void;
  grade: Grade | null;
  subjectId: string;
  toast: React.RefObject<Toast>;
};
function GradeSetting({ onClose, grade, subjectId, toast }: Props) {
  const create = useCreateGrade();
  const update = useUpdateGrade();

  const [gradeRules, setGradeRules] = useState<
    (GradeRule & { id: string })[] | null
  >(
    grade?.gradeRules
      .sort((a, b) => b.min - a.min)
      .map((g, index) => {
        return {
          id: crypto.randomUUID(),
          ...g,
        };
      }) ?? [
      ...defaultGradeRule.map((g) => {
        return { ...g, id: crypto.randomUUID() };
      }),
    ]
  );

  const handleAddRow = () => {
    setGradeRules((prev) => {
      if (!prev) {
        return null;
      }
      return [...prev, { max: 0, min: 0, grade: "", id: crypto.randomUUID() }];
    });
  };

  const handleRemoveRow = (id: string) => {
    setGradeRules((prev) => {
      if (!prev) {
        return null;
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!gradeRules) {
        throw new Error("Grade Range Error");
      }
      if (!grade) {
        await create.mutateAsync({
          subjectId,
          gradeRanges: gradeRules,
        });
      }

      if (grade) {
        await update.mutateAsync({
          query: {
            gradeRangeId: grade.id,
          },
          body: {
            gradeRanges: gradeRules,
          },
        });
      }
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Changes has been saved",
        life: 3000,
      });
      document.body.style.overflow = "auto";
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
      onSubmit={handleUpdate}
      className="w-96 h-max  bg-gray-100 rounded-md border  p-3 flex flex-col gap-1"
    >
      <header className="w-full flex items-center justify-between border-b">
        <h1>Grade Setting</h1>
        <button
          type="button"
          onClick={() => {
            document.body.style.overflow = "auto";
            onClose();
          }}
          className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
        >
          <IoMdClose />
        </button>
      </header>
      <main>
        <ul className="w-full p-2 max-h-80 overflow-auto gap-2 grid">
          <li className="grid grid-cols-4 gap-2">
            <span>Max</span>
            <span>Min</span>
            <span>Grade</span>
            <span>Action</span>
          </li>
          {gradeRules?.map((grade, index, array) => {
            return (
              <GradeRuleItem
                onAdd={() => handleAddRow()}
                onRemove={(id) => handleRemoveRow(id)}
                isLastItem={array.length === index + 1}
                key={index}
                setGradeRules={setGradeRules}
                data={grade}
              />
            );
          })}
        </ul>
      </main>
      <footer className="w-full pt-3 border-t  justify-end gap-3 flex">
        <button
          type="button"
          onClick={() => {
            document.body.style.overflow = "auto";
            onClose();
          }}
          className="second-button border flex items-center justify-center gap-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="main-button flex items-center justify-center gap-1"
        >
          <FiPlus /> Update
        </button>
      </footer>
    </form>
  );
}

export default GradeSetting;

type GradeRuleItemProps = {
  data: GradeRule & { id: string };
  setGradeRules: React.Dispatch<
    React.SetStateAction<
      | (GradeRule & {
          id: string;
        })[]
      | null
    >
  >;
  isLastItem?: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
};
function GradeRuleItem({
  data,
  setGradeRules,
  isLastItem,
  onAdd,
  onRemove,
}: GradeRuleItemProps) {
  return (
    <li className="w-72 h-10 grid grid-cols-4 gap-2">
      <InputNumber
        required
        value={data.max}
        placeholder="max"
        onValueChange={(value) =>
          setGradeRules((prev) => {
            if (!prev) {
              return null;
            }
            return prev.map((grade) => {
              return grade.id === data.id ? { ...grade, max: value } : grade;
            });
          })
        }
      />
      <InputNumber
        required
        value={data.min}
        placeholder="min"
        onValueChange={(value) =>
          setGradeRules((prev) => {
            if (!prev) {
              return null;
            }
            return prev.map((grade) => {
              return grade.id === data.id ? { ...grade, min: value } : grade;
            });
          })
        }
      />
      <input
        required
        type="text"
        value={data.grade}
        placeholder="Grade"
        onChange={(e) =>
          setGradeRules((prev) => {
            if (!prev) {
              return null;
            }
            return prev.map((grade) => {
              return grade.id === data.id
                ? { ...grade, grade: e.target.value }
                : grade;
            });
          })
        }
        className="main-input w-full h-10"
      />

      <div className="flex items-center gap-2 justify-start px-5">
        <button
          onClick={() => onRemove(data.id)}
          title="Delete Row"
          type="button"
          className="text-red-500 bg-red-100 p-1 rounded"
        >
          <IoMdClose />
        </button>
        {isLastItem === true && (
          <button
            onClick={() => onAdd()}
            title="Add Row"
            type="button"
            className="text-green-500 bg-green-100 p-1 rounded"
          >
            <FiPlus />
          </button>
        )}
      </div>
    </li>
  );
}
