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

# Copy the Next.js app
COPY --from=builder /app /app

# Install necessary tools
RUN apk add --no-cache nodejs npm curl procps bash

# Expose ports
EXPOSE 80 3000

# Create startup script
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'set -ex' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Current directory: $(pwd)"' >> /start.sh && \
    echo 'echo "Listing /app directory:"' >> /start.sh && \
    echo 'ls -la /app' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Starting Next.js development server..."' >> /start.sh && \
    echo 'cd /app' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'if [ ! -f "package.json" ]; then' >> /start.sh && \
    echo '  echo "Error: package.json not found in /app"' >> /start.sh && \
    echo '  exit 1' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'sed -i \'/"my-v0-project": "file:",/d\' package.json' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Installing dependencies..."' >> /start.sh && \
    echo 'npm ci' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Running npm run dev..."' >> /start.sh && \
    echo 'npm run dev -- -H 0.0.0.0 &' >> /start.sh && \
    echo 'NEXT_PID=$!' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'check_nextjs() {' >> /start.sh && \
    echo '  curl -s http://localhost:3000 > /dev/null' >> /start.sh && \
    echo '  return $?' >> /start.sh && \
    echo '}' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Waiting for Next.js to be ready..."' >> /start.sh && \
    echo 'for i in $(seq 1 30); do' >> /start.sh && \
    echo '  if check_nextjs; then' >> /start.sh && \
    echo '    echo "Next.js is ready!"' >> /start.sh && \
    echo '    break' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo '  echo "Attempt $i: Waiting for Next.js..."' >> /start.sh && \
    echo '  sleep 2' >> /start.sh && \
    echo '  if [ $i -eq 30 ]; then' >> /start.sh && \
    echo '    echo "Next.js failed to start within 60 seconds"' >> /start.sh && \
    echo '    exit 1' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo 'done' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Starting Nginx..."' >> /start.sh && \
    echo 'nginx -g "daemon off;" &' >> /start.sh && \
    echo 'NGINX_PID=$!' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'while true; do' >> /start.sh && \
    echo '  if ! kill -0 $NEXT_PID 2>/dev/null; then' >> /start.sh && \
    echo '    echo "Next.js process died, exiting..."' >> /start.sh && \
    echo '    exit 1' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo '  if ! kill -0 $NGINX_PID 2>/dev/null; then' >> /start.sh && \
    echo '    echo "Nginx process died, exiting..."' >> /start.sh && \
    echo '    exit 1' >> /start.sh && \
    echo '  fi' >> /start.sh && \
    echo '  sleep 5' >> /start.sh && \
    echo 'done' >> /start.sh && \
    chmod +x /start.sh

# Start both nginx and Next.js dev server
CMD ["/bin/bash", "/start.sh"] 