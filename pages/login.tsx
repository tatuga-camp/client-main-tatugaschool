import React, { useState } from "react";
import Image from 'next/image';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    // You can integrate your authentication logic here.
  };

  // Function to handle forgot password
  const handleForgotPassword = () => {
    console.log("Redirect to forgot password page");
    // You can implement navigation to the forget password page here.
  };

  // Function to handle sign-up
  const handleSignUp = () => {
    console.log("Redirect to sign-up page");
    // You can implement navigation to the sign-up page here.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <Image src="/logo.svg" alt="Tatuga School Logo" width={60} height={60} />
        <h1 className="text-lg font-semibold mt-4">Tatuga School</h1>
      </div>
      <form
        className="bg-white p-8 sm:p-16 rounded-2xl shadow-lg text-center w-full max-w-md sm:w-96"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-6">Log in</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 sm:p-4 mb-4 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 sm:p-4 mb-2 border border-gray-300 rounded-lg"
        />
        <a
          onClick={handleForgotPassword}
          className="block text-right text-sm text-gray-600 mb-6 cursor-pointer"
        >
          Forget password?
        </a>
        <button
          type="submit"
          className="w-full p-3 sm:p-4 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-600 transition duration-300"
        >
          Log in
        </button>
        <a
          onClick={handleSignUp}
          className="block mt-4 text-sm text-gray-600 cursor-pointer"
        >
          Sign up
        </a>
      </form>
      <div className="flex flex-col items-center justify-center mt-8 text-center">
        <Image src="/logo-ted-fund.svg" alt="Logo ted fund" width={40} height={40} />
        <p className="text-sm text-gray-600 mt-4 max-w-xs">
          สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
          สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </p>
      </div>
    </div>
  );
};

export default LoginPage;