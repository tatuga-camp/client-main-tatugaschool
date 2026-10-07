/** Shared size so the stack and the spotlight card line up exactly. */
export const CARD_SIZE = "h-60 w-44 md:h-72 md:w-52";

export default function CardBack() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border-4 border-white bg-primary-color shadow-[0_10px_24px_rgba(39,93,150,0.28)]"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.2) 1.5px, transparent 1.6px)",
        backgroundSize: "13px 13px",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-2xl font-extrabold text-white">
          ?
        </span>
      </div>
    </div>
  );
}
