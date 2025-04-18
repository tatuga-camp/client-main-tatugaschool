/* eslint-disable react-hooks/exhaustive-deps */
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";
import React from "react";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

interface AnimationCardProps<T> {
  randomImages: T[];
  onPassPointer: () => void;
  onStart: (start: boolean) => void;
  onFinished: () => void;
  isStarted: boolean;
  speedUp: number;
}


const AnimationCard = <T extends AnimationImageItemProps>({
  randomImages,
  onPassPointer,
  onStart,
  onFinished,
  isStarted,
  speedUp = 2
}: AnimationCardProps<T>) => {

const IMAGE_WIDTH = 200;
const GAP = 0.9 * 16; // Gap in pixels (0.9rem)
const GAP_BETWEEN_IMAGE = 10;
const INITIAL_SPEED = 1 / speedUp;
const TIME_INITIAL = INITIAL_SPEED * 2 * 1000 / speedUp;
const SLOWDOWN_SPEED = 3 / speedUp;
const TIME_SLOWDOWN = SLOWDOWN_SPEED * 1000 + TIME_INITIAL / speedUp;
const SLOWDOWN_STOP = 7 / speedUp;

  const controls = useAnimationControls();
  const [onProgress, setOnProgress] = React.useState(false);
  const x = useMotionValue(0);
  const TOTAL_WIDTH = (IMAGE_WIDTH + GAP) * randomImages.length;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    if (isStarted && !onProgress) {
      startAnimation();
      const timerStart = setTimeout(handleSlowdown, TIME_INITIAL);
      const timerSlow = setTimeout(handleSlowdownAndStop, TIME_SLOWDOWN);
      const unsubscribe = x.onChange(handleImageSelection);
      setOnProgress(true);
      return () => {
        controls.stop();
        clearTimeout(timerStart);
        clearTimeout(timerSlow);
        unsubscribe();
      };
    } else {
      setOnProgress(false);
      controls.stop();
    }
  }, [isStarted]);

  const startAnimation = () => {
    controls.start({
      x: [-TOTAL_WIDTH, 0],
      transition: {
        duration: INITIAL_SPEED,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
    onStart(true);
  };

  const handleSlowdown = async () => {
    await controls.start({
      x: [-TOTAL_WIDTH, 0],
      transition: {
        duration: SLOWDOWN_SPEED,
        ease: "linear",
        repeat: 1,
        repeatType: "loop",
      },
    });
  };

  const handleSlowdownAndStop = async () => {
    await controls.start({
      x: [-TOTAL_WIDTH, 0],
      transition: {
        duration: SLOWDOWN_STOP,
        ease: "easeOut",
        repeat: 0,
      },
    });
    controls.stop();
    setTimeout(() => {
      setOnProgress(false);
      onStart(false);
      onFinished();
    }, 100);
  };
  const handleImageSelection = (latest: number) => {
    const centerPosition = window.innerWidth / 2;
    const currentPosition = -latest;
    const index = Math.floor(
      (currentPosition + centerPosition) /
        (IMAGE_WIDTH + GAP + GAP_BETWEEN_IMAGE)
    );

    setCurrentIndex((prev) => {
      if (index !== prev) {
        onPassPointer();
      }
      return index;
    });
  };

  return (
    <div className="w-full flex justify-center items-center relative">
      <div className="absolute h-full w-[3px] bg-black p-0 z-10  rounded-full" />

      <div className=" max-w-2xl min-w-[42rem] overflow-hidden ">
        <motion.div
          style={{
            display: "flex",
            width: "fit-content",
            gap: "0.9rem",
            padding: "0.9rem",
            x,
          }}
          initial={{ x: 0 }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          animate={{
            ...controls,
            x: [0, -TOTAL_WIDTH],
          }}
        >
          {randomImages.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              className="bg-white flex flex-col items-center justify-start
               rounded-md h-full ring-1 ring-black overflow-hidden"
              style={{ width: `${IMAGE_WIDTH}px` }}
            >
              <div className="w-full h-40 bg-gray-100 relative rounded overflow-hidden">
                <Image
                  key={`${image.id}-${index}`}
                  src={image.photo}
                  alt={`Scroll item ${index}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <h1 className="text-lg font-semibold text-balance break-words w-full text-center">
                {image.firstName} {image.lastName}
              </h1>
              <h1 className="text-md font-normal text-gray-500 break-words w-full text-center">
                Number {image.number}
              </h1>
            </div>
          ))}
          {randomImages.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              className="bg-white flex flex-col items-center justify-start
               rounded-md h-60 ring-1 ring-black overflow-hidden"
              style={{ width: `${IMAGE_WIDTH}px` }}
            >
              <div className="w-full h-40 bg-gray-100 relative rounded overflow-hidden">
                <Image
                  key={`${image.id}-${index}`}
                  src={image.photo}
                  alt={`Scroll item ${index}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={10}
                  className="object-cover"
                />
              </div>
              <h1 className="text-lg font-semibold text-balance break-words w-full text-center">
                {image.firstName} {image.lastName}
              </h1>
              <h1 className="text-md font-normal text-gray-500 break-words w-full text-center">
                Number {image.number}
              </h1>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AnimationCard;
