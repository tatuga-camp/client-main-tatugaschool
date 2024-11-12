/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";
import AnimationCard from "./AnimationCard";
interface AnimationPanoramaCarouselProps<T> {
  images: T[];
  onPassPointer: () => void;
  onSelected: (onSelected: T | null) => void;
}

const AnimationPanoramaCarousel = <T extends AnimationImageItemProps>({
  images,
  onPassPointer: onPassPointer,
  onSelected,
}: AnimationPanoramaCarouselProps<T>) => {
  const [clonedImages, setClonedImages] = useState<T[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [passPointer, setPassPointer] = useState<T | null>(null);

  const RANDOM_IMAGE =
    images.length >= 30
      ? images.slice(0, 30).sort(() => Math.random() - 0.5)
      : [
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
        ]
          .slice(0, 30)
          .sort(() => Math.random() - 0.5);

  useEffect(() => {
    setIsStarted(true);
    setClonedImages(RANDOM_IMAGE);
    onSelected(RANDOM_IMAGE[1]);
  }, []);

  const handleCloseModal = () => {
    setIsStarted(false);
  };

  const handleOpenModal = () => {
    setIsStarted(true);
    setClonedImages(RANDOM_IMAGE);
  };

  useEffect(() => {
    if (!isStarted && passPointer) {
      onSelected(passPointer);
    }
  }, [passPointer, isStarted]);

  return (
    <div className="">
      <button onClick={handleOpenModal} className="mt-4">
        Open Modal
      </button>
      {clonedImages.length > 0 && (
        <AnimationCard<T>
          randomImages={clonedImages}
          onPassPointer={onPassPointer}
          setIsStarted={setIsStarted}
          isStarted={isStarted}
        />
      )}
    </div>
  );
};

export default AnimationPanoramaCarousel;
