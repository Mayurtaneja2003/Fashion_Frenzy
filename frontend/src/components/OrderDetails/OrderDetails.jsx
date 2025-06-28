import React, { useState, useCallback, memo } from 'react';
import { API_URL } from '../../config/api'; // <-- see next fix
import './OrderDetails.css';

const OrderDetails = ({ order, onClose, onOrderUpdated, availablePromoCodes }) => {
    const handleModalClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    if (!order) return null;

    // Calculate subtotal
    const subtotal = order.items
        ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : 0;

    // Calculate shipping (example: $2 if total < 100, else free)
    const shipping = order.total && order.total < 100 ? 2 : 0;

    const handleCancelOrder = async () => {
        try {
            const response = await fetch(`${API_URL}/api/orders/cancel/${order._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}` // <-- fix here
                }
            });
            const data = await response.json();
            if (data.success) {
                if (onOrderUpdated) onOrderUpdated(); // <-- Refresh orders
                onClose();
            } else {
                alert(data.message || 'Failed to cancel order. Please try again.');
            }
        } catch (error) {
            alert('Failed to cancel order. Please try again.');
        }
    };

    const defaultPromoCodes = {
        'WELCOME10': { discount: 10, description: '10% off on your first order' },
        'SUMMER20': { discount: 20, description: '20% off on summer collection' },
        'SPECIAL15': { discount: 15, description: '15% off on all items' }
        // ...add all codes you use
    };

    const promoCodes = availablePromoCodes || defaultPromoCodes;

    return (
        <div 
            className="order-details-overlay" 
            onClick={onClose}
            style={{ overflowY: 'auto' }}
        >
            <div 
                className="order-details-modal" 
                onClick={handleModalClick}
            >
                <button 
                    className="close-btn" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    &times;
                </button>

                <h2>Order Details</h2>
                
                <div className="order-info-section">
                    <div className="order-header">
                        <div className="order-basic-info">
                            <p><strong>Order #:</strong> {order.orderNumber}</p>
                            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                            <p>
                                <strong>Status:</strong> 
                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </p>                           
                            <p><strong>Payment Method:</strong> {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</p>
                        </div>
                        {/* Only show Cancel button if not Cancelled or Delivered */}
                        {(order.status !== 'Cancelled' && order.status !== 'Delivered') && (
                            <div className="order-actions">
                                <button 
                                    className="cancel-order-btn"
                                    onClick={handleCancelOrder}
                                >
                                    Cancel Order
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="shipping-details">
                        <h3>Shipping Details</h3>
                        <div className="address-info">
                            <div className="customer-name">
                                <p><strong>Name:</strong> {order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                            </div>
                            <div className="contact-info">
                                <p><strong>Email:</strong> {order.customerInfo.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {order.customerInfo.phone || 'N/A'}</p>
                            </div>
                            <div className="delivery-address">
                                <p><strong>Delivery Address:</strong></p>
                                <p className="address-line">{order.customerInfo.address || 'N/A'}</p>
                                <p className="address-line">
                                    {order.customerInfo.city && `${order.customerInfo.city}, `}
                                    {order.customerInfo.state && `${order.customerInfo.state} `}
                                    {order.customerInfo.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="items-list">
                        <h3>Order Items</h3>
                        {order.items.map((item, index) => (
                            <div 
                                key={`${item.productId}-${index}`} 
                                className="order-detail-item"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="item-image">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>
                                <div className="item-info">
                                    <h4>{item.name || 'Product Name Not Available'}</h4>
                                    <p><strong>Size:</strong> {item.size || 'N/A'}</p>
                                    <p><strong>Quantity:</strong> {item.quantity || 0}</p>
                                    <p className="item-price">
                                        <strong>Price:</strong> ${(item.price || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="order-summary">
                        <div className="summary-row subtotal">
                            <span>Subtotal</span>
                              <span>
                              ${order.items
                                ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
                                : '0.00'}
                            </span>
                        </div>
                        <div className="summary-row shipping">
                            <span>Shipping</span>
                             <span>{order.total && order.total < 100 ? '$2.00' : 'Free'}</span>
                            {/* <span>
                              {order.shippingCost !== undefined
                                ? (order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`)
                                : (order.total && order.total < 100 ? '$2.00' : 'Free')}
                            </span> */}
                        </div>
                        {order.promoCode && order.promoDiscount > 0 && (
                            <div className="summary-row discount">
                                <span>
                                    Discount
                                    {promoCodes[order.promoCode]
                                        ? ` (${promoCodes[order.promoCode].discount}%)`
                                        : ''}

                                </span>
                                <span>- ${order.promoDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>
                              ${(() => {
                                // Subtotal
                                const subtotal = order.items
                                  ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                  : 0;
                                // Shipping
                                const shipping = order.total && order.total < 100 ? 2 : 0;
                                // Discount
                                const discount = order.promoDiscount || 0;
                                // Total calculation
                                return (subtotal + shipping - discount).toFixed(2);
                              })()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;