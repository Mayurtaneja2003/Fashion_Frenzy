const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/place-order', auth, orderController.placeOrder); // Changed from /place to /place-order
router.get('/count', auth, orderController.getOrderCount);
router.get('/my-orders', auth, orderController.getUserOrders); // Add this route if not present
router.put('/cancel/:orderId', auth, orderController.cancelOrder);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);

// Add this route for Stripe payment intent
router.post('/create-payment-intent', auth, orderController.createPaymentIntent);

module.exports = router;