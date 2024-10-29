
const AddressBook = ({ addresses }: { addresses: any[] }) => {
    return (
        <div className="p-6 bg-white rounded-lg mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Address book</h2>
                <a href="#" className="text-purple-600 font-medium flex items-center">
                    <span className="mr-1">+</span> Address
                </a>
            </div>

            <div className="space-y-4">
                {addresses.map((address, index) => (
                    <div
                        key={index}
                        className="flex items-start justify-between p-6 border rounded-lg bg-white shadow-sm"
                    >
                        <div className="space-y-2">
                            <p className="font-semibold text-gray-900">{address.name}</p>
                            <p className="text-gray-500 text-sm">
                                <span className="font-semibold">Address:</span> {address.street} - {address.city}, {address.state} / {address.zip}
                            </p>
                            <p className="text-gray-500 text-sm">
                                <span className="font-semibold">Phone:</span> {address.phone}
                            </p>
                        </div>

                        <button className="text-gray-400">
                            <span className="text-xl">⋮</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddressBook;