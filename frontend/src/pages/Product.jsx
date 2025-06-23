import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/Shop-context'
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrum from '../components/Breadcrums/Breadcrum'
import ProductDisplay from '../components/ProductDisplay/ProductDisplay'
import DescriptionBox from '../components/DescriptionBox/DescriptionBox'
import RelatedProducts from '../components/RelatedProducts/RelatedProducts'

const Product = () => {
    const { addToCart, all_product } = useContext(ShopContext);
    const { productId } = useParams();
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null); // Add this state variable

    // Find the product from context
    const contextProduct = all_product.find(p => p.id === parseInt(productId));

    useEffect(() => {
        if (!contextProduct) {
            // If product not found in context, fetch it directly
            const fetchProduct = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`http://localhost:4000/api/product/${productId}`);
                    if (!response.ok) {
                        throw new Error('Product not found');
                    }
                    const data = await response.json();
                    setProduct(data);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setError('Product not found');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        } else {
            setProduct(contextProduct);
            setLoading(false);
        }
    }, [productId, contextProduct]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className='product'>
            <Breadcrum product={product} />
            <ProductDisplay 
                product={product}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                onBuyNow={() => {
                    if (!localStorage.getItem('auth-token')) {
                        navigate('/login');
                        return;
                    }
                    
                    if (!selectedSize) {
                        alert('Please select a size');
                        return;
                    }

                    // Add item to cart
                    addToCart(product.id, selectedSize, product.new_price);
                    
                    // Store buy now item details in localStorage
                    localStorage.setItem('buyNowItem', JSON.stringify({
                        id: product.id,
                        size: selectedSize,
                        quantity: 1,
                        price: product.new_price
                    }));

                    // Navigate to checkout
                    navigate('/checkout', { state: { buyNow: true } });
                }}
            />
            <DescriptionBox />
            <RelatedProducts />
        </div>
    );
};

export default Product;