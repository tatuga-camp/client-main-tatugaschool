/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import AnimationModal from "./AnimationModal";
import ConditionalFireworkEffect from "./AnimationFireworkEffectConditional";
import { AnimationPanoramaCarouselProps } from "./types/AnimationPanoramaCarouselProps";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";

const AnimationPanoramaCarousel = <T extends AnimationImageItemProps,>({ images, isStarted, passPointer: passPointer, onPassPointer: setPointer, onSelected, setIsStarted }: AnimationPanoramaCarouselProps<T>) => {
    const [clonedImages, setClonedImages] = useState<T[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const RANDOM_IMAGE = images.length >= 6
        ? images.slice(0, 6).sort(() => Math.random() - 0.5)
        : [...images, ...images, ...images, ...images, ...images, ...images].slice(0, 6).sort(() => Math.random() - 0.5);

    useEffect(() => {
        setIsStarted(true);
        setPointer(null);
        setClonedImages(RANDOM_IMAGE);
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsStarted(false);
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setIsStarted(true);
        setPointer(null);
        setClonedImages(RANDOM_IMAGE);
    }

    useEffect(() => {
        if (!isStarted && passPointer) {
            onSelected(passPointer);
        }
    }, [passPointer, isStarted]);

    return (
        <>
            <button onClick={handleOpenModal} className="mt-4">Open Modal</button>

            <AnimationModal<T>
                isModalOpen={isModalOpen}
                handleCloseModal={handleCloseModal}
                clonedImages={clonedImages}
                isStarted={isStarted}
                passPointer={passPointer}
                setPointer={setPointer}
                setIsStarted={setIsStarted}
                onSelected={onSelected}
            />
            <ConditionalFireworkEffect isStarted={isStarted} passPointer={passPointer} isModalOpen={isModalOpen} />
        </>
    );
};

export default AnimationPanoramaCarousel;
