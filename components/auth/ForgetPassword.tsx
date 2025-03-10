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
          language.data ?? "en"
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
        className="bg-white w-full md:w-5/12
                 p-[80px_40px] rounded-lg flex flex-col gap-5 
                 shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
        onSubmit={handleForgetPassword}
      >
        <h2 className="text-[24px] font-bold">
          {forgetPasswordLanguageData.title(language.data ?? "en")}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p className="text-sm text-center">
          {forgetPasswordLanguageData.description(language.data ?? "en")}
        </p>
        <input
          type="email"
          placeholder={forgetPasswordLanguageData.inputEmail(
            language.data ?? "en"
          )}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-[16px]  border border-gray-300 rounded-lg"
        />

        {loading ? (
          <button
            type="submit"
            className="w-full p-4 bg-[#5F3DC4] text-white rounded-lg font-semibold hover:bg-[#482ab4] transition duration-300 flex items-center justify-center space-x-2"
          >
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          <button type="submit" className="w-full main-button">
            {forgetPasswordLanguageData.button(language.data ?? "en")}
          </button>
        )}
      </form>
    </>
  );
};
