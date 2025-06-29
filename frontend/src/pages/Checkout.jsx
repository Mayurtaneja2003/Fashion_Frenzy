import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/Shop-context';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/Checkout.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment/StripePayment';
import { fetchAPI } from '../config/api';
import { FaHome, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
    const { 
        cartItems, 
        all_product, 
        getTotalCartAmount,
        appliedPromoCode,
        promoDiscount,
        setCartItems,
        setCartSizes,
        getDefaultCart,
        resetPromoCode, // Add this
        userOrderCount  // Add this
    } = useContext(ShopContext);

    const navigate = useNavigate();
    const location = useLocation();
    const isBuyNow = location.state?.buyNow;
    const [buyNowItem, setBuyNowItem] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'cod',
        category: 'home' // default to home
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [addCategory, setAddCategory] = useState(null);
    const [isDefaultChecked, setIsDefaultChecked] = useState(false);
    const [isSavedChecked, setIsSavedChecked] = useState(false);

    useEffect(() => {
        if (isBuyNow) {
            const item = localStorage.getItem('buyNowItem');
            if (item) {
                setBuyNowItem(JSON.parse(item));
            }
        }
    }, [isBuyNow]);

    useEffect(() => {
        if (cartItems && all_product && all_product.length > 0) {
            setLoading(false);
        }
    }, [cartItems, all_product]);

    // Toggle add address form
    const handleAddNewAddressClick = () => setShowAddAddress(prev => !prev);

    // Handle add address form submit
    const handleAddAddressSubmit = async (e) => {
        e.preventDefault();
        // If neither is checked, don't save
        if (!isDefaultChecked && !isSavedChecked) {
            alert("Please select at least one: Save as default or Save as address.");
            return;
        }
      
        // Save address (default or just saved)
        await fetch(`${process.env.REACT_APP_API_URL}/api/address`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
            },
            body: JSON.stringify({
                category: formData.category,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                phone: formData.phone,
                name: formData.firstName,
                default: isDefaultChecked, // <-- send this
                saved: isSavedChecked      // <-- send this
            })
        });
        // Refresh addresses
        fetch(`${process.env.REACT_APP_API_URL}/api/address`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
        })
            .then(res => res.json());
        setShowAddAddress(false);
        setIsDefaultChecked(false);
        setIsSavedChecked(false);
    };

    const cartTotal = getTotalCartAmount();
    const hasItems = Object.values(cartItems).some(quantity => quantity > 0);
    const shippingCost = hasItems && cartTotal < 100 ? 2 : 0;
    const totalAmount = cartTotal + shippingCost - promoDiscount;  // Already includes discount

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const formatCartItems = () => {
        return cartItemsToShow.map(([cartKey, quantity]) => {
            const [itemId, itemSize] = cartKey.split('-');
            const product = all_product.find(p => p.id === parseInt(itemId));
            const basePrice = product.new_price;
            const sizePrice = {
                'S': basePrice,
                'M': basePrice + 5,
                'L': basePrice + 10,
                'XL': basePrice + 15,
                'XXL': basePrice + 20,
            }[itemSize] || basePrice;

            return {
                productId: parseInt(itemId),
                name: product.name,
                image: product.image,  // Include the image URL
                size: itemSize,
                quantity: quantity,
                price: sizePrice
            };
        });
    };

    const clearCart = async () => {
        try {
            // Clear context first
            setCartItems(getDefaultCart());
            setCartSizes({});

            // Then clear localStorage
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartSizes');
            localStorage.removeItem('cartPrices');

            // Verify clearing
            const storedCart = localStorage.getItem('cartItems');
            const storedSizes = localStorage.getItem('cartSizes');
            const storedPrices = localStorage.getItem('cartPrices');

            if (!storedCart && !storedSizes && !storedPrices) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.phone || !formData.address || !formData.city || 
            !formData.state || !formData.zipCode) {
            alert('Please fill in all required fields');
            return false;
        }
        if (!hasItems) {
            alert('Your cart is empty');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields here if needed

        // Prepare cart items
        const formattedItems = Object.entries(cartItems)
            .filter(([_, quantity]) => quantity > 0)
            .map(([cartKey, quantity]) => {
                const [itemId, size] = cartKey.split('-');
                const product = all_product.find(p => p.id === parseInt(itemId));
                const basePrice = product.new_price;
                const sizePrice = {
                    'S': basePrice,
                    'M': basePrice + 5,
                    'L': basePrice + 10,
                    'XL': basePrice + 15,
                    'XXL': basePrice + 20,
                }[size] || basePrice;
                return {
                    productId: product.id,
                    name: product.name,
                    size: size,
                    quantity: quantity,
                    price: sizePrice, // <-- this is correct!
                    image: product.image
                };
            });

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify({
                    orderDetails: {
                        orderNumber: Math.floor(100000 + Math.random() * 900000),
                        paymentMethod: formData.paymentMethod
                    },
                    customerInfo: formData,
                    cartItems: formattedItems,
                    totalAmount: getTotalCartAmount() - promoDiscount,
                    promoCode: appliedPromoCode,           // <-- add this
                    promoDiscount: promoDiscount           // <-- and this
                })
            });

            const data = await response.json();

            if (data.success) {
                setCartItems({});
                setCartSizes({});
                resetPromoCode(); // <-- Add this line to reset promo code!
                navigate('/order-success', { 
                    state: { 
                        orderNumber: data.order.orderNumber,
                        orderDetails: data.order
                    }
                });
            } else {
                alert(data.message || 'Failed to place order');
            }
        } catch (error) {
            alert('Failed to place order. Please try again.');
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            if (!validateForm()) return;

            const orderNumber = (Math.floor(100000 + Math.random() * 900000)).toString();
            const formattedItems = Object.entries(cartItems)
                .filter(([_, quantity]) => quantity > 0)
                .map(([cartKey, quantity]) => {
                    const [itemId, itemSize] = cartKey.split('-');
                    const product = all_product.find(p => p.id === parseInt(itemId));
                    const basePrice = product.new_price;
                    const sizePrice = {
                        'S': basePrice,
                        'M': basePrice + 5,
                        'L': basePrice + 10,
                        'XL': basePrice + 15,
                        'XXL': basePrice + 20,
                    }[itemSize] || basePrice;
                    return {
                        productId: parseInt(itemId),
                        name: product.name,
                        image: product.image,
                        size: itemSize,
                        quantity: quantity,
                        price: sizePrice // <-- FIXED: now correct for each size!
                    };
                });

            const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: JSON.stringify({
                    orderDetails: {
                        orderNumber, // string
                        paymentId: paymentIntent.id
                    },
                    paymentMethod: 'online',
                    customerInfo: formData,
                    cartItems: formattedItems,
                    totalAmount,
                    promoCode: appliedPromoCode,
                    promoDiscount: promoDiscount
                }),
            });

            const orderData = await orderResponse.json();

            if (orderData.success) {
                setCartItems(getDefaultCart());
                setCartSizes({});
                resetPromoCode(); // <-- Add this line here too!
                localStorage.removeItem('cartItems');
                localStorage.removeItem('cartSizes');
                localStorage.removeItem('cartPrices');
                navigate('/order-success', { 
                    state: { 
                        orderNumber,
                        paymentId: paymentIntent.id,
                        orderDetails: orderData.order
                    }
                });
            } else {
                throw new Error(orderData.error || 'Failed to place order');
            }
        } catch (error) {
            alert('Payment successful but order placement failed. Please contact support.');
        }
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
    };

    const cartItemsToShow = Object.entries(cartItems).filter(([_, quantity]) => quantity > 0);

    const getCartItemsToShow = () => {
        if (isBuyNow && buyNowItem) {
            // Show only the buy now item
            const product = all_product.find(p => p.id === buyNowItem.id);
            return [[`${buyNowItem.id}-${buyNowItem.size}`, buyNowItem.quantity]];
        }
        // Show all cart items
        return Object.entries(cartItems).filter(([_, quantity]) => quantity > 0);
    };

    const getTotalAmount = () => {
        if (isBuyNow && buyNowItem) {
            const product = all_product.find(p => p.id === buyNowItem.id);
            const basePrice = product.new_price;
            const sizePrice = {
                'S': basePrice,
                'M': basePrice + 5,
                'L': basePrice + 10,
                'XL': basePrice + 15,
                'XXL': basePrice + 20,
            }[buyNowItem.size] || basePrice;
            return sizePrice;
        }
        return getTotalCartAmount();
    };

    const handleOrderSuccess = async () => {
        if (isBuyNow) {
            localStorage.removeItem('buyNowItem');
        }
        // ... rest of success handling
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
  <div className="checkout-container">
    <h1>Checkout</h1>
    <div className="checkout-content">
      <div className="checkout-form-section">
        <h2>Shipping Information</h2>
        <form
  onSubmit={formData.paymentMethod === 'cod' ? handleSubmit : (e) => e.preventDefault()}
  className="checkout-form"
  autoComplete="off"
>
  <div className="form-row">
    <div className="form-group">
      <label>
        <span className="icon">👤</span> First Name
      </label>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        required
        placeholder="Enter your first name"
      />
    </div>
    <div className="form-group">
      <label>
        <span className="icon">👤</span> Last Name
      </label>
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        required
        placeholder="Enter your last name"
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>
        <span className="icon">📧</span> Email
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        required
        placeholder="you@example.com"
      />
    </div>
    <div className="form-group">
      <label>
        <span className="icon">📱</span> Phone
      </label>
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        required
        placeholder="Your phone number"
      />
    </div>
  </div>

  <div className="form-group">
    <label>
      <span className="icon">🏠</span> Address
    </label>
    <input
      type="text"
      name="address"
      value={formData.address}
      onChange={handleInputChange}
      required
      placeholder="Street address"
    />
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>
        <span className="icon">🏙️</span> City
      </label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        required
        placeholder="City"
      />
    </div>
    <div className="form-group">
      <label>
        <span className="icon">🌎</span> State
      </label>
      <input
        type="text"
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        required
        placeholder="State"
      />
    </div>
    <div className="form-group">
      <label>
        <span className="icon">🏷️</span> ZIP Code
      </label>
      <input
        type="text"
        name="zipCode"
        value={formData.zipCode}
        onChange={handleInputChange}
        required
        placeholder="ZIP code"
      />
    </div>
  </div>

  <div className="form-group">
    <label className="block font-semibold mb-2">Address Type</label>
    <div className="flex gap-4">
      {[
        { key: "home", label: "Home", icon: <span role="img" aria-label="Home">🏡</span> },
        { key: "office", label: "Office", icon: <span role="img" aria-label="Office">🏢</span> },
        { key: "other", label: "Other", icon: <span role="img" aria-label="Other">📍</span> },
      ].map(opt => (
        <button
          type="button"
          key={opt.key}
          className={`flex items-center px-4 py-2 rounded border transition
            ${formData.category === opt.key ? "selected" : ""}
          `}
          style={{ fontWeight: 500, fontSize: "1rem" }}
          onClick={() => setFormData({ ...formData, category: opt.key })}
        >
          {opt.icon}
          <span className="ml-2">{opt.label}</span>
        </button>
      ))}
    </div>
  </div>

  <div className="form-group">
    <label className="payment-section">
      <h2>Payment Method</h2>
    </label>
    <div className="payment-options">
      <label className="payment-option">
        <input
          type="radio"
          name="paymentMethod"
          value="cod"
          checked={formData.paymentMethod === 'cod'}
          onChange={handleInputChange}
        />
        <span>Cash on Delivery</span>
      </label>
      <label className="payment-option">
        <input
          type="radio"
          name="paymentMethod"
          value="online"
          checked={formData.paymentMethod === 'online'}
          onChange={handleInputChange}
        />
        <span>Online Payment</span>
      </label>
    </div>
  </div>

  <button
    type="submit"
    className="place-order-btn"
    style={{ display: formData.paymentMethod === 'online' ? 'none' : 'block', marginTop: 24 }}
  >
    Place Order
  </button>
</form>
      </div>
      <div className="order-summary">
        <h2>Order Summary</h2>
        {getCartItemsToShow().map(([cartKey, quantity]) => {
          const [itemId, itemSize] = cartKey.split('-');
          const product = all_product.find(p => p.id === parseInt(itemId));
          const basePrice = product.new_price;
          const sizePrice = {
            'S': basePrice,
            'M': basePrice + 5,
            'L': basePrice + 10,
            'XL': basePrice + 15,
            'XXL': basePrice + 20,
          }[itemSize] || basePrice;

          return (
            <div key={cartKey} className="summary-item">
              <span>{product.name} ({itemSize}): </span>
              <span>${(sizePrice * quantity).toFixed(2)}</span>
            </div>
          );
        })}
        <div className="summary-item">
          <span>Subtotal: </span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Shipping: </span>
          <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        {appliedPromoCode && (
          <div className="summary-item discount">
            <span>Discount ({appliedPromoCode})</span>
            <span>-${promoDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-item total">
          <span>Total: </span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>
      </div>
    {formData.paymentMethod === 'online' && (
  <div className="payment-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '300px' }}>
    <Elements stripe={stripePromise}>
      <StripePayment 
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        customerInfo={formData}
      />
    </Elements>
  </div>
  
)}
  </div>
);
};

export default Checkout;