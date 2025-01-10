import React from "react";

const icons = {
  basic: (
    <div className="relative w-8 h-8">
      <div className="absolute top-0 left-0 w-full h-full bg-primary-color-focus rounded transform rotate-45"></div>
      <div className="absolute inset-0 w-full h-full bg-purple-700 rounded transform rotate-45 -translate-y-1 translate-x-1"></div>
    </div>
  ),
  starter: (
    <div className="relative w-8 h-8">
      <div className="absolute top-0 left-0 w-full h-full bg-primary-color-focus rounded transform rotate-45"></div>
      <div className="absolute inset-0 w-full h-full bg-purple-700 rounded transform rotate-45 -translate-y-1 translate-x-1"></div>
      <div className="absolute inset-0 w-full h-full bg-primary-color-focus rounded transform rotate-45 -translate-y-2 translate-x-2"></div>
    </div>
  ),
  premium: (
    <div className="relative w-8 h-8">
      <div className="absolute top-0 left-0 w-full h-full bg-primary-color-focus rounded transform rotate-45"></div>
      <div className="absolute inset-0 w-full h-full bg-purple-700 rounded transform rotate-45 -translate-y-1 translate-x-1"></div>
      <div className="absolute inset-0 w-full h-full bg-primary-color-focus rounded transform rotate-45 -translate-y-2 translate-x-2"></div>
      <div className="absolute inset-0 w-full h-full bg-purple-700 rounded transform rotate-45 -translate-y-3 translate-x-3"></div>
    </div>
  ),
};

const PlanIcon = ({
  planType,
}: {
  planType: "basic" | "starter" | "premium";
}) => {
  return (
    <div className="flex justify-start items-start">
      {icons[planType] || icons.basic}
    </div>
  );
};

export default PlanIcon;
