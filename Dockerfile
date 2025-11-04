FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with API URL set at build time - must be env var for Vite to pick up
ENV VITE_API_URL=https://zira-tech.com/api.php

RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
