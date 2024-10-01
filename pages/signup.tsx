import React, { useState } from "react";
import Image from "next/image";
import { SignUpService } from "@/services";

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบว่าผู้ใช้ได้กรอกข้อมูลในทุกช่องหรือไม่
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // ตรวจสอบว่า password และ confirm password ตรงกันหรือไม่
    if (password !== confirmPassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setErrorMessage("");

    try {
      // เรียกใช้งาน SignUpService โดยส่งข้อมูลที่ผู้ใช้กรอก
      const response = await SignUpService({
        email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
        phone: "1234567890",
        provider: "local",
      });

      console.log("Sign up successful:", response);
    } catch (error) {
      console.error("Sign up failed:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F7F7F9] px-4 py-10">
      {/* ส่วนแสดงโลโก้และชื่อด้านบน */}
      <div className="flex flex-row items-center justify-center mb-10">
        <img
          src="/logo.svg"
          alt="Tatuga School Logo"
          className="h-[80px] mr-4"
        />
        <h1 className="text-[32px] font-bold text-[#333333]">Tatuga School</h1>
      </div>

      {/* ฟอร์มสมัครสมาชิก */}
      <form
        className="bg-white w-[600px] h-[628px] p-[80px_40px] rounded-[40px] shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
        onSubmit={handleSignUp}
      >
        <h2 className="text-[24px] font-bold mb-[40px]">Sign up</h2>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-[16px] mb-[20px] border border-gray-300 rounded-lg"
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-[16px] mb-[20px] border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          className="w-full p-[16px] bg-[#5F3DC4] text-white rounded-[8px] font-semibold hover:bg-[#482ab4] transition duration-300"
        >
          Sign up
        </button>
      </form>

      {/* Footer */}
      <div className="flex flex-row items-center justify-center mt-10">
        <img
          src="/logo-ted-fund.svg"
          alt="TED Fund Logo"
          className="h-[40px] mr-4"
        />
        <p className="text-[14px] text-[#6E6E6E] max-w-[500px] text-center">
          สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
          สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
