import React, { useState } from 'react';
import axios from 'axios';
const PasswordManagement = () => {
    const [showForgot, setShowForgot] = useState(false);
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmNewPassword) {
            alert('Mật khẩu mới không khớp');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token'); // Lấy JWT từ localStorage
            if (!token) {
                alert('Bạn cần đăng nhập để thực hiện chức năng này');
                setLoading(false);
                return;
            }

            const res = await axios.post(
                '/api/users/change-password',
                {
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            alert(res.data.message || 'Đổi mật khẩu thành công');
            setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
            alert(message);
        }
        setLoading(false);
    };

    const handleSubmitForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/users/forgot-password', {
                email,
            });
            alert('Email đặt lại mật khẩu đã được gửi.');
            setEmail('');
            setShowForgot(false);
        } catch (error) {
            const message = error.response?.data?.message || 'Gửi email thất bại';
            alert(message);
        }
        setLoading(false);
    };
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center', // căn ngang giữa
                alignItems: 'flex-start', // căn dọc từ trên xuống (nếu muốn cách lề trên)
                minHeight: '100vh', // chiếm toàn bộ chiều cao viewport
                paddingTop: '60px', // khoảng cách cách lề trên (bạn chỉnh thoải mái)
                // backgroundColor: '#f9f9f9', // background tùy chọn
            }}
        >
            <section
                className="border rounded p-6"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                }}
            >
                {/* Nội dung form vẫn giữ nguyên */}
                {!showForgot ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4 text-primary text-center">Đổi mật khẩu</h2>
                        <form onSubmit={handleSubmitChangePassword}>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
                                <input
                                    name="currentPassword"
                                    type="password"
                                    className="w-full  px-3 py-2 border rounded-lg"
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Mật khẩu mới</label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    className="w-full  px-3 py-2 border rounded-lg"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Xác nhận mật khẩu mới</label>
                                <input
                                    name="confirmNewPassword"
                                    type="password"
                                    className="w-full  px-3 py-2 border rounded-lg"
                                    value={form.confirmNewPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`mt-2 w-full px-4 py-2 rounded text-white ${
                                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary'
                                }`}
                                disabled={loading}
                            >
                                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setShowForgot(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-4 text-primary text-center">Quên mật khẩu</h2>
                        <form onSubmit={handleSubmitForgotPassword}>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Email của bạn</label>
                                <input
                                    type="email"
                                    className="w-full border rounded-lg px-3 py-2"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`mt-2 w-full px-4 py-2 rounded text-white ${
                                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary'
                                }`}
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setShowForgot(false)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Quay lại đổi mật khẩu
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default PasswordManagement;
