# Dockerfile cho React + Vite

# Stage 1: Build
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy từ build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"]
