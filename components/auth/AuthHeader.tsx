import Image from "next/image";
import Link from "next/link";
import { defaultCanvas } from "../../data";

export const AuthHeader = () => (
  <a
    href="https://tatugaschool.com/"
    className="flex items-center justify-center bg-white px-3 rounded-full py-1 gap-1 md:gap-2"
  >
    <div
      className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-white
         relative hover:scale-105 active:scale-110 transition duration-150"
    >
      <Image
        src="/favicon.ico"
        placeholder="blur"
        blurDataURL={defaultCanvas}
        fill
        alt="logo tatuga school"
      />
    </div>
    <div className="font-bold uppercase hidden md:block text-lg md:text-base text-icon-color">
      Tatuga School
    </div>
  </a>
);
