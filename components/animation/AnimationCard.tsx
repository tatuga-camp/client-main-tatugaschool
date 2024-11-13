/* eslint-disable react-hooks/exhaustive-deps */
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";
import React from "react";

interface AnimationCardProps<T> {
  randomImages: T[];
  onPassPointer: () => void;
  setIsStarted: (start: boolean) => void;
  isStarted: boolean;
}

const IMAGE_WIDTH = 200;
const GAP = 0.9 * 16; // Gap in pixels (0.9rem)
const GAP_BETWEEN_IMAGE = 10;
const INITIAL_SPEED = 0.5;
const TIME_INITIAL = (INITIAL_SPEED * 2) * 1000;
const SLOWDOWN_SPEED = 1;
const TIME_SLOWDOWN = (SLOWDOWN_SPEED * 1000) + TIME_INITIAL;
const SLOWDOWN_STOP = 2;

const AnimationCard = <T extends AnimationImageItemProps>({
  randomImages,
  onPassPointer,
  setIsStarted,
}: AnimationCardProps<T>) => {
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const TOTAL_WIDTH = (IMAGE_WIDTH + GAP) * randomImages.length;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  
  useEffect(() => {
    startAnimation();
    return () => controls.stop();
  }, []);

  useEffect(() => {
    const timer = setTimeout(handleSlowdown, TIME_INITIAL);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(handleSlowdownAndStop, TIME_SLOWDOWN);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = x.onChange(handleImageSelection);
    return () => unsubscribe();
  }, []);

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
    setIsStarted(true);
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
    setTimeout(() => setIsStarted(false), 500);
  };
  const handleImageSelection = (latest: number) => {
    const centerPosition = window.innerWidth / 2;
    const currentPosition = -latest;
    const index = Math.floor(
      (currentPosition + centerPosition) / (IMAGE_WIDTH + GAP + GAP_BETWEEN_IMAGE)
    );

    console.log(index);
    

    setCurrentIndex((prev) => {
      if (index !== prev) {
        onPassPointer();
      }
      return index;
    });
  };

  return (
    <div className="w-full flex justify-center items-center relative">
      <div className="absolute h-full w-[1px] bg-gray-100 p-0 z-10 rounded-full" />
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
               rounded-md h-60 ring-1 ring-black overflow-hidden"
              style={{ width: `${IMAGE_WIDTH}px` }}
            >
              <div className="w-full h-40 bg-gray-100 relative rounded overflow-hidden">
                <Image
                  key={`${image.id}-${index}`}
                  src={image.photo}
                  alt={`Scroll item ${index}`}
                  fill
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
