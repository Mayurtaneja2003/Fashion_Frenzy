const Order = require('../models/Order');

exports.getAnalytics = async (req, res) => {
    try {
        // Example: filter by period (today, week, month, year)
        // You can expand this logic as needed
        let match = {};
        const now = new Date();
        if (req.params.period === 'today') {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            match.date = { $gte: start };
        } else if (req.params.period === 'week') {
            const start = new Date(now.setDate(now.getDate() - 7));
            match.date = { $gte: start };
        } else if (req.params.period === 'month') {
            const start = new Date(now.setMonth(now.getMonth() - 1));
            match.date = { $gte: start };
        } else if (req.params.period === 'year') {
            const start = new Date(now.setFullYear(now.getFullYear() - 1));
            match.date = { $gte: start };
        }

        const orders = await Order.find(match);

        // Example analytics
        const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalOrders = orders.length;
        const categoryData = { women: 0, men: 0, kid: 0 };
        const sizeData = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
        const priceRanges = [
            { min: 0, max: 50, count: 0 },
            { min: 51, max: 100, count: 0 },
            { min: 101, max: 200, count: 0 },
            { min: 201, max: 10000, count: 0 }
        ];

        orders.forEach(order => {
            order.items.forEach(item => {
                if (categoryData[item.category]) categoryData[item.category]++;
                // Fix: Only increment if size is valid
                if (item.size && sizeData.hasOwnProperty(item.size)) sizeData[item.size]++;
                const price = item.price * item.quantity;
                for (const range of priceRanges) {
                    if (price >= range.min && price <= range.max) {
                        range.count++;
                        break;
                    }
                }
            });
        });

        res.json({
            totalSales,
            totalOrders,
            categoryData,
            sizeData,
            priceRanges
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: error.message });
    }
};