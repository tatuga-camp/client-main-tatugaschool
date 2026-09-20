import Image from "next/image";
import { defaultCanvas } from "../../data";
import { footerData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

export const AuthBrandPanel = () => {
  const language = useGetLanguage();

  return (
    <aside className="relative hidden min-h-0 min-w-0 overflow-hidden md:flex md:w-[42%] md:flex-col md:justify-center lg:w-[46%] 2xl:w-1/2">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-white/10 2xl:h-80 2xl:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 right-6 h-40 w-40 rounded-full bg-white/10 2xl:h-64 2xl:w-64"
      />
      <div className="relative z-10 flex max-w-lg flex-col gap-4 px-6 lg:gap-5 lg:px-8 xl:gap-6 xl:px-12 2xl:max-w-xl 2xl:gap-8 2xl:px-16">
        <div className="relative h-12 w-12 overflow-hidden rounded-3xl bg-white shadow-sm ring-2 ring-white/80 lg:h-14 lg:w-14 xl:h-16 xl:w-16 2xl:h-20 2xl:w-20">
          <Image
            src="/favicon.ico"
            placeholder="blur"
            blurDataURL={defaultCanvas}
            fill
            alt="logo tatuga school"
          />
        </div>
        <h1 className="font-Anuphan text-2xl font-bold leading-tight text-white lg:text-3xl xl:text-4xl 2xl:text-5xl">
          {footerData.title(language.data ?? "en")}
        </h1>
        <p className="text-xs font-light leading-relaxed text-white/90 lg:text-sm xl:text-base 2xl:text-lg">
          {footerData.description(language.data ?? "en")}
        </p>
        <a
          href="https://tatugacamp.com"
          className="text-[11px] font-light text-white/80 hover:text-white hover:underline lg:text-xs xl:text-sm 2xl:text-base"
        >
          {footerData.coppyright(language.data ?? "en")}
        </a>
      </div>
    </aside>
  );
};
