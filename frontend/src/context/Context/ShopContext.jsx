import React, { createContext, useCallback, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    return {};
};

const ShopContextProvider = (props) => {
  // Remove useNavigate hook from here
  const [cartItems, setCartItems] = useState(() => {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : {};
  });

  const [cartSizes, setCartSizes] = useState(() => {
      const savedSizes = localStorage.getItem('cartSizes');
      return savedSizes ? JSON.parse(savedSizes) : {};
  });

  const [cartPrices, setCartPrices] = useState(() => {
      const savedPrices = localStorage.getItem('cartPrices');
      return savedPrices ? JSON.parse(savedPrices) : {};
  });

  // Keep these state declarations at the top with other states
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [userOrderCount, setUserOrderCount] = useState(0);

  const availablePromoCodes = {
      'NEWBIE': { discount: 50, description: 'Get $50 off on your first order!' },
      'SUMMER20': { discount: 20, description: 'Summer Special: $20 off on all orders' },
      'FLASH10': { discount: 10, description: 'Flash Sale: $10 off on your purchase' },
      'WEEKEND25': { discount: 25, description: 'Weekend Special: $25 off on orders above $200' },
      'SEASON15': { discount: 15, description: 'Seasonal Discount: $15 off on all items' }
  };

  // Save to localStorage whenever cart changes
  useEffect(() => {
      // Remove the condition to always save cart state
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('cartSizes', JSON.stringify(cartSizes));
      localStorage.setItem('cartPrices', JSON.stringify(cartPrices));
  }, [cartItems, cartSizes, cartPrices]);

  // Use useCallback for functions that are passed as props
  const setCartItemsWithStorage = useCallback((newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  }, []);

  // Memoize cart operations
  const addToCart = useCallback((itemId, size, basePrice) => {
    const cartKey = `${itemId}-${size}`;
    setCartItemsWithStorage(prev => ({
      ...prev,
      [cartKey]: (prev[cartKey] || 0) + 1
    }));
  }, [setCartItemsWithStorage]);

  const removeFromCart = (itemId, size) => {
      const cartKey = `${itemId}-${size}`;
      setCartItems(prev => {
          const newCart = { ...prev };
          if (newCart[cartKey] > 0) {
              newCart[cartKey] -= 1;
              if (newCart[cartKey] === 0) {
                  delete newCart[cartKey];
                  // Also remove from sizes and prices
                  const newSizes = { ...cartSizes };
                  const newPrices = { ...cartPrices };
                  delete newSizes[cartKey];
                  delete newPrices[cartKey];
                  setCartSizes(newSizes);
                  setCartPrices(newPrices);
              }
          }
          localStorage.setItem('cartItems', JSON.stringify(newCart));
          return newCart;
      });
  };

  const handleRemoveItem = (itemId, size) => {
      const cartKey = `${itemId}-${size}`;
      
      setCartItems(prev => {
          const newCart = { ...prev };
          delete newCart[cartKey];
          localStorage.setItem('cartItems', JSON.stringify(newCart));
          return newCart;
      });

      setCartSizes(prev => {
          const newSizes = { ...prev };
          delete newSizes[cartKey];
          localStorage.setItem('cartSizes', JSON.stringify(newSizes));
          return newSizes;
      });

      setCartPrices(prev => {
          const newPrices = { ...prev };
          delete newPrices[cartKey];
          localStorage.setItem('cartPrices', JSON.stringify(newPrices));
          return newPrices;
      });
  };

  // Remove the initial auth-token cart fetch if you want to use localStorage instead
  useEffect(() => {
      if (localStorage.getItem('cartItems')) {
          const savedCart = JSON.parse(localStorage.getItem('cartItems'));
          const savedSizes = JSON.parse(localStorage.getItem('cartSizes') || '{}');
          const savedPrices = JSON.parse(localStorage.getItem('cartPrices') || '{}');
          
          setCartItems(savedCart);
          setCartSizes(savedSizes);
          setCartPrices(savedPrices);
      }
  }, []);

  const [all_product, setAll_Product] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth-token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      setIsLoading(true);
      fetch('http://localhost:4000/allproducts')
          .then((response) => response.json())
          .then((data) => {
              setAll_Product(data);
              setIsLoading(false);
          })
          .catch((error) => {
              console.error("Error fetching products:", error);
              setIsLoading(false);
          });
  }, []);

  useEffect(() => {
      if (localStorage.getItem('auth-token')) {
          fetch('http://localhost:4000/getcart', {
              method: 'POST',
              headers: {
                  Accept: 'application/form-data',
                  'auth-token': `${localStorage.getItem('auth-token')}`,
                  'Content-Type': 'application/json',
              },
          })
              .then((response) => response.json())
              .then((data) => {
                  // Replace console.logs with proper error handling
                  const defaultCart = getDefaultCart();
                  const defaultSizes = {};
                  for (const itemId in data) {
                      defaultCart[itemId] = data[itemId].quantity;
                      defaultSizes[itemId] = data[itemId].size;
                  }
                  setCartItems(defaultCart);
                  setCartSizes(defaultSizes);
              })
              .catch((error) => {
                  // Proper error handling
                  console.error("Error fetching cart:", error);
                  // Optionally show user feedback
                  // setError("Failed to fetch cart data");
              });
      }
  }, []);

  // Memoize cart total calculations
  const getTotalCartAmount = useCallback(() => {
    try {
      let total = 0;
      for (const [cartKey, quantity] of Object.entries(cartItems)) {
        if (quantity > 0) {
          const [itemId, size] = cartKey.split('-');
          const product = all_product.find(p => p.id === parseInt(itemId));
          if (product) {
            const basePrice = product.new_price;
            const sizePrice = {
              'S': basePrice,
              'M': basePrice + 5,
              'L': basePrice + 10,
              'XL': basePrice + 15,
              'XXL': basePrice + 20,
            }[size] || basePrice;
            
            total += sizePrice * quantity;
          }
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating total:', error);
      return 0;
    }
  }, [cartItems, all_product]);

  const getTotalCartItems = () => {
      let totalItem = 0;
      for (const item in cartItems) {
          if (!isNaN(cartItems[item]) && cartItems[item] > 0) { // Check for valid numeric values
              totalItem += cartItems[item];
          }
      }
      return totalItem;
  };
  const handleLogout = () => {
      // Clear auth token
      localStorage.removeItem('auth-token');
      
      // Reset cart states to default
      setCartItems(getDefaultCart());
      setCartSizes({});
      setCartPrices({});
      
      // Clear cart data from localStorage
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartSizes');
      localStorage.removeItem('cartPrices');
      
      // Reset authentication state
      setIsAuthenticated(false);
      
      // Instead of using navigate, use window.location
      window.location.href = '/';
  };

  // Update the useEffect to fetch order count immediately after login
  useEffect(() => {
    const fetchUserOrderCount = async () => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            try {
                const response = await fetch('http://localhost:4000/api/user/order-count', {
                    headers: {
                        'auth-token': token
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUserOrderCount(data.orderCount);
                    // Clear NEWBIE promo if not eligible
                    if (data.orderCount > 0 && appliedPromoCode === 'NEWBIE') {
                        setAppliedPromoCode(null);
                        setPromoDiscount(0);
                    }
                }
            } catch (error) {
                console.error('Error fetching order count:', error);
            }
        }
    };

    fetchUserOrderCount();
}, [isAuthenticated]); // Add isAuthenticated as dependency

  // Update the applyPromoCode function
  const applyPromoCode = useCallback(async (code) => {
    if (code === 'NEWBIE') {
        try {
            const response = await fetch('http://localhost:4000/api/user/order-count', {
                headers: {
                    'auth-token': localStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            
            if (data.orderCount > 0) {
                // Updated message to be more clear
                alert('NEWBIE promo code is only valid for first-time orders. You have already placed orders before.');
                setAppliedPromoCode(null);
                setPromoDiscount(0);
                return false;
            }
        } catch (error) {
            console.error('Error checking order count:', error);
            return false;
        }
    }

    if (availablePromoCodes[code]) {
        setAppliedPromoCode(code);
        setPromoDiscount(availablePromoCodes[code].discount);
        return true;
    }
    return false;
}, [availablePromoCodes]);

  // Add this function to reset promo code after order placement
  const resetPromoCode = useCallback(() => {
      setAppliedPromoCode(null);
      setPromoDiscount(0);
      localStorage.removeItem('appliedPromoCode');
      localStorage.removeItem('promoDiscount');
  }, []);

  const removePromoCode = useCallback(() => {
      setAppliedPromoCode(null);
      setPromoDiscount(0);
  }, []);

  // Add this with other state declarations
  const clearBuyNowItem = useCallback(() => {
    localStorage.removeItem('buyNowItem');
}, []);

  // Update context value to include cartPrices
  const contextValue = {
    all_product,
    cartItems,
    cartSizes,
    cartPrices,
    addToCart,
    removeFromCart,
    handleRemoveItem,
    getTotalCartAmount,
    getTotalCartItems,
    setCartItems: setCartItemsWithStorage,
    setCartSizes,
    setCartPrices,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    handleLogout,
    getDefaultCart,
    appliedPromoCode,
    promoDiscount,
    applyPromoCode,
    removePromoCode,
    availablePromoCodes,
    userOrderCount, // Add this to context value
    resetPromoCode,
    clearBuyNowItem, // Add clearBuyNowItem to context value
  };

  return (
      <ShopContext.Provider value={contextValue}>
          {props.children}
      </ShopContext.Provider>
  );
};

export default ShopContextProvider;