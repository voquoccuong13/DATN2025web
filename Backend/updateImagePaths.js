// updateImagePaths.js
const mongoose = require('mongoose');
const Product = require('./models/productModel');
require('dotenv').config();

async function updateImages() {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Product.updateMany({ image: { $regex: 'railway.app' } }, [
        {
            $set: {
                image: {
                    $replaceOne: {
                        input: '$image',
                        find: 'https://eatgofood-web-production.up.railway.app',
                        replacement: 'http://localhost:9000',
                    },
                },
            },
        },
    ]);

    console.log(`✅ Đã cập nhật ${result.modifiedCount} sản phẩm.`);
    process.exit(0);
}

updateImages().catch((err) => {
    console.error('❌ Lỗi khi cập nhật:', err);
    process.exit(1);
});
