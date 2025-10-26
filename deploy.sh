#!/bin/bash
# Simple deployment script for self-hosted server

set -e

echo "🚀 Deploying AI Toolbox..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop containers
echo "⏹️  Stopping containers..."
docker-compose down

# Build new images
echo "🔨 Building application..."
docker-compose build --no-cache

# Start containers
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "🗃️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Check status
echo "✅ Checking status..."
docker-compose ps

echo "🎉 Deployment complete!"
echo "📊 View logs: docker-compose logs -f app"
echo "🔍 Check status: docker-compose ps"
