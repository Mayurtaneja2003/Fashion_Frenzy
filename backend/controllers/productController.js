// filepath: d:\project\fashion_frenzy\backend\controllers\productController.js
const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.json(products);
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category.toLowerCase();
        
        const products = await Product.find({
            category: { $regex: new RegExp(`^${category}$`, 'i') }
        }).lean();
    
        res.json(products);
    } catch (error) {
        console.error("Error fetching category products:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
       
        const product = await Product.findOne({ id: productId });
       
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPopularProducts = async (req, res) => {
    try {
        const category = req.params.category || 'women';
       
        const products = await Product.find({ 
            category: { $regex: new RegExp(`^${category}$`, 'i') }
        })
        .sort({ 'new_price': -1 })
        .limit(4)
        .lean();
        
       res.json(products);
    } catch (error) {
        console.error("Error fetching popular products:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getNewCollection = async (req, res) => {
    try {
        const category = req.params.category || 'women';
        
        const products = await Product.find({ 
            category: { $regex: new RegExp(`^${category}$`, 'i') }
        })
        .sort({ date: -1 })
        .limit(8)
        .lean();
        
        res.json(products);
    } catch (error) {
        console.error("Error fetching new collection:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, product: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};