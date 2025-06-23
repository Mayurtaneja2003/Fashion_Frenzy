const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.placeOrder = async (req, res) => {
    try {
        console.log('placeOrder called by user:', req.user);
        console.log('Request body:', req.body);
        const { orderDetails, customerInfo, cartItems, totalAmount, paymentMethod, stripeToken } = req.body;
        // If online payment, process Stripe payment
        if (paymentMethod === 'online') {
            // Uncomment and configure if using Stripe
            // const charge = await stripe.charges.create({
            //     amount: Math.round(totalAmount * 100),
            //     currency: 'usd',
            //     source: stripeToken.id,
            //     description: `Order payment for user ${req.user.id}`,
            // });
            // if (!charge.paid) {
            //     return res.status(400).json({ success: false, message: "Payment failed" });
            // }
        }
        // Calculate estimated delivery date: 7 days from now
        const estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const order = new Order({
            userId: req.user.id,
            orderNumber: orderDetails?.orderNumber || Math.floor(Math.random() * 1000000),
            items: cartItems,
            total: totalAmount,
            status: 'Processing',
            customerInfo: customerInfo,
            date: new Date(),
            estimatedDeliveryDate,
            paymentMethod: paymentMethod || 'cod',
            paymentId: orderDetails?.paymentId || null
        });

        await order.save();
        await User.findByIdAndUpdate(req.user.id, { $inc: { orderCount: 1 } });

        res.json({ 
            success: true, 
            message: "Order placed successfully",
            order: order 
        });
    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to place order", 
            error: error.message 
        });
    }
};

exports.getOrderCount = async (req, res) => {
    try {
        const orderCount = await Order.countDocuments({ userId: req.user.id });
        res.json({ orderCount });
    } catch (error) {
        console.error('Error fetching order count:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
        }
        order.status = 'Cancelled';
        await order.save();
        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to cancel order" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, lastStatusUpdate } = req.body;
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        order.status = status;
        order.lastStatusUpdate = lastStatusUpdate || new Date();
        // If delivered, set deliveredAt
        if (status === 'Delivered') {
            order.deliveredAt = new Date();
        }
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update order status" });
    }
};

exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, email } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: 'usd',
            receipt_email: email,
        });
        console.log('Created PaymentIntent:', paymentIntent.id, paymentIntent.client_secret);
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe PaymentIntent error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
};