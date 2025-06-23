const Contact = require('../models/Contact');
const { sendEmail } = require('../utilis/email');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Save to database
        const contact = new Contact({
            name,
            email,
            subject,
            message
        });
        await contact.save();

        // Send confirmation emails
        await sendEmail({
            to: email,
            subject: 'Thank you for contacting Fashion Frenzy',
            template: 'contactConfirmation',
            data: { name, subject, message }
        });

        // Send notification to admin
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Form Submission',
            template: 'contactNotification',
            data: { name, email, subject, message }
        });

        res.json({
            success: true,
            message: 'Thank you for your message!'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
};