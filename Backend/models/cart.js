const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    selectedOptions: {
        type: Object,
        default: {},
    },
    name: { type: String, required: true }, // ✅ thêm
    image: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    variantKey: { type: String },
    price: { type: Number, required: true }, // Giá tại thời điểm thêm vào giỏ
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Mỗi user có 1 giỏ hàng duy nhất
    },
    items: [cartItemSchema],
    distance: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
});

// Mỗi lần lưu cart sẽ tự động cập nhật updatedAt
cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
// model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
