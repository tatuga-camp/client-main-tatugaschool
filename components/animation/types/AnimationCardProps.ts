export interface AnimationCardProps<T> {
    randomImages: T[];
    setPointer: (passPointer: T | null) => void;
    setIsStarted: (start: boolean) => void;
    isStarted: boolean;
    passPointer: T | null;
    onSelected: (onSelected: T | null) => void;
} 