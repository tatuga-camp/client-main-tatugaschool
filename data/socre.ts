export const scoreOnSubjectTitlesDefault = [
  {
    icon: "https://storage.tatugaschool.com/AVATAR/Good-job.webp",
    blurHash: "UEO{GV?D05-m~9WDIqah0NWV08M~X_ows.ov",
  },
  {
    icon: "https://storage.tatugaschool.com/AVATAR/Well-Done.webp",
    blurHash: "UlMi|;xpE4n+IrWDs.bFIqahE5bY~QovIrjI",
  },
  {
    icon: "https://storage.tatugaschool.com/AVATAR/Keep-It-Up.webp",
    blurHash: "UAPPF5^z05?W~RRlNIoe05WC07IY~QxrD-WD",
  },
  {
    icon: "https://storage.tatugaschool.com/AVATAR/Excellent.webp",
    blurHash: "UAP63q^z06?C^}WCM~a#05WC07Ir~jt5E4oe",
  },
  {
    icon: "https://storage.tatugaschool.com/AVATAR/Needs-Improvement.webp",
    blurHash: "UAPPF5^z05?W~RRlNIoe05WC07IY~QxrD-WD",
  },
] as const;

export type ScoreOnSubjectIcon =
  (typeof scoreOnSubjectTitlesDefault)[number]["icon"];
