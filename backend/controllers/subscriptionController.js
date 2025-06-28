const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('../utilis/email');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.json({
                success: false,
                message: 'This email is already subscribed'
            });
        }

        // Save new subscriber
        const subscriber = new Subscriber({ email });
        await subscriber.save();

        // Respond to client immediately
        res.json({ success: true, message: 'Subscribed successfully!' });

        // Send welcome email asynchronously (do not await or return)
        sendEmail({
            to: email,
            subject: 'Welcome to our Newsletter!',
            template: 'newsletterWelcome',
            data: { email }
        }).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.'
        });
    }
};