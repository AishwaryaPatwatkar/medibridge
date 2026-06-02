# Stage 1: Build React project
FROM node:20-alpine AS builder

# Expose VITE_API_URL as a build-time argument for Vite asset compilation
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Install dependencies first (leverage Docker caching)
COPY package.json ./
RUN npm install

# Copy source code and build project
COPY . ./
RUN npm run build

# Stage 2: Serve static contents with Nginx
FROM nginx:stable-alpine

# Copy built assets to Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
