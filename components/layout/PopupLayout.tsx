import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

function PopupLayout({ children, onClose }: LayoutProps) {
  return (
    <div
      className={`fixed flex top-0 bottom-0 right-0 left-0 items-center justify-center m-auto z-50`}
    >
      {children}
      <footer
        onClick={() => onClose()}
        className="top-0 bottom-0 w-screen h-screen right-0 left-0 
    bg-black/50 fixed  m-auto -z-10"
      ></footer>
    </div>
  );
}

export default PopupLayout;
