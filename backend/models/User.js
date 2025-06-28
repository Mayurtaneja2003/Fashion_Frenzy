const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Add a method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Users', userSchema);