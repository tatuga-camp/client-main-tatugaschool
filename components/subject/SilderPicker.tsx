/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useEffect, useState } from "react";
import { AnimationImageItemProps } from "../animation/types/AnimationImageItemProps";
import AnimationCard from "../animation/AnimationCard";
import { ProgressSpinner } from "primereact/progressspinner";
import AnimationFireworkEffect from "../animation/AnimationFireworkEffect";
import { useSound } from "../../hook";
import Image from "next/image";
interface SilderPickerProps<T> {
  images: T[];
}

const SilderPicker = <T extends AnimationImageItemProps>({
  images,
}: SilderPickerProps<T>) => {
  const [selectItem, setSelectItem] = useState<T | null>(null);
  const cheering = useSound("/sounds/cheering.mp3");
  const ding = useSound("/sounds/ding.mp3");
  const shuffleWithNoAdjacentDuplicates = (arr: T[], count: number) => {
    let selectedImages = arr.slice(0, count);
    // สุ่มลำดับของ selectedImages แบบสุ่ม
    selectedImages.sort(() => Math.random() - 0.5);

    // ตรวจสอบและจัดเรียงใหม่หากมีภาพซ้ำติดกัน
    for (let i = 1; i < selectedImages.length; i++) {
      if (selectedImages[i] === selectedImages[i - 1]) {
        // หาอันที่ไม่ซ้ำเพื่อสลับตำแหน่ง
        for (let j = i + 1; j < selectedImages.length; j++) {
          if (selectedImages[j] !== selectedImages[i - 1]) {
            // สลับตำแหน่ง
            [selectedImages[i], selectedImages[j]] = [
              selectedImages[j],
              selectedImages[i],
            ];
            break;
          }
        }
      }
    }
    return selectedImages;
  };
  const [clonedImages, setClonedImages] = useState<T[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [finsih, setFinsh] = useState(false);

  const RANDOM_IMAGE =
    images.length >= 30
      ? shuffleWithNoAdjacentDuplicates(images, 30)
      : shuffleWithNoAdjacentDuplicates(
          [
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
            ...images,
          ],
          30
        );

  useEffect(() => {
    setClonedImages(RANDOM_IMAGE);
    setSelectItem(RANDOM_IMAGE[1]);
  }, []);

  const handleOpenModal = () => {
    setClonedImages(RANDOM_IMAGE);
    setSelectItem(RANDOM_IMAGE[1]);
    setIsStarted((prev) => !prev);
    setFinsh(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {finsih && !isStarted && <AnimationFireworkEffect />}
      {finsih && selectItem ? (
        <div className="max-w-2xl min-w-[42rem] flex flex-col items-center justify-center gap-2  h-60 bg-white">
          <h1 className="text-2xl font-bold">Congratulations!</h1>
          <div className="w-40 h-40 bg-gray-100 relative rounded overflow-hidden">
            <Image
              key={`${selectItem?.id}`}
              src={selectItem?.photo}
              alt={`Scroll item`}
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-semibold">
            {selectItem?.firstName} {selectItem?.lastName}
          </h1>
          <h1 className="text-md font-normal text-gray-500">
            Number {selectItem?.number}
          </h1>
          <div className="w-full flex justify-center gap-2">
            <button
              disabled={isStarted}
              onClick={handleOpenModal}
              className="main-button flex items-center w-60 h-10 justify-center"
            >
              START AGAIN
            </button>
            <button
              disabled={isStarted}
              onClick={handleOpenModal}
              className="reject-button flex items-center w-60 h-10 justify-center"
            >
              REMOVE AND START AGAIN
            </button>
          </div>
        </div>
      ) : (
        <div>
          {clonedImages.length > 0 && (
            <AnimationCard<T>
              randomImages={clonedImages}
              onPassPointer={() => {
                if (ding) {
                  ding.pause(); // Stop the current audio if it's playing
                  ding.currentTime = 1; // Reset to the beginning
                  ding.play();
                }
              }}
              onStart={(start) => console.log(start)}
              onFinished={() => {
                setIsStarted(false);

                cheering?.play();
                setTimeout(() => {
                  setFinsh(true);
                }, 1000);
              }}
              isStarted={isStarted}
            />
          )}
          <div className="w-full flex justify-center z-10">
            <button
              disabled={isStarted}
              onClick={handleOpenModal}
              className="main-button flex items-center w-40 h-10 justify-center"
            >
              {isStarted ? (
                <ProgressSpinner
                  animationDuration="1s"
                  style={{ width: "20px" }}
                  className="w-5 h-5"
                  strokeWidth="8"
                />
              ) : (
                "START"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SilderPicker;
