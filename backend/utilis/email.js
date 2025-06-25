const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const templates = {
    contactConfirmation: (data) => ({
        subject: 'Thank you for contacting Fashion Frenzy',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank you for reaching out!</h2>
                <p>Dear ${data.name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Your message details:</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Message:</strong> ${data.message}</p>
                <p>Best regards,<br>Fashion Frenzy Team</p>
            </div>
        `
    }),
    newsletterWelcome: (data) => ({
        subject: 'Welcome to Fashion Frenzy Newsletter!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Fashion Frenzy!</h2>
                <p>Thank you for subscribing to our newsletter.</p>
                <p>You'll now receive exclusive offers, latest fashion updates, and special discounts directly in your inbox.</p>
                <p>Stay stylish!</p>
                <p>Best regards,<br>Fashion Frenzy Team</p>
            </div>
        `
    }),
    orderConfirmation: (data) => ({
        subject: 'Order Confirmation - Fashion Frenzy',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank you for your order, ${data.name}!</h2>
                <p>Your order <strong>#${data.orderNumber}</strong> has been placed successfully.</p>
                <p><strong>Order Details:</strong></p>
                <ul>
                    ${data.items.map(item => `<li>${item.name} (Size: ${item.size}) x ${item.quantity} - $${item.price}</li>`).join('')}
                </ul>
                <p><strong>Total:</strong> $${data.total}</p>
                <p>We will notify you when your order is shipped.</p>
                <p>Best regards,<br>Fashion Frenzy Team</p>
            </div>
        `
    }),
    loginNotification: (data) => ({
        subject: 'Login Notification - Fashion Frenzy',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hello ${data.name},</h2>
                <p>Your account was just logged in. If this wasn't you, please reset your password immediately.</p>
                <p>Best regards,<br>Fashion Frenzy Team</p>
            </div>
        `
    })
};

exports.sendEmail = async ({ to, subject, template, data }) => {
    try {
        const emailTemplate = templates[template](data);
        await transporter.sendMail({
            from: `"Fashion Frenzy" <${process.env.EMAIL_USER}>`,
            to,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};