import { useEffect, useId, useRef, useState } from "react";
import {
  IoCheckmark,
  IoGameController,
  IoMusicalNotes,
  IoVolumeHigh,
  IoVolumeMute,
} from "react-icons/io5";
import { GiDrumKit } from "react-icons/gi";
import { PickerSoundLanguage } from "../../../data/languages";
import { Language } from "../../../interfaces";
import type { PickerSound } from "./usePickerSound";

const OPTIONS: { key: PickerSound; icon: React.ReactNode }[] = [
  { key: "chime", icon: <IoMusicalNotes /> },
  { key: "arcade", icon: <IoGameController /> },
  { key: "drumroll", icon: <GiDrumKit /> },
  { key: "off", icon: <IoVolumeMute /> },
];

type Props = {
  sound: PickerSound;
  onChange: (next: PickerSound) => void;
  lang: Language;
  /** Classes for the round trigger button (light or dark-glass pill). */
  buttonClassName: string;
  /** Open the list above the button (bottom toolbars) instead of below. */
  placement?: "down" | "up";
  disabled?: boolean;
};

/**
 * Sound-set picker shared by all student pickers. Choosing a set saves it
 * and plays a short preview, so teachers can audition before a real draw.
 */
export default function SoundMenu({
  sound,
  onChange,
  lang,
  buttonClassName,
  placement = "down",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const label = PickerSoundLanguage.menu_label(lang);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Window capture runs before the pickers' own document listeners, so
    // Esc closes only this menu and Space can't start a spin behind it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        setOpen(false);
      } else if (e.code === "Space" || e.key === " ") {
        e.stopPropagation();
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-label={`${label}: ${PickerSoundLanguage.name(lang, sound)}`}
        title={`${label}: ${PickerSoundLanguage.name(lang, sound)}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition disabled:opacity-50 ${buttonClassName}`}
      >
        {sound === "off" ? <IoVolumeMute /> : <IoVolumeHigh />}
      </button>
      {open && (
        <div
          id={listId}
          role="radiogroup"
          aria-label={label}
          className={`absolute right-0 z-50 w-64 max-w-[85vw] rounded-2xl border border-gray-200 bg-white p-2 text-icon-color shadow-xl ${
            placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <p className="px-2 pb-1 pt-0.5 text-xs font-semibold uppercase tracking-wide text-icon-color/60">
            {label}
          </p>
          {OPTIONS.map((o) => {
            const active = sound === o.key;
            return (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(o.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                  active
                    ? "bg-primary-color/10 text-primary-color"
                    : "hover:bg-gray-100"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ${
                    active
                      ? "bg-primary-color text-white"
                      : "bg-primary-color/10 text-primary-color"
                  }`}
                >
                  {o.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {PickerSoundLanguage.name(lang, o.key)}
                  </span>
                  <span className="block text-xs leading-snug text-icon-color/60">
                    {PickerSoundLanguage.hint(lang, o.key)}
                  </span>
                </span>
                {active && <IoCheckmark className="shrink-0 text-lg" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
