import { footerData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

export const AuthFooter = () => {
  const language = useGetLanguage();
  return (
    <section className="flex mt-5 items-center flex-col">
      <span className="text-white font-medium text-sm">
        {footerData.title(language.data ?? "en")}
      </span>
      <p className="text-white font-light text-sm">
        {footerData.description(language.data ?? "en")}
      </p>
      <a
        href="https://tatugacamp.com"
        className="text-white font-light text-sm"
      >
        {footerData.coppyright(language.data ?? "en")}
      </a>
    </section>
  );
};
