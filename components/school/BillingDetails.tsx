import { useState } from 'react';

interface BillingDetailsProps {
    plan: string;
    billingName: string;
    billingAddress: string;
    billingPhone: string;
    paymentMethod: string;
    onSubmit: (e: React.FormEvent) => void;
}

const BillingDetails = ({
    plan,
    billingName,
    billingAddress,
    billingPhone,
    paymentMethod,
    onSubmit,
}: BillingDetailsProps) => {

    const [formState, setFormState] = useState({
        plan: plan,
        billingName: billingName,
        billingAddress: billingAddress,
        billingPhone: billingPhone,
        paymentMethod: paymentMethod
    });


    const handleChange = {
        plan: (value: string) => setFormState(prev => ({ ...prev, plan: value })),
        billingName: (value: string) => setFormState(prev => ({ ...prev, billingName: value })),
        billingAddress: (value: string) => setFormState(prev => ({ ...prev, billingAddress: value })),
        billingPhone: (value: string) => setFormState(prev => ({ ...prev, billingPhone: value })),
        paymentMethod: (value: string) => setFormState(prev => ({ ...prev, paymentMethod: value }))
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(formState);
        onSubmit(formState as any);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
            <div className="grid grid-cols-3 mb-4">
                <label htmlFor="plan" className="text-gray-600">Plan</label>
                <input
                    id="plan"
                    type="text"
                    value={formState.plan}
                    onChange={(e) => handleChange.plan(e.target.value)}
                    className="font-medium col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
                />
            </div>
            <div className="grid grid-cols-3 mb-4">
                <label htmlFor="billingName" className="text-gray-600">Billing name</label>
                <input
                    id="billingName"
                    type="text"
                    value={formState.billingName}
                    onChange={(e) => handleChange.billingName(e.target.value)}
                    className="font-medium col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
                />
            </div>
            <div className="grid grid-cols-3 mb-4">
                <label htmlFor="billingAddress" className="text-gray-600">Billing address</label>
                <input
                    id="billingAddress"
                    type="text"
                    value={formState.billingAddress}
                    onChange={(e) => handleChange.billingAddress(e.target.value)}
                    className="font-medium col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
                />
            </div>
            <div className="grid grid-cols-3 mb-4">
                <label htmlFor="billingPhone" className="text-gray-600">Billing phone number</label>
                <input
                    id="billingPhone"
                    type="tel"
                    value={formState.billingPhone}
                    onChange={(e) => handleChange.billingPhone(e.target.value)}
                    className="font-medium col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
                />
            </div>
            <div className="grid grid-cols-3 mb-4">
                <label htmlFor="paymentMethod" className="text-gray-600">Payment method</label>
                <input
                    id="paymentMethod"
                    type="text"
                    value={formState.paymentMethod}
                    onChange={(e) => handleChange.paymentMethod(e.target.value)}
                    className="font-medium col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color-focus"
                />
            </div>

            <div className="flex justify-end space-x-4 mt-6 border-t border-gray-200 pt-4">
                <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg"
                >
                    Cancel plan
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary-color text-white rounded-lg"
                >
                    Upgrade plan
                </button>
            </div>
        </form>
    );
};

export default BillingDetails;
