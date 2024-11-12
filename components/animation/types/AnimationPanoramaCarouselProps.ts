export interface AnimationPanoramaCarouselProps<T> {
    images: T[];
    isStarted: boolean;
    passPointer: T | null;
    onPassPointer: (passPointer: T | null) => void;
    onSelected: (onSelected: T | null) => void;
    setIsStarted: (start: boolean) => void;
} 