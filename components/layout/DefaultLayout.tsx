import SchoolListHeader from "@/components/Header";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { User } from "../../interfaces";
import { GetUserService } from "../../services";
import { useRouter } from "next/router";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <div className="min-h-screen font-Anuphan bg-[#6f47dd]">
      <SchoolListHeader queryClient={queryClient} />
      {children}
    </div>
  );
};

export default DefaultLayout;
