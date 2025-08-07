// routes/products.js
const express = require('express');
const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');
const Order = require('../models/order');
const router = express.Router();
const { adminProtect, isAdmin } = require('../middleware/authMiddleware');
const BASE_URL = process.env.BASE_URL || 'http://localhost:9000';

// Cấu hình multer để lưu ảnh vào thư mục uploads và đặt tên file duy nhất
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({ storage });

// [GET] Lấy danh sách sản phẩm api/product
router.get('/', async (req, res) => {
    try {
        const { mainCategory } = req.query;
        const filter = mainCategory ? { mainCategory } : {};
        const products = await Product.find(filter);
        res.json(products);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// [POST] Tạo sản phẩm mới api/product
router.post('/', adminProtect, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, category, mainCategory, price, priceOld, deal, options } = req.body;

        const imageUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : '';

        let parsedOptions = [];
        if (options) {
            try {
                parsedOptions = JSON.parse(options);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Options không hợp lệ!' });
            }
        }
        const product = new Product({
            name,
            priceOld,
            deal,
            description,
            category,
            mainCategory,
            price,
            image: imageUrl,
            options: parsedOptions,
        });

        const saved = await product.save();
        res.status(201).json({ success: true, product: saved });
    } catch (err) {
        console.error('Lỗi khi tạo sản phẩm:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
router.put('/:id', adminProtect, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // 👇 Nếu options là string thì parse lại
        if (updateData.options && typeof updateData.options === 'string') {
            try {
                updateData.options = JSON.parse(updateData.options);
            } catch (parseErr) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể phân tích options. Dữ liệu không hợp lệ.',
                });
            }
        }

        // 👇 Nếu có file ảnh mới thì cập nhật đường dẫn ảnh
        if (req.file) {
            updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // 👇 Cập nhật sản phẩm
        const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        res.json({ success: true, product: updated });
    } catch (err) {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// [DELETE] Xóa sản phẩm theo ID
router.delete('/:id', adminProtect, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});
// [GET] /api/products/search?keyword=...
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';

        const regex = new RegExp(keyword, 'i'); // không phân biệt hoa thường
        const products = await Product.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                { category: { $regex: regex } },
                { mainCategory: { $regex: regex } },
            ],
        });

        res.json(products);
    } catch (err) {
        console.error('Lỗi tìm kiếm sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server khi tìm kiếm' });
    }
});
// route để lấy top sản phẩm bán chạy
    router.get('/top-selling', async (req, res) => {
        try {
            const topProducts = await Order.aggregate([
                { $match: { status: 'Đã giao' } },
                { $unwind: '$cartItems' },
                {
                    $group: {
                        _id: '$cartItems.productId',
                        totalQuantity: { $sum: '$cartItems.quantity' },
                    },
                },
                {
                    $lookup: {
                        from: 'products', // Tên collection đúng trong MongoDB
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productInfo',
                    },
                },
                { $unwind: '$productInfo' },
                {
                    $project: {
                        _id: '$productInfo._id',
                        name: '$productInfo.name',
                        image: '$productInfo.image',
                        description: '$productInfo.description',
                        price: '$productInfo.price',
                        totalQuantity: 1,
                    },
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 4 },
            ]);

            res.json({ success: true, data: topProducts });
        } catch (err) {
            console.error('❌ Lỗi khi lấy top sản phẩm:', err);
            res.status(500).json({ success: false, message: 'Lỗi server khi thống kê món bán chạy' });
        }
    });
// [GET] /api/products/new
// Lấy 8 sản phẩm mới nhất
router.get('/new', async (req, res) => {
    try {
        const newProducts = await Product.find().sort({ createdAt: -1 }).limit(8);
        res.json({ success: true, products: newProducts });
    } catch (err) {
        console.error('❌ Lỗi khi lấy sản phẩm mới:', err);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy sản phẩm mới' });
    }
});

// [GET] /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.json(product);
    } catch (err) {
        console.error('Lỗi lấy chi tiết sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
