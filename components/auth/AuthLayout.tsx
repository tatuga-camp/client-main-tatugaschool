import LanguageSelect from "../common/LanguageSelect";
import { AuthHeader } from "./AuthHeader";

type AuthLayoutProps = {
  children: React.ReactNode;
  contentClassName?: string;
};

export const AuthLayout = ({ children, contentClassName }: AuthLayoutProps) => (
  <div className="gradient-bg flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden font-Anuphan">
    <header className="flex w-full shrink-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 md:px-6 lg:px-8 2xl:px-10">
      <div className="min-w-0">
        <AuthHeader />
      </div>
      <LanguageSelect className="w-[9.25rem] shrink-0 border border-gray-200 shadow-sm sm:w-40 md:w-48" />
    </header>
    <div
      className={
        contentClassName ??
        "pb-safe flex w-full flex-1 flex-col items-center px-4 pb-5 sm:px-6 md:px-8"
      }
    >
      {children}
    </div>
  </div>
);
