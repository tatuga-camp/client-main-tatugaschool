import SchoolListHeader from "@/components/Header";
import { UserService } from "@/services";
import { QueryClient, useQuery } from "@tanstack/react-query";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  useQuery({
    queryKey: ["user"],
    queryFn: () => UserService(),
  });

  const clearClient = new QueryClient();

  return (
    <div className="min-h-screen bg-[#6f47dd]">
      <SchoolListHeader QueryClient={clearClient} />
      {children}
    </div>
  );
};

export default DefaultLayout;
