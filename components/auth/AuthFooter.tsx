import { footerData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

export const AuthFooter = () => {
  const language = useGetLanguage();
  return (
    <section className="mx-auto mt-6 flex w-full max-w-sm flex-col items-center px-1 pb-2 text-center sm:mt-8 sm:max-w-md md:mt-6 md:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
      <span className="text-xs font-medium text-white sm:text-sm">
        {footerData.title(language.data ?? "en")}
      </span>
      <p className="mt-1 text-pretty text-[11px] font-light leading-relaxed text-white/90 sm:text-sm">
        {footerData.description(language.data ?? "en")}
      </p>
      <a
        href="https://tatugacamp.com"
        className="mt-1 text-[11px] font-light text-white/90 hover:underline sm:text-sm"
      >
        {footerData.coppyright(language.data ?? "en")}
      </a>
    </section>
  );
};
