import React, { useState } from "react";
import { SignUpService } from "@/services";
import Swal from "sweetalert2";
import UserAgreement from "../agreements/UserAgreement";
import { InputMask } from "primereact/inputmask";
import { ErrorMessages } from "../../interfaces";
import { useRouter } from "next-nprogress-bar";
import Password from "../common/Password";

export const SignUpForm = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      Swal.fire({
        title: "Please wait...",
        text: "We are processing your request",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await SignUpService({
        email,
        password,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        provider: "LOCAL",
      });
      await Swal.fire({
        title: "Registration Success!",
        text: "Please check your email for verification.",
        icon: "success",
      });
      router.push("/auth/sign-in");
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
      className="bg-white p-10  w-11/12 flex flex-col gap-4 md:w-8/12 lg:w-8/12 xl:w-5/12  rounded-[40px] shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
      onSubmit={handleSignUp}
    >
      <h2 className="text-[24px] font-bold mb-[40px]">Create Account</h2>
      <div className="flex flex-col items-center gap-4">
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">First Name</span>
          <input
            type="text"
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
            placeholder="Enter Your Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="  main-input w-80"
          />
        </label>
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">Phone Number</span>
          <InputMask
            required
            value={phone}
            onChange={(e) => setPhone(e.value as string)}
            mask="(+99) 999-999-9999"
            className=" main-input w-80"
            placeholder="(+99) 999-999-9999"
          />
        </label>
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">Email Adress</span>
          <input
            type="email"
            placeholder="Enter Your E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="  main-input w-80"
          />
        </label>
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">Password</span>
          <Password
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            toggleMask
          />
        </label>
        <label className="h-max  flex flex-col relative items-start">
          <span className="text-sm">Confirm Password</span>
          <Password
            placeholder="Enter your Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            toggleMask
          />
        </label>
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
        }  text-white rounded h-5 flex items-center justify-center
            font-semibold  transition duration-300`}
      >
        Create Account
      </button>
    </form>
  );
};
