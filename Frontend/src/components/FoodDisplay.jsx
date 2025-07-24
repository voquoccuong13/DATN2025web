import React, { useEffect, useState } from 'react';
import FoodItem from './FoodItem';
import axios from 'axios';

const FoodDisplay = () => {
    const [topFood, setTopFood] = useState([]);
    const [showAll, setShowAll] = useState(false);

    // Gọi API lấy danh sách món ăn bán chạy
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/products/top-selling');
                setTopFood(res?.data?.data || []); // Dữ liệu từ route mới
            } catch (err) {
                console.error('Lỗi khi lấy danh sách món ăn:', err);
            }
        };

        fetchData();
    }, []);

    const displayedFood = showAll ? topFood : topFood?.slice?.(0, 4) || [];

    return (
        <section id="foodhot" className="py-12 bg-white px-20 pt-24">
            <div className="container mx-auto px-4">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold">🥇 Món ăn bán chạy nhất</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayedFood.map((item, index) => (
                        <div key={item._id} data-aos="fade-up" data-aos-delay={index * 100}>
                            <FoodItem
                                id={item._id}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                image={item.image}
                                // isNew={index < 4}
                                isHot={index < 4}
                            />
                        </div>
                    ))}
                </div>

                {!showAll && topFood.length > 4 && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAll(true)}
                            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            Xem thêm
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FoodDisplay;
