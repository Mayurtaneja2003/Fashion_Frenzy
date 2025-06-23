import React, { useState, useEffect } from 'react';
import "./ListProduct.css";
import cross_icon from "../../assets/cross_icon.png";
import edit_icon from "../../assets/edit_icon.svg"; // Make sure this file exists

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchInfo = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/allproducts"); // <-- FIXED
            const data = await response.json();
            setAllProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, []);

    const remove_product = async (id) => {
        try {
            const response = await fetch(`http://localhost:4000/api/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                await fetchInfo();
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Error removing product:", error);
        }
    };

    return (
        <div className='list-product'>
            <h1>All Products List</h1>
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Actions</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {allproducts.map((product, index) => (
                    <React.Fragment key={index}>
                        <div className="listproduct-format-main listproduct-format">
                            <img src={product.image} alt="" className='listproduct-product-icon' />
                            <p>{product.name}</p>
                            <p>${product.old_price}</p>
                            <p>${product.new_price}</p>
                            <p>{product.category}</p>
                            <div className="product-actions">
                                <button 
                                    className="edit-button"
                                    onClick={() => setEditingProduct(product)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={() => remove_product(product._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <hr />
                    </React.Fragment>
                ))}
            </div>

            {editingProduct && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h2>Edit Product</h2>
                        <form className="edit-form">
                            <div className="form-group">
                                <label>Product Title</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({
                                        ...editingProduct,
                                        name: e.target.value
                                    })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        name="old_price"
                                        value={editingProduct.old_price}
                                        onChange={(e) => setEditingProduct({
                                            ...editingProduct,
                                            old_price: Number(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Offer Price</label>
                                    <input
                                        type="number"
                                        name="new_price"
                                        value={editingProduct.new_price}
                                        onChange={(e) => setEditingProduct({
                                            ...editingProduct,
                                            new_price: Number(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({
                                        ...editingProduct,
                                        category: e.target.value
                                    })}
                                >
                                    <option value="women">Women</option>
                                    <option value="men">Men</option>
                                    <option value="kid">Kid</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    className="update-btn"
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`http://localhost:4000/api/products/${editingProduct._id}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'auth-token': localStorage.getItem('auth-token') // if your backend requires auth
                                                },
                                                body: JSON.stringify(editingProduct)
                                            });

                                            if (response.ok) {
                                                await fetchInfo();
                                                setEditingProduct(null);
                                                alert('Product updated successfully!');
                                            } else {
                                                throw new Error('Failed to update product');
                                            }
                                        } catch (error) {
                                            console.error('Error updating product:', error);
                                            alert('Failed to update product');
                                        }
                                    }}
                                >
                                    Update Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListProduct;