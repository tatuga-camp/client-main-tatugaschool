export const ClassLevelList = [
  {
    title: "อนุบาล",
    titleEn: "Kindergarten",
  },
  {
    title: "ประถมศึกษาปีที่ 1",
    titleEn: "Primary 1",
  },
  {
    title: "ประถมศึกษาปีที่ 2",
    titleEn: "Primary 2",
  },
  {
    title: "ประถมศึกษาปีที่ 3",
    titleEn: "Primary 3",
  },
  {
    title: "ประถมศึกษาปีที่ 4",
    titleEn: "Primary 4",
  },
  {
    title: "ประถมศึกษาปีที่ 5",
    titleEn: "Primary 5",
  },
  {
    title: "ประถมศึกษาปีที่ 6",
    titleEn: "Primary 6",
  },
  {
    title: "มัธยมศึกษาปีที่ 1",
    titleEn: "Secondary 1",
  },
  {
    title: "มัธยมศึกษาปีที่ 2",
    titleEn: "Secondary 2",
  },
  {
    title: "มัธยมศึกษาปีที่ 3",
    titleEn: "Secondary 3",
  },
  {
    title: "มัธยมศึกษาปีที่ 4",
    titleEn: "Secondary 4",
  },
  {
    title: "มัธยมศึกษาปีที่ 5",
    titleEn: "Secondary 5",
  },
  {
    title: "มัธยมศึกษาปีที่ 6",
    titleEn: "Secondary 6",
  },
  {
    title: "ปวช. 1",
    titleEn: "Vocational Certificate 1",
  },
  {
    title: "ปวช. 2",
    titleEn: "Vocational Certificate 2",
  },
  {
    title: "ปวช. 3",
    titleEn: "Vocational Certificate 3",
  },
  {
    title: "ปวส. 1",
    titleEn: "High Vocational Certificate 1",
  },
  {
    title: "ปวส. 2",
    titleEn: "High Vocational Certificate 2",
  },
  {
    title: "อุดมศึกษา",
    titleEn: "Higher Education",
  },
] as const;

export type ClassLevelType = (typeof ClassLevelList)[number]["title"];
