import { useEffect } from "react";
import SchoolListHeader from "@/components/Header";
import useUserStore from "@/store/userStore";
import { SignInService, UserService } from "@/services";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    const responseUser = await UserService()
    setUser(responseUser);
  };

  return (
    <div className="min-h-screen bg-[#6f47dd]">
      <SchoolListHeader clearUser={clearUser} />
      {children}
    </div>
  );
};

export default DefaultLayout;
