# Development stage
FROM node:18.19.0-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
# Remove the circular dependency
RUN sed -i '/"my-v0-project": "file:",/d' package.json
RUN npm ci

# Copy source code
COPY . .

# Serve with nginx
FROM nginx:1.25-alpine
LABEL maintainer="SpaceApp Team"
LABEL description="SpaceApp Frontend Development"

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create app directory and set permissions
RUN mkdir -p /app && chown -R nginx:nginx /app

# Copy the Next.js app
COPY --from=builder --chown=nginx:nginx /app /app

# Install necessary tools
RUN apk add --no-cache nodejs npm curl procps bash

# Expose ports
EXPOSE 80 3000

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Start both nginx and Next.js dev server
CMD ["/bin/bash", "/start.sh"]