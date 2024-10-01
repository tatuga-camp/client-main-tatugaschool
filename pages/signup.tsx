import React, { useState } from "react";
import Image from "next/image";
import { SignUpService } from "@/services";

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle sign-up
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

    // ถ้าไม่มีข้อผิดพลาด สามารถดำเนินการสมัครสมาชิกต่อได้
    setErrorMessage(""); // เคลียร์ข้อความแสดงข้อผิดพลาด

    try {
      // เรียกใช้งาน SignUpService โดยส่งข้อมูลที่ผู้ใช้กรอก
      const response = await SignUpService({
        email,
        password,
        firstName: name.split(" ")[0], // สมมติว่าใช้แค่ชื่อแรก
        lastName: name.split(" ")[1] || "", // สมมติว่าชื่อสกุลเป็น optional
        phone: "1234567890", // ค่า placeholder สำหรับเบอร์โทรศัพท์ (แก้ไขตามที่ต้องการ)
        provider: "local", // ค่า provider เป็น "local"
      });

      console.log("Sign up successful:", response);
      // หลังจากสมัครสำเร็จ คุณสามารถเปลี่ยนหน้าไปยังหน้าอื่น เช่น หน้า login หรือหน้า home
    } catch (error) {
      console.error("Sign up failed:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
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
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <button
          type="submit"
          className="w-full p-3 sm:p-4 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-600 transition duration-300"
        >
          Sign up
        </button>
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
}

export default SignUpPage;
