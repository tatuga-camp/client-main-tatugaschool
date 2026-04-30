import { IoMdEye } from "react-icons/io";
import { TeachingMaterial } from "../../interfaces";
import { SiCanva } from "react-icons/si";

type Props = {
  teachingMaterial: TeachingMaterial;
  language: "en" | "th";
  onClick: () => void;
};
function TeachingMaterialCard({ teachingMaterial, onClick, language }: Props) {
  return (
    <button
      onClick={() => onClick()}
      className="group relative h-max w-80 overflow-hidden rounded-2xl border-2 border-black bg-white font-Anuphan transition hover:scale-105"
    >
      <div className="absolute right-2 top-2 z-20 rounded-2xl border bg-green-100 px-3 text-sm text-green-800">
        AI Match: {(teachingMaterial.score * 100).toFixed(0)}%
      </div>
      {teachingMaterial.canvaURL && (
        <div className="absolute left-2 top-2 z-20 flex flex-col gap-2 text-4xl font-bold text-blue-500">
          <SiCanva />
        </div>
      )}
      <div className="relative h-60 w-full">
        <img
          src={
            teachingMaterial.thumbnail
              ? teachingMaterial.thumbnail
              : "/favicon.ico"
          }
          className="h-full w-full object-contain"
        />
      </div>
      <section className="mt-3 flex w-full grow flex-col justify-between gap-2 px-2 pb-2">
        <h1 className="text-lg font-semibold">
          {language === "en"
            ? teachingMaterial.title
            : teachingMaterial.titleTH}
        </h1>
        <ul className="flex flex-wrap gap-2">
          {teachingMaterial.tags.map((tag, index) => {
            return (
              <li
                className="w-max rounded-2xl bg-blue-100 px-2 text-xs text-blue-700"
                key={index}
              >
                #{tag}
              </li>
            );
          })}
        </ul>
        <footer className="flex w-full items-center justify-between">
          <div className="text-xs text-gray-500">
            Create At:{" "}
            {new Date(teachingMaterial.createAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
          </div>
        </footer>
      </section>
    </button>
  );
}

export default TeachingMaterialCard;
