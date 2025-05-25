# Development stage
FROM node:18.19.0-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Serve with nginx
FROM nginx:1.25-alpine
LABEL maintainer="SpaceApp Team"
LABEL description="SpaceApp Frontend Development"

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the Next.js app
COPY --from=builder /app /app

# Install necessary tools
RUN apk add --no-cache nodejs npm

# Expose ports
EXPOSE 80 3000

# Start both nginx and Next.js dev server
CMD sh -c "cd /app && npm run dev & nginx -g 'daemon off;'" 