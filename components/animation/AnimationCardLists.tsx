import React from 'react';
import AnimationCard from './AnimationCard';
import { AnimationCardProps } from './types/AnimationCardProps';
import { AnimationImageItemProps } from './types/AnimationImageItemProps';

interface AnimationCardListsProps<T> extends AnimationCardProps<T> {
    clonedImages: T[];
    isStarted: boolean;
}

const AnimationCardLists = <T extends AnimationImageItemProps>({
    clonedImages,
    setPointer,
    setIsStarted,
    isStarted,
    passPointer,
    onSelected
}: AnimationCardListsProps<T>) => {
    return (
        <>
            {clonedImages.length > 0 && isStarted && (
                <AnimationCard<T>
                    randomImages={clonedImages}
                    setPointer={setPointer}
                    setIsStarted={setIsStarted}
                    isStarted={isStarted}
                    passPointer={passPointer}
                    onSelected={onSelected}
                />
            )}
        </>
    );
};

export default AnimationCardLists; 