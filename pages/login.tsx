import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";


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

      // เก็บ token ใน localStorage หรือ cookie ตามความต้องการ
      // เช่น localStorage.setItem("token", response.access_token);

      // เปลี่ยนหน้าไปยัง home หลังจากเข้าสู่ระบบสำเร็จ
      router.push("/home");
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
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <Image
          src="/logo.svg"
          alt="Tatuga School Logo"
          width={60}
          height={60}
        />
        <h1 className="text-lg font-semibold mt-4">Tatuga School</h1>
      </div>
      <form
        className="bg-white p-8 sm:p-16 rounded-2xl shadow-lg text-center w-full max-w-md sm:w-96"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-6">Log in</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}{" "}
        {/* แสดงข้อผิดพลาด */}
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
        <Image
          src="/logo-ted-fund.svg"
          alt="Logo ted fund"
          width={40}
          height={40}
        />
        <p className="text-sm text-gray-600 mt-4 max-w-xs">
          สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
          สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
function SignInService(arg0: { email: string; password: string; }) {
  throw new Error("Function not implemented.");
}

