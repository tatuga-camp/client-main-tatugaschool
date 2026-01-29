import AskNotification from "../AskNotification";
import Navbar from "../Navbar";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-background-color font-Anuphan">
      <Navbar trigger={false} setTrigger={() => {}} menuLists={[]} />
      {children}
      <AskNotification />
    </div>
  );
};

export default DefaultLayout;
