import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams(); // lấy token từ URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            alert('Vui lòng nhập đầy đủ mật khẩu.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Mật khẩu không khớp.');
            return;
        }

        try {
            const res = await axios.post(`/api/users/reset-password/${token}`, {
                password,
            });

            alert('Đặt lại mật khẩu thành công!');
            navigate('/home'); // chuyển về trang home
        } catch (error) {
            const message = error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
            alert(message);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-[350px]">
                <h2 className="text-xl font-bold mb-4 text-center">Đặt lại mật khẩu</h2>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-3 border rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />
                <button type="submit" className="w-full bg-primary text-white py-2 rounded">
                    Xác nhận
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
