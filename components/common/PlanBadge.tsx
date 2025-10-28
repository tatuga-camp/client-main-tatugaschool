import { Plan } from "../../interfaces";

export default function PlanBadge({ plan }: { plan: Plan }) {
  let colors = "bg-gray-100 text-gray-800";
  switch (plan) {
    case "BASIC":
      colors = "bg-blue-100 text-blue-800";
      break;
    case "PREMIUM":
      colors = "bg-purple-100 text-purple-800";
      break;
    case "ENTERPRISE":
      colors = "bg-yellow-100 text-yellow-800";
      break;
    case "FREE":
    default:
      colors = "bg-green-100 text-green-800";
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${colors}`}
    >
      {plan}
    </span>
  );
}
