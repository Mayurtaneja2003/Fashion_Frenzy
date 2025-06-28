import React, { useEffect, useState } from 'react';

const categoryLabels = {
  home: 'Home',
  office: 'Office',
  other: 'Other'
};

const AddressSelector = ({ selectedCategory, onSelect, onAddNew, onSetDefault }) => {
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState({});
  const [defaultAddr, setDefaultAddr] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/address', {
        headers: { 'auth-token': localStorage.getItem('auth-token') }
    })
        .then(res => res.json())
        .then(data => {
            setAddresses(data.addresses || []);
           });
}, []);

  const handleSetDefault = async (cat) => {
    const addr = addresses.find(a => a.category === cat);
    if (!addr) return;
    await fetch('http://localhost:4000/api/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token')
      },
      body: JSON.stringify({ ...addr, default: true, saved: addr.saved }) // <-- always send saved!
    });
    // Refresh addresses
    fetch('http://localhost:4000/api/address', {
      headers: { 'auth-token': localStorage.getItem('auth-token') }
    })
      .then(res => res.json())
      .then(data => {
        setAddresses(data.addresses || []);
        // Update default address state
        const updatedDefaultAddr = data.addresses?.find(addr => addr.default);
        setDefaultAddr(updatedDefaultAddr);
      });
  };

  const savedAddresses = addresses.filter(addr => addr.saved);

  return (
    <div className="address-selector">
      <h3 className="font-semibold mb-2">Saved Addresses</h3>
      <div className="flex flex-wrap gap-6">
        {savedAddresses.map(addr => (
          <div
            key={addr.category}
            className={`address-card p-4 border rounded-lg shadow-md bg-white min-w-[280px] max-w-[320px] flex-1 relative transition hover:shadow-xl ${selectedCategory && selectedCategory.category === addr.category ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            style={{ marginBottom: '20px' }}
            onClick={() => onSelect(addr)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-blue-700">{categoryLabels[addr.category] || addr.category}</span>
              {addr.default && (
                <span className="text-green-600 font-semibold text-xs ml-2">Default</span>
              )}
            </div>
            <div className="mb-1"><b>Name:</b> {addr.name}</div>
            <div className="mb-1"><b>Address:</b> {addr.address}</div>
            <div className="mb-1"><b>City:</b> {addr.city}</div>
            <div className="mb-1"><b>State:</b> {addr.state}</div>
            <div className="mb-1"><b>ZIP:</b> {addr.zipCode}</div>
            <div className="mb-1"><b>Phone:</b> {addr.phone}</div>
            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 text-xs"
                onClick={e => {
                  e.stopPropagation();
                  onAddNew(addr); // Open edit modal/form
                }}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                onClick={async e => {
                  e.stopPropagation();
                  await fetch(`http://localhost:4000/api/address/${addr.category}`, {
                    method: 'DELETE',
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                  });
                  // Refresh addresses
                  fetch('http://localhost:4000/api/address', {
                    headers: { 'auth-token': localStorage.getItem('auth-token') }
                  })
                    .then(res => res.json())
                    .then(data => setAddresses(data.addresses || []));
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {addresses.length < 3 && (
          <div
            className="address-card p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-w-[280px] max-w-[320px] bg-gray-50 cursor-pointer hover:border-blue-400 transition"
            style={{ marginBottom: '20px', minHeight: '220px' }}
            onClick={() => setShowAddAddress(true)}
          >
            <span className="text-3xl text-blue-400 mb-2">+</span>
            <span className="font-semibold text-blue-600">Add New Address</span>
          </div>
        )}
      </div>
      {showAddAddress && (
        <form className="add-address-form bg-white p-6 rounded-lg shadow-lg mt-4 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">Add New Address</h3>
          {/* Form fields for new address */}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Save Address</button>
        </form>
      )}
    </div>
  );
};

export default AddressSelector;