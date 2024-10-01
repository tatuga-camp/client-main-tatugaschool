import React, { useState } from "react";
import { useRouter } from "next/router";
import { Footer, InputField, LogoSection } from "@/components";
import { SignInService } from "@/services";


const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await SignInService({ email, password });
      console.log("Login successful:", response);
      
      localStorage.setItem("token", response.access_token);

      router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
    }
  };

  const handleForgotPassword = () => {
    console.log("Redirect to forgot password page");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <LogoSection title="Tatuga School" />
      <form
        className="bg-white p-8 sm:p-16 rounded-2xl shadow-lg text-center w-full max-w-md sm:w-96"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-6">Log in</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}{" "}
        {/* แสดงข้อผิดพลาด */}
        <InputField
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <Footer />
    </div>
  );
};

export default LoginPage;

