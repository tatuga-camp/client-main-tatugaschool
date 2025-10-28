import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import router from "next/router";
import { destroyCookie } from "nookies";
import { useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { defaultBlurHash, defaultCanvas } from "../../data";
import { navbarLanguageData } from "../../data/languages";
import { User } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = {
  user: UseQueryResult<User, Error>;
};
function ButtonProfile({ user }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const language = useGetLanguage();
  const handleLogout = () => {
    setLoading(true);
    queryClient.clear();
    destroyCookie({}, "access_token", {
      path: "/",
      secure: true,
      sameSite: "None",
      domain:
        process.env.NEXT_PUBLIC_COOKIE === "production"
          ? ".tatugaschool.com"
          : "localhost",
    });
    destroyCookie({}, "refresh_token", {
      path: "/",
      secure: true,
      sameSite: "None",
      domain:
        process.env.NEXT_PUBLIC_COOKIE === "production"
          ? ".tatugaschool.com"
          : "localhost",
    });
    router.push("/auth/sign-in");
  };
  return (
    <div className="flex flex-1 items-center justify-end">
      <div className="group flex w-max items-center justify-end gap-4 rounded-2xl bg-white px-4 py-2 transition-width md:hover:w-96">
        <div className="flex gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={user.data?.photo || defaultCanvas}
              alt="User Avatar"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                user.data?.blurHash ?? defaultBlurHash,
              )}
              className="cursor-pointer object-cover"
              onClick={() => {
                router.push("/account");
              }}
            />
          </div>
          <div className="hidden h-0 w-0 flex-col items-start justify-center gap-0 overflow-hidden transition-width duration-300 group-hover:h-max group-hover:w-max md:flex">
            <h2 className="text-sm font-semibold text-gray-800">
              {user.data?.email}
            </h2>
            <span className="text-xs text-gray-500">
              {user.data?.firstName} {user.data?.lastName}
            </span>
          </div>
        </div>
        <button
          disabled={loading}
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-1 text-sm font-semibold text-white transition duration-150 hover:bg-red-600 hover:drop-shadow-md active:scale-105"
        >
          <AiOutlineLogout />
          <span className="hidden w-max md:block">
            {navbarLanguageData.logoutButton(language.data ?? "en")}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ButtonProfile;
