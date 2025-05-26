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