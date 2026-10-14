/** The menu item to highlight: `?menu=` when present, else the page default. */
export function highlightedMenu(
  queryMenu: string | string[] | undefined,
  defaultMenu: string,
): string {
  const value = Array.isArray(queryMenu) ? queryMenu[0] : queryMenu;
  return value ? value : defaultMenu;
}
