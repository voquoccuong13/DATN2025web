import axios from 'axios';
import { useState, useContext } from 'react';
import { SendHorizonal } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

function ChatBox() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [mainProduct, setMainProduct] = useState(null);
    const [suggestProducts, setSuggestProducts] = useState([]);
    const [suggestDrink, setSuggestDrink] = useState(null);
    const [suggestDessert, setSuggestDessert] = useState(null);
    const [orderActions, setOrderActions] = useState([]);
    const { addToCart } = useContext(StoreContext);

    const handleAsk = async () => {
        if (!question.trim()) return;
        setLoading(true);
        setAnswer('');
        setMainProduct(null);
        setSuggestProducts([]);
        setSuggestDrink(null);
        setSuggestDessert(null);
        setOrderActions([]);

        try {
            const res = await axios.post('/api/chatbot/ask', { question });

            const data = res.data;

            setAnswer(typeof data.reply === 'string' ? data.reply : '');
            setMainProduct(data.mainProduct ? { ...data.mainProduct } : null);

            setSuggestProducts(Array.isArray(data.suggestProduct) ? data.suggestProduct : []);
            setSuggestDrink(data.suggestDrink || null);
            setSuggestDessert(data.suggestDessert || null);
            setOrderActions(data.orderActions || []);
            console.log('🔥 mainProduct:', data.mainProduct);
        } catch (error) {
            console.error('Lỗi gọi API:', error);
            setAnswer('Xin lỗi, hệ thống đang gặp sự cố.');
        }

        setLoading(false);
    };

    const handleAddToCart = (product) => {
        if (product) {
            console.log('🛒 Thêm vào giỏ:', product.name);
            addToCart(product);
        }
    };

    const renderProductCard = (product, label) => {
        console.log('🧪 Đang render product:', product);

        if (!product) return null;
        return (
            <div className="p-2 border rounded-md mb-2 flex gap-3">
                <img
                    src={product.image || '/no-image.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                    <div className="font-semibold text-sm">
                        {label}: {product.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">{product.description}</div>
                    <div className="text-red-500 font-medium mb-1">Giá: {product.price?.toLocaleString('vi-VN')}đ</div>
                    <button
                        onClick={() => handleAddToCart(product)}
                        className="text-white bg-primary px-2 py-1 text-xs rounded"
                    >
                        <i className="ri-add-line ri-lg"></i> Đặt hàng
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col hide-scrollbar">
            <div className="font-semibold text-lg mb-2 hide-scrollbar">🤖 Trợ lý AI món ăn</div>

            <div className="bg-gray-50 p-3 rounded-md text-sm border mb-2 max-h-[80vh] overflow-y-auto hide-scrollbar">
                {question && (
                    <p className="mb-2">
                        <strong>Bạn:</strong> {question}
                    </p>
                )}

                {/* Luôn hiển thị dù có answer hay không */}
                {(mainProduct || suggestProducts.length > 0 || suggestDrink || suggestDessert || answer) && (
                    <div>
                        {answer && (
                            <>
                                <p className="font-semibold mb-1">AI:</p>
                                <div className="text-sm italic text-black mb-2">{answer}</div>
                            </>
                        )}

                        {mainProduct && (
                            <>
                                <p className="font-medium">🎯 Món bạn cần tìm:</p>
                                {renderProductCard(mainProduct, 'Món chính')}
                            </>
                        )}

                        {suggestProducts.length > 0 && (
                            <>
                                <p className="font-medium">🍔 Các món phù hợp:</p>
                                {suggestProducts.map((item, idx) => (
                                    <div key={item._id || idx}>{renderProductCard(item, `Món ${idx + 1}`)}</div>
                                ))}
                            </>
                        )}

                        {suggestDrink && (
                            <div>
                                <p className="font-medium">🥤 Gợi ý món uống:</p>
                                {renderProductCard(suggestDrink, 'Món uống')}
                            </div>
                        )}

                        {suggestDessert && (
                            <div>
                                <p className="font-medium">🍰 Gợi ý món tráng miệng:</p>
                                {renderProductCard(suggestDessert, 'Món tráng miệng')}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <textarea
                    className="flex-1 resize-none border rounded-md p-2 text-sm h-12 hidden:scrollbar"
                    placeholder="Tôi muốn combo 2 người, món gà, ít cay..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAsk();
                        }
                    }}
                />

                <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="bg-primary text-white p-2 rounded-md transition disabled:opacity-50"
                >
                    {loading ? '...' : <SendHorizonal size={18} />}
                </button>
            </div>
        </div>
    );
}

export default ChatBox;
