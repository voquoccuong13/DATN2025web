import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import OptionModal from './Models/OptionModal';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from './LoginContext';
const ChickenItemCart = ({
    _id,
    name,
    description,
    price,
    image,
    Category,
    mainCategory,
    options,
    onOpenDetail,
    rating = 0,
    numReviews = 0,
}) => {
    const { addToCart, token } = useContext(StoreContext);
    const [isPressed, setIsPressed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = !!token;
    const { showLogin, setShowLogin } = useContext(LoginContext);
    const product = {
        _id,
        name,
        description,
        price,
        image,
        Category,
        mainCategory,
        options,
    };
    const renderStars = (value) => {
        const fullStars = Math.floor(value);
        const hasHalfStar = value % 1 !== 0;
        const emptyStars = 5 - Math.ceil(value);

        return (
            <div className="flex gap-0.5 text-yellow-400 text-sm">
                {[...Array(fullStars)].map((_, i) => (
                    <i key={`full-${i}`} className="ri-star-fill"></i>
                ))}
                {hasHalfStar && <i className="ri-star-half-fill"></i>}
                {[...Array(emptyStars)].map((_, i) => (
                    <i key={`empty-${i}`} className="ri-star-line"></i>
                ))}
            </div>
        );
    };
    const handleAddToCart = () => {
        if (!isAuthenticated) {
            setShowLogin(true); // ✅ Mở modal login thay vì chuyển trang
            return;
        }

        if (options && options.length > 0) {
            setShowModal(true);
        } else {
            addToCart(product);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
            <div onClick={() => onOpenDetail(_id)} className="h-48 overflow-hidden cursor-pointer">
                <img src={image} alt={name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="p-4 flex flex-col justify-between flex-grow">
                <div onClick={() => onOpenDetail(_id)} className="cursor-pointer">
                    <p className="font-semibold text-lg mb-1">{name}</p>
                    {renderStars(rating)}
                    <p className="text-xs text-gray-500 mb-2">{numReviews} đánh giá</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{description}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-3">
                    <span className="font-bold text-lg text-primary">
                        {price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        })}
                    </span>
                    <button
                        onMouseDown={() => setIsPressed(true)}
                        onMouseUp={() => setIsPressed(false)}
                        onMouseLeave={() => setIsPressed(false)}
                        onClick={handleAddToCart}
                        className={`add-to-cart w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full !rounded-button ${
                            isPressed ? 'pressed' : ''
                        }`}
                        aria-label="Đặt hàng món"
                        style={{
                            transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                            transition: 'transform 0.1s ease',
                            boxShadow: isPressed ? 'none' : '',
                        }}
                    >
                        <i className="ri-add-line ri-lg"></i>
                    </button>
                </div>
            </div>
            {showModal && (
                <OptionModal
                    product={product}
                    onClose={() => setShowModal(false)}
                    onConfirm={(productWithOptions) => {
                        addToCart(productWithOptions);
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ChickenItemCart;
