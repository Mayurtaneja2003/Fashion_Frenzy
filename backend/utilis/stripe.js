const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (amount, customer) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: {
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email
            }
        });
        return paymentIntent;
    } catch (error) {
        console.error('Stripe error:', error);
        throw error;
    }
};

exports.confirmPayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Payment confirmation error:', error);
        throw error;
    }
};