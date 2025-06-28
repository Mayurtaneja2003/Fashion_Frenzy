import React, { useState, useEffect } from 'react';
import './CSS/ShopCategory.css';
import Item from '../components/Item/Item';
import { API_URL } from '../config/api';

const ShopCategory = (props) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/category/${props.category}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        if (props.category) {
            fetchProducts();
        }
    }, [props.category]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!products.length) return <div>No products found in this category</div>;

    return (
        <div className='shop-category'>
            {props.banner && (
                <img className='shopcategory-banner' src={props.banner} alt="category banner" />
            )}
            <div className="shopcategory-products">
                {products.map((item) => (
                    <Item
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        image={item.image}
                        new_price={item.new_price}
                        old_price={item.old_price}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShopCategory;
