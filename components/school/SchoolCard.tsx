import { School } from "@/interfaces";
import Image from "next/image";

const SchoolCard: React.FC<{ school: School }> = ({ school }) => {
  console.log(school, "school");

  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-4 w-full mb-10 z-10">
      <div className="mr-4 w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={school.logo}
          alt={school.title}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h2 className="flex-1 text-xl font-bold text-gray-800 truncate w-11/12">
          {school.title}
          <span className="block border-b-2 border-purple-500 w-1/2 mt-1"></span>
        </h2>
        <p className="text-gray-500 text-lg">{school.city}</p>
      </div>
    </div>
  );
};

export default SchoolCard;
