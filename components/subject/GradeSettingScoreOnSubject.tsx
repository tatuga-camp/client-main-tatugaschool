import React, { useState } from "react";
import { useUpdateScoreOnSubject } from "../../react-query";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveUp2 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { ErrorMessages, ScoreOnSubject } from "../../interfaces";
import Switch from "../common/Switch";
import InputNumber from "../common/InputNumber";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";

type Props = {
  onClose: () => void;
  scoreOnSubject: ScoreOnSubject;
  toast: React.RefObject<Toast>;
};
function GradeSettingScoreOnSubject({ onClose, scoreOnSubject, toast }: Props) {
  const update = useUpdateScoreOnSubject();
  const [weight, setWeight] = useState<{
    data: number | null;
    allowWeight: boolean;
    maxScore: number | null;
  }>({
    data: scoreOnSubject.weight,
    allowWeight: scoreOnSubject.weight !== null ? true : false,
    maxScore:
      scoreOnSubject.weight !== null && scoreOnSubject.maxScore === null
        ? 1
        : scoreOnSubject.maxScore,
  });
  console.log(weight);
  const handleSaveChange = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await update.mutateAsync({
        query: {
          socreOnSubjectId: scoreOnSubject.id,
        },
        body: {
          weight: weight.data,
          maxScore: weight.allowWeight === true ? weight.maxScore : null,
        },
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Changes has been saved",
        life: 3000,
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
      onSubmit={handleSaveChange}
      className="flex h-max w-96 flex-col gap-1 rounded-md border bg-gray-100 p-3"
    >
      <div className="flex w-full items-center justify-end gap-2 border-b pb-2">
        {update.isPending ? (
          <div className="h-8">
            <ProgressSpinner
              animationDuration="1s"
              style={{ width: "20px" }}
              className="h-5 w-5"
              strokeWidth="8"
            />
          </div>
        ) : (
          <button className="second-button flex h-8 items-center justify-center gap-1 border py-1">
            <CiSaveUp2 />
            Save Change
          </button>
        )}
        <button
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </div>
      <div className="flex w-full justify-center gap-3">
        <div className="flex w-80 flex-col gap-5">
          <div className="flex flex-col gap-0">{scoreOnSubject.title}</div>

          <label className="flex w-full items-center justify-between gap-2">
            <span className="text-base font-medium">
              Allow Weight of Special Score
            </span>
            <Switch
              checked={weight.allowWeight}
              setChecked={(e) => {
                setWeight((prev) => {
                  return {
                    ...prev,
                    data: e ? 0 : null,
                    maxScore: e ? 1 : null,
                    allowWeight: e,
                  };
                });
              }}
            />
          </label>
          {weight.allowWeight && (
            <label className="flex w-full flex-col">
              <span className="text-base font-medium">
                Weight of Special Score (Optional)
              </span>
              <InputNumber
                value={weight?.data || 0}
                max={100}
                suffix="%"
                min={0}
                required
                placeholder="percentage of Special Score"
                onValueChange={(e) =>
                  setWeight({
                    ...weight,
                    data: e,
                  })
                }
              />
            </label>
          )}
          {weight.allowWeight && (
            <label className="flex w-full flex-col">
              <span className="text-base font-medium">
                Max Points of this speical score
              </span>
              <InputNumber
                value={weight?.maxScore || 0}
                max={100}
                min={1}
                required
                placeholder="Max Points"
                onValueChange={(e) =>
                  setWeight({
                    ...weight,
                    maxScore: e,
                  })
                }
              />
            </label>
          )}
        </div>
      </div>
    </form>
  );
}

export default GradeSettingScoreOnSubject;
