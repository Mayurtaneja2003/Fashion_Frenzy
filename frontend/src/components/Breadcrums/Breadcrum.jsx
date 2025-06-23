import React, { useContext } from 'react';
import './Breadcrum.css';
import arrow_icon from '../assets/breadcrum_arrow.png';
import { ShopContext } from '../../context/Context/ShopContext';

const Breadcrum = (props) => {
    const { all_product, isLoading } = useContext(ShopContext);
    const { product } = props;

    if (isLoading) {
        return <div className="breadcrum">Loading...</div>;
    }

    if (!product) {
        return <div className="breadcrum">Product not found</div>;
    }

    return (
        <div className='breadcrum'>
            HOME <img src={arrow_icon} alt="" /> SHOP <img src={arrow_icon} alt="" /> {product.category} <img src={arrow_icon} alt="" /> {product.name}
        </div>
    );
};

export default Breadcrum;