export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex flex-col gap-2 h-full font-Anuphan
   items-center justify-between min-h-screen min-w-full gradient-bg p-5"
  >
    {children}
  </div>
);
