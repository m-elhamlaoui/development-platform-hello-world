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

# Create startup script with proper shell handling
RUN cat > /start.sh << 'EOF'
#!/bin/bash
set -ex

echo "Current directory: $(pwd)"
echo "Listing /app directory:"
ls -la /app

echo "Starting Next.js development server..."
cd /app

if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in /app"
  exit 1
fi

sed -i '/"my-v0-project": "file:",/d' package.json

echo "Installing dependencies..."
npm ci

echo "Running npm run dev..."
npm run dev -- -H 0.0.0.0 &
NEXT_PID=$!

check_nextjs() {
  curl -s http://localhost:3000 > /dev/null
  return $?
}

echo "Waiting for Next.js to be ready..."
for i in $(seq 1 30); do
  if check_nextjs; then
    echo "Next.js is ready!"
    break
  fi
  echo "Attempt $i: Waiting for Next.js..."
  sleep 2
  if [ $i -eq 30 ]; then
    echo "Next.js failed to start within 60 seconds"
    exit 1
  fi
done

echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

while true; do
  if ! kill -0 $NEXT_PID 2>/dev/null; then
    echo "Next.js process died, exiting..."
    exit 1
  fi
  if ! kill -0 $NGINX_PID 2>/dev/null; then
    echo "Nginx process died, exiting..."
    exit 1
  fi
  sleep 5
done
EOF

RUN chmod +x /start.sh

# Start both nginx and Next.js dev server
CMD ["/bin/bash", "/start.sh"]