import React, { ReactNode, useEffect, useId, useRef, useState } from "react";
import { MdMoreHoriz } from "react-icons/md";
import useClickOutside from "../../hook/useClickOutside";

export type RowAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
};

type Props = {
  // Accessible name of the trigger, e.g. "More actions for Somchai".
  label: string;
  actions: RowAction[];
  disabled?: boolean;
};

function RowActionsMenu({ label, actions, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(
      (item): item is HTMLButtonElement => item !== null,
    );
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color/60 transition-colors hover:bg-background-color hover:text-icon-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-color/30 disabled:cursor-wait disabled:opacity-50"
      >
        <MdMoreHoriz aria-hidden />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-2xl bg-white py-1 shadow-lg ring-1 ring-icon-color/10"
        >
          {actions.map((action, index) => (
            <button
              key={action.key}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                close(false);
                action.onSelect();
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none ${
                action.danger
                  ? "text-error-color hover:bg-error-color/10 focus:bg-error-color/10"
                  : "text-icon-color hover:bg-background-color focus:bg-background-color"
              }`}
            >
              <span aria-hidden className="text-lg">
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RowActionsMenu;
