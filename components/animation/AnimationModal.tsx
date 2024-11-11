import { IoClose } from "react-icons/io5";
import Image from 'next/image';
import AnimationCardLists from "./AnimationCardLists";
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";
import { AnimationModalProps } from "./types/AnimationModalProps";
import Modal from "./components/Modal";
import AnimationSelectImage from "./AnimationSelectImage";

const AnimationModal = <T extends AnimationImageItemProps,>({
    isModalOpen,
    handleCloseModal,
    clonedImages,
    isStarted,
    passPointer,
    setPointer,
    setIsStarted,
    onSelected
}: AnimationModalProps<T>) => {
    return (
        <Modal isModalOpen={isModalOpen} handleCloseModal={handleCloseModal}>
            <AnimationCardLists<T>
                clonedImages={clonedImages}
                setPointer={setPointer}
                setIsStarted={setIsStarted}
                isStarted={isStarted}
                randomImages={clonedImages}
                passPointer={passPointer}
                onSelected={onSelected}
            />
            <AnimationSelectImage passPointer={passPointer} isStarted={isStarted} />
        </Modal>
    );
};

export default AnimationModal; 