import Image from 'next/image';

const PaymentMethod = ({ cards }: { cards: any[] }) => {
    return (
        <div className="p-6 bg-white rounded-lg mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Payment method</h2>
                <a href="#" className="text-purple-600 font-medium flex items-center">
                    <span className="mr-1">+</span> New Card
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-10 border rounded-lg bg-white shadow-sm"
                    >
                        <div className="items-center space-x-4 space-y-4">
                            {card.type === 'Mastercard' ? (
                                <Image
                                    src="/svg/cards/mastercard-logo.svg"
                                    alt="Mastercard"
                                    width={96}
                                    height={24}
                                />
                            ) : (
                                <Image
                                    src="/svg/cards/visa-logo.svg"
                                    alt="Visa"
                                    width={96}
                                    height={24}
                                />
                            )}

                            <div>
                                <p className="font-medium text-gray-900">**** **** **** {card.last4}</p>
                            </div>
                        </div>

                        <button className="text-gray-400">
                            <span className="text-2xl">⋮</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethod;
