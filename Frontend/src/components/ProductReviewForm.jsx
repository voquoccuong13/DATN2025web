// ProductReviewForm.jsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

const ProductReviewForm = ({ product, orderCode, onSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');

    // Thêm base URL giống như ProductDetail
    const backendBaseURL = 'http://backend:9000';

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 3) {
            Swal.fire('Quá nhiều ảnh', 'Chỉ được tải lên tối đa 3 ảnh', 'warning');
            return;
        }

        // Kiểm tra kích thước file (tối đa 5MB mỗi file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter((file) => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            Swal.fire('File quá lớn', 'Mỗi ảnh không được vượt quá 5MB', 'warning');
            return;
        }

        // Kiểm tra định dạng file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const invalidFiles = files.filter((file) => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            Swal.fire('Định dạng không hỗ trợ', 'Chỉ hỗ trợ file JPG, JPEG, PNG, GIF', 'warning');
            return;
        }

        Promise.all(
            files.map((file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({ file, preview: e.target.result });
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });
            }),
        )
            .then((newImages) => {
                setImages([...images, ...newImages]);
            })
            .catch((error) => {
                console.error('Error reading files:', error);
                Swal.fire('Lỗi', 'Không thể đọc file ảnh', 'error');
            });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!selectedProductId || rating === 0 || comment.trim().length < 10) {
            return Swal.fire(
                'Thiếu thông tin',
                'Vui lòng chọn sản phẩm, số sao và nhận xét ít nhất 10 ký tự',
                'warning',
            );
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('orderCode', orderCode);
            formData.append('productId', selectedProductId);
            formData.append('rating', rating);
            formData.append('comment', comment);

            // Thêm userId nếu có
            const userId = localStorage.getItem('userId');
            if (userId) {
                formData.append('userId', userId);
            }

            // Thêm images vào FormData
            images.forEach((img, index) => {
                if (img.file) {
                    formData.append('images', img.file);
                    console.log(`Added image ${index + 1}:`, img.file.name, img.file.size);
                }
            });

            // Log FormData content để debug
            console.log('FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Sử dụng đúng base URL
            const response = await axios.post(`${backendBaseURL}/api/reviews`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 giây timeout
            });

            console.log('Review submitted successfully:', response.data);

            // Hiển thị thông báo thành công
            await Swal.fire('Thành công', 'Đánh giá của bạn đã được gửi', 'success');

            // Callback để parent component biết review đã được submit
            if (onSubmitted && typeof onSubmitted === 'function') {
                onSubmitted(selectedProductId);
            }

            // Reset form
            setSelectedProductId('');
            setRating(0);
            setComment('');
            setImages([]);
            setHoveredStar(0);
        } catch (err) {
            console.error('Error submitting review:', err);

            let errorMessage = 'Gửi đánh giá thất bại';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Timeout - Vui lòng thử lại';
            } else if (err.response?.status === 413) {
                errorMessage = 'File quá lớn - Vui lòng chọn ảnh nhỏ hơn';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            Swal.fire('Lỗi', errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Đảm bảo productList là array
    const productList = Array.isArray(product) ? product : product ? [product] : [];

    return (
        <div className="mt-6 p-6 bg-gray-50 border rounded-lg">
            <h4 className="font-semibold text-lg mb-4">Gửi đánh giá sản phẩm</h4>

            {productList.length === 0 ? (
                <p className="text-gray-500">Không có sản phẩm để đánh giá</p>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Chọn sản phẩm *</label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            disabled={submitting}
                        >
                            <option value="">-- Chọn sản phẩm --</option>
                            {productList.map((item) => (
                                <option key={item.productId || item._id} value={item.productId || item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedProductId && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Số sao *{rating > 0 && <span className="text-orange-500 ml-2">({rating} sao)</span>}
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={24}
                                            onClick={() => !submitting && setRating(star)}
                                            onMouseEnter={() => !submitting && setHoveredStar(star)}
                                            onMouseLeave={() => !submitting && setHoveredStar(0)}
                                            fill={star <= (hoveredStar || rating) ? '#fbbf24' : 'none'}
                                            stroke="#fbbf24"
                                            className={`${
                                                submitting ? 'cursor-not-allowed' : 'cursor-pointer'
                                            } transition-colors`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Nhận xét *
                                    <span className="text-sm text-gray-500 ml-1">
                                        ({comment.length}/10 ký tự tối thiểu)
                                    </span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Chia sẻ trải nghiệm về món này..."
                                    disabled={submitting}
                                    minLength={10}
                                ></textarea>
                                {comment.length > 0 && comment.length < 10 && (
                                    <p className="text-red-500 text-sm mt-1">
                                        Cần ít nhất {10 - comment.length} ký tự nữa
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Hình ảnh (tùy chọn, tối đa 3 ảnh, mỗi ảnh &lt; 5MB)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    onChange={handleImageUpload}
                                    disabled={submitting || images.length >= 3}
                                    className="mb-2 w-full"
                                />
                                <p className="text-xs text-gray-500 mb-2">
                                    Hỗ trợ: JPG, JPEG, PNG, GIF. Tối đa 3 ảnh, mỗi ảnh không quá 5MB.
                                </p>
                                {images.length > 0 && (
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative">
                                                <img
                                                    src={img.preview}
                                                    alt={`preview ${i + 1}`}
                                                    className="w-16 h-16 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    disabled={submitting}
                                                    className="absolute -top-1 -right-1 w-5 h-5 text-white bg-red-500 rounded-full hover:bg-red-600 text-xs flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || rating === 0 || comment.trim().length < 10}
                                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        'Gửi đánh giá'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductReviewForm;
