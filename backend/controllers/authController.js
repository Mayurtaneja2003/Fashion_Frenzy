const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
            password: req.body.password,
            cartData: cart
        });
        await user.save();

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
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        let user = await User.findOne({email: req.body.email});
        if(!user) {
            return res.json({
                success: false,
                errors: "Wrong Email ID"
            });
        }

        const passCompare = user.password === req.body.password;
        if(!passCompare) {
            return res.json({
                success: false,
                errors: "Wrong password"
            });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(data, process.env.JWT_SECRET);
        res.json({
            success: true,
            message: "User logged in successfully",
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};