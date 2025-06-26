import { School } from "@/interfaces";
import Image from "next/image";

const SchoolCard: React.FC<{ school: School }> = ({ school }) => {
  return (
    <div className="z-10 mb-10 flex w-full items-center rounded-xl bg-gray-100 p-4">
      <div className="mr-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
        <Image
          src={school.logo}
          alt={school.title}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h2 className="w-11/12 flex-1 truncate text-xl font-bold text-gray-800">
          {school.title}
          <span className="mt-1 block w-1/2 border-b-2 border-purple-500"></span>
        </h2>
        <p className="text-lg text-gray-500">{school.city}</p>
      </div>
    </div>
  );
};

export default SchoolCard;
