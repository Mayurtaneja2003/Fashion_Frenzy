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
    origin: [
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'auth-token', 'Access-Control-Allow-Credentials']
}));

// Static files
app.use("/assets", express.static(path.join(__dirname, "../frontend/src/components/assets")));
app.use('/images', express.static('upload/images'));
app.use('/products', express.static('uploads'));

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './upload/images';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

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
        console.log('Fetching new collections');
        // Use the specific new_collections collection
        const newCollections = await mongoose.connection.db.collection('new_collections').find({}).toArray();
        console.log(`Found ${newCollections.length} items in new collections`);
        res.json(newCollections);
    } catch (error) {
        console.error('Error fetching new collections:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/upload', upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const image_url = `http://localhost:4000/images/${req.file.filename}`;
    res.json({ success: true, image_url });
});

// Example for /subscribe
// app.post('/subscribe', async (req, res) => {
//     // handle newsletter subscription logic here
//     res.json({ success: true });
// });

// // Example for /contact
// app.post('/contact', async (req, res) => {
//     // handle contact form logic here
//     res.json({ success: true });
// });

// Database connection
connectDB();

// Database connection with error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Test query to check if we can fetch products
        return Product.find({}).limit(1);
    })
    .then(products => {
        console.log('Test query result:', products);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});