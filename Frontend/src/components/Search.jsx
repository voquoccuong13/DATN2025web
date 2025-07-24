import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FoodItem from './FoodItem';
import { menu_list } from '../assets/assets';

const Search = () => {
    const scrollRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [newest, setNewest] = useState([]);
    const [comboList, setComboList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showSearchInput, setShowSearchInput] = useState(false);

    const highlightKeyword = (text, keyword) => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        return (
            <>
                {text.split(regex).map((part, i) =>
                    part.toLowerCase() === keyword.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200 px-1 rounded">
                            {part}
                        </mark>
                    ) : (
                        part
                    ),
                )}
            </>
        );
    };

    useEffect(() => {
        axios
            .get('/api/products/top-selling')
            .then((res) => setTopSelling(res.data.products))
            .catch((err) => console.error('Top selling error:', err));

        axios
            .get('/api/products/new')
            .then((res) => setNewest(res.data))
            .catch((err) => console.error('Newest error:', err));

        axios
            .get('/api/products?mainCategory=Combo')
            .then((res) => setComboList(res.data))
            .catch((err) => console.error('Combo error:', err));
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                setIsLoading(true);
                axios
                    .get(`/api/products/search?keyword=${searchTerm}`)
                    .then((res) => {
                        setSearchResults(res.data);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.error('Search error:', err);
                        setIsLoading(false);
                    });
            } else {
                setSearchResults([]);
            }
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleClick = (menuName) => {
        console.log('Menu clicked:', menuName);
    };

    return (
        <div className="w-full px-6 sm:px-6 lg:px-8 xl:px-12 -mt-14">
            <div className="w-full py-6 border-b border-gray-200 bg-gradient-to-r from-red-50 via-white to-yellow-50 shadow rounded-xl">
                <div className="px-6 sm:px-6 lg:px-8">
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 place-items-center">
                        {[
                            { icon: '🔍', label: 'Tìm kiếm', type: 'search' },
                            { icon: '🔥', label: 'Món bán chạy', id: 'top-selling', type: 'scroll' },
                            { icon: '🆕', label: 'Món mới', id: 'newest', type: 'scroll' },
                            { icon: '💥', label: 'Ưu đãi combo', id: 'combo', type: 'scroll' },
                            ...menu_list.map((item) => ({
                                icon:
                                    {
                                        Burger: '🍔',
                                        Pizza: '🍕',
                                        'Gà rán': '🍗',
                                        'Đồ uống': '🥤',
                                        'Tráng miệng': '🍰',
                                    }[item.menu_name] || '🍽️',
                                label: item.menu_name,
                                type: 'menu',
                            })),
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center cursor-pointer hover:text-red-600 transition group"
                                onClick={() => {
                                    if (item.type === 'search') {
                                        setShowSearchInput((prev) => !prev);
                                    } else {
                                        handleClick(item.label);
                                    }
                                }}
                            >
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                                    {item.icon}
                                </div>
                                <span className="text-xs mt-1 text-center font-medium group-hover:font-semibold">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Input tìm kiếm xuất hiện riêng bên dưới */}
                    {showSearchInput && (
                        <div className="mt-6 w-full flex flex-col items-center">
                            {/* Ô tìm kiếm */}
                            <div className="w-full max-w-[600px] px-4">
                                <input
                                    type="text"
                                    placeholder="Nhập món bạn cần tìm..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Kết quả tìm kiếm */}
                            <div className="w-full mt-4 px-4">
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {isLoading && (
                                        <div className="col-span-full text-center text-gray-500 text-sm">
                                            Đang tìm kiếm...
                                        </div>
                                    )}
                                    {!isLoading && searchResults.length === 0 && searchTerm.trim() !== '' && (
                                        <div className="col-span-full text-center text-red-500 text-sm">
                                            Không tìm thấy món phù hợp.
                                        </div>
                                    )}
                                    {!isLoading &&
                                        searchResults
                                            .slice(0, 6)
                                            .map((item) => (
                                                <FoodItem
                                                    key={item._id}
                                                    id={item._id}
                                                    name={item.name}
                                                    description={item.description}
                                                    price={item.price}
                                                    image={item.image}
                                                    isNew={item.isNew}
                                                    isHot={item.isHot}
                                                />
                                            ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
