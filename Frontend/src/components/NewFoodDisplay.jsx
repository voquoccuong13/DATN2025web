import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FoodItem from './FoodItem';

const NewFoodDisplay = () => {
    const [newFoods, setNewFoods] = useState([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchNewFoods = async () => {
            try {
                const res = await axios.get('/api/products/new');
                setNewFoods(res?.data?.products || []);
            } catch (err) {
                console.error('Lỗi khi lấy sản phẩm mới:', err);
            }
        };
        fetchNewFoods();
    }, []);

    const displayedFood = showAll ? newFoods || [] : newFoods?.slice?.(0, 4) || [];

    return (
        <section id="new-food" className="py-12 bg-gray-50 px-20">
            <div className="container mx-auto px-4">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800">🆕 Món ăn mới ra mắt</h2>
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
                                isNew={true} // 👈 truyền prop để gắn badge "Mới"
                            />
                        </div>
                    ))}
                </div>

                {!showAll && newFoods.length > 4 && (
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

export default NewFoodDisplay;
