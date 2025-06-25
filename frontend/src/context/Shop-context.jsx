import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext({
    products: [],
    cartItems: {},
    cartSizes: {},
    appliedPromoCode: null,
    promoDiscount: 0,
    isLoading: true,
    orderCount: 0,
    cartCount: 0,
    incrementCartCount: () => {},
    updateCartCount: () => {},
    getTotalCartItems: () => 0,
    getDefaultCart: () => ({}),
    resetPromoCode: () => {},
});

export const ShopContextProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : {};
    });
    const [cartSizes, setCartSizes] = useState(() => {
        const savedSizes = localStorage.getItem('cartSizes');
        return savedSizes ? JSON.parse(savedSizes) : {};
    });
    const [appliedPromoCode, setAppliedPromoCode] = useState(null);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [orderCount, setOrderCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/allproducts');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Save cart data to localStorage whenever it changes
    useEffect(() => {
        if (cartItems) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Fetch cart count from backend on mount or after login
    useEffect(() => {
        const fetchCartCount = async () => {
            const token = localStorage.getItem('auth-token');
            if (!token) return;
            try {
                const res = await fetch('http://localhost:4000/api/cart/count', {
                    headers: { 'auth-token': token }
                });
                const data = await res.json();
                if (data.success) setCartCount(data.count);
            } catch (e) {
                setCartCount(0);
            }
        };
        fetchCartCount();
    }, []);

    // Call this after adding to cart
    const incrementCartCount = () => setCartCount(prev => prev + 1);

    // Optionally, add a function to set cart count directly
    const updateCartCount = (count) => setCartCount(count);

    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
    };

    const contextValue = {
        all_product: products,
        products,
        cartItems,
        setCartItems,
        cartSizes,
        setCartSizes,
        appliedPromoCode,
        setAppliedPromoCode,
        promoDiscount,
        setPromoDiscount,
        isLoading,
        orderCount,
        cartCount,
        incrementCartCount,
        updateCartCount,
        getTotalCartItems,
        getDefaultCart: () => ({}),
        resetPromoCode: () => {
            setAppliedPromoCode(null);
            setPromoDiscount(0);
        },
        getTotalCartAmount: () => {
            let total = 0;
            for (const [cartKey, quantity] of Object.entries(cartItems)) {
                const [itemId, itemSize] = cartKey.split('-');
                const product = products.find(p => p.id === parseInt(itemId));
                
                if (product) {
                    const basePrice = product.new_price;
                    const sizePrice = {
                        'S': basePrice,
                        'M': basePrice + 5,
                        'L': basePrice + 10,
                        'XL': basePrice + 15,
                        'XXL': basePrice + 20,
                    }[itemSize] || basePrice;

                    total += quantity * sizePrice;
                }
            }
            return total;
        },
        addToCart: (itemId, size) => {
            const cartKey = `${itemId}-${size}`;
            setCartItems(prev => ({
                ...prev,
                [cartKey]: (prev[cartKey] || 0) + 1
            }));
            setCartSizes(prev => ({
                ...prev,
                [itemId]: size
            }));
        },
        removeFromCart: (itemId, size) => {
            const cartKey = `${itemId}-${size}`;
            setCartItems(prev => ({
                ...prev,
                [cartKey]: Math.max((prev[cartKey] || 0) - 1, 0)
            }));
        },
        handleRemoveItem: (itemId, size) => {
            const cartKey = `${itemId}-${size}`;
            setCartItems(prev => {
                const newCart = { ...prev };
                delete newCart[cartKey];
                return newCart;
            });
        }
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};