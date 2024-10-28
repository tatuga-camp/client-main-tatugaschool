import React from 'react';
import PlanComponent from './PlanComponent';
import InvoiceHistory from './InvoiceHistory';
import PaymentMethod from './PaymentMethod';
import AddressBook from './AddressBook';


const invoices = [
    { number: 1990, date: '08 Jun 2024', amount: 94.75, pdfUrl: '#' },
    { number: 1991, date: '09 Jun 2024', amount: 88.00, pdfUrl: '#' },
    { number: 1992, date: '10 Jun 2024', amount: 120.50, pdfUrl: '#' },
    { number: 1993, date: '11 Jun 2024', amount: 99.99, pdfUrl: '#' },
    { number: 1994, date: '12 Jun 2024', amount: 100.00, pdfUrl: '#' },
    { number: 1995, date: '13 Jun 2024', amount: 100.00, pdfUrl: '#' },
    { number: 1996, date: '14 Jun 2024', amount: 100.00, pdfUrl: '#' },
    { number: 1997, date: '15 Jun 2024', amount: 100.00, pdfUrl: '#' },
    { number: 1998, date: '16 Jun 2024', amount: 100.00, pdfUrl: '#' },
    { number: 1999, date: '17 Jun 2024', amount: 100.00, pdfUrl: '#' },
    { number: 2000, date: '18 Jun 2024', amount: 100.00, pdfUrl: '#' },
];

const cards = [
    { type: 'Mastercard', last4: '5678' },
    { type: 'Visa', last4: '1234' },
];

const addresses = [
    {
        name: 'Deja Brady',
        street: '18605 Thompson Circle Apt. 086',
        city: 'Idaho Falls',
        state: 'WV',
        zip: '50337',
        phone: '399-757-9909'
    },
    {
        name: 'Deja Brady',
        street: '18605 Thompson Circle Apt. 086',
        city: 'Idaho Falls',
        state: 'WV',
        zip: '50337',
        phone: '399-757-9909'
    },
    {
        name: 'Deja Brady',
        street: '18605 Thompson Circle Apt. 086',
        city: 'Idaho Falls',
        state: 'WV',
        zip: '50337',
        phone: '399-757-9909'
    },
    {
        name: 'Deja Brady',
        street: '18605 Thompson Circle Apt. 086',
        city: 'Idaho Falls',
        state: 'WV',
        zip: '50337',
        phone: '399-757-9909'
    }
];

const BillingPlanSection = () => {
    return (
        <div className='grid grid-cols-6 gap-4'>
            <div className='col-span-5'>
                <PlanComponent />
                <PaymentMethod cards={cards} />
                <AddressBook addresses={addresses} />
            </div>
            <div className='col-span-1'>
                <InvoiceHistory invoices={invoices} />
            </div>
        </div>
    );
};

export default BillingPlanSection;