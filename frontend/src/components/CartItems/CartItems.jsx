import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/Shop-context';
import { API_URL, fetchAPI } from '../../config/api';
import './CartItems.css';

const CartItems = () => {
    const navigate = useNavigate();
    const { 
        getTotalCartAmount, 
        all_product, 
        cartItems,
        setCartItems,
        cartSizes,
        setCartSizes,
        appliedPromoCode,
        setAppliedPromoCode,
        promoDiscount,
        setPromoDiscount,
        addToCart,         // Add these functions from context
        removeFromCart,    // Add these functions from context
        handleRemoveItem,  // Add these functions from context
        resetPromoCode     // Add resetPromoCode function from context
    } = useContext(ShopContext);

    const [promoCode, setPromoCode] = useState('');
    const [promoMessage, setPromoMessage] = useState('');
    const [showPromoCodes, setShowPromoCodes] = useState(false);

    // Available promo codes with their discounts
    const availablePromoCodes = {
        'WELCOME10': { discount: 10, description: '10% off on your first order' },
        'SUMMER20': { discount: 20, description: '20% off on summer collection' },
        'SPECIAL15': { discount: 15, description: '15% off on all items' }
    };

    const handlePromoCodeApply = (code) => {
        if (!localStorage.getItem('auth-token')) {
            setPromoMessage('Please login to apply promo code');
            return;
        }

        // Check if cart is empty
        const hasItems = Object.values(cartItems).some(qty => qty > 0);
        if (!hasItems) {
            setPromoMessage('Add items to cart before applying a promo code');
            return;
        }

        // Check if the promo code exists
        if (!availablePromoCodes[code]) {
            setPromoMessage('Invalid promo code');
            return;
        }

        // Calculate the discount amount (percentage of cart total)
        const cartTotal = getTotalCartAmount();
        const discountPercent = availablePromoCodes[code].discount;
        const discountAmount = (cartTotal * discountPercent) / 100;

        // Apply the promo code
        setAppliedPromoCode(code);
        setPromoDiscount(discountAmount);
        setPromoMessage(`Promo code ${code} applied successfully!`);
        setPromoCode('');
        setShowPromoCodes(false);
    };

    const handleRemovePromoCode = () => {
        setAppliedPromoCode(null);
        setPromoDiscount(0);
        setPromoCode('');
        setPromoMessage('');
    };

    // Calculate cart totals
    const cartTotal = getTotalCartAmount();
    const hasItems = cartItems ? Object.values(cartItems).some(quantity => quantity > 0) : false;
    const shippingCost = hasItems && cartTotal < 100 ? 2 : 0;
    const totalAmount = cartTotal + shippingCost - (promoDiscount || 0);

    const cartItemsToShow = cartItems ? 
        Object.entries(cartItems).filter(([_, quantity]) => quantity > 0) : 
        [];

    // Add handleProductClick function
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    useEffect(() => {
        const hasItems = Object.values(cartItems).some(qty => qty > 0);
        if (!hasItems && appliedPromoCode) {
            resetPromoCode();
        }
        // Clear promo message if cart is empty or promo code is removed
        if (!hasItems || !appliedPromoCode) {
            setPromoMessage('');
        }
    }, [cartItems, appliedPromoCode, resetPromoCode]);

    return (
        <div className='cartitems'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Size</p>
                <p>Price</p>
                <p>Quantity</p> 
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {cartItemsToShow.map(([cartKey, quantity]) => {
                const [itemId, itemSize] = cartKey.split('-');
                const product = all_product?.find(p => p.id === parseInt(itemId));
                
                if (!product) return null;

                // Calculate price based on size
                const basePrice = product.new_price;
                const sizePrice = {
                    'S': basePrice,
                    'M': basePrice + 5,
                    'L': basePrice + 10,
                    'XL': basePrice + 15,
                    'XXL': basePrice + 20,
                }[itemSize] || basePrice;

                const totalPrice = sizePrice * quantity;

                return (
                    <div key={cartKey} className="cartitems-format cartitems-format-main">
                        <img 
                            src={product.image} 
                            alt="" 
                            className="cartitems-product-icon" 
                            onClick={() => handleProductClick(product.id)}
                        />
                        <p>{product.name}</p>
                        <p className="cart-size">{itemSize}</p>
                        <p>${sizePrice.toFixed(2)}</p>
                        <div className="cartitems-quantity-controls">
                            <button 
                                className="quantity-btn"
                                onClick={() => removeFromCart(itemId, itemSize)}
                            >-</button>
                            <span className="quantity-number">{quantity}</span>
                            <button 
                                className="quantity-btn"
                                onClick={() => addToCart(itemId, itemSize)}
                            >+</button>
                        </div>
                        <p>${totalPrice.toFixed(2)}</p>
                        <button 
                            className="remove-btn"
                            onClick={() => handleRemoveItem(itemId, itemSize)}
                        >×</button>
                    </div>
                );
            })}
            {/* Update the totals section */}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>${cartTotal.toFixed(2)}</p>
                        </div>
                        <hr />
                        {hasItems && (
                            <>
                                <div className="cartitems-total-item">
                                    <p>Shipping</p>
                                    <p>${shippingCost.toFixed(2)}</p>
                                </div>
                                <hr />
                            </>
                        )}
                        {appliedPromoCode && (
                            <div className="cartitems-total-item">
                                <p>Discount ({availablePromoCodes[appliedPromoCode].discount}%)</p>
                                <p>-${promoDiscount.toFixed(2)}</p>
                            </div>
                        )}
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${totalAmount.toFixed(2)}</h3>
                        </div>
                    </div>
                    {/* Add the place order button */}
                    {hasItems && (
                        <button 
                            className="cartitems-total-button"
                            onClick={() => {
                                if (!localStorage.getItem('auth-token')) {
                                    navigate('/login');
                                    return;
                                }
                                navigate('/checkout');
                            }}
                        >
                            PROCEED TO CHECKOUT
                        </button>
                    )}
                </div>

                <div className="cartitems-promocode">
                    <p>If you have a promo code, Enter it here</p>
                    <div className="cartitems-promobox">
                        {appliedPromoCode ? (
                            <div className="applied-promo">
                                <span className="applied-promo-text">
                                    {`${appliedPromoCode} applied: ${availablePromoCodes[appliedPromoCode].discount}% off`}
                                </span>
                                <button onClick={handleRemovePromoCode}>Remove</button>
                            </div>
                        ) : (
                            <>
                                <input 
                                    type="text" 
                                    placeholder='Enter promo code' 
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    onFocus={() => setShowPromoCodes(true)}
                                />
                                <button onClick={() => handlePromoCodeApply(promoCode)}>Apply</button>
                            </>
                        )}
                    </div>

                    {promoMessage && (
                        <div className={`promo-message ${promoMessage.includes('successfully') ? 'success' : 'error'}`}>
                            {promoMessage}
                        </div>
                    )}

                    {!appliedPromoCode && showPromoCodes && (
                        <div className="promo-codes-list">
                            {Object.entries(availablePromoCodes).map(([code, details]) => (
                                <div key={code} className="promo-code-item">
                                    <div className="promo-code-info">
                                        <span className="promo-code">{code}</span>
                                        <span className="promo-description">{details.description}</span>
                                    </div>
                                    <button 
                                        className="apply-promo-btn"
                                        onClick={() => handlePromoCodeApply(code)}
                                    >
                                        Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div> 
    )
}

export default CartItems