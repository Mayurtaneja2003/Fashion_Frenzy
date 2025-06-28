const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../utilis/email');

exports.signup = async (req, res) => {
    try {
        let check = await User.findOne({email: req.body.email});
        if(check) {
            return res.status(400).json({
                success: false,
                errors: "User already exists"
            });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new User({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password, // <-- plain, let pre-save hook hash it
            cartData: cart
        });
        await user.save();

        // Send welcome email to user
        // await sendEmail({
        //     to: user.email,
        //     subject: 'Welcome to Fashion Frenzy!',
        //     template: 'newsletterWelcome',
        //     data: { email: user.email }
        // });

        // Send signup email
        await sendEmail({
            to: user.email,
            subject: 'Welcome to Fashion Frenzy!',
            template: 'signupNotification',
            data: { name: user.name, email: user.email } // <-- pass name here
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(data, process.env.JWT_SECRET);
        res.json({
            success: true,
            message: "User registered successfully",
            token: token
        });
    } catch (error) {
        console.error("Signup error:", error); // Add this for debugging
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Send login email
        await sendEmail({
            to: user.email,
            subject: 'Login Notification - Fashion Frenzy',
            template: 'loginNotification',
            data: { name: user.name, email: user.email }
        });

        // Create JWT token
        const data = { user: { id: user.id } };
        const token = jwt.sign(data, process.env.JWT_SECRET);

        // Return token and user info
        res.json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};