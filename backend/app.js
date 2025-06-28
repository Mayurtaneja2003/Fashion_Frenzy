require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./config/db');
const path = require("path");
const auth = require('./middleware/auth');  // Add this line
const User = require('./models/User');      // Add this line
const Product = require('./models/Product'); // Import Product model
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fashion_frenzy_products', // Your folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage: storage });

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const contactRoutes = require('./routes/contact');
const subscriptionRoutes = require('./routes/subscription');
const analyticsRoutes = require('./routes/analytics');
const addressRoutes = require('./routes/address');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow both frontend and admin
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
}));

// Static files
app.use("/assets", express.static(path.join(__dirname, "../frontend/src/components/assets")));
app.use('/images', express.static('upload/images'));
app.use('/products', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);  
app.use('/api/orders', orderRoutes);
app.use('/api', cartRoutes);     
app.use('/api/contact', contactRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/address', addressRoutes);

// Add this route for cart data
app.get('/getcart', auth, async (req, res) => {
    try {
        const userData = await User.findOne({_id: req.user.id});
        res.json(userData.cartData || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this route for testing
app.get('/api/test', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({ status: 'ok', message: 'Database connection successful' });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Add this route specifically for new collections
app.get('/newcollections', async (req, res) => {
    try {
        const newCollections = await mongoose.connection.db.collection('new_collections').find({}).toArray();
        res.json(newCollections);
    } catch (error) {
        console.error('Error fetching new collections:', error);
        res.status(500).json({ error: error.message });
    }
});

// Replace your upload route:
app.post('/upload', upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, image_url: req.file.path });
});

// Add this error handler after all routes:
app.use((err, req, res, next) => {
  console.error('Upload error:', err);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

// Database connection
connectDB();

// Database connection with error handling
mongoose.connect(process.env.MONGODB_URI)
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

app.listen(port, (error) => {
    if (error) {
        console.error("Server failed to start:", error);
    }
});