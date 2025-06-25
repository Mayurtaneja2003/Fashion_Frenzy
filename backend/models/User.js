const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Object,
        default: {}
    },
    date: {
        type: Date,
        default: Date.now
    },
    orderCount: {
        type: Number,
        default: 0
    },
    savedAddresses: [
        {
            category: { type: String, enum: ['home', 'office', 'other'], required: true },
            address: { type: String, required: true },
            city: String,
            state: String,
            zipCode: String,
            phone: String,
            name: String,
            default: { type: Boolean, default: false },
            saved: { type: Boolean, default: false } // <-- add this
        }
    ]
});

module.exports = mongoose.model('Users', userSchema);