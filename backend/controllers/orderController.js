const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendEmail } = require('../utilis/email');

exports.placeOrder = async (req, res) => {
    try {
        const { orderDetails, customerInfo, cartItems, totalAmount, paymentMethod } = req.body;

        // Calculate subtotal
        const subtotal = cartItems.reduce((sum, item) => {
            const basePrice = item.price;
            const sizePrice = {
                'S': basePrice,
                'M': basePrice + 5,
                'L': basePrice + 10,
                'XL': basePrice + 15,
                'XXL': basePrice + 20,
            }[item.size] || basePrice;
            return sum + sizePrice * item.quantity;
        }, 0);

        const shippingCost = subtotal < 100 ? 2 : 0;
        const promoDiscount = req.body.promoDiscount || 0;
        const total = subtotal + shippingCost - promoDiscount;

        // 1. Save order to DB
        const order = new Order({
            userId: req.user.id,
            orderNumber: orderDetails?.orderNumber || Math.floor(Math.random() * 1000000),
            items: cartItems,
            subtotal,
            shippingCost,
            promoDiscount,
            total,
            status: 'Processing',
            customerInfo: customerInfo,
            date: new Date(),
            paymentMethod: paymentMethod || 'cod',
            paymentId: orderDetails?.paymentId || null,
            promoCode: req.body.promoCode,
            promoDiscount: req.body.promoDiscount
        });

        await order.save();

        // 2. Respond to client immediately
        res.json({
            success: true,
            message: "Order placed successfully",
            order: order
        });

        // 3. Do slow tasks asynchronously (don't await)
        // Update user order count
        User.findByIdAndUpdate(req.user.id, { $inc: { orderCount: 1 } }).catch(() => { });

        // Send emails
        const sendOrderEmails = async () => {
            try {
                await sendEmail({
                    to: customerInfo.email,
                    subject: 'Order Confirmation - Fashion Frenzy',
                    template: 'orderConfirmation',
                    data: {
                        name: customerInfo.firstName,
                        orderNumber: order.orderNumber,
                        items: cartItems,
                        total: totalAmount
                    }
                });
                await sendEmail({
                    to: process.env.ADMIN_EMAIL,
                    subject: `New Order Placed: #${order.orderNumber}`,
                    template: 'orderConfirmation',
                    data: {
                        name: customerInfo.firstName,
                        orderNumber: order.orderNumber,
                        items: cartItems,
                        total: totalAmount
                    }
                });
            } catch (emailErr) {
                console.error("Order email failed:", emailErr);
            }
        };
        sendOrderEmails();

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
        // Sort by createdAt descending (newest first)
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
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
    const { amount, email } = req.body;
    if (!amount || !email) {
        return res.status(400).json({ error: 'Amount and email are required' });
    }
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            receipt_email: email,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe PaymentIntent error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
};