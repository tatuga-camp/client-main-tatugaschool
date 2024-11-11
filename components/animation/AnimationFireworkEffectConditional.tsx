import AnimationFireworkEffect from "./AnimationFireworkEffect";
interface ImageItem {
    id: string;
    photo: string;
}
const ConditionalFireworkEffect = ({ isStarted, passPointer, isModalOpen }: { isStarted: boolean, passPointer: ImageItem | null, isModalOpen: boolean }) => {
    if (!isStarted && passPointer?.id && isModalOpen) {
        return <AnimationFireworkEffect />;
    }
    return null;
};

export default ConditionalFireworkEffect; 