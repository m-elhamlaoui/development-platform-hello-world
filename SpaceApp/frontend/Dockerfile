# Build stage
FROM node:18.19.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:1.25-alpine
LABEL maintainer="SpaceApp Team"
LABEL description="SpaceApp Frontend"

# Copy built assets from builder stage
COPY --from=builder /app/.next/standalone /usr/share/nginx/html
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html/public
COPY nginx.conf /etc/nginx/nginx.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
