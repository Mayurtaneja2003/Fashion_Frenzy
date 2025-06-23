import React, { useState, useEffect } from 'react';
import './TrackOrder.css';

const TrackOrder = ({ order, onClose }) => {
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [lastUpdateTime, setLastUpdateTime] = useState(order.lastStatusUpdate ? new Date(order.lastStatusUpdate) : new Date(order.date));

    const steps = [
        { status: 'Processing', description: 'Order is being processed' },
        { status: 'Shipped', description: 'Order has been shipped' },
        { status: 'Delivered', description: 'Order has been delivered' }
    ];

    useEffect(() => {
        const updateStatus = async () => {
            const currentTime = new Date();
            const timeDiff = (currentTime - new Date(lastUpdateTime)) / 1000 / 60; // difference in minutes

            if (timeDiff >= 5) {
                const currentIndex = steps.findIndex(step => step.status === currentStatus);
                if (currentIndex < steps.length - 1) {
                    const newStatus = steps[currentIndex + 1].status;
                    
                    try {
                        const response = await fetch(`http://localhost:4000/api/orders/${order._id}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'auth-token': localStorage.getItem('auth-token')
                            },
                            body: JSON.stringify({ 
                                status: newStatus,
                                lastStatusUpdate: new Date()
                            })
                        });

                        if (response.ok) {
                            setCurrentStatus(newStatus);
                            setLastUpdateTime(currentTime);
                        }
                    } catch (error) {
                        console.error('Error updating order status:', error);
                    }
                }
            }
        };

        const interval = setInterval(updateStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [currentStatus, lastUpdateTime, order._id, steps]);

    // Add this useEffect to update state when a new order is selected
    useEffect(() => {
        setCurrentStatus(order.status);
        setLastUpdateTime(order.lastStatusUpdate ? new Date(order.lastStatusUpdate) : new Date(order.date));
    }, [order]);

    const getCurrentStep = () => {
        return steps.findIndex(step => step.status === currentStatus);
    };

    return (
        <div className="track-order-overlay">
            <div className="track-order-modal">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Track Order</h2>
                <p className="order-number">Order #{order.orderNumber}</p>

                <div className="tracking-timeline">
                    {steps.map((step, index) => {
                        const currentStep = getCurrentStep();
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <div 
                                key={step.status} 
                                className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            >
                                <div className="step-indicator">
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="step-content">
                                    <h3>{step.status}</h3>
                                    <p>{step.description}</p>
                                    {isCurrent && (
                                        <p className="current-status">
                                            Last updated: {new Date(lastUpdateTime).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                {index < steps.length - 1 && <div className={`connector ${isCompleted ? 'completed' : ''}`} />}
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Estimated Delivery/Delivered Date at the very bottom */}
            {order.status === 'Delivered' && order.deliveredAt && (
                <div className="delivered-date" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <strong>Delivered On:</strong> {new Date(order.deliveredAt).toLocaleDateString()}
                </div>
            )}
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && order.estimatedDeliveryDate && (
                <div className="estimated-delivery" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

export default TrackOrder;