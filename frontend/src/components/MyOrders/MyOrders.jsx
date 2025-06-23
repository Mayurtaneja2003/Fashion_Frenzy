import React, { useState, useEffect } from 'react';
import OrderDetails from '../OrderDetails/OrderDetails';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/orders', {
                    headers: {
                        'auth-token': localStorage.getItem('auth-token')
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    // Sort orders by date in descending order (newest first)
                    const sortedOrders = data.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setOrders(sortedOrders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    const handleOrderStatusUpdate = (updatedOrder) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order._id === updatedOrder._id ? updatedOrder : order
            )
        );
    };

    return (
        <div className="my-orders">
            {/* Your orders list rendering logic */}
            
            {selectedOrder && (
                <OrderDetails 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={handleOrderStatusUpdate}
                />
            )}
        </div>
    );
};

export default MyOrders;