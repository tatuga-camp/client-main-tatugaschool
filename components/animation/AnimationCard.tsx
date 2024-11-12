/* eslint-disable react-hooks/exhaustive-deps */
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import Image from 'next/image';
import { AnimationCardProps } from "./types/AnimationCardProps";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";

const IMAGE_WIDTH = 120;
const GAP = 0.9 * 16; // Gap in pixels (0.9rem)
const INITIAL_SPEED = 0.5;
const SLOWDOWN_SPEED = 1;
const SLOWDOWN_STOP = 3;

const AnimationCard = <T extends AnimationImageItemProps,>({ randomImages, setPointer, setIsStarted }: AnimationCardProps<T>) => {
    const controls = useAnimationControls();
    const x = useMotionValue(0);
    const TOTAL_WIDTH = (IMAGE_WIDTH + GAP) * randomImages.length;

    useEffect(() => {
        startAnimation();
        return () => controls.stop();
    }, []);

    useEffect(() => {
        const timer = setTimeout(handleSlowdown, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(handleSlowdownAndStop, 5000);
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
                repeat: 6,
                repeatType: "loop",
            }
        });
        setIsStarted(true);
    };

    const handleSlowdown = async () => {
        await controls.start({
            x: [-TOTAL_WIDTH, 0],
            transition: {
                duration: SLOWDOWN_SPEED,
                ease: "linear",
                repeat: 2,
                repeatType: "loop",
            }
        });
    };

    const handleSlowdownAndStop = async () => {
        await controls.start({
            x: [-TOTAL_WIDTH, 0],
            transition: {
                duration: SLOWDOWN_STOP,
                ease: "easeOut",
                repeat: 0,
            }
        });
        controls.stop();
        setTimeout(() => setIsStarted(false), 500);
    };

    const handleImageSelection = (latest: number) => {
        const centerPosition = window.innerWidth / 2;
        const currentPosition = -latest;
        const index = Math.floor((currentPosition + centerPosition) / (IMAGE_WIDTH + GAP));
        setPointer(randomImages[index - 5]);
    };

    return (
        <div className="w-full flex justify-center items-center relative">
            <div className="absolute h-full w-[1px] bg-gray-100 p-0 z-10 rounded-full" />
            <div className="overflow-hidden max-w-2xl min-w-[42rem]">
                <motion.div
                    style={{
                        display: "flex",
                        width: "fit-content",
                        gap: "0.9rem",
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
                        <Image
                            key={`${image.id}-${index}`}
                            src={image.photo}
                            alt={`Scroll item ${index}`}
                            width={IMAGE_WIDTH}
                            height={IMAGE_WIDTH}
                            className="object-cover"
                        />
                    ))}
                    {randomImages.map((image, index) => (
                        <Image
                            key={`${image.id}-${index}`}
                            src={image.photo}
                            alt={`Scroll item ${index}`}
                            width={IMAGE_WIDTH}
                            height={IMAGE_WIDTH}
                            className="object-cover"
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default AnimationCard; 