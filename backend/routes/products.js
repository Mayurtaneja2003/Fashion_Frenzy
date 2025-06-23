const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Fix route paths by removing optional parameters
router.get('/allproducts', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/product/:id', productController.getProductById);
router.get('/popular', productController.getPopularProducts);
router.get('/popular/:category', productController.getPopularProducts);
router.get('/product/:id', productController.getProductById);
router.get('/newcollections', productController.getNewCollection); // Changed URL path
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.post('/products', productController.addProduct);

module.exports = router;