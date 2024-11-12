export interface AnimationModalProps<T> {
    isModalOpen: boolean;
    handleCloseModal: () => void;
    clonedImages: T[];
    isStarted: boolean;
    passPointer: T | null;
    setPointer: (passPointer: T | null) => void;
    setIsStarted: (start: boolean) => void;
    onSelected: (onSelected: T | null) => void;
} 