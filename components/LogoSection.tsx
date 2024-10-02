import Image from "next/image";

export const LogoSection = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center mb-8 text-center">
    <Image src="/logo.svg" alt={`${title} Logo`} width={60} height={60} />
    <h1 className="text-lg font-semibold mt-4">{title}</h1>
  </div>
);
