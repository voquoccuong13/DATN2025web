const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/productModel');
const { protect } = require('../middleware/authMiddleware');

// POST /api/users/cart - lưu giỏ hàng
router.post('/cart', protect, async (req, res) => {
    try {
        const { cartItems } = req.body;

        if (!Array.isArray(cartItems)) {
            return res.status(400).json({ message: 'Cart items phải là mảng' });
        }

        const enrichedItems = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            enrichedItems.push({
                productId: item.productId,
                quantity: item.quantity || 1,
                variantKey: item.variantKey || '',
                selectedOptions: item.selectedOptions || {},
                price: product.price,
                name: product.name,
                image: product.image,
            });
        }

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { items: enrichedItems } },
            { new: true, upsert: true },
        );

        res.json({ message: 'Lưu giỏ hàng thành công', cart: updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lưu giỏ hàng' });
    }
});

// GET /api/users/cart - lấy giỏ hàng
router.get('/cart', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

        if (!cart) {
            return res.json({ items: [] }); // ✅ Sửa chỗ này
        }

        res.json(cart);
    } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng' });
    }
});

module.exports = router;
