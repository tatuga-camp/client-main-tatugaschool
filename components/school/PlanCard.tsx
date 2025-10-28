import PlanIcon from "./PlanIcon";

interface PlanProps {
  type: "Basic" | "Starter" | "Premium";
  price: string;
  isCurrent?: boolean;
}

const PlanCard = ({ type, price, isCurrent }: PlanProps) => {
  return (
    <div
      className={`relative flex-1 items-start justify-start rounded-2xl border border-gray-100 px-4 py-6 ${
        isCurrent ? "bg-gray-100" : ""
      }`}
    >
      {isCurrent && (
        <span className="absolute right-2 top-2 rounded bg-purple-200 px-2 py-0.5 text-sm text-purple-600">
          Current
        </span>
      )}
      <div className={`${isCurrent ? "space-y-6" : "space-y-6"}`}>
        <PlanIcon
          planType={type.toLowerCase() as "basic" | "starter" | "premium"}
        />
        <h3 className="text-lg font-medium text-gray-300">{type}</h3>
        <p className={`text-4xl font-bold ${isCurrent ? "text-gray-500" : ""}`}>
          {price === "Free" ? price : `฿ ${price}`}
          {price !== "Free" && <span className="text-sm">/mo</span>}
        </p>
      </div>
    </div>
  );
};

export default PlanCard;
