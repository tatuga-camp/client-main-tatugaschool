import React, { useEffect, useState } from "react";
import { SignUpService } from "@/services";
import Swal from "sweetalert2";
import UserAgreement from "../agreements/UserAgreement";
import { InputMask } from "primereact/inputmask";
import { ErrorMessages } from "../../interfaces";
import { useRouter } from "next-nprogress-bar";
import Password from "../common/Password";
import { FcGoogle } from "react-icons/fc";
import { PhoneInput } from "react-international-phone";
import { requestData, signUpLanguageData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

type Props = {
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  providerId?: string | undefined;
  photo?: string | undefined;
  provider?: "google" | undefined;
};
export const SignUpForm = (props: Props) => {
  const router = useRouter();
  const language = useGetLanguage();
  const [isAgree, setIsAgree] = useState(false);
  const [firstName, setFirstName] = useState(props.firstName);
  const [phone, setPhone] = useState("");
  const [lastName, setLastName] = useState(props.lastName);
  const [email, setEmail] = useState(props.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(props.photo);
  const [providerId, setProvider] = useState<string | undefined>(
    props.providerId,
  );

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (props.provider !== "google") {
        if (
          !firstName ||
          !email ||
          !password ||
          !confirmPassword ||
          !lastName ||
          !phone
        ) {
          throw new Error("Please fill in all fields");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      Swal.fire({
        title: requestData.loadingTitle(language.data ?? "en"),
        text: requestData.loadingDescription(language.data ?? "en"),
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await SignUpService({
        email: email as string,
        password,
        firstName: firstName as string,
        lastName: lastName as string,
        phone: phone,
        photo: photo,
        providerId: providerId,
        provider: props.provider === "google" ? "GOOGLE" : "LOCAL",
      });

      router.push(response.redirectUrl);

      await Swal.fire({
        title: requestData.successTitle(language.data ?? "en"),
        text: requestData.successSignUp(language.data ?? "en"),
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      Swal.fire({
        title: requestData.loadingTitle(language.data ?? "en"),
        text: requestData.loadingDescription(language.data ?? "en"),
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      router.push(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/auth/google`);
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result?.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <form
      className="flex w-96 flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-[0_12px_24px_rgba(145,158,171,0.12)] md:w-5/12"
      onSubmit={handleSignUp}
    >
      <h2 className="text-[24px] font-bold">
        {signUpLanguageData.title(language.data ?? "en")}
      </h2>
      <span className="text-sm text-gray-500">
        ({signUpLanguageData.teacherOnly(language.data ?? "en")})
      </span>
      {props.provider === "google" && (
        <div className="second-button flex items-center justify-center gap-2 border">
          <FcGoogle />
          {signUpLanguageData.nowCreateAccountOnGoogle(language.data ?? "en")}
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <label className="relative flex h-max flex-col items-start">
          <span className="text-sm">
            {signUpLanguageData.firstNameTitle(language.data ?? "en")}
          </span>
          <input
            type="text"
            disabled={props.provider === "google" && !!props.firstName}
            placeholder={signUpLanguageData.firstNamePlaceholder(
              language.data ?? "en",
            )}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="main-input w-80"
          />
        </label>
        <label className="relative flex h-max flex-col items-start">
          <span className="text-sm">
            {signUpLanguageData.lastNameTitle(language.data ?? "en")}
          </span>
          <input
            type="text"
            disabled={props.provider === "google" && !!props.lastName}
            placeholder={signUpLanguageData.lastNamePlaceholder(
              language.data ?? "en",
            )}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="main-input w-80"
          />
        </label>
        <label className="relative flex h-max w-80 flex-col items-start">
          <span className="text-sm">
            {signUpLanguageData.phone(language.data ?? "en")}
          </span>
          <PhoneInput
            required
            defaultCountry="th"
            value={phone}
            onChange={(e) => {
              setPhone(e);
            }}
          />
        </label>
        <label className="relative flex h-max flex-col items-start">
          <span className="text-sm">
            {signUpLanguageData.email(language.data ?? "en")}
          </span>
          <input
            type="email"
            disabled={props.provider === "google"}
            placeholder={signUpLanguageData.emailPlaceholder(
              language.data ?? "en",
            )}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="main-input w-80"
          />
        </label>
        {props.provider !== "google" && (
          <label className="relative flex h-max w-80 flex-col items-start">
            <span className="text-sm">
              {signUpLanguageData.password(language.data ?? "en")}
            </span>
            <Password
              placeholder={signUpLanguageData.passwordPlaceholder(
                language.data ?? "en",
              )}
              value={password}
              feedback={true}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
            />
          </label>
        )}
        {props.provider !== "google" && (
          <label className="relative flex h-max w-80 flex-col items-start">
            <span className="text-sm">
              {signUpLanguageData.confirmPassword(language.data ?? "en")}
            </span>
            <Password
              feedback={true}
              placeholder={signUpLanguageData.confirmPasswordPlaceholder(
                language.data ?? "en",
              )}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              toggleMask
            />
          </label>
        )}
      </div>
      <div className="mt-10 h-40 overflow-auto text-left">
        <UserAgreement />
      </div>
      <label className="flex items-center gap-2">
        <input
          checked={isAgree}
          onChange={(e) => setIsAgree(() => e.target.checked)}
          type="checkbox"
          required
        />
        <span className="text-sm">
          {signUpLanguageData.acceptPolicy(language.data ?? "en")}
        </span>
      </label>
      <button
        type="submit"
        disabled={!isAgree}
        className={`p-5 ${
          isAgree ? "bg-secondary-color hover:bg-primary-color" : "bg-gray-400"
        } flex h-5 w-80 items-center justify-center rounded font-semibold text-white transition duration-300`}
      >
        {signUpLanguageData.createAccount(language.data ?? "en")}
      </button>
      {props.provider !== "google" && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="second-button flex w-80 items-center justify-center gap-2 border"
        >
          <FcGoogle />
          {signUpLanguageData.createAccountGoogle(language.data ?? "en")}
        </button>
      )}
    </form>
  );
};
