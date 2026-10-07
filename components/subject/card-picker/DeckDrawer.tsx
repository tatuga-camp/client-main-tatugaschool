import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { CardPickerLanguage } from "../../../data/languages";
import { Language, StudentOnSubject } from "../../../interfaces";
import { StudentPhoto } from "./CardFace";

type Props = {
  open: boolean;
  onClose: () => void;
  deck: StudentOnSubject[];
  picked: StudentOnSubject[];
  revealed: StudentOnSubject | null;
  lang: Language;
  onMoveToPicked: (id: string) => void;
  onMoveToDeck: (id: string) => void;
};

// Roster order, not deck order — listing deck order would reveal who's next.
const byNumber = (a: StudentOnSubject, b: StudentOnSubject) =>
  a.number.localeCompare(b.number, undefined, { numeric: true });

export default function DeckDrawer({
  open,
  onClose,
  deck,
  picked,
  revealed,
  lang,
  onMoveToPicked,
  onMoveToDeck,
}: Props) {
  const [tab, setTab] = useState<"deck" | "picked">("deck");
  const deckRows = [...deck].sort(byNumber);
  const pickedRows = [...picked].reverse(); // most recent first
  const pickedCount = picked.length + (revealed ? 1 : 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            key="panel"
            className="fixed bottom-3 left-3 top-3 z-40 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-white font-Anuphan text-icon-color shadow-2xl"
            initial={{ x: "-110%" }}
            animate={{ x: 0 }}
            exit={{ x: "-110%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <header className="flex items-center gap-2 border-b p-3">
              <div className="flex flex-1 rounded-lg bg-background-color p-1">
                {(["deck", "picked"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      tab === key
                        ? "bg-white text-primary-color shadow-sm"
                        : "text-icon-color/70 hover:text-icon-color"
                    }`}
                  >
                    {key === "deck"
                      ? `${CardPickerLanguage.in_deck(lang)} · ${deck.length}`
                      : `${CardPickerLanguage.picked(lang)} · ${pickedCount}`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={CardPickerLanguage.close(lang)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-background-color"
              >
                <IoClose />
              </button>
            </header>

            <ul className="flex-1 overflow-y-auto p-2">
              {tab === "picked" && revealed && (
                <li className="flex items-center gap-3 rounded-lg bg-primary-color/5 px-3 py-2">
                  <StudentPhoto
                    student={revealed}
                    className="h-8 w-8 text-sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {revealed.firstName} {revealed.lastName}
                  </span>
                  <span className="rounded-full bg-primary-color px-2 py-0.5 text-[11px] font-bold text-white">
                    {CardPickerLanguage.now_label(lang)}
                  </span>
                </li>
              )}
              {(tab === "deck" ? deckRows : pickedRows).map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() =>
                      tab === "deck"
                        ? onMoveToPicked(student.id)
                        : onMoveToDeck(student.id)
                    }
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-background-color"
                  >
                    <StudentPhoto
                      student={student}
                      className="h-8 w-8 text-sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="block text-xs text-icon-color/60">
                        {CardPickerLanguage.number_label(lang, student.number)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-primary-color opacity-0 transition group-hover:opacity-100">
                      {tab === "deck"
                        ? CardPickerLanguage.move_to_picked(lang)
                        : CardPickerLanguage.move_to_deck(lang)}
                    </span>
                  </button>
                </li>
              ))}
              {(tab === "deck" ? deckRows.length : pickedCount) === 0 && (
                <li className="px-3 py-10 text-center text-sm text-icon-color/60">
                  {CardPickerLanguage.empty_list(lang)}
                </li>
              )}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
