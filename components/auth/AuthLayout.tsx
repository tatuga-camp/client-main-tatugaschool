export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex flex-col h-full font-Anuphan
   items-center justify-between min-h-screen min-w-full bg-[#F7F7F9] p-5"
  >
    {children}
  </div>
);
