import type { ReactNode } from "react";
import React from "react";
import { IoMdClose } from "react-icons/io";
import { useEscKey } from "../../hook";
import LoadingBar from "../common/LoadingBar";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
  loading?: boolean;
};

function SlideLayout({ children, onClose, loading }: LayoutProps) {
  const [triggerShow, setTriggerShow] = React.useState(false);
  React.useEffect(() => {
    setTriggerShow(true);
  }, []);

  const handleClose = () => {
    setTriggerShow(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      onClose();
    }, 300);
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  useEscKey(() => {
    handleClose();
  });

  return (
    <div
      className={`fixed flex top-0 bottom-0 right-0 left-0 items-center justify-end m-auto z-50`}
    >
      <div
        className={`
        ${
          triggerShow ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:w-10/12 lg:w-7/12
        2xl:w-5/12 h-full flex justify-between flex-col relative bg-white`}
      >
        <header className="w-full p-2 flex justify-end">
          <button
            onClick={() => {
              handleClose();
            }}
            type="button"
            className="text-lg  hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
          >
            <IoMdClose />
          </button>
        </header>
        {loading && <LoadingBar />}
        {children}
      </div>
      <footer
        onClick={() => {
          handleClose();
        }}
        className="top-0 bottom-0 w-screen h-screen right-0 left-0 
bg-black/50 fixed  m-auto -z-10"
      ></footer>
    </div>
  );
}

export default SlideLayout;
