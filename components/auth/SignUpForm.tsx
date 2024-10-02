import React, { useState } from "react";
import { SignUpService } from "@/services";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
export const SignUpForm = () => {

    const router = useRouter();
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        if (!name.split(" ")[1]) {
            setErrorMessage("กรุณากรอกชื่อสกุลให้ถูกต้อง");
            return;
        }

        if (password.length < 8) {
            setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("รหัสผ่านไม่ตรงกัน");
            return;
        }


        setErrorMessage("");

        try {
            const response = await SignUpService({
                email,
                password,
                firstName: name.split(" ")[0],
                lastName: name.split(" ")[1] || "",
                phone: "0000000000",
                provider: "LOCAL",
            });
            await Swal.fire({
                title: "Registration Success!",
                text: "Please check your email for verification.",
                icon: "success",
            });
            console.log("Sign up successful:", response);
            router.push("/");
        } catch (error: any) {
            console.error("Sign up failed:", error);
            setErrorMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก");
        }
    };


    return (

        <form
            className="bg-white w-full md:w-[600px] p-[80px_40px] rounded-[40px] shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
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
    )
}