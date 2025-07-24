const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const sendEmail = require('../utils/sendEmail');
const { nanoid } = require('nanoid');
const path = require('path');
const { protect, isAdmin } = require('../middleware/authMiddleware');

//
const orderConfirmationMessage = (order) => {
    const orderDetailUrl = `${process.env.FRONTEND_URL}/order/${order.orderCode}`;

    return `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <div style="text-align: center;">
      <img src="cid:logo_cid" alt="Logo" style="max-width: 120px;" />

      <h2 style="color: #d63b3b;">Cảm ơn bạn đã đặt hàng!</h2>
    </div>

    <p>Xin chào <strong>${order.fullName}</strong>,</p>
    <p>Chúng tôi đã nhận được đơn hàng của bạn với mã đơn:</p>
    <h3 style="color: #333;">#${order.orderCode}</h3>

    <p><strong>Thông tin giao hàng:</strong></p>
    <ul style="list-style: none; padding: 0;">
      <li>📍 <strong>Địa chỉ:</strong> ${order.address}</li>
      <li>📞 <strong>Số điện thoại:</strong> ${order.phone}</li>
      <li>💳 <strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</li>
      <li>🥢 <strong>Dụng cụ nhựa:</strong> ${order.needPlasticUtensils ? 'Có' : 'Không'}</li>
    </ul>

    <h4>Sản phẩm đã đặt:</h4>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="border-bottom: 1px solid #ddd;">
          <th align="left">Tên</th>
          <th align="right">SL</th>
          <th align="right">Giá</th>
        </tr>
      </thead>
      <tbody>
        ${order.cartItems
            .map(
                (item) => `
            <tr>
              <td>${item.name}</td>
              <td align="right">${item.quantity}</td>
              <td align="right">${item.price.toLocaleString()}₫</td>
            </tr>`,
            )
            .join('')}
      </tbody>
    </table>

    <div style="margin: 20px 0; border-top: 1px solid #ccc; padding-top: 10px;">
      <p><strong>Tạm tính:</strong> ${order.subtotal.toLocaleString()}₫</p>
      <p><strong>Phí vận chuyển:</strong> ${order.shippingFee.toLocaleString()}₫</p>
      <p><strong>Giảm giá:</strong> -${order.discountAmount.toLocaleString()}₫</p>
      <p><strong>Thời gian đặt:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p style="font-size: 17px; color: #d63b3b;"><strong>Tổng cộng: ${order.total.toLocaleString()}₫</strong></p>


    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${orderDetailUrl}" style="background: #d63b3b; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px;">
        Xem chi tiết đơn hàng
      </a>
    </div>

    <p style="color: #666;">Nếu bạn có bất kỳ câu hỏi nào, xin đừng ngần ngại liên hệ với chúng tôi.</p>
    <p style="color: #555;">Trân trọng,<br />Đội ngũ Eatgo Web</p>
  </div>
  `;
};

// POST /api/orders - tạo đơn hàng mới
router.post('/', protect, async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            address,
            distance,
            needPlasticUtensils,
            paymentMethod, // raw từ frontend, ví dụ: 'Tiền mặt' hoặc 'MoMo'
            cartItems,
            subtotal,
            shippingFee,
            discountAmount,
            total,
            note,
        } = req.body;
        if (!fullName || !email || !phone || !address || distance == null || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
        }
        //  Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ.' });
        }

        // Kiểm tra định dạng số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84, đủ 10 số)
        const phoneRegex = /^(0|\+84)(\d{9})$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
        }

        // Map paymentMethod từ frontend sang giá trị enum backend
        const paymentMethodMap = {
            'Tiền mặt': 'cash',
            MoMo: 'momo',
        };
        const mappedPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod;

        const orderCode = nanoid(8);
        const order = new Order({
            user: req.user.id,
            orderCode, // gán mã đơn hàng ngắn
            fullName,
            email,
            phone,
            address,
            distance,
            needPlasticUtensils,
            paymentMethod: mappedPaymentMethod, // sử dụng giá trị đã map
            cartItems,
            subtotal,
            shippingFee,
            discountAmount,
            total,
            note,
        });

        const savedOrder = await order.save();

        // Gửi email xác nhận
        const message = orderConfirmationMessage(savedOrder);
        await sendEmail(email, 'Xác nhận đơn hàng từ Eatgo', message, [
            {
                filename: 'favicon.png',
                path: path.join(__dirname, '../uploads/assets/favicon.png'),
                cid: 'logo_cid',
            },
        ]);

        res.status(201).json({
            message: 'Đặt hàng thành công',
            orderId: savedOrder._id,
            orderCode: savedOrder.orderCode,
        });
    } catch (error) {
        console.error('Lỗi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// GET /api/orders/code/:orderCode - lấy đơn hàng theo mã có admin
router.get('/code/:orderCode', async (req, res) => {
    try {
        const order = await Order.findOne({ orderCode: req.params.orderCode });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        res.json(order);
    } catch (error) {
        console.error('Lỗi lấy đơn hàng theo mã:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// GET /api/orders - Lấy tất cả đơn hàng (admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Lỗi lấy danh sách đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
//
// PUT /api/admin/orders/:id/status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// PATCH /api/orders/cancel/:orderCode
// người dùng hủy đơn
router.patch('/cancel/:orderCode', async (req, res) => {
    try {
        const order = await Order.findOne({ orderCode: req.params.orderCode });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        console.log('Current order.status:', order.status);
        if (order.status !== 'Đang chờ') {
            return res.status(400).json({ message: 'Chỉ có thể hủy đơn khi đơn hàng đang chờ xử lý.' });
        }

        // Cập nhật trạng thái và thời gian hủy
        order.status = 'Đã hủy';
        order.canceledAt = new Date();

        //  In log tất cả các field để kiểm tra
        console.log('Order chuẩn bị lưu:', order.toObject());

        const saved = await order.save();

        res.json({ message: 'Đơn hàng đã được hủy thành công', order: saved });
    } catch (err) {
        console.error('❌ Lỗi khi hủy đơn:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý hủy đơn hàng', error: err.message });
    }
});
// @desc    Tìm kiếm đơn hàng
// @route   GET /api/orders/search?keyword=abc
// @access  Private (admin)
router.get('/search', protect, isAdmin, async (req, res) => {
    try {
        const keyword = req.query.keyword || '';

        // Tìm theo orderCode hoặc fullName (không phân biệt hoa thường)
        const orders = await Order.find({
            $or: [{ orderCode: { $regex: keyword, $options: 'i' } }, { fullName: { $regex: keyword, $options: 'i' } }],
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi tìm kiếm đơn hàng' });
    }
});

// Admin hủy đơn
// router.patch('/admin/cancel/:orderCode', protect, async (req, res) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ message: 'Bạn không có quyền thực hiện' });
//     }

//     try {
//         const order = await Order.findOne({ orderCode: req.params.orderCode });
//         if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

//         if (order.status === 'đã hủy' || order.status === 'hoàn tất') {
//             return res.status(400).json({ message: 'Không thể hủy đơn đã hoàn tất hoặc đã hủy' });
//         }

//         order.status = 'đã hủy';
//         order.canceledAt = new Date();
//         await order.save();

//         return res.json({ message: 'Admin đã hủy đơn hàng thành công', order });
//     } catch (err) {
//         res.status(500).json({ message: 'Lỗi server', error: err });
//     }
// });

module.exports = router;
