import Image from "next/image";

const PaymentMethod = ({ cards }: { cards: any[] }) => {
  return (
    <div className="mx-auto mt-10 rounded-2xl bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment method</h2>
        <a href="#" className="flex items-center font-medium text-purple-600">
          <span className="mr-1">+</span> New Card
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border bg-white p-10 shadow-sm"
          >
            <div className="items-center space-x-4 space-y-4">
              {card.type === "Mastercard" ? (
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
                <p className="font-medium text-gray-900">
                  **** **** **** {card.last4}
                </p>
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
