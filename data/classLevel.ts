export const ClassLevelList = [
  {
    title: "อนุบาล",
  },
  {
    title: "ประถมศึกษาปีที่ 1",
  },
  {
    title: "ประถมศึกษาปีที่ 2",
  },
  {
    title: "ประถมศึกษาปีที่ 3",
  },
  {
    title: "ประถมศึกษาปีที่ 4",
  },
  {
    title: "ประถมศึกษาปีที่ 5",
  },
  {
    title: "ประถมศึกษาปีที่ 6",
  },
  {
    title: "มัธยมศึกษาปีที่ 1",
  },
  {
    title: "มัธยมศึกษาปีที่ 2",
  },
  {
    title: "มัธยมศึกษาปีที่ 3",
  },
  {
    title: "มัธยมศึกษาปีที่ 4",
  },
  {
    title: "มัธยมศึกษาปีที่ 5",
  },
  {
    title: "มัธยมศึกษาปีที่ 6",
  },
  {
    title: "ปวช. 1",
  },
  {
    title: "ปวช. 2",
  },
  {
    title: "ปวช. 3",
  },
  {
    title: "ปวส. 1",
  },
  {
    title: "ปวส. 2",
  },
  {
    title: "อุดมศึกษา",
  },
] as const;

export type ClassLevelType = (typeof ClassLevelList)[number]["title"];
