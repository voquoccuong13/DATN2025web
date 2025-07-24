import React from 'react';
import delivery from '../assets/delivery.avif';

const Derlivery = () => {
    return (
        <div>
            {/* <!-- Giao hàng --> */}
            <section className="py-12 bg-white px-4 md:px-10 lg:px-20">
                <div className="container mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Khu vực giao hàng</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div
                            className="rounded-lg overflow-hidden h-60 sm:h-80 md:h-[400px] bg-cover bg-center"
                            style={{ backgroundImage: `url(${delivery})` }}
                            data-aos="fade-right"
                            data-aos-duration="1000"
                        ></div>

                        <div
                            className="flex flex-col justify-center"
                            data-aos="fade-left"
                            data-aos-delay="200"
                            data-aos-duration="1000"
                        >
                            <h3 className="text-xl sm:text-2xl font-bold mb-4">Chúng tôi giao hàng đến đâu?</h3>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">
                                Dịch vụ giao hàng của chúng tôi hiện đang phục vụ các khu vực nội thành Hà Nội và TP. Hồ
                                Chí Minh với thời gian giao hàng nhanh chóng trong vòng 30 phút.
                            </p>

                            <div className="space-y-4 mb-6">
                                {/* Thời gian */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                                        <i className="ri-time-line text-primary"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base">Thời gian giao hàng</h4>
                                        <p className="text-gray-600 text-xs sm:text-sm">
                                            20-30 phút (tùy khoảng cách và số lượng đơn hàng)
                                        </p>
                                    </div>
                                </div>

                                {/* Phí giao hàng */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                                        <i className="ri-money-dollar-circle-line text-primary"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base">Phí giao hàng</h4>
                                        <p className="text-gray-600 text-xs sm:text-sm">
                                            15.000 ₫ - 20.000 ₫ (trong bán kính 5km)
                                        </p>
                                    </div>
                                </div>

                                {/* Miễn phí */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                                        <i className="ri-gift-line text-primary"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base">Miễn phí giao hàng</h4>
                                        <p className="text-gray-600 text-xs sm:text-sm">Cho đơn hàng từ 300.000 ₫</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Derlivery;
