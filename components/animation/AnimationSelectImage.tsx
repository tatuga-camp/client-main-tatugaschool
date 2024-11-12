import Image from 'next/image';
import { AnimationImageItemProps } from "./types/AnimationImageItemProps";

interface AnimationSelectImageProps {
    passPointer: AnimationImageItemProps | null;
    isStarted: boolean;
}

const AnimationSelectImage: React.FC<AnimationSelectImageProps> = ({ passPointer, isStarted }) => {
    if (!passPointer || isStarted) return null;

    return (
        <div
            key={passPointer.id}
            className="max-w-2xl min-w-[42rem] flex justify-center items-center"
        >
            <Image src={passPointer.photo} alt="Profile" width={40} height={40} className="h-96 w-auto" />
        </div>
    );
};

export default AnimationSelectImage; 