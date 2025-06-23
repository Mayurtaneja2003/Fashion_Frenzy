import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/OrderSuccess.css';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const orderNumber = Math.floor(100000 + Math.random() * 900000); // Generate random order number

    return (
        <div className="order-success-container">
            <div className="order-success-card">
                <div className="success-checkmark">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                    </div>
                </div>
                <h1>Order Placed Successfully!</h1>
                <p className="order-number">Order #{orderNumber}</p>
                <p className="thank-you-message">Thank you for shopping with Fashion Frenzy!</p>
                <p className="order-info">We'll send you a confirmation email shortly.</p>
                <div className="action-buttons">
                    <button onClick={() => navigate('/')} className="continue-shopping">
                        Continue Shopping
                    </button>
                    <button onClick={() => navigate('/order-history')} className="view-orders">
                        View Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;