import React, { useState } from "react";
import Image from 'next/image';

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle sign-up
  const handleSignUp = (e: React.FormEvent) => {
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

    // ถ้าไม่มีข้อผิดพลาด สามารถดำเนินการสมัครสมาชิกต่อได้
    setErrorMessage(""); // เคลียร์ข้อความแสดงข้อผิดพลาด
    console.log("Signing up with:", { name, email, password });
    // คุณสามารถเพิ่มการเรียกใช้ API สำหรับ sign-up logic ตรงนี้ได้
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <Image src="/logo.svg" alt="Tatuga School Logo" width={60} height={60} />
        <h1 className="text-lg font-semibold mt-4">Tatuga School</h1>
      </div>
      <form
        className="bg-white p-8 sm:p-16 rounded-xl shadow-lg w-full max-w-md text-center flex flex-col"
        onSubmit={handleSignUp}
      >
        <h2 className="text-2xl font-bold mb-6">Sign up</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 sm:p-4 mb-4 border border-gray-300 rounded-lg"
        />
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
          className="w-full p-3 sm:p-4 mb-4 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-3 sm:p-4 mb-4 border border-gray-300 rounded-lg"
        />
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        <button
          type="submit"
          className="w-full p-3 sm:p-4 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-600 transition duration-300"
        >
          Sign up
        </button>
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

export default SignUpPage;