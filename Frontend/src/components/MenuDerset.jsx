import React, { useState, useEffect } from 'react';
import DersetItemCart from './DersetItemCart';
import { assets } from '../assets/assets';
import ProductDetail from './ProductDetail ';
import axios from 'axios';
const MenuDerset = () => {
    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [sortType, setSortType] = useState('popular');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [dersetList, setDersetList] = useState([]);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const backendBaseURL = 'http://backend:9000';
    // Lọc theo loại
    const filteredList = dersetList.filter((item) => {
        if (selectedType === 'Tất cả') return true;
        return item.category === selectedType; // Cần đảm bảo item có trường type đúng tên
    });

    // Sắp xếp theo sortType
    const sortedList = [...filteredList].sort((a, b) => {
        switch (sortType) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt); // giả sử có createdAt
            case 'popular':
            default:
                return b.popularity - a.popularity; // giả sử có popularity
        }
    });

    const types = ['Tất cả', 'Kem', 'Chè', 'Trái cây', 'Bánh'];
    const sortOptions = [
        { label: 'Phổ biến nhất', value: 'popular' },
        { label: 'Giá: Thấp đến cao', value: 'price-asc' },
        { label: 'Giá: Cao đến thấp', value: 'price-desc' },
        { label: 'Mới nhất', value: 'newest' },
    ];
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const listToShow = searchTerm.trim()
        ? searchResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : sortedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalItems = searchTerm.trim() ? searchResults.length : sortedList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handler cho khi rating được submit - CẢI TIẾN
    const handleRatingSubmitted = async (productId) => {
        console.log('Rating submitted for product:', productId, 'updating burger list...');

        try {
            // Thêm delay để đảm bảo server đã xử lý xong
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Trigger update để re-fetch dữ liệu
            setTriggerUpdate((prev) => prev + 1);

            // Nếu đang search, cũng cần update search results
            if (searchTerm.trim() !== '') {
                setTimeout(async () => {
                    try {
                        const res = await axios.get(`${backendBaseURL}/api/products/search?keyword=${searchTerm}`);
                        setSearchResults(res.data);
                    } catch (err) {
                        console.error('Lỗi tìm kiếm sau khi rating:', err);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Error in handleRatingSubmitted:', error);
        }
    };

    useEffect(() => {
        fetch('/api/products?mainCategory=Tráng miệng')
            .then((res) => res.json())
            .then((data) => {
                console.log('Sản phẩm Dersset:', data);
                setDersetList(data); // nếu bạn dùng state
            });
    }, []);
    // Effect cho search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() !== '') {
                axios
                    .get(`${backendBaseURL}/api/products/search?keyword=${searchTerm}`)
                    .then((res) => {
                        setSearchResults(res.data);
                        setCurrentPage(1);
                    })
                    .catch((err) => console.error('Lỗi tìm kiếm:', err));
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);
    return (
        <section className="relative py-8 pt-20 px-4 md:px-20 bg-[#f9fafb] min-h-screen">
            {/* Page Title */}
            <div className="bg-primary/5 py-8 px-4 md:px-20 rounded-t-xl">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tráng miệng</h1>
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                    <li className="inline-flex items-center">
                                        <a href="/" className="text-sm text-gray-700 hover:text-primary">
                                            Trang chủ
                                        </a>
                                    </li>
                                    <li>
                                        <div className="flex items-center">
                                            <i className="ri-arrow-right-s-line text-gray-500"></i>
                                            <span className="ml-1 text-sm text-gray-700  md:ml-2">Thực đơn</span>
                                        </div>
                                    </li>
                                    <li aria-current="page">
                                        <div className="flex items-center">
                                            <i className="ri-arrow-right-s-line text-gray-500"></i>
                                            <span className="ml-1 text-sm font-medium text-primary md:ml-2">
                                                Tráng miệng
                                            </span>
                                        </div>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <img
                                src={assets.Menu_5}
                                alt="Tráng miệng"
                                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc + tìm kiếm + sắp xếp  */}
            <div className="py-6 bg-white border-b shadow-sm rounded-b-xl">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Dropdown Loại */}
                        <div className="relative w-full md:w-auto md:min-w-[160px]">
                            <button
                                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm text-gray-700 flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <i className="ri-filter-3-line text-lg text-primary"></i>
                                <span className="flex-1 text-left">{selectedType || 'Loại'}</span>
                                <i className="ri-arrow-down-s-line text-gray-500"></i>
                            </button>
                            {typeDropdownOpen && (
                                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    {types.map((type) => (
                                        <li
                                            key={type}
                                            onClick={() => {
                                                setSelectedType(type);
                                                setTypeDropdownOpen(false);
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer transition ${
                                                selectedType === type
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-700 hover:bg-primary hover:text-white'
                                            }`}
                                        >
                                            {type}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Ô tìm kiếm */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400 text-lg">
                                <i className="ri-search-line text-lg text-primary"></i>
                            </span>
                        </div>

                        {/* Dropdown Sắp xếp */}
                        <div className="relative w-full md:w-auto md:min-w-[160px]">
                            <button
                                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm text-gray-700 flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <i className="ri-sort-desc text-lg text-primary"></i>
                                <span className="flex-1 text-left">
                                    {sortOptions.find((o) => o.value === sortType)?.label || 'Sắp xếp'}
                                </span>
                                <i className="ri-arrow-down-s-line text-gray-500"></i>
                            </button>
                            {sortDropdownOpen && (
                                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    {sortOptions.map(({ label, value }) => (
                                        <li
                                            key={value}
                                            onClick={() => {
                                                setSortType(value);
                                                setSortDropdownOpen(false);
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer transition ${
                                                sortType === value
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-700 hover:bg-primary hover:text-white'
                                            }`}
                                        >
                                            {label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
                {listToShow.map((product) => (
                    <DersetItemCart
                        onOpenDetail={(id) => setSelectedProductId(id)}
                        key={`${product._id}-${triggerUpdate}`}
                        _id={product._id}
                        name={product.name}
                        description={product.description}
                        price={product.price}
                        image={product.image}
                        mainCategory={product.mainCategory}
                        options={product.options}
                        rating={product.rating}
                        numReviews={product.numReviews}
                    />
                ))}
            </div>
            {/* Product Detail Modal */}
            {selectedProductId && (
                <ProductDetail
                    productId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                    onRatingSubmitted={handleRatingSubmitted} // Sử dụng handler cải tiến
                />
            )}
            {/* <!-- Pagination --> */}
            <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow overflow-hidden">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="py-2 px-4 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <i className="ri-arrow-left-s-line"></i>
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`py-2 px-4 border ${
                                    currentPage === page
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="py-2 px-4 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <i className="ri-arrow-right-s-line"></i>
                    </button>
                </nav>
            </div>
        </section>
    );
};

export default MenuDerset;
