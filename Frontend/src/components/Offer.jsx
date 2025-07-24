import React, { useState, useEffect, useRef } from 'react';
import OfferItem from '../components/OfferItem';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProductDetail from './ProductDetail ';

const Offer = () => {
    const [comboItems, setComboItems] = useState([]);
    const scrollRef = useRef(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        const fetchComboDeals = async () => {
            try {
                const res = await axios.get('/api/products?mainCategory=Combo');
                setComboItems(res.data || []);
            } catch (error) {
                console.error('Lỗi khi lấy ưu đãi combo:', error);
            }
        };
        fetchComboDeals();
    }, []);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -600, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 600, behavior: 'smooth' });
        }
    };

    return (
        <section id="khuyenmai" className="py-10 md:py-20 px-4 sm:px-6 md:px-20 bg-white relative">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
                    💥Ưu đãi đặc biệt
                </h2>

                {/* Gradient 2 bên */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

                {/* Nút điều hướng */}
                {comboItems.length > 2 && (
                    <>
                        <button
                            onClick={scrollLeft}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow p-2 rounded-full hidden md:block hover:scale-110 transition"
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow p-2 rounded-full hidden md:block hover:scale-110 transition"
                        >
                            <ChevronRight />
                        </button>
                    </>
                )}

                {/* Thanh trượt ngang */}
                <div className="overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
                    >
                        {comboItems.map((item, index) => (
                            <div
                                key={item._id}
                                className="w-[calc(50%-12px)] flex-shrink-0 snap-start transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                                onClick={() => {
                                    setSelectedProductId(item._id);
                                    setShowDetail(true);
                                }}
                            >
                                <OfferItem
                                    id={item._id}
                                    deal={item.deal}
                                    name={item.name}
                                    description={item.description}
                                    image={item.image}
                                    priceOld={item.priceOld}
                                    price={item.price}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {showDetail && selectedProductId && (
                <ProductDetail productId={selectedProductId} onClose={() => setShowDetail(false)} />
            )}
        </section>
    );
};

export default Offer;
