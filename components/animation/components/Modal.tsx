import { IoClose } from "react-icons/io5";

interface ModalProps {
    children: React.ReactNode;
    isModalOpen: boolean;
    handleCloseModal: () => void;
}

const Modal = ({
    children,
    isModalOpen,
    handleCloseModal
}: ModalProps) => {
    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg relative">
                        <button onClick={handleCloseModal} className="absolute -top-3 -right-3 z-50 text-sm text-black p-2 bg-white rounded-full"><IoClose /></button>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal; 