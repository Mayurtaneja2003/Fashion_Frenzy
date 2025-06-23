const User = require('../models/User');

exports.addToCart = async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id });
        if (!userData.cartData) {
            userData.cartData = {};
        }

        userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;
        await User.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: userData.cartData },
            { new: true }
        );

        res.json({
            success: true,
            message: "Added to cart",
            cartData: userData.cartData
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Failed to add to cart" });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id });
        if (!userData.cartData) {
            userData.cartData = {};
        }

        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
        }

        await User.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: userData.cartData }
        );
        
        res.json({
            success: true,
            message: "Removed from cart"
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ success: false, message: "Failed to remove from cart" });
    }
};

exports.getCartData = async (req, res) => {
    try {
        let userData = await User.findOne({_id: req.user.id});
        if (!userData || !userData.cartData) {
            return res.status(400).json({ errors: "Cart data not found" });
        }

        let validCartData = {};
        for (const itemId in userData.cartData) {
            if (!isNaN(userData.cartData[itemId]) && userData.cartData[itemId] !== null) {
                validCartData[itemId] = userData.cartData[itemId];
            } else {
                validCartData[itemId] = 0;
            }
        }
        res.json(validCartData);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, message: "Failed to fetch cart" });
    }
};