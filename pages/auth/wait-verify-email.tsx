import React from "react";
import Swal from "sweetalert2";
import { AuthFooter } from "../../components/auth/AuthFooter";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthLayout } from "../../components/auth/AuthLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ErrorMessages } from "../../interfaces";
import {
  useGetLanguage,
  useGetNoVerifyUser,
  useResendVerifyEmail,
  useUpdateUser,
} from "../../react-query";
import ButtonProfile from "../../components/common/ButtonProfile";
import Link from "next/link";
import {
  waitVerifyEmailLanguageData,
  verifyEmailLanguageData,
} from "../../data/languages";

function Index() {
  const user = useGetNoVerifyUser();
  const language = useGetLanguage();
  const resend = useResendVerifyEmail();
  const updateUser = useUpdateUser();
  const [triggerUpdate, setTriggerUpdate] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const handleResend = async () => {
    try {
      await resend.mutateAsync();
      Swal.fire({
        title: waitVerifyEmailLanguageData.swalSuccessTitle(
          language.data ?? "en",
        ),
        text: waitVerifyEmailLanguageData.swalSuccessTextResend(
          language.data ?? "en",
        ),
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error
          ? result?.error
          : verifyEmailLanguageData.swalErrorTitle(language.data ?? "en"),
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? verifyEmailLanguageData.swalErrorCode(language.data ?? "en") +
            result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({ email });
      Swal.fire({
        title: waitVerifyEmailLanguageData.swalSuccessTitle(
          language.data ?? "en",
        ),
        text: waitVerifyEmailLanguageData.swalSuccessTextUpdate(
          language.data ?? "en",
        ),
        icon: "success",
      });
      setEmail("");
      setTriggerUpdate(false);
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error
          ? result?.error
          : verifyEmailLanguageData.swalErrorTitle(language.data ?? "en"),
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? verifyEmailLanguageData.swalErrorCode(language.data ?? "en") +
            result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  if (user.data?.isVerifyEmail === true) {
    return (
      <AuthLayout>
        <div className="flex w-full grow flex-col items-center justify-center gap-5">
          <AuthHeader />
          <div className="h-max w-full rounded-2xl bg-white p-3 text-center md:w-8/12 xl:w-4/12">
            {waitVerifyEmailLanguageData.alreadyVerified(language.data ?? "en")}
          </div>
          <Link
            href={"/"}
            className="rounded-2xl bg-[#5F3DC4] p-4 font-semibold text-white transition duration-300 hover:bg-[#482ab4]"
          >
            {waitVerifyEmailLanguageData.enterDashboard(language.data ?? "en")}
          </Link>
        </div>
        <AuthFooter />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout>
      <div className="flex w-full grow flex-col items-center justify-center gap-5">
        <AuthHeader />
        <div className="flex h-max w-full flex-col items-center justify-center rounded-2xl bg-white p-3 text-center md:w-8/12 xl:w-4/12">
          <ButtonProfile user={user} />

          {triggerUpdate ? (
            <form onSubmit={handleUpdateEmail}>
              <h2 className="text-xl font-semibold">
                {waitVerifyEmailLanguageData.updateEmailTitle(
                  language.data ?? "en",
                )}
              </h2>
              <span className="text-sm text-gray-600">
                {waitVerifyEmailLanguageData.updateEmailDescription(
                  language.data ?? "en",
                )}
              </span>

              <input
                type="email"
                placeholder={waitVerifyEmailLanguageData.emailPlaceholder(
                  language.data ?? "en",
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="main-input mt-5 h-10 w-full"
              />
              <button
                disabled={updateUser.isPending}
                className="main-button mt-2 flex w-full items-center justify-center p-2"
              >
                {updateUser.isPending ? (
                  <LoadingSpinner />
                ) : (
                  waitVerifyEmailLanguageData.updateEmailButton(
                    language.data ?? "en",
                  )
                )}
              </button>

              <button
                type="button"
                onClick={() => setTriggerUpdate(false)}
                className="mt-2 text-xs text-gray-600 hover:underline"
              >
                {waitVerifyEmailLanguageData.backToVerifyEmail(
                  language.data ?? "en",
                )}
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                {waitVerifyEmailLanguageData.pleaseVerifyTitle(
                  language.data ?? "en",
                )}
              </h2>
              <span className="text-sm text-gray-600">
                ({user.data?.email})
              </span>
              <p className="pb-5 text-center text-sm">
                {waitVerifyEmailLanguageData.verifyDescription(
                  language.data ?? "en",
                )}
              </p>

              <button
                disabled={resend.isPending}
                onClick={handleResend}
                className="main-button flex w-full items-center justify-center p-2"
              >
                {resend.isPending ? (
                  <LoadingSpinner />
                ) : (
                  waitVerifyEmailLanguageData.resendButton(
                    language.data ?? "en",
                  )
                )}
              </button>
              <button
                onClick={() => setTriggerUpdate(true)}
                className="mt-2 text-xs text-gray-600 hover:underline"
              >
                {waitVerifyEmailLanguageData.changeEmailPrompt(
                  language.data ?? "en",
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <AuthFooter />
    </AuthLayout>
  );
}

export default Index;
