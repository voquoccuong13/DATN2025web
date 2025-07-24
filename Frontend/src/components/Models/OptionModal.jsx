import React, { useState } from 'react';
import { X } from 'lucide-react'; // icon close hiện đại

const OptionModal = ({ product, onClose, onConfirm }) => {
    const [selectedOptions, setSelectedOptions] = useState({});

    const handleSingle = (optionName, choice) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionName]: [choice],
        }));
    };

    const handleMultiple = (optionName, choice, checked) => {
        setSelectedOptions((prev) => {
            const prevChoices = prev[optionName] || [];
            return {
                ...prev,
                [optionName]: checked ? [...prevChoices, choice] : prevChoices.filter((c) => c.label !== choice.label),
            };
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                {/* Nút đóng */}
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Tuỳ chọn cho <span className="text-primary">{product.name}</span>
                </h2>

                {/* Danh sách tuỳ chọn */}
                {product.options?.map((opt, idx) => (
                    <div key={idx} className="mb-5">
                        <p className="font-semibold mb-3 text-gray-700">{opt.name}</p>
                        <div className="space-y-2">
                            {opt.type === 'single'
                                ? opt.choices.map((choice, i) => (
                                      <label key={i} className="flex items-center gap-3">
                                          <input
                                              type="radio"
                                              name={opt.name}
                                              onChange={() => handleSingle(opt.name, choice)}
                                              className="accent-primary"
                                          />
                                          <span>
                                              {choice.label}{' '}
                                              <span className="text-sm text-gray-500">
                                                  (+{choice.price.toLocaleString()}₫)
                                              </span>
                                          </span>
                                      </label>
                                  ))
                                : opt.choices.map((choice, i) => (
                                      <label key={i} className="flex items-center gap-3">
                                          <input
                                              type="checkbox"
                                              onChange={(e) => handleMultiple(opt.name, choice, e.target.checked)}
                                              className="accent-primary"
                                          />
                                          <span>
                                              {choice.label}{' '}
                                              <span className="text-sm text-gray-500">
                                                  (+{choice.price.toLocaleString()}₫)
                                              </span>
                                          </span>
                                      </label>
                                  ))}
                        </div>
                    </div>
                ))}

                {/* Nút hành động */}
                <div className="flex justify-end gap-3 pt-6">
                    <button onClick={onClose} className="text-gray-600 hover:underline hover:text-gray-900 transition">
                        Huỷ
                    </button>
                    <button
                        onClick={() => {
                            const extraPrice = Object.values(selectedOptions)
                                .flat()
                                .reduce((sum, c) => sum + c.price, 0);
                            const finalProduct = {
                                ...product,
                                selectedOptions,
                                price: product.price + extraPrice,
                            };
                            onConfirm(finalProduct);
                        }}
                        className="bg-gradient-to-r from-pink-500 to-red-500 hover:opacity-90 text-white px-5 py-2 rounded-full font-medium shadow-lg transition"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionModal;
