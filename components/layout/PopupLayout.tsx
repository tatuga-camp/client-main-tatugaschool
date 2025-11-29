import { useEffect, type ReactNode } from "react";
import { useEscKey } from "../../hook";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

function PopupLayout({ children, onClose }: LayoutProps) {
  useEscKey(() => {
    onClose();
    document.body.style.overflow = "auto";
  });

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex items-center justify-center`}
    >
      {children}
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          onClose();
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/80"
      ></footer>
    </div>
  );
}

export default PopupLayout;
