import React from "react";
import Swal from "sweetalert2";
import { useGetLanguage, useVerifyLineToken } from "../../react-query";
import { ErrorMessages } from "../../interfaces";
import { FaLine, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { defaultCanvas } from "../../data";

type Props = {
  verifyLineToken: string;
  subjectId: string;
};
function VerifyConnectLine({ verifyLineToken, subjectId }: Props) {
  const language = useGetLanguage();
  const verifyLineTokenMutation = useVerifyLineToken();

  const handleVerifyLineToken = async (confirm: boolean) => {
    try {
      await verifyLineTokenMutation.mutateAsync({
        body: { token: verifyLineToken, confirm, subjectId },
      });
    } catch (error: any) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString(),
        icon: "error",
      });
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#00B900] shadow-md">
          <FaLine className="text-5xl text-white" />
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-color shadow-md">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl transition duration-150 hover:scale-105 active:scale-110">
            <Image
              src={"/favicon.ico"}
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              alt="logo tatuga school"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          {language.data === "th"
            ? "เชื่อมต่อกลุ่มไลน์"
            : "Connect to Line Group"}
        </h2>
        <p className="text-center text-sm text-gray-500">
          {language.data === "th"
            ? "คุณต้องการเชื่อมต่อรายวิชานี้กับกลุ่มไลน์หรือไม่?"
            : "Do you want to connect this subject to the Line Group?"}
        </p>
      </div>

      <div className="mt-4 flex w-full flex-col gap-3">
        <button
          onClick={() => handleVerifyLineToken(true)}
          disabled={verifyLineTokenMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00B900] py-3 font-semibold text-white transition-all hover:bg-[#009900] active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100"
        >
          {verifyLineTokenMutation.isPending ? (
            <FaSpinner className="animate-spin text-xl" />
          ) : language.data === "th" ? (
            "ยืนยัน"
          ) : (
            "Confirm"
          )}
        </button>
        <button
          onClick={() => handleVerifyLineToken(false)}
          disabled={verifyLineTokenMutation.isPending}
          className="w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-600 transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {language.data === "th" ? "ยกเลิก" : "Deny"}
        </button>
      </div>
    </div>
  );
}

export default VerifyConnectLine;
