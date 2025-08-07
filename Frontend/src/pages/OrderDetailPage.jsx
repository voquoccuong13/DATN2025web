import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import Swal from 'sweetalert2';
const statusSteps = ['Đang chờ', 'Đã nhận đơn', 'Đang giao', 'Đã giao', 'Đã hủy'];
import ProductReviewForm from '../components/ProductReviewForm';
const OrderDetailPage = () => {
    const navigate = useNavigate();

    const { clearCart, addToCart, addMultipleToCart } = useContext(StoreContext);
    const { orderCode } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const backendBaseURL = 'http://backend:9000';

    const fetchOrder = async () => {
        try {
            setLoading(true);

            const res = await fetch(`/api/orders/code/${orderCode}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setOrder(data);

                if (data.paymentMethod === 'momo' && data.status === 'Đã nhận đơn') {
                    const pendingOrderCode = localStorage.getItem('pendingOrderCode');
                    if (pendingOrderCode === orderCode) {
                        console.log('✅ Xóa giỏ hàng sau khi thanh toán MoMo thành công');
                        localStorage.removeItem('pendingOrderCode');
                        localStorage.setItem(`cart_cleared_${orderCode}`, 'true');
                    }
                }
                return;
            }

            // Nếu đơn hàng chưa có, thực hiện xác nhận từ MoMo
            const query = new URLSearchParams(location.search);
            const resultCode = query.get('resultCode');
            const transId = query.get('transId');
            const signature = query.get('signature');
            const responseTime = query.get('responseTime');
            const requestId = query.get('requestId');
            const extraData = query.get('extraData');

            if (!extraData || !resultCode) {
                throw new Error('Không tìm thấy dữ liệu thanh toán MoMo');
            }

            console.log('📦 rawExtraData MoMo redirect:', extraData);

            const confirmRes = await fetch('/api/momo/momo-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    rawExtraData: extraData,
                    resultCode: Number(resultCode),
                    momoTransactionId: transId || '',
                }),
            });

            const confirmData = await confirmRes.json();
            if (!confirmRes.ok) {
                throw new Error(confirmData.message || 'Không thể lưu đơn hàng sau thanh toán');
            }

            setOrder(confirmData.order);
            localStorage.removeItem(`momo_extra_${orderCode}`);
            localStorage.removeItem('pendingOrderCode');
            localStorage.setItem(`cart_cleared_${orderCode}`, 'true');
        } catch (err) {
            console.error('❌ Lỗi fetchOrder:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderCode]);

    const handleCancelOrder = async () => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Đơn hàng sẽ bị hủy và không thể khôi phục!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Hủy đơn hàng',
            cancelButtonText: 'Giữ lại',
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`/api/orders/cancel/${orderCode}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Hủy đơn thất bại');

            setOrder(data.order);
            Swal.fire({
                icon: 'success',
                title: 'Đã hủy đơn hàng',
                text: 'Đơn hàng của bạn đã được hủy thành công.',
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: err.message,
            });
        }
    };

    const handleReorder = () => {
        if (!order || !order.cartItems) return;

        clearCart();
        setTimeout(() => {
            order.cartItems.forEach((item) => {
                const product = {
                    _id: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    selectedOptions: item.selectedOptions || {},
                };
                const variantKey = item.variantKey || '';
                const quantity = item.quantity;

                addMultipleToCart(product, variantKey, quantity);
            });

            Swal.fire({
                icon: 'success',
                title: 'Đã đặt lại đơn hàng!',
                text: 'Sản phẩm đã được thêm vào giỏ hàng mới.',
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => {
                navigate('/cart');
            }, 2000);
        }, 100);
    };

    if (loading) return <div>Đang tải đơn hàng...</div>;
    if (error) return <div>{error}</div>;
    if (!order) return <div>Không tìm thấy đơn hàng.</div>;
    const currentStatusIndex = statusSteps.indexOf(order.status);
    const canReview = order.status === 'Đã giao';

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen pt-24 px-4">
            <div className="max-w-3xl mx-auto p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-6 pb-2 border-b-2 border-pink-200">
                    Đơn hàng #{order.orderCode}
                </h2>

                {/* Thông báo trạng thái */}
                {order.paymentMethod === 'momo' && order.status === 'paid' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-400 text-green-700 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-xl">✅</span>
                            <span className="font-semibold">Thanh toán MoMo thành công!</span>
                        </div>
                        <p className="mt-1 text-sm">Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
                    </div>
                )}

                {order.paymentMethod === 'momo' && order.status === 'đang chờ' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-400 text-yellow-800 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            <span className="font-semibold">Đang chờ thanh toán MoMo...</span>
                        </div>
                        <p className="mt-1 text-sm">Vui lòng hoàn tất thanh toán để xử lý đơn hàng.</p>
                    </div>
                )}

                {/* Tiến trình đơn hàng */}
                <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-4">Tiến trình đơn hàng:</h3>
                    <div className="flex flex-wrap gap-6 items-center">
                        {statusSteps.map((step, idx) => {
                            const isOrderCancelled = order.status === 'Đã hủy';
                            const isCancelledStep = isOrderCancelled && step === 'Đã hủy';
                            const isCompleted = idx <= currentStatusIndex;

                            return (
                                <div key={idx} className="flex items-center">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 text-xs font-bold ${
                                            isCompleted
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                    >
                                        {isCompleted ? '✓' : idx + 1}
                                    </div>
                                    <span
                                        className={`text-sm ${
                                            isCancelledStep
                                                ? 'line-through text-red-500'
                                                : isCompleted
                                                ? 'text-green-700'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {step}
                                    </span>
                                    {idx < statusSteps.length - 1 && (
                                        <div
                                            className={`hidden sm:block h-1 w-8 rounded-full mx-3 ${
                                                idx < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">📋 Thông tin đơn hàng</h3>
                    <div className="grid sm:grid-cols-2 gap-4 bg-white rounded-xl p-4 shadow border border-gray-100 text-sm">
                        <div>
                            <span className="font-medium">👤 Họ tên:</span> {order.fullName}
                        </div>
                        <div>
                            <span className="font-medium">📞 SĐT:</span> {order.phone}
                        </div>
                        <div className="sm:col-span-2">
                            <span className="font-medium">📍 Địa chỉ:</span> {order.address}
                        </div>
                        <div>
                            <span className="font-medium">💳 Thanh toán:</span> {order.paymentMethod}
                        </div>
                        <div>
                            <span className="font-medium">🕒 Thời gian:</span>{' '}
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <div>
                            <span className="font-medium">🥢 Dụng cụ nhựa:</span>{' '}
                            {order.needPlasticUtensils ? 'Có' : 'Không'}
                        </div>
                        <div>
                            <span className="font-medium">📝 Ghi chú:</span> {order.note || 'Không có ghi chú'}
                        </div>
                        <div>
                            <span className="font-medium">🍱 Số món:</span>{' '}
                            {order.cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Danh sách sản phẩm bên trái */}
                    <div>
                        <h4 className="mb-3 font-semibold text-lg border-b pb-1">🧾 Sản phẩm:</h4>
                        <ul className="space-y-2">
                            {order.cartItems.slice(0, 4).map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between bg-white p-3 rounded-lg shadow border text-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                item.image.startsWith('http')
                                                    ? item.image.replace(
                                                          'https://eatgofood-web-production.up.railway.app',
                                                          'http://backend:9000',
                                                      )
                                                    : `http://backend:9000${item.image}`
                                            }
                                            alt={item.name}
                                            className="w-10 h-10 rounded border"
                                        />

                                        <span>
                                            {item.quantity} x {item.name}
                                        </span>
                                    </div>
                                    <span>{item.price.toLocaleString()}₫</span>
                                </li>
                            ))}
                        </ul>
                        {order.cartItems.length > 4 && (
                            <p className="text-sm text-gray-500 italic mt-2 text-center">
                                ...và {order.cartItems.length - 4} sản phẩm khác
                            </p>
                        )}
                    </div>

                    {/* Tổng cộng bên phải */}
                    <div>
                        <h4 className="mb-3 font-semibold text-lg border-b pb-1">💰 Thông tin thanh toán:</h4>
                        <div className="space-y-2 text-sm sm:text-base text-gray-800">
                            <div className="flex justify-between">
                                <span>Tổng tiền:</span>
                                <span>{order.total?.toLocaleString()}₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển:</span>
                                <span>{order.shippingFee?.toLocaleString()}₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Giảm giá:</span>
                                <span className="text-red-500">-{order.discountAmount?.toLocaleString()}₫</span>
                            </div>
                            <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg text-red-600">
                                <span>Tổng cộng:</span>
                                <span>{order.total?.toLocaleString()}₫</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút hành động */}
                {canReview && !showReviewForm && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:opacity-90 shadow-md"
                        >
                            Đánh giá sản phẩm trong đơn hàng
                        </button>
                    </div>
                )}

                {canReview && showReviewForm && (
                    <div className="mt-6">
                        <ProductReviewForm
                            product={order.cartItems.filter((item) => !item.hasReview)}
                            orderCode={order.orderCode}
                            onSubmitted={(productId) => {
                                setOrder((prev) => ({
                                    ...prev,
                                    cartItems: prev.cartItems.map((item) =>
                                        item.productId === productId ? { ...item, hasReview: true } : item,
                                    ),
                                }));
                            }}
                        />
                    </div>
                )}

                {order.status?.toLowerCase() === 'đang chờ' && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleCancelOrder}
                            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                        >
                            Hủy đơn hàng
                        </button>
                    </div>
                )}

                {(order.status === 'Đã giao' || order.status === 'Đã hủy') && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleReorder}
                            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 shadow"
                        >
                            Đặt lại đơn này
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;
