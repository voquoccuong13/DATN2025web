import React, { useState, useRef, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPop from './components/LoginPop';
import Home from './pages/Home';
import Cart from './pages/Cart';
import PlaceOrder from './pages/PlaceOrder';
import MenuBurger from './components/MenuBurger';
import MenuPIzza from './components/MenuPIzza';
import MenuChicken from './components/MenuChicken';
import MenuDrink from './components/MenuDrink';
import MenuDerset from './components/MenuDerset';
import ScrollToTop from './components/ScrollToTop';
import { AnimatePresence, motion } from 'framer-motion';
import StoreContextProvider from './context/StoreContext';
import AddedNotification from './components/AddedNotification ';
import OrderDetailPage from './pages/OrderDetailPage';
import ResetPassword from './components/ResetPassword';
import SidebarProlife from './components/SidebarProlife';
import UserOrders from './components/UserOrders';
import ProductDetail from './components/ProductDetail ';
import VerifyEmail from './pages/VerifyEmail';
import ChatWidget from './components/ChatWidget';
import VNPayReturn from './pages/VNPayReturn';
import { LoginContext } from './components/LoginContext';
export default function App() {
    //
    const aboutRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState('home');
    //
    const [showLogin, setShowLogin] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Lỗi khi đọc user từ localStorage:', error);
            setUser(null);
        }
    }, []);

    const handleLoginSuccess = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // lưu vào localStorage
        localStorage.setItem('token', token); // token
        setShowLogin(false);
    };

    //
    const scrollToAboutUs = () => {
        if (location.pathname !== '/home') {
            navigate('/home');
            setTimeout(() => {
                if (aboutRef.current) {
                    aboutRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300); // Chờ Home mount xong
        } else {
            if (aboutRef.current) {
                aboutRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <LoginContext.Provider value={{ showLogin, setShowLogin, handleLoginSuccess }}>
            <StoreContextProvider>
                <div className="overflow-x-hidden hidden-scrollbar">
                    {showLogin && <LoginPop setShowLogin={setShowLogin} onLoginSuccess={handleLoginSuccess} />}
                    <Header
                        user={user}
                        setUser={setUser}
                        setShowLogin={setShowLogin}
                        scrollToAboutUs={scrollToAboutUs}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                    />
                    <ScrollToTop />
                    <AnimatePresence mode="wait">
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Home aboutRef={aboutRef} />{' '}
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/home"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Home aboutRef={aboutRef} />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/cart"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Cart />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/order"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <PlaceOrder />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/thucdon/burger"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <MenuBurger />{' '}
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/thucdon/pizza"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <MenuPIzza />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/thucdon/ga-ran"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <MenuChicken />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/thucdon/do-uong"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <MenuDrink />
                                    </motion.div>
                                }
                            />
                            <Route
                                path="/thucdon/trang-mieng"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <MenuDerset />{' '}
                                    </motion.div>
                                }
                            />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/order/:orderCode" element={<OrderDetailPage />} />
                            <Route path="/home/sidebar" element={<SidebarProlife />} />
                            <Route path="/home/sidebar/orders" element={<UserOrders />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/vnpay_return" element={<VNPayReturn />} />
                            <Route
                                path="/order-failed"
                                element={
                                    <div className="p-6 text-center text-red-600">
                                        Thanh toán thất bại. Vui lòng thử lại!
                                    </div>
                                }
                            />

                            <Route
                                path="/product/:id"
                                element={
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <ProductDetail />
                                    </motion.div>
                                }
                            />
                        </Routes>
                    </AnimatePresence>
                    <ChatWidget />
                    <Footer />

                    <AddedNotification />
                </div>
            </StoreContextProvider>
        </LoginContext.Provider>
    );
}
