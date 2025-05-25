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
RUN apk add --no-cache nodejs npm curl procps bash

# Expose ports
EXPOSE 80 3000

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting Next.js development server..."\n\
cd /app\n\
\n\
# Start Next.js in the background\n\
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
nginx -g "daemon off;"\n\
' > /start.sh && chmod +x /start.sh

# Start both nginx and Next.js dev server
CMD ["/bin/bash", "/start.sh"] 