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
RUN echo '#!/bin/bash\n\
set -ex\n\
\n\
echo "Current directory: $(pwd)"\n\
echo "Listing /app directory:"\n\
ls -la /app\n\
\n\
echo "Starting Next.js development server..."\n\
cd /app\n\
\n\
# Check if package.json exists\n\
if [ ! -f "package.json" ]; then\n\
  echo "Error: package.json not found in /app"\n\
  exit 1\n\
fi\n\
\n\
# Remove circular dependency if it exists\n\
sed -i \'/"my-v0-project": "file:",/d\' package.json\n\
\n\
# Install dependencies\n\
echo "Installing dependencies..."\n\
npm ci\n\
\n\
# Start Next.js in the background\n\
echo "Running npm run dev..."\n\
npm run dev -- -H 0.0.0.0 &\n\
NEXT_PID=$!\n\
\n\
# Function to check if Next.js is ready\n\
check_nextjs() {\n\
  curl -s http://localhost:3000 > /dev/null\n\
  return $?\n\
}\n\
\n\
# Wait for Next.js to be ready\n\
echo "Waiting for Next.js to be ready..."\n\
for i in $(seq 1 30); do\n\
  if check_nextjs; then\n\
    echo "Next.js is ready!"\n\
    break\n\
  fi\n\
  echo "Attempt $i: Waiting for Next.js..."\n\
  sleep 2\n\
  if [ $i -eq 30 ]; then\n\
    echo "Next.js failed to start within 60 seconds"\n\
    exit 1\n\
  fi\n\
done\n\
\n\
echo "Starting Nginx..."\n\
nginx -g "daemon off;" &\n\
NGINX_PID=$!\n\
\n\
# Keep the container running and monitor both processes\n\
while true; do\n\
  if ! kill -0 $NEXT_PID 2>/dev/null; then\n\
    echo "Next.js process died, exiting..."\n\
    exit 1\n\
  fi\n\
  if ! kill -0 $NGINX_PID 2>/dev/null; then\n\
    echo "Nginx process died, exiting..."\n\
    exit 1\n\
  fi\n\
  sleep 5\n\
done\n\
' > /start.sh && chmod +x /start.sh

# Start both nginx and Next.js dev server
CMD ["/bin/bash", "/start.sh"] 