const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    subscriptionDate: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    preferences: {
        type: Object,
        default: {
            promotions: true,
            newsletter: true,
            productUpdates: true
        }
    }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);