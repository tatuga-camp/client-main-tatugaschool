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
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const [firstName, setFirstName] = useState(props.firstName);
  const [phone, setPhone] = useState("");
  const [lastName, setLastName] = useState(props.lastName);
  const [email, setEmail] = useState(props.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(props.photo);
  const [providerId, setProvider] = useState<string | undefined>(
    props.providerId
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
        title: "Please wait...",
        text: "We are processing your request",
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
        title: "Registration Success!",
        text: "Please check your email for verification.",
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
        title: "Please wait...",
        text: "We are processing your request",
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
      className="bg-white p-10   rounded-lg  flex flex-col
       gap-4 w-96 md:w-5/12 items-center  shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
      onSubmit={handleSignUp}
    >
      <h2 className="text-[24px] font-bold">Create Account</h2>
      <span className="text-gray-500 text-sm">(For Only Teacher)</span>
      {props.provider === "google" && (
        <div className="second-button border gap-2 flex items-center justify-center">
          <FcGoogle />
          You are creating account with Google
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">First Name</span>
          <input
            type="text"
            disabled={props.provider === "google"}
            placeholder="Enter Your First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="  main-input w-80"
          />
        </label>
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">Last Name</span>
          <input
            type="text"
            disabled={props.provider === "google"}
            placeholder="Enter Your Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="  main-input w-80"
          />
        </label>
        <label className="h-max w-80  flex flex-col relative items-start">
          <span className="text-sm">Phone Number</span>
          <PhoneInput
            required
            defaultCountry="th"
            value={phone}
            onChange={(e) => {
              setPhone(e);
            }}
          />
        </label>
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">Email Adress</span>
          <input
            type="email"
            disabled={props.provider === "google"}
            placeholder="Enter Your E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="  main-input w-80"
          />
        </label>
        {props.provider !== "google" && (
          <label className="h-max  flex flex-col  w-80 relative items-start">
            <span className="text-sm">Password</span>
            <Password
              placeholder="Enter Your Password"
              value={password}
              feedback={true}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
            />
          </label>
        )}
        {props.provider !== "google" && (
          <label className="h-max w-80  flex flex-col relative items-start">
            <span className="text-sm">Confirm Password</span>
            <Password
              feedback={true}
              placeholder="Enter your Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              toggleMask
            />
          </label>
        )}
      </div>
      <div className="text-left mt-10 h-40 overflow-auto">
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
          I agree to the{" "}
          <span className="text-primary-color">Terms of Service</span> and{" "}
          <span className="text-primary-color">Privacy Policy</span>
        </span>
      </label>
      <button
        type="submit"
        disabled={!isAgree}
        className={`p-5 ${
          isAgree ? "bg-secondary-color hover:bg-primary-color" : "bg-gray-400"
        }  text-white rounded w-80 h-5 flex items-center justify-center
            font-semibold  transition duration-300`}
      >
        Create Account
      </button>
      {props.provider !== "google" && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="second-button w-80 border gap-2 flex items-center justify-center"
        >
          <FcGoogle />
          Create Account with Google
        </button>
      )}
    </form>
  );
};
