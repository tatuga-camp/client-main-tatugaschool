import InviteJoinSchool from "./InviteJoinSchool";

interface InviteJoinSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolId: string;
}

const InviteJoinSchoolModal: React.FC<InviteJoinSchoolModalProps> = ({
    isOpen,
    onClose,
    schoolId
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold mb-4">Invite to Join School</h2>
                <InviteJoinSchool schoolId={schoolId} hideFinishButton={true} />

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteJoinSchoolModal;
