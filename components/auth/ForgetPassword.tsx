import { ForgotPasswordService } from "@/services";
import { useRouter } from "next/router";
import { useState } from "react";
import Swal from "sweetalert2";
import { useGetLanguage } from "../../react-query";
import { forgetPasswordLanguageData, requestData } from "../../data/languages";

export const ForgetPasswordForm = () => {
  const router = useRouter();
  const language = useGetLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email) {
      setError("กรุณากรอกอีเมล");
      setLoading(false);
      return;
    }

    try {
      const response = await ForgotPasswordService({ email: email });

      setLoading(false);

      await Swal.fire({
        title: requestData.successTitle(language.data ?? "en"),
        text: requestData.successForgetPasswordDesciption(
          language.data ?? "en",
        ),
        icon: "success",
      });

      router.push("/");
    } catch (error: any) {
      setLoading(false);
      console.error("Forgot Password failed:", error);
      if (error.message) {
        setError(error.message);
        return;
      }
      setError("Invalid email");
    }
  };
  return (
    <>
      <form
        className="flex w-full flex-col gap-5 rounded-2xl bg-white p-[80px_40px] text-center shadow-[0_12px_24px_rgba(145,158,171,0.12)] md:w-5/12"
        onSubmit={handleForgetPassword}
      >
        <h2 className="text-[24px] font-bold">
          {forgetPasswordLanguageData.title(language.data ?? "en")}
        </h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <p className="text-center text-sm">
          {forgetPasswordLanguageData.description(language.data ?? "en")}
        </p>
        <input
          type="email"
          placeholder={forgetPasswordLanguageData.inputEmail(
            language.data ?? "en",
          )}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-2xl border border-gray-300 p-[16px]"
        />

        {loading ? (
          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-[#5F3DC4] p-4 font-semibold text-white transition duration-300 hover:bg-[#482ab4]"
          >
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                fill="currentColor"
                d="M12 4v2a8 8 0 1 0 8 8h2A10 10 0 1 1 12 4z"
              />
            </svg>
            <span>Loading...</span>
          </button>
        ) : (
          <button type="submit" className="main-button w-full">
            {forgetPasswordLanguageData.button(language.data ?? "en")}
          </button>
        )}
      </form>
    </>
  );
};
