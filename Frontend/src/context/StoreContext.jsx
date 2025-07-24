import { createContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    //Các biến trạng thái chính
    const [note, setNote] = useState('');

    const [cartItem, setCartItem] = useState({});
    const [showAddedNotification, setShowAddedNotification] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null); // Lưu thông tin đặt hàng
    const prevCartRef = useRef(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [showLogin, setShowLogin] = useState(false);
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setToken(token); // cập nhật lại token context
        setShowLogin(false);
    };
    useEffect(() => {
        const updateToken = () => {
            const newToken = localStorage.getItem('token');
            console.log('🟢 [storage] Token mới:', newToken);
            setToken(newToken);
            console.log('🟢 Token cập nhật:', newToken);
        };

        window.addEventListener('storage', updateToken); // Theo dõi thay đổi từ localStorage (đa tab)
        return () => window.removeEventListener('storage', updateToken);
    }, []);

    // hàm logout
    const logout = () => {
        setCartItem({});
        localStorage.removeItem('token'); // Xóa token khỏi localStorage
        localStorage.removeItem('cart'); // Xóa cart trong localStorage
        setToken(null);
    };

    // Load giỏ hàng từ backend (MongoDB) khi có token
    const loadCartFromMongoDB = async (token) => {
        console.log('🟡 Token gửi lên loadCart:', token);
        try {
            const res = await axios.get('/api/users/cart', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Response from /api/users/cart:', res.data);

            const cart = res.data;
            const items = Array.isArray(cart?.items) ? cart.items : [];
            console.log('Cart items:', items);

            const loadedCart = {};
            items.forEach((item) => {
                const product = item.productId;
                if (!product) {
                    console.log('Warning: item.productId is null or undefined', item);
                    return;
                }

                const key = product._id + (item.variantKey ? `_${item.variantKey}` : '');
                loadedCart[key] = {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: item.quantity,
                    variantKey: item.variantKey || '',
                    selectedOptions: item.selectedOptions || {},
                };
            });

            console.log('Loaded cart object:', loadedCart);
            setCartItem(loadedCart);
            prevCartRef.current = loadedCart;
        } catch (error) {
            console.error(' Lỗi khi tải giỏ hàng từ MongoDB:', error);
        }
    };

    // Lưu giỏ hàng lên backend MongoDB
    const saveCartToMongoDB = async (cart) => {
        if (!token) {
            console.warn('No token, không lưu được giỏ hàng lên MongoDB');
            return;
        }
        try {
            const items = Object.values(cart).map((item) => ({
                productId: item._id,
                quantity: item.quantity,
                variantKey: item.variantKey || '',
                selectedOptions: item.selectedOptions || {},
            }));
            console.log('Saving cart items to backend:', items);

            await axios.post(
                '/api/users/cart',
                { cartItems: items },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            prevCartRef.current = cart;
            console.log('Save cart success');
        } catch (error) {
            console.error('Lỗi khi lưu giỏ hàng vào MongoDB:', error);
        }
    };

    // Load giỏ hàng khi mount component hoặc khi token thay đổi (ví dụ đăng nhập/xuất)
    useEffect(() => {
        if (!token) {
            const localCart = localStorage.getItem('cart');
            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    setCartItem(parsed);
                    prevCartRef.current = parsed;
                    console.log('✅ Giỏ hàng được load từ localStorage');
                } catch (err) {
                    console.error('❌ Lỗi parse giỏ hàng từ localStorage:', err);
                    setCartItem({});
                }
            } else {
                setCartItem({});
            }
        } else {
            loadCartFromMongoDB(token);
        }
    }, [token]);

    // Tự động lưu cartItem lên backend khi thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItem));

        if (token) {
            const hasChanged = JSON.stringify(cartItem) !== JSON.stringify(prevCartRef.current);
            const isCartEmpty = Object.keys(cartItem).length === 0;

            if (hasChanged && !isCartEmpty) {
                const handler = setTimeout(() => {
                    saveCartToMongoDB(cartItem);
                }, 1000);
                return () => clearTimeout(handler);
            }
        }
    }, [cartItem, token]);

    // Thêm sản phẩm vào giỏ
    const addToCart = (product, variantKey = '') => {
        const key = product._id + (variantKey ? `_${variantKey}` : '');
        setCartItem((prev) => {
            const existing = prev[key];
            return {
                ...prev,
                [key]: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    variantKey,
                    quantity: existing ? existing.quantity + 1 : 1,
                    selectedOptions: product.selectedOptions || {},
                },
            };
        });
        setShowAddedNotification(true);
        setTimeout(() => setShowAddedNotification(false), 2000);
    };
    const addMultipleToCart = (product, variantKey = '', quantity = 1) => {
        const key = product._id + (variantKey ? `_${variantKey}` : '');
        setCartItem((prev) => ({
            ...prev,
            [key]: {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                variantKey,
                quantity,
                selectedOptions: product.selectedOptions || {},
            },
        }));
        setShowAddedNotification(true);
        setTimeout(() => setShowAddedNotification(false), 2000);
    };

    // Cập nhật số lượng sản phẩm trong giỏ
    const updateQuantity = (itemId, newQty) => {
        setCartItem((prev) => {
            if (newQty <= 0) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            }
            return {
                ...prev,
                [itemId]: {
                    ...prev[itemId],
                    quantity: newQty,
                },
            };
        });
    };

    // Xóa sản phẩm khỏi giỏ
    const removeFromCart = (itemId) => {
        setCartItem((prev) => {
            const copy = { ...prev };
            delete copy[itemId];
            return copy;
        });
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = () => setCartItem({});

    // Lấy số lượng của một sản phẩm
    const getItemQuantity = (itemId) => cartItem[itemId]?.quantity || 0;

    // Lấy tổng số lượng sản phẩm trong giỏ
    const getTotalCartQuantity = () => Object.values(cartItem).reduce((acc, item) => acc + item.quantity, 0);

    // Lưu thông tin đặt hàng (shipping, note, paymentMethod, coupon...) để gửi sang trang thanh toán
    const saveOrderInfo = (info) => {
        setOrderInfo(info);
    };

    return (
        <StoreContext.Provider
            value={{
                cartItem,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                getItemQuantity,
                getTotalCartQuantity,
                showAddedNotification,
                setShowAddedNotification,
                saveOrderInfo,
                orderInfo,
                logout,
                note,
                setNote,
                addMultipleToCart,
                token,
                showLogin,
                setShowLogin,
                handleLoginSuccess,
                openLogin: () => setShowLogin(true),
            }}
        >
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
