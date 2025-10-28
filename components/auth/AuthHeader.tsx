import Image from "next/image";
import Link from "next/link";
import { defaultCanvas } from "../../data";

export const AuthHeader = () => (
  <a
    href="https://tatugaschool.com/"
    className="flex items-center justify-center gap-1 rounded-full bg-white px-3 py-1 md:gap-2"
  >
    <div className="relative h-6 w-6 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
      <Image
        src="/favicon.ico"
        placeholder="blur"
        blurDataURL={defaultCanvas}
        fill
        alt="logo tatuga school"
      />
    </div>
    <div className="hidden text-lg font-bold uppercase text-icon-color md:block md:text-base">
      Tatuga School
    </div>
  </a>
);
