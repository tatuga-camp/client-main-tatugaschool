import React from 'react';

const InvoiceHistory = ({ invoices }: { invoices: any[] }) => {
    return (
        <div className="p-6 bg-white rounded-lg mx-auto">
            <h2 className="text-lg font-semibold mb-4">Invoice history</h2>

            <div className="space-y-4">
                {invoices.map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-700">
                        <div>
                            <p className="font-medium">INV-{invoice.number}</p>
                            <p className="text-gray-500 text-xs">{invoice.date}</p>
                        </div>

                        <p className="font-medium text-gray-900">฿{invoice.amount.toFixed(2)}</p>

                        <a href={invoice.pdfUrl} className="text-purple-600 font-medium">
                            PDF
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvoiceHistory;
