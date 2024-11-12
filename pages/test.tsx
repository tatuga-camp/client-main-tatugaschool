import { useEffect, useState } from "react";
import { Student } from "@/interfaces/Student";
import AnimationPanoramaCarousel from "@/components/animation/AnimationPanoramaCarousel";

const TestPage = () => {
  const images: Student[] = [
    {
      "id": "66d955f9a99282b607720cda",
      createAt: new Date("2024-09-05T06:55:53.021Z"),
      updateAt: new Date("2024-09-05T06:55:53.021Z"),
      title: "portals",
      firstName: "Nigel",
      lastName: "Beer",
      photo: "/cat/1.jpg",
      number: "346",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      id: "66d955fba99282b607720cdb",
      createAt: new Date("2024-09-05T06:55:55.062Z"),
      updateAt: new Date("2024-09-05T06:55:55.062Z"),
      title: "pixel",
      firstName: "Deontae",
      lastName: "Schmidt",
      photo: "/cat/2.jpg",
      number: "924",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      "id": "66d955fda99282b607720cdc",
      createAt: new Date("2024-09-05T06:55:57.315Z"),
      updateAt: new Date("2024-09-05T06:55:57.315Z"),
      title: "Rand",
      firstName: "Candelario",
      lastName: "Dooley",
      photo: "/cat/3.jpg",
      number: "9",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      "id": "66d95661a99282b607720ce9",
      createAt: new Date("2024-09-05T06:57:37.753Z"),
      updateAt: new Date("2024-09-05T06:57:37.753Z"),
      title: "drive",
      firstName: "Horacio",
      lastName: "Gottlieb",
      photo: "/cat/4.jpg",
      number: "288",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      "id": "66e5a8a772fc86073a3e1f47",
      createAt: new Date("2024-09-14T15:15:51.888Z"),
      updateAt: new Date("2024-09-14T15:15:51.888Z"),
      title: "Cambridgeshire",
      firstName: "Ines",
      lastName: "Aufderhar",
      photo: "/cat/5.jpg",
      number: "283",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      id: "66e5a8b472fc86073a3e1f48",
      createAt: new Date("2024-09-14T15:16:04.181Z"),
      updateAt: new Date("2024-09-14T15:16:04.181Z"),
      title: "Unbranded",
      firstName: "Charlie",
      lastName: "Emmerich",
      photo: "/cat/6.jpg",
      number: "714",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      "id": "66e5a8d972fc86073a3e1f49",
      createAt: new Date("2024-09-14T15:16:41.902Z"),
      updateAt: new Date("2024-09-14T15:16:41.902Z"),
      title: "DDS",
      firstName: "Reginald",
      lastName: "Corkery",
      photo: "/cat/7.jpg",
      number: "905",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      id: "66e5a8db72fc86073a3e1f4a",
      createAt: new Date("2024-09-14T15:16:43.484Z"),
      updateAt: new Date("2024-09-14T15:16:43.484Z"),
      title: "II",
      firstName: "Palma",
      lastName: "Skiles",
      photo: "/cat/8.jpg",
      number: "21",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
    {
      id: "66e5a8dc72fc86073a3e1f4b",
      createAt: new Date("2024-09-14T15:16:44.996Z"),
      updateAt: new Date("2024-09-14T15:16:44.996Z"),
      title: "PhD",
      firstName: "Keven",
      lastName: "Schimmel",
      photo: "/cat/9.jpg",
      number: "764",
      schoolId: "66d95412a99282b607720cd6",
      classId: "66d955eda99282b607720cd9"
    },
  ]
  const [passPointer, setPassPointer] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [onSelected, setOnSelected] = useState<any>(null);

  useEffect(() => {
    console.log("onSelected", onSelected);
  }, [onSelected]);

  return (
    <>
      <AnimationPanoramaCarousel<Student>
        images={images}
        passPointer={passPointer}
        isStarted={isStarted}
        onSelected={setOnSelected}
        onPassPointer={setPassPointer}
        setIsStarted={setIsStarted}
      />
    </>
  );
};

export default TestPage;
