import SchoolListHeader from "@/components/Header";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { User } from "../../interfaces";
import { GetUserService } from "../../services";
import { useRouter } from "next/router";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen font-Anuphan w-full bg-background-color">
      <SchoolListHeader />
      {children}
    </div>
  );
};

export default DefaultLayout;
