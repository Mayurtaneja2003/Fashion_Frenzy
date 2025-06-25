const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utilis/email');

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Send confirmation to user
        await sendEmail({
            to: email,
            subject: 'Thank you for contacting Fashion Frenzy',
            template: 'contactConfirmation',
            data: { name, subject, message }
        });

        // Notify admin
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `New Contact Message: ${subject}`,
            template: 'contactConfirmation',
            data: { name, subject, message }
        });

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

module.exports = router;