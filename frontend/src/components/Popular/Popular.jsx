import React, { useState, useEffect } from 'react';
import './Popular.css';
import Item from '../Item/Item';
import { API_URL } from '../../config/api';

const Popular = () => {
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/api/category/women`);
                if (!response.ok) {
                    throw new Error('Failed to fetch popular products');
                }
                const data = await response.json();
                // Get the first 4 products for popular section
                const popular = data.slice(0, 4);
                setPopularProducts(popular);
            } catch (error) {
                console.error('Error fetching popular products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularProducts();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popularProducts.map((item) => (
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

export default Popular;