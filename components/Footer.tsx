import Image from "next/image";

export const Footer = () => (
    <div className="flex flex-col items-center justify-center mt-8 text-center">
        <Image src="/logo-ted-fund.svg" alt="Logo ted fund" width={40} height={40} />
        <p className="text-sm text-gray-600 mt-4 max-w-xs">
            สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
            สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </p>
    </div>
);