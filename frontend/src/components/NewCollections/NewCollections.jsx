import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../Item/Item'

const NewCollections = () => {
    const [new_collection, setNew_collection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewCollections = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/newcollections');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch new collections');
                }
                
                const data = await response.json();
                 setNew_collection(data);
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to load new collections');
            } finally {
                setLoading(false);
            }
        };

        fetchNewCollections();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!new_collection.length) return <div>No new collections available</div>;

    return (
        <div className='new-collections'>
            <h1>NEW COLLECTIONS</h1>
            <hr />
            <div className="collections">
                {new_collection.map((item, i) => (
                    <Item
                        key={i}
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

export default NewCollections;
