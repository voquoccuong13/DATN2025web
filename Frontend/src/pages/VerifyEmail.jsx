import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                const res = await axios.get(`/api/users/verify-email?token=${token}`);
                toast.success(res.data.message || 'Xác minh thành công');
                setStatus('success');

                setTimeout(() => navigate('/home'), 2000); // chuyển hướng về trang login
            } catch (error) {
                toast.error(error.response?.data?.message || 'Xác minh thất bại');
                setStatus('error');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded shadow-md text-center max-w-md">
                {status === 'loading' && <p>Đang xác minh tài khoản...</p>}
                {status === 'success' && <p className="text-green-600 font-semibold">✅ Tài khoản đã được xác minh!</p>}
                {status === 'error' && (
                    <p className="text-red-600 font-semibold">❌ Xác minh thất bại hoặc link không hợp lệ</p>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
