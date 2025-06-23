const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/getcart', auth, cartController.getCartData); // Add this route
router.post('/add', auth, cartController.addToCart);
router.post('/remove', auth, cartController.removeFromCart);

module.exports = router;