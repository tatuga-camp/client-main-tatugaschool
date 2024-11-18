import { Toast } from "primereact/toast";
import React from "react";
import { FaBook, FaPlus } from "react-icons/fa6";
import { MdAssignment } from "react-icons/md";
import ClassworkCreate from "./ClassworkCreate";

type Props = {
  toast: React.RefObject<Toast>;
};
function Classwork({ toast }: Props) {
  const [triggerCreate, setTriggerCreate] = React.useState(false);

  return (
    <>
      {triggerCreate && (
        <div
          className={`fixed flex
          } top-0 bottom-0 right-0 left-0 flex items-center justify-center m-auto z-50`}
        >
          <div className="bg-background-color w-screen h-screen ">
            <ClassworkCreate
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreate(false);
              }}
            />
          </div>
        </div>
      )}
      <header className="w-full flex justify-between px-40">
        <section>
          <h1 className="text-3xl font-semibold">Classwork</h1>
          <span className="text-gray-400">
            You can assign a task to your students here and track their progress
          </span>
        </section>

        <section className="flex font-Anuphan items-center gap-1">
          <button
            onClick={() => setTriggerCreate((prev) => !prev)}
            className="second-button relative   flex items-center w-52 justify-center gap-1 py-1 border "
          >
            <div className="flex items-center justify-center gap-2">
              <FaPlus />
              Create Classwork
            </div>
          </button>
        </section>
      </header>
    </>
  );
}

export default Classwork;
