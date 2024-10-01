import Link from "next/link";
import { useRouter } from "next/router";

import { setCookie, destroyCookie, parseCookies } from "nookies";


export default function Home() {

  const router = useRouter();
  const cookies = parseCookies()

  const handleLogout = () => {

    destroyCookie(null, "access_token", { path: "/" });
    destroyCookie(null, "refresh_token", { path: "/" });

    console.log("Cookie deleted successfully", { cookies });
    
    console.log("Logged out successfully");
    router.push("/login");
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <Link href="/login">Login </Link>

      <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
        Log Out
      </button>
    </div>
  );
}
