import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
const LoginPop = ({ showLogin, setShowLogin, onLoginSuccess }) => {
    const [errors, setErrors] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [mode, setMode] = useState('login'); // login | register | forgot
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [showPwd, setShowPwd] = useState({ pwd: false, confirm: false });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
        });
        setShowPwd({ pwd: false, confirm: false });
        setErrors({});
        setAgreeTerms(false);
    };
    const loginUser = async ({ email, password }) => {
        try {
            const res = await axios.post(`/api/users/login`, {
                email,
                password,
            });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Đăng nhập thất bại');
        }
    };

    const registerUser = async ({ name, email, password, phone }) => {
        try {
            const res = await axios.post(`/api/users/register`, {
                name,
                email,
                password,
                phone,
            });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post(`/api/users/forgot-password`, { email });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'login') {
                if (!form.email || !form.password) return alert('Vui lòng nhập đầy đủ thông tin');
                const data = await loginUser({
                    email: form.email,
                    password: form.password,
                });
                console.log('🔥 Token nhận được từ server:', data.token);
                localStorage.setItem('token', data.token);
                window.dispatchEvent(new Event('storage'));

                localStorage.setItem('user', JSON.stringify(data.user));
                Swal.fire({
                    title: `Xin chào ${data.user.name}!`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });

                onLoginSuccess(data.user, data.token);
                setShowLogin(false);
                const redirect = new URLSearchParams(window.location.search).get('redirect');
                if (redirect) {
                    window.location.href = redirect;
                } else {
                    window.location.reload();
                }
            } else if (mode === 'register') {
                const { username, email, password, confirmPassword, phone } = form;
                const newErrors = {};

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^(0|\+84)(\d{9})$/;

                if (!username) newErrors.username = 'Tên đăng nhập không được bỏ trống';
                if (!emailRegex.test(email)) newErrors.email = 'Email không hợp lệ';
                if (!phoneRegex.test(phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
                if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
                if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors); // ⛔ Nếu có lỗi => cập nhật state lỗi và dừng submit
                    return;
                }
                if (!agreeTerms) {
                    Swal.fire('Thông báo', 'Bạn cần đồng ý với Điều khoản sử dụng & Chính sách bảo mật', 'warning');
                    return;
                }

                // ✅ Nếu không có lỗi:
                setErrors({});
                const data = await registerUser({
                    name: username,
                    email,
                    password,
                    phone,
                });
                Swal.fire({
                    title: 'Đăng ký thành công!',
                    text: 'Vui lòng kiểm tra email và xác minh tài khoản trước khi đăng nhập.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
                setMode('login');
                resetForm();
            } else if (mode === 'forgot') {
                if (!form.email) return alert('Vui lòng nhập email');
                const data = await forgotPassword(form.email);
                Swal.fire({
                    title: 'Thành công',
                    text: data.message || 'Yêu cầu đặt lại mật khẩu đã được gửi!',
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false,
                });

                setMode('login');
                resetForm();
            }
        } catch (err) {
            Swal.fire({
                title: 'Lỗi',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'Đóng',
            });
        }
    };

    const renderInput = (type, name, placeholder, toggle = false) => (
        <div className="relative">
            <input
                type={toggle && showPwd[name] ? 'text' : type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg pr-10 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]}</span>}
            {toggle && (
                <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, [name]: !showPwd[name] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                    {showPwd[name] ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center">
            <form
                onSubmit={handleSubmit}
                className="w-[90vw] sm:w-[max(23vw,330px)] bg-white flex flex-col gap-6 p-6 rounded-lg animate-fadeIn text-sm text-gray-500"
            >
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 mb-2">
                        {['login', 'register'].map((item) => (
                            <span
                                key={item}
                                onClick={() => {
                                    setMode(item);
                                    resetForm();
                                }}
                                className={`cursor-pointer px-2 pb-1 transition ${
                                    mode === item
                                        ? 'text-primary font-bold border-b-2 border-primary text-lg'
                                        : 'text-gray-400 font-semibold'
                                }`}
                            >
                                {item === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                            </span>
                        ))}
                    </div>
                    <img
                        src={assets.cross_icon}
                        alt="close"
                        className="cursor-pointer"
                        onClick={() => setShowLogin(false)}
                    />
                </div>

                {/* Form Body */}
                {mode === 'forgot' ? (
                    <>
                        {renderInput('email', 'email', 'Email')}
                        <button className="w-full bg-primary text-white py-2 rounded-lg">Gửi yêu cầu</button>
                        <p onClick={() => setMode('login')} className="text-primary cursor-pointer text-center">
                            Quay lại đăng nhập
                        </p>
                    </>
                ) : (
                    <>
                        {mode === 'register' && (
                            <>
                                {renderInput('text', 'username', 'Tên đăng nhập')}
                                {renderInput('text', 'phone', 'Số điện thoại')}
                            </>
                        )}
                        {renderInput('email', 'email', 'Email')}
                        {renderInput('password', 'password', 'Mật khẩu', true)}
                        {mode === 'register' && renderInput('password', 'confirmPassword', 'Nhập lại mật khẩu', true)}

                        <button className="w-full bg-primary text-white py-2 rounded-lg">
                            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                        </button>

                        {mode === 'login' && (
                            <p onClick={() => setMode('forgot')} className="text-primary cursor-pointer text-center">
                                Quên mật khẩu?
                            </p>
                        )}

                        {mode === 'register' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="accent-primary"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <p className="text-xs">
                                    Tôi đồng ý với{' '}
                                    <span className="text-primary cursor-pointer">Điều khoản sử dụng</span> &{' '}
                                    <span className="text-primary cursor-pointer">Chính sách bảo mật</span>
                                </p>
                            </div>
                        )}

                        <p className="text-center text-sm">
                            {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                            <span
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    resetForm();
                                }}
                                className="text-primary cursor-pointer"
                            >
                                {mode === 'login' ? 'Đăng ký tại đây' : 'Đăng nhập tại đây'}
                            </span>
                        </p>
                    </>
                )}
            </form>
        </div>
    );
};

export default LoginPop;
