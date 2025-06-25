const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all addresses
router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ addresses: user.savedAddresses || [] });
});

// Add or update address
router.post('/', auth, async (req, res) => {
    const { category, address, city, state, zipCode, phone, name, default: isDefault, saved } = req.body;
    if (!category || !address) return res.status(400).json({ success: false, message: 'Category and address required' });

    const user = await User.findById(req.user.id);

    // Remove existing address with same category
    user.savedAddresses = (user.savedAddresses || []).filter(a => a.category !== category);

    // If setting as default, unset default from others
    if (isDefault) {
        user.savedAddresses.forEach(a => a.default = false);
    }

    // Add new address
    user.savedAddresses.push({ category, address, city, state, zipCode, phone, name, default: !!isDefault, saved: !!saved });

    // Limit to 3 categories
    user.savedAddresses = user.savedAddresses.slice(-3);
    await user.save();
    res.json({ success: true, addresses: user.savedAddresses });
});

// Delete address by category
router.delete('/:category', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    user.savedAddresses = (user.savedAddresses || []).filter(a => a.category !== req.params.category);
    await user.save();
    res.json({ success: true, addresses: user.savedAddresses });
});

module.exports = router;