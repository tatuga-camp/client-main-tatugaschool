import Image from "next/image";

export const AuthFooter = () => (
    <div className="flex flex-row items-center justify-center mt-[60px]">
        <Image
            src="/logo-ted-fund.svg"
            alt="TED Fund Logo"
            width={40}
            height={40}
            className="h-[40px] w-[152.58px] mr-[16px]"
        />
        <p className="text-[14px] text-[#6E6E6E] max-w-[500px] text-center">
            สนับสนุนโดยกองทุนพัฒนาผู้ประกอบการเทคโนโลยี และนวัตกรรม (TED FUND)
            สำนักงานคณะกรรมการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม
        </p>
    </div>
)