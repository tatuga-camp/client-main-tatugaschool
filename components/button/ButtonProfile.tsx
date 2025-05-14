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
    <div className="flex items-center flex-1 justify-end ">
      <div
        className="flex items-center justify-end w-max transition-width
       md:hover:w-96 group bg-white rounded-lg px-4 py-2 gap-4"
      >
        <div className="flex gap-2">
          <div className="w-10 h-10 relative rounded-full overflow-hidden ">
            <Image
              src={user.data?.photo || defaultCanvas}
              alt="User Avatar"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                user.data?.blurHash ?? defaultBlurHash
              )}
              className=" object-cover cursor-pointer"
              onClick={() => {
                router.push("/account");
              }}
            />
          </div>
          <div className=" items-start w-0 h-0  overflow-hidden group-hover:w-max group-hover:h-max duration-300 transition-width flex-col justify-center gap-0 hidden md:flex">
            <h2 className="font-semibold text-sm text-gray-800">
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
          className="flex hover:bg-red-600 transition duration-150 hover:drop-shadow-md active:scale-105
       items-center text-sm justify-center  gap-2 px-3
     py-1 bg-red-500 text-white font-semibold rounded-md"
        >
          <AiOutlineLogout />
          <span className="hidden md:block w-max">
            {navbarLanguageData.logoutButton(language.data ?? "en")}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ButtonProfile;
