import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getSubtotal, getDiscountAmount, calculateShippingFee, getTotal } from '../components/MapUtil';

const Cart = () => {
    const {
        cartItem,
        removeFromCart,
        updateQuantity,
        clearCart: contextClearCart,
        saveOrderInfo,
        orderInfo, // Thêm orderInfo để lấy dữ liệu đã lưu
    } = useContext(StoreContext);
    const navigate = useNavigate();

    // --- State ---
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [shippingMethod, setShippingMethod] = useState('delivery');
    const { note, setNote } = useContext(StoreContext);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

    // Khôi phục dữ liệu từ orderInfo khi component load
    useEffect(() => {
        if (orderInfo) {
            setNote(orderInfo.note || '');
            setShippingMethod(orderInfo.shippingMethod || 'delivery');
            setPaymentMethod(orderInfo.paymentMethod || 'cash');
            setCoupon(orderInfo.coupon || '');
            setDiscount(orderInfo.discountRate || 0);
        }
    }, [orderInfo]);

    // --- Xử lý thay đổi ghi chú với debounce ---
    const [noteTimeout, setNoteTimeout] = useState(null);

    const handleNoteChange = (e) => {
        const newNote = e.target.value;
        setNote(newNote);

        // Clear timeout cũ
        if (noteTimeout) {
            clearTimeout(noteTimeout);
        }

        // Set timeout mới để auto-save sau 1 giây
        const timeout = setTimeout(() => {
            saveOrderInfo({
                shippingMethod,
                note: newNote,
                paymentMethod,
                coupon: coupon,
                discountRate: discount,
            });
        }, 1000);

        setNoteTimeout(timeout);
    };

    // Cleanup timeout khi component unmount
    useEffect(() => {
        return () => {
            if (noteTimeout) {
                clearTimeout(noteTimeout);
            }
        };
    }, [noteTimeout]);

    // --- Xử lý số lượng sản phẩm ---
    const handleQuantityChange = (itemId, newQty) => {
        const qty = parseInt(newQty);
        if (!isNaN(qty) && qty >= 0) {
            updateQuantity(itemId, qty);
        }
    };

    const handleClearCart = () => {
        contextClearCart();
        setShowClearCartConfirm(false);
    };

    const getSubtotal = () => {
        return Object.values(cartItem).reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // --- Áp dụng mã giảm giá ---
    const handleApplyCoupon = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            Swal.fire('Lỗi', 'Bạn cần đăng nhập để sử dụng mã giảm giá', 'warning');
            return;
        }

        try {
            console.log('🎫 Gửi mã:', coupon);
            const res = await axios.post(
                '/api/promotion-discounts/validate',
                { code: coupon.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const discountPercent = res.data.discount;
            console.log('✅ Nhận discount:', discountPercent);
            setDiscount(discountPercent / 100);

            Swal.fire('Thành công', `Áp dụng mã ${coupon.toUpperCase()} (-${discountPercent}%)`, 'success');
        } catch (err) {
            console.error('❌ Lỗi kiểm tra mã:', err);
            const msg = err.response?.data?.message || 'Không thể kiểm tra mã giảm giá';
            Swal.fire('Không hợp lệ', msg, 'error');
            setDiscount(0);
        }
    };

    // --- Thanh toán / Tiếp tục đến trang đặt hàng ---
    const handleCheckout = () => {
        // Validate ghi chú (nếu cần)
        if (note.length > 500) {
            Swal.fire('Lỗi', 'Ghi chú không được vượt quá 500 ký tự', 'warning');
            return;
        }

        // Clear timeout để đảm bảo ghi chú được lưu ngay lập tức
        if (noteTimeout) {
            clearTimeout(noteTimeout);
        }

        // Lưu thông tin đơn hàng
        saveOrderInfo({
            shippingMethod,
            note: note.trim(), // Trim whitespace
            paymentMethod,
            coupon: coupon,
            discountRate: discount,
        });

        console.log('📝 Ghi chú được lưu:', note.trim());
        navigate('/order');
    };

    // --- Xác nhận xóa giỏ hàng ---
    const handleConfirmClearCart = () => {
        Swal.fire({
            title: 'Xóa giỏ hàng?',
            text: 'Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa tất cả',
            cancelButtonText: 'Hủy',
            width: 300,
        }).then((result) => {
            if (result.isConfirmed) {
                contextClearCart();
                // Reset ghi chú khi xóa giỏ hàng
                setNote('');
                Swal.fire({
                    title: 'Đã xóa!',
                    text: 'Giỏ hàng của bạn đã được xóa.',
                    icon: 'success',
                    width: 300,
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    // --- Tính toán giá ---
    const subtotal = getSubtotal(cartItem);
    const discountAmount = getDiscountAmount(subtotal, discount);
    const total = subtotal - discountAmount;

    return (
        <div className="p-6 pt-28 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-primary">Giỏ hàng của bạn</h2>

            {subtotal === 0 ? (
                <p className="text-gray-500">Giỏ hàng đang trống.</p>
            ) : (
                <>
                    {/* Header cho desktop */}
                    <div className="hidden md:grid grid-cols-6 font-bold border-b py-2 text-gray-700 text-sm">
                        <p>Sản phẩm</p>
                        <p>Tên</p>
                        <p>Giá</p>
                        <p>Số lượng</p>
                        <p>Tổng</p>
                        <p>Xóa</p>
                    </div>

                    {/* Danh sách sản phẩm */}
                    {Object.entries(cartItem).map(([itemId, itemData]) => {
                        if ((itemData.quantity || 0) <= 0) return null;

                        return (
                            <div key={itemId} className="grid md:grid-cols-6 grid-cols-1 border-b py-4 text-sm gap-2">
                                {/* Sản phẩm */}
                                <div className="flex items-center gap-2">
                                    <span className="font-medium md:hidden w-24">Sản phẩm:</span>
                                    <img
                                        src={itemData.image}
                                        alt={itemData.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                </div>

                                {/* Tên */}
                                <div className="flex items-center md:block">
                                    <span className="font-medium md:hidden w-24">Tên:</span>
                                    <p>{itemData.name}</p>
                                    {itemData.selectedOptions &&
                                        Object.entries(itemData.selectedOptions).map(([optionName, choices]) => (
                                            <div key={optionName} className="text-gray-500 text-xs">
                                                {optionName}:{' '}
                                                {choices
                                                    .map((c) => `${c.label} (+${c.price.toLocaleString()}₫)`)
                                                    .join(', ')}
                                            </div>
                                        ))}
                                </div>

                                {/* Giá */}
                                <div className="flex items-center md:block">
                                    <span className="font-medium md:hidden w-24">Giá:</span>
                                    <p>
                                        {itemData.price?.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }) || '0 ₫'}
                                    </p>
                                </div>

                                {/* Số lượng */}
                                <div className="flex items-center md:block">
                                    <span className="font-medium md:hidden w-24">Số lượng:</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(itemId, itemData.quantity - 1)}
                                            disabled={itemData.quantity <= 0}
                                            className="rounded px-2 py-1 border hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{itemData.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(itemId, itemData.quantity + 1)}
                                            className="rounded px-2 py-1 border hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Tổng */}
                                <div className="flex items-center md:block">
                                    <span className="font-medium md:hidden w-24">Tổng:</span>
                                    <p>
                                        {(itemData.price * itemData.quantity).toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </p>
                                </div>

                                {/* Xóa */}
                                <div className="flex items-center md:block">
                                    <span className="font-medium md:hidden w-24">Xóa:</span>
                                    <button
                                        onClick={() => removeFromCart(itemId)}
                                        className="text-red-500 hover:underline hover:text-red-700"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-4 text-right">
                        <button onClick={handleConfirmClearCart} className="text-red-600 hover:underline text-sm">
                            Xóa tất cả sản phẩm
                        </button>
                    </div>

                    {/* Mã khuyến mãi */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            placeholder="Nhập mã giảm giá"
                            className="border px-3 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90"
                            disabled={!coupon.trim()}
                        >
                            Áp dụng mã
                        </button>
                    </div>

                    {/* Phương thức vận chuyển và tổng tiền */}
                    <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
                        {/* Phương thức vận chuyển */}
                        <div className="space-y-2 w-full md:w-1/2">
                            <p className="font-semibold">Phương thức vận chuyển:</p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="shipping"
                                    value="pickup"
                                    checked={shippingMethod === 'pickup'}
                                    onChange={() => setShippingMethod('pickup')}
                                />
                                <span>Lấy tại cửa hàng (miễn phí)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="shipping"
                                    value="delivery"
                                    checked={shippingMethod === 'delivery'}
                                    onChange={() => setShippingMethod('delivery')}
                                />
                                <span>Giao hàng tận nơi</span>
                            </label>
                        </div>

                        {/* Tổng tiền */}
                        <div className="border-t pt-4 text-right w-full md:w-1/2 space-y-2 text-sm md:text-base">
                            <p>
                                Tổng sản phẩm:{' '}
                                <span className="font-semibold">
                                    {subtotal.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </span>
                            </p>
                            {discount > 0 && (
                                <p>
                                    Giảm giá:{' '}
                                    <span className="text-green-600 font-semibold">
                                        -{' '}
                                        {discountAmount.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </span>
                                </p>
                            )}
                            <p className="text-lg font-bold">
                                Tổng thanh toán:{' '}
                                <span className="text-red-600">
                                    {total.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </span>
                            </p>
                            <div className="text-right mt-6">
                                <button
                                    onClick={handleCheckout}
                                    className="bg-primary text-white px-6 py-3 rounded text-sm md:text-base hover:opacity-90 disabled:opacity-50"
                                    disabled={subtotal === 0}
                                >
                                    Tiến hành đặt hàng
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú đơn hàng - CẢI TIẾN */}
                    <div className="pt-5 border-t mt-5">
                        <div className="mb-2">
                            <p className="font-semibold">Ghi chú đơn hàng:</p>
                            <span className={`text-sm ${note.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                                {note.length}/500 ký tự
                            </span>
                        </div>
                        <textarea
                            className="w-full md:w-2/3 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            rows={4}
                            placeholder="Ví dụ: Giao sau 18h, không lấy nước đá, gọi trước khi giao..."
                            value={note}
                            onChange={handleNoteChange}
                            maxLength={500}
                        />
                        <div className="mt-2 text-xs text-gray-500">💡 Ghi chú sẽ được lưu tự động sau 1 giây</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
