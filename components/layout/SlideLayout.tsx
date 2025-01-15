import type { ReactNode } from "react";
import React, { use, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { TbReportSearch } from "react-icons/tb";
import { SiGooglegemini } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import LoadingBar from "../common/LoadingBar";
import { useEnterKey, useEscKey } from "../../hook";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
  loading?: boolean;
  onClickUpdate: () => void;
  onClickDelete: () => void;
};

function SlideLayout({
  children,
  onClose,
  loading,
  onClickUpdate,
  onClickDelete,
}: LayoutProps) {
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

  useEnterKey(() => {
    onClickUpdate();
  });

  return (
    <div
      className={`fixed flex top-0 bottom-0 right-0 left-0 items-center justify-end m-auto z-50`}
    >
      <div
        className={`
        ${
          triggerShow ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300
        w-5/12 h-full flex justify-between flex-col bg-white`}
      >
        <header className="w-full px-3  py-5 border-b justify-between flex">
          <div className="flex items-center justify-start gap-2">
            <button className="flex items-center justify-center gap-1 second-button border">
              <SiGooglegemini />
              Suggest Carrer Path (AI)
            </button>
            <button className="flex items-center justify-center gap-1 second-button border">
              <TbReportSearch />
              Report
            </button>
          </div>

          <button
            onClick={() => {
              handleClose();
            }}
            type="button"
            className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
          >
            <IoMdClose />
          </button>
        </header>
        {loading && <LoadingBar />}
        {children}

        <div className="w-full px-3  py-5  border-t justify-between gap-3 flex">
          <button
            onClick={() => {
              document.body.style.overflow = "auto";
              onClickDelete();
            }}
            className="reject-button flex items-center justify-center gap-1"
          >
            <MdDelete />
            Delete student
          </button>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                handleClose();
              }}
              type="button"
              className="second-button border flex items-center justify-center gap-1"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClickUpdate();
              }}
              type="submit"
              className="main-button flex items-center justify-center gap-1"
            >
              <FiPlus /> Update Student
            </button>
          </div>
        </div>
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
