import React, { useState } from 'react';
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";

const AddProduct = () => {
    const [image, setImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        new_price: "",
        old_price: ""
    });

    const imageHandler = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
        } else {
            alert('Please select a valid image file');
        }
    };

    const changeHandler = (e) => {
        setProductDetails({...productDetails, [e.target.name]: e.target.value});
    };

    const validateForm = () => {
        if (!productDetails.name.trim()) {
            alert('Please enter product title');
            return false;
        }
        if (!productDetails.old_price || isNaN(productDetails.old_price)) {
            alert('Please enter a valid price');
            return false;
        }
        if (!productDetails.new_price || isNaN(productDetails.new_price)) {
            alert('Please enter a valid offer price');
            return false;
        }
        if (!image) {
            alert('Please select a product image');
            return false;
        }
        return true;
    };

    const Add_Product = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Upload image first
            const formData = new FormData();
            formData.append('product', image);

            const uploadResponse = await fetch("http://localhost:4000/upload", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (uploadData.success) {
                // Fetch the latest product id from the backend
                let newId = 1;
                try {
                    const res = await fetch('http://localhost:4000/api/allproducts');
                    const products = await res.json();
                    if (Array.isArray(products) && products.length > 0) {
                        newId = Math.max(...products.map(p => p.id || 0)) + 1;
                    }
                } catch (e) {
                    // fallback to 1
                }

                const product = {
                    id: newId,
                    ...productDetails,
                    image: uploadData.image_url
                };

                const productResponse = await fetch('http://localhost:4000/api/products', {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });

                const productData = await productResponse.json();
                
                if (productData.success) {
                    alert('Product Added Successfully!');
                    // Reset form
                    setProductDetails({
                        name: "",
                        image: "",
                        category: "women",
                        new_price: "",
                        old_price: ""
                    });
                    setImage(false);
                } else {
                    throw new Error('Failed to add product');
                }
            }
        } catch (error) {
            alert('Failed to add product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='add-product'>
            <h2>Add New Product</h2>
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield"> {/* Fix: Changed itemfiled to itemfield */}
                    <p>Price</p>
                    <input 
                        value={productDetails.old_price}  
                        onChange={changeHandler} 
                        type="text" 
                        name='old_price' 
                        placeholder='Type here' 
                    />
                </div>
                <div className="addproduct-itemfield"> {/* Fix: Changed itemfiled to itemfield */}
                    <p>Offer Price</p>
                    <input 
                        value={productDetails.new_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='new_price' 
                        placeholder='Type here' 
                    />
                </div>
            </div>
            <div className="addproduct-itemfiled">
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler}  name="category" className="add-product-selector">
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumnail-img' alt="" />
                </label>
                <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
            </div>
            <button 
                onClick={Add_Product} 
                className={`addproduct-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? 'Adding...' : 'Add Product'}
            </button>
        </div>
    );
};

export default AddProduct;