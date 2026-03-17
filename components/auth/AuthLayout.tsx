import LanguageSelect from "../LanguageSelect";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="gradient-bg flex h-full min-h-screen min-w-full flex-col items-center justify-between gap-2 p-5 font-Anuphan">
    <div className="fixed right-2 top-2">
      <LanguageSelect className="w-40 border border-gray-200 shadow-sm md:w-48" />
    </div>
    {children}
  </div>
);
