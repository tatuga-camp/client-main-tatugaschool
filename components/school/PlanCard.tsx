import PlanIcon from "./PlanIcon";

interface PlanProps {
    type: 'Basic' | 'Starter' | 'Premium';
    price: string;
    isCurrent?: boolean;
}

const PlanCard = ({ type, price, isCurrent }: PlanProps) => {
    return (
        <div className={`flex-1 px-4 py-6 border border-gray-100 rounded-lg justify-start items-start relative ${isCurrent ? 'bg-gray-100' : ''}`}>
            {isCurrent && (
                <span className="absolute top-2 right-2 bg-purple-200 text-purple-600 text-sm px-2 py-0.5 rounded">
                    Current
                </span>
            )}
            <div className={`${isCurrent ? 'space-y-6' : 'space-y-6'}`}>
                <PlanIcon planType={type.toLowerCase() as 'basic' | 'starter' | 'premium'} />
                <h3 className="text-lg font-medium text-gray-300">{type}</h3>
                <p className={`text-4xl font-bold ${isCurrent ? 'text-gray-500' : ''}`}>
                    {price === 'Free' ? price : `฿ ${price}`}
                    {price !== 'Free' && <span className="text-sm">/mo</span>}
                </p>
            </div>
        </div>
    );
};

export default PlanCard;
