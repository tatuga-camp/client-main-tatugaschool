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
      className={`fixed bottom-0 left-0 right-0 top-0 z-40 m-auto flex items-center justify-end`}
    >
      <div
        className={` ${
          triggerShow ? "translate-x-0" : "translate-x-full"
        } relative flex h-full w-full flex-col justify-between bg-white transition-transform duration-300 md:w-10/12 lg:w-7/12 2xl:w-5/12`}
      >
        <header className="flex w-full justify-end p-2">
          <button
            onClick={() => {
              handleClose();
            }}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50 md:h-6 md:w-6"
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
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/50"
      ></footer>
    </div>
  );
}

export default SlideLayout;
