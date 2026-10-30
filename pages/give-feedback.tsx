import Head from "next/head";
import Feedback from "../components/common/Feedback";
import DefaultLayout from "../components/layout/DefaultLayout";
import { feedbackLanguageData } from "../data/languages";
import { useGetLanguage } from "../react-query";

function GiveFeedback() {
  const language = useGetLanguage();
  const lang = language.data ?? "en";

  return (
    <DefaultLayout>
      <Head>
        <title>{feedbackLanguageData.campaignPageTitle(lang)}</title>
      </Head>
      <section className="w-full bg-gradient-to-br from-primary-color to-secondary-color px-5 pb-24 pt-10 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-90">
          {feedbackLanguageData.campaignEyebrow(lang)}
        </p>
        <h1 className="mx-auto mt-2 max-w-2xl text-3xl font-bold md:text-4xl">
          {feedbackLanguageData.campaignHeadline(lang)}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            feedbackLanguageData.campaignStep1(lang),
            feedbackLanguageData.campaignStep2(lang),
            feedbackLanguageData.campaignStep3(lang),
          ].map((step) => (
            <span
              key={step}
              className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold"
            >
              {step}
            </span>
          ))}
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-16 flex w-full max-w-2xl justify-center px-5 pb-10">
        <Feedback variant="campaign" />
      </div>
    </DefaultLayout>
  );
}

export default GiveFeedback;
