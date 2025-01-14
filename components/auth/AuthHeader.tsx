import Image from "next/image";

export const AuthHeader = () => (
  <div className="flex flex-row gap-3 items-center justify-center mb-10">
    <Image src="/favicon.ico" alt="Tatuga School Logo" width={50} height={50} />
    <h1 className="text-lg font-bold text-[#333333]">Tatuga School</h1>
  </div>
);
