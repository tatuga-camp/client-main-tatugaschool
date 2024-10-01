import React, { useState } from "react";
import { useRouter } from "next/router";
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
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F7F7F9] px-4 py-[40px]">
      {/* ส่วนแสดงโลโก้และชื่อด้านบน */}
      <div className="flex flex-row items-center justify-center mb-[60px]">
        <img
          src="/logo.svg"
          alt="Tatuga School Logo"
          className="h-[80px] mr-[16px]"
        />
        <h1 className="text-[32px] font-bold text-[#333333]">Tatuga School</h1>
      </div>

      {/* ฟอร์มล็อกอิน */}
      <form
        className="bg-white w-[600px] h-[628px] p-[80px_40px] rounded-[40px] shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
        onSubmit={handleLogin}
      >
        <h2 className="text-[24px] font-bold mb-[40px]">Log in</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-[16px] mb-[20px] border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-[16px] mb-[20px] border border-gray-300 rounded-lg"
        />
        <a
          onClick={handleForgotPassword}
          className="block text-right text-[14px] text-[#6E6E6E] mb-[40px] cursor-pointer"
        >
          Forget password?
        </a>
        <button
          type="submit"
          className="w-full p-[16px] bg-[#5F3DC4] text-white rounded-[8px] font-semibold hover:bg-[#482ab4] transition duration-300"
        >
          Log in
        </button>
        <a
          onClick={handleSignUp}
          className="block mt-[20px] text-[14px] text-[#6E6E6E] cursor-pointer"
        >
          Sign up
        </a>
      </form>

      {/* Footer */}
      <div className="flex flex-row items-center justify-center mt-[60px]">
        <img
          src="/logo-ted-fund.svg"
          alt="TED Fund Logo"
          className="h-[40px] mr-[16px]"
        />
        <p className="text-[14px] text-[#6E6E6E] max-w-[500px] text-center">
          สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
          สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
