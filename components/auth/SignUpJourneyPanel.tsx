import { signUpLanguageData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

type Props = {
  // Invited teachers skip email verification and school setup: the server
  // verifies them through the invitation and sends them into that school.
  invitedSchool?: string | null;
};

// Sign-up's counterpart to AuthBrandPanel: instead of brand copy it shows the
// real path from this form to a working school, with this form as step one.
export const SignUpJourneyPanel = ({ invitedSchool }: Props) => {
  const language = useGetLanguage();
  const lang = language.data ?? "en";

  const steps = invitedSchool
    ? [
        {
          title: signUpLanguageData.stepAccount(lang),
          detail: signUpLanguageData.stepAccountDetail(lang),
        },
        {
          title: `${signUpLanguageData.stepJoin(lang)}: ${invitedSchool}`,
          detail: signUpLanguageData.stepJoinDetail(lang),
        },
      ]
    : [
        {
          title: signUpLanguageData.stepAccount(lang),
          detail: signUpLanguageData.stepAccountDetail(lang),
        },
        {
          title: signUpLanguageData.stepVerify(lang),
          detail: signUpLanguageData.stepVerifyDetail(lang),
        },
        {
          title: signUpLanguageData.stepSchool(lang),
          detail: signUpLanguageData.stepSchoolDetail(lang),
        },
      ];

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
      <div className="relative z-10 flex max-w-lg flex-col px-6 lg:px-8 xl:px-12 2xl:max-w-xl 2xl:px-16">
        <h1 className="text-2xl font-bold leading-snug text-white lg:text-3xl xl:text-4xl xl:leading-snug">
          {invitedSchool
            ? signUpLanguageData.journeyInvitedTitle(lang)
            : signUpLanguageData.journeyTitle(lang)}
        </h1>
        <ol className="mt-8 flex flex-col xl:mt-10">
          {steps.map((step, index) => {
            const current = index === 0;
            const last = index === steps.length - 1;
            return (
              <li
                key={step.title}
                aria-current={current ? "step" : undefined}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {!last && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-[1.125rem] top-10 w-px bg-white/35"
                  />
                )}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    current
                      ? "bg-white text-primary-color shadow-sm"
                      : "border border-white/60 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="pt-1.5">
                  <p
                    className={`font-semibold leading-snug text-white lg:text-lg ${
                      current ? "" : "text-white/90"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
};
