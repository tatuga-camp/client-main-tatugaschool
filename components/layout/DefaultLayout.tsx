import SchoolListHeader from "@/components/Header";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { User } from "../../interfaces";
import { GetUserService } from "../../services";
import { useRouter } from "next/router";
import AskNotification from "../AskNotification";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen font-Anuphan w-full bg-background-color">
      <SchoolListHeader />
      {children}

      <AskNotification />
    </div>
  );
};

export default DefaultLayout;
