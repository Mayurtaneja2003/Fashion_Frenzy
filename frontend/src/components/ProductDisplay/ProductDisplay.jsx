import React, {useContext, useState} from 'react'
import './ProductDisplay.css'
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { ShopContext } from '../../context/Shop-context'; // (already imported)
import { useNavigate } from 'react-router-dom'; // Add this import

const ProductDisplay = ({ product, selectedSize, setSelectedSize, onBuyNow }) => {
    const { addToCart } = useContext(ShopContext); // remove incrementCartCount
    const navigate = useNavigate(); // Add this hook
    const [size, setSize] = useState('S');
    const [price, setPrice] = useState(product.new_price);
    const sizePrices = {
        S: product.new_price,
        M: product.new_price + 5,
        L: product.new_price + 10,
        XL: product.new_price + 15,
        XXL: product.new_price + 20,
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size); // Use the passed setSelectedSize function
    };

    const handleAddToCart = () => {
        if (size) {
            addToCart(product.id, size);
            // Navigate to cart page after adding item
            navigate('/cart');
        } else {
            alert("Please select a size first.");
        }
    }

    const getSizePrice = (basePrice, size) => {
        const sizePrices = {
            'S': basePrice,
            'M': basePrice + 5,
            'L': basePrice + 10,
            'XL': basePrice + 15,
            'XXL': basePrice + 20
        };
        return sizePrices[size] || basePrice;
    };

    const currentPrice = selectedSize ? 
        getSizePrice(product.new_price, selectedSize) : 
        product.new_price;

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" /> 
                </div>
                <div className="productdisplay-img">
                    <img className='productdisplay-main-img' src={product.image} alt="" />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-stars">
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_dull_icon} alt="" />
                    <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-prices-old">
                        ${product.old_price}
                    </div>
                    <div className="productdisplay-right-prices-new">
                        ${currentPrice}
                    </div>
                </div>
                <div className="productdisplay-right-description">
                    A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.
                </div>  
                <div className="productdisplay-right-size">
                    <h1>Select Size</h1>
                    <div className="productdisplay-right-sizes">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <div 
                                key={size} 
                                className={`size ${selectedSize === size ? 'selected' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                                <div className="size-price">
                                    ${getSizePrice(product.new_price, size)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="productdisplay-button-container">
                    <button 
                        className='productdisplay-add-cart'
                        onClick={() => {
                            if (!selectedSize) {
                                alert('Please select a size');
                                return;
                            }
                            addToCart(product.id, selectedSize, product.new_price);
                            // incrementCartCount(); // REMOVE THIS LINE
                        }}
                    >
                        ADD TO CART
                    </button>
                    <button 
                        className='productdisplay-buy-now'
                        onClick={() => {
                            if (!selectedSize) {
                                alert('Please select a size');
                                return;
                            }
                            onBuyNow();
                        }}
                    >
                        BUY NOW
                    </button>
                </div>
                <p className="productdisplay-right-category"><span>Category : </span>Women, T-Shirt, Crop Top</p>
                <p className="productdisplay-right-category"><span>Tags : </span>Modern, Latest</p>
            </div>
        </div>
    )
}
 
export default ProductDisplay