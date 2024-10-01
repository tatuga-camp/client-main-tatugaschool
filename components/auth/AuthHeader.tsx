import Image from "next/image";

export const AuthHeader = () => (
    <div className="flex flex-row items-center justify-center mb-[60px]">
        <Image
            src="/logo.svg"
            alt="Tatuga School Logo"
            width={80}
            height={80}
            className="h-[80px] mr-[16px]"
        />
        <h1 className="text-[32px] font-bold text-[#333333]">Tatuga School</h1>
    </div>
)