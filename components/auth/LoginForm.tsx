import React, { useState } from "react";
import { useRouter } from "next/router";
import { SignInService } from "@/services";
import { setCookie } from "nookies";
export const LoginForm = () => {

    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await SignInService({ email, password });
            console.log("Login successful:", response);

            setCookie(null, "access_token", response.accessToken, {
                path: "/",
            });
            setCookie(null, "refresh_token", response.refreshToken, {
                path: "/",
            });

            setLoading(false);

            router.push("/");
        } catch (err) {
            setLoading(false);
            console.error("Login failed:", err);
            setError("Invalid email or password");
        }
    };

    const handleForgotPassword = () => {
        router.push("/auth/forget-password");
    };

    const handleSignUp = () => {
        router.push("/auth/signup");
    };
    return (

        <form
            className="bg-white w-full md:w-[600px] p-[80px_40px] rounded-[40px] shadow-[0_12px_24px_rgba(145,158,171,0.12)] text-center"
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
                className="block text-left text-[14px] text-[#6E6E6E] mb-[40px] cursor-pointer"
            >
                Forget password?
            </a>
            {loading ?
                <button
                    type="submit"
                    className="w-full p-4 bg-[#5F3DC4] text-white rounded-lg font-semibold hover:bg-[#482ab4] transition duration-300 flex items-center justify-center space-x-2"
                >
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            fill="currentColor"
                            d="M12 4v2a8 8 0 1 0 8 8h2A10 10 0 1 1 12 4z"
                        />
                    </svg>
                    <span>Loading...</span>
                </button>
                : <button
                    type="submit"
                    className="w-full p-[16px] bg-[#5F3DC4] text-white rounded-[8px] font-semibold hover:bg-[#482ab4] transition duration-300"
                >
                    Log in
                </button>}
            <a
                onClick={handleSignUp}
                className="block mt-[20px] text-[14px] text-[#6E6E6E] cursor-pointer"
            >
                Sign up
            </a>
        </form>
    )
}