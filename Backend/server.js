const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const userRoute = require('./routes/userRoute');
const cartRoute = require('./routes/cartRoute');
const oderRoute = require('./routes/oderRoute');
const momoRoute = require('./routes/momoRoute');
const reportRoute = require('./routes/reportRoute');
const promotionRoute = require('./routes/promotionRoute');
const reviewRoute = require('./routes/reviewRoute');
const promotionDisRoute = require('./routes/promotionDisRoute'); // Đường dẫn mới cho mã giảm giá
const chatbotRoute = require('./routes/chatbotRoute');
const vnpayRoute = require('./routes/vnpayRoute');
const { connectDB } = require('./config/db');

dotenv.config();
const app = express();

// Middleware toàn cục
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const productRoutes = require('./routes/productRoute');

// API routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoute);
app.use('/api/users', cartRoute); // route giỏ hàng
console.log('✅ Gắn route [cartRoute] tại /api/users');
app.use('/api/orders', oderRoute);

app.use('/api/momo', momoRoute);
app.use('/api/vnpay', vnpayRoute);

app.use('/api/promotion', promotionRoute);
//api doanh thu
app.use('/api/admin', reportRoute);
//api đánh giá
app.use('/api/reviews', reviewRoute);
// API mã giảm giá
app.use('/api/promotion-discounts', promotionDisRoute);
// Route trang chính
app.get('/', (req, res) => {
    res.send('API is running...');
});
// ROU CHO CHATBOT
app.use('/api/chatbot', chatbotRoute);
// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
});

// Kết nối DB rồi mới listen server
connectDB()
    .then(() => {
        console.log('✅ Đã kết nối MongoDB');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy trên cổng http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối MongoDB', err);
    });
