export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-between min-h-screen min-w-full bg-[#F7F7F9] px-4">
        <div className="place-content-center min-h-screen">
            {children}
        </div>
    </div>
)