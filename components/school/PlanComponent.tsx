import React from 'react';
import PlanCard from './PlanCard';
import BillingDetails from './BillingDetails';

const PlanComponent = () => {
    return (
        <div className="p-8 bg-white rounded-lg mx-auto">
            <h2 className="text-xl font-semibold mb-6">Plan</h2>

            <div className="flex space-x-4 mb-8">
                <PlanCard type="Basic" price="Free" />
                <PlanCard type="Starter" price="4.99" isCurrent={true} />
                <PlanCard type="Premium" price="9.99" />
            </div>

            <BillingDetails
                plan="Starter"
                billingName="Tharathip N Bangchang"
                billingAddress="19034 Verna Unions Apt. 164 - Honolulu, RI / 87535"
                billingPhone="+1 202-555-0143"
                paymentMethod="**** **** **** 5678"
                onSubmit={(data) => console.log(data)}
            />
        </div>
    );
};

export default PlanComponent;
