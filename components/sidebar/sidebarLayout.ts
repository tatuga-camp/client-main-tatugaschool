// Keep these literal so Tailwind picks them up. Must match Sidebar's `w-[4.5rem] lg:w-52`.
// Below `md` the rail overlays the page, so content keeps the full width.

/** Pads page content clear of the always-visible sidebar (from `md` up). */
export const SIDEBAR_CONTENT_OFFSET =
  "min-w-0 max-w-full overflow-x-hidden md:pl-[4.5rem] lg:pl-52";

/** Starts a fixed full-width bar (footers, banners) beside the sidebar. */
export const SIDEBAR_FIXED_LEFT = "left-0 right-0 md:left-[4.5rem] lg:left-52";
