import Image from "next/image";
import { defaultCanvas } from "../../data";

export const AuthHeader = () => (
  <a
    href="https://tatugaschool.com/"
    className="flex min-w-0 max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm sm:gap-2 sm:px-3"
  >
    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
      <Image
        src="/favicon.ico"
        placeholder="blur"
        blurDataURL={defaultCanvas}
        fill
        alt="logo tatuga school"
      />
    </div>
    <div className="truncate text-sm font-bold uppercase text-icon-color sm:text-base md:text-lg">
      Tatuga School
    </div>
  </a>
);
