import Image from "next/image";
import { IoMdEye } from "react-icons/io";
import { FileOnTeachingMaterial, TeachingMaterial } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash, defaultCanvas } from "../../data";

type Props = {
  teachingMaterial: TeachingMaterial & { files: FileOnTeachingMaterial[] };
  onClick: () => void;
};
function TeachingMaterialCard({ teachingMaterial, onClick }: Props) {
  return (
    <div className="group relative h-max w-80 overflow-hidden rounded-md border bg-white font-Anuphan">
      <div className="absolute bottom-0 left-0 right-0 top-0 z-30 m-auto hidden h-full w-full flex-col items-center justify-center gap-2 group-hover:flex">
        <button
          onClick={() => onClick()}
          className="second-button flex h-8 w-40 items-center justify-center gap-2 border py-2"
        >
          <IoMdEye /> View File
        </button>
        <span className="text-sm text-white">click to view detail</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 top-0 z-20 m-auto hidden h-full w-full gap-2 bg-sky-600/50 backdrop-blur-sm group-hover:flex"></div>

      <div className="relative h-60 w-full">
        <Image
          src={
            teachingMaterial.thumbnail
              ? teachingMaterial.thumbnail
              : "/favicon.ico"
          }
          alt="backgroud image of file"
          fill
          blurDataURL={
            teachingMaterial.blurHash
              ? decodeBlurhashToCanvas(teachingMaterial.blurHash)
              : defaultCanvas
          }
          placeholder="blur"
          className="object-contain"
        />
      </div>
      <section className="mt-3 flex w-full grow flex-col justify-between gap-2 px-2 pb-2">
        <h1 className="text-lg font-semibold">{teachingMaterial.title}</h1>
        <ul className="flex flex-wrap gap-2">
          {teachingMaterial.tags.map((tag, index) => {
            return (
              <li
                className="w-max rounded-md bg-blue-100 px-2 text-xs text-blue-700"
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
    </div>
  );
}

export default TeachingMaterialCard;
