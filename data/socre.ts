export const scoreOnSubjectTitlesDefault = [
  {
    icon: "https://storage.cloud.google.com/public-tatugaschool/Good-job.svg",
    blurHash: "UEO{GV?D05-m~9WDIqah0NWV08M~X_ows.ov",
  },
  {
    icon: "https://storage.cloud.google.com/public-tatugaschool/Well-Done.svg",
    blurHash: "UlMi|;xpE4n+IrWDs.bFIqahE5bY~QovIrjI",
  },
  {
    icon: "https://storage.cloud.google.com/public-tatugaschool/Keep-It-Up.svg",
    blurHash: "UAPPF5^z05?W~RRlNIoe05WC07IY~QxrD-WD",
  },
  {
    icon: "https://storage.cloud.google.com/public-tatugaschool/Excellent.svg",
    blurHash: "UAP63q^z06?C^}WCM~a#05WC07Ir~jt5E4oe",
  },
  {
    icon: "https://storage.cloud.google.com/public-tatugaschool/Needs-Improvement.svg",
    blurHash: "UAPPF5^z05?W~RRlNIoe05WC07IY~QxrD-WD",
  },
] as const;

export type ScoreOnSubjectIcon =
  (typeof scoreOnSubjectTitlesDefault)[number]["icon"];
