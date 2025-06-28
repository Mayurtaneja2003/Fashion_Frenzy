import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';
import './OrderHistory.css';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../OrderDetails/OrderDetails';
import TrackOrder from '../TrackOrder/TrackOrder';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTrackOrder, setShowTrackOrder] = useState(false);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="order-history-loading">
                <div className="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="no-orders">
                <div className="no-orders-icon">🛍️</div>
                <p>You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/')}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <h1>My Orders</h1>
            <div className="orders-grid">
                {orders.map((order) => (
                    <div key={order.orderNumber} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <h2>Order #{order.orderNumber}</h2>
                                <p className="order-date">{formatDate(order.date)}</p>
                            </div>
                            <div className="order-status">
                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="order-items-preview">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="item-image">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            style={{ cursor: 'pointer' }} 
                                            onClick={() => navigate(`/product/${item.productId}`)} 
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <div className="item-meta">
                                            <span className="item-size">Size: {item.size}</span>
                                            <span className="item-quantity">Qty: {item.quantity}</span>
                                            <span className="item-price">${item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-footer">
                            <div className="order-summary">
                                <div className="summary-row subtotal">
                                    <span>Subtotal</span>
                                    <span>
                                      ${order.items && order.items.length
                                        ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
                                        : '0.00'
                                      }
                                    </span>
                                  </div>
                                  <div className="summary-row shipping">
                                    <span>Shipping</span>
                                       <span>{order.total && order.total < 100 ? '$2.00' : 'Free'}</span>
                                  </div>
                                  {order.promoCode && order.promoDiscount > 0 && (
                                    <div className="summary-row discount">
                                      <span>Discount ({order.promoCode}):</span>
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
                                <div className="order-actions">
                                    {order.status === 'Cancelled' || order.status === 'Delivered' ? (
                                        <button 
                                            className="buy-again"
                                            onClick={() => {
                                                if (order.items && order.items.length > 0) {
                                                  navigate(`/product/${order.items[0].productId}`);
                                                }
                                              }}
                                        >
                                            Buy Again
                                        </button>
                                    ) : (
                                        <button 
                                            className="track-order"
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowTrackOrder(true);
                                            }}
                                        >
                                            Track Order
                                        </button>
                                    )}
                                    <button 
                                        className="view-details"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowOrderDetails(true);
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                      
                    </div>
                ))}
            </div>

            {/* Move modals OUTSIDE the map */}
            {showTrackOrder && selectedOrder && (
                <TrackOrder 
                    order={selectedOrder} 
                    onClose={() => {
                        setShowTrackOrder(false);
                        setSelectedOrder(null);
                    }}
                />
            )}

            {showOrderDetails && selectedOrder && (
                <OrderDetails 
                    order={selectedOrder} 
                    onClose={() => {
                        setShowOrderDetails(false);
                        setSelectedOrder(null);
                    }}
                    onOrderUpdated={fetchOrders} // <-- Pass this prop
                />
            )}
        </div>
    );
};

export default OrderHistory;