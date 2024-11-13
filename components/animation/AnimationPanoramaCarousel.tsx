/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";
import AnimationCard from "./AnimationCard";
interface AnimationPanoramaCarouselProps<T> {
    images: T[];
    onPassPointer: () => void;
    onSelected: (onSelected: T | null) => void;
}

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
                    [selectedImages[i], selectedImages[j]] = [selectedImages[j], selectedImages[i]];
                    break;
                }
            }
        }
    }
    return selectedImages;
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
            ? shuffleWithNoAdjacentDuplicates(images, 30)
            : shuffleWithNoAdjacentDuplicates([
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
            ], 30);

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
