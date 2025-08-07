# Dockerfile cho Backend Node.js

# 1. Sử dụng image Node chính thức
FROM node:18

# 2. Tạo thư mục app
WORKDIR /app

# 3. Copy file cấu hình và cài thư viện
COPY package*.json ./
RUN npm install

# 4. Copy toàn bộ mã nguồn
COPY . .

# 5. Expose cổng backend
EXPOSE 9000

# 6. Chạy app
CMD ["npm", "start"]
