# Self-Hosting Guide - Complete Control

Guide for hosting the entire AI SaaS platform on your own server(s).

---

## 🎯 What You Need

### Minimum Requirements (0-10k users)

**Single Server:**
- **CPU:** 2-4 cores
- **RAM:** 4-8 GB
- **Storage:** 50-100 GB SSD
- **Bandwidth:** 1-5 TB/month

**Software:**
- Ubuntu 22.04 LTS (or your preferred Linux)
- Node.js 18+ (for Next.js)
- PostgreSQL 15+ (database)
- Nginx (reverse proxy)
- PM2 (process manager)
- Optional: Docker + Docker Compose

**Monthly Cost:** $10-40 depending on provider

---

## 🚀 Quick Setup (Without Docker)

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ai_toolbox;
CREATE USER ai_toolbox_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_toolbox TO ai_toolbox_user;
\q
```

### 3. Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/ai-toolbox
sudo chown $USER:$USER /var/www/ai-toolbox

# Clone repository
cd /var/www/ai-toolbox
git clone https://github.com/yourusername/AI-Toolbox.git .

# Install dependencies
npm install --legacy-peer-deps

# Setup environment variables
nano .env.production
```

### 4. Environment Variables

```bash
# .env.production
NODE_ENV=production

# Database
DATABASE_URL="postgresql://ai_toolbox_user:your_secure_password@localhost:5432/ai_toolbox"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_CLOUD_VISION_API_KEY="..."
DEEPL_API_KEY="..."
REPLICATE_API_TOKEN="r8_..."
```

### 5. Build Application

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build Next.js
npm run build

# Test production build locally
npm start
# Should run on http://localhost:3000
```

### 6. PM2 Process Manager

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'ai-toolbox',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ai-toolbox',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 2,  // Run 2 instances for load balancing
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/ai-toolbox-error.log',
    out_file: '/var/log/pm2/ai-toolbox-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Make PM2 start on system boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs ai-toolbox
```

### 7. Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ai-toolbox
```

```nginx
upstream nextjs_app {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/ai-toolbox-access.log;
    error_log /var/log/nginx/ai-toolbox-error.log;

    # Max upload size (for OCR images, etc.)
    client_max_body_size 20M;

    # Proxy to Next.js
    location / {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://nextjs_app;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ai-toolbox /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx and set up auto-renewal
```

---

## 🐳 Docker Setup (Recommended)

Much easier than manual setup!

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: ai-toolbox-db
    restart: always
    environment:
      POSTGRES_USER: ai_toolbox_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ai_toolbox
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ai_toolbox_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (for caching and queues)
  redis:
    image: redis:7-alpine
    container_name: ai-toolbox-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ai-toolbox-app
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://ai_toolbox_user:${DB_PASSWORD}@postgres:5432/ai_toolbox
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads  # For file uploads

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: ai-toolbox-nginx
    restart: always
    depends_on:
      - app
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - certbot_data:/var/www/certbot

volumes:
  postgres_data:
  redis_data:
  certbot_data:
```

### 3. Create .env File

```bash
# .env
DB_PASSWORD=your_secure_password_here
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_generated_secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
OPENAI_API_KEY=sk-...
# ... other API keys
```

### 4. Deploy with Docker

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

---

## 📊 Server Recommendations

### Budget Option ($10-20/month)
- **Hetzner Cloud CX21:** €4.90/month (2 vCPU, 4GB RAM)
- **DigitalOcean Droplet:** $12/month (2 vCPU, 2GB RAM)
- **Linode:** $12/month (2 GB RAM)

Good for: 0-5k users

### Mid-Tier ($40-60/month)
- **Hetzner Cloud CX31:** €8.90/month (2 vCPU, 8GB RAM)
- **DigitalOcean:** $24/month (2 vCPU, 4GB RAM)
- **Vultr High Frequency:** $24/month (2 vCPU, 4GB RAM)

Good for: 5k-20k users

### High Performance ($100-200/month)
- **Dedicated CPU servers**
- **4-8 vCPU, 16-32GB RAM**
- Multiple instances with load balancer

Good for: 20k-100k+ users

---

## 🔄 Deployment Workflow

### With Docker (Recommended)

```bash
# On your development machine
git add .
git commit -m "New features"
git push origin main

# On your server
cd /var/www/ai-toolbox
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec app npx prisma migrate deploy
```

### With PM2 (Manual)

```bash
# On your server
cd /var/www/ai-toolbox
git pull origin main
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart ai-toolbox
```

### Automated with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/ai-toolbox
            git pull origin main
            docker-compose down
            docker-compose build
            docker-compose up -d
```

---

## 📈 Scaling Strategy

### Phase 1: Single Server (0-10k users)
```
[Server]
  ├── Next.js App
  ├── PostgreSQL
  └── Redis
```

Cost: $10-40/month

### Phase 2: Separate Database (10k-50k users)
```
[App Server]          [DB Server]
  ├── Next.js    ─────→ PostgreSQL
  └── Redis
```

Cost: $50-100/month

### Phase 3: Load Balanced (50k-100k users)
```
                [Load Balancer]
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   [App Server] [App Server] [App Server]
        │            │            │
        └────────────┼────────────┘
                     ▼
              [DB Server (Primary)]
                     │
                     ▼
          [DB Server (Read Replica)]
                     │
                     ▼
              [Redis Cluster]
```

Cost: $200-500/month

Still cheaper than managed services!

---

## 🔒 Security Checklist

- [ ] Firewall configured (ufw or iptables)
- [ ] SSH key-only authentication
- [ ] Disable root login
- [ ] Fail2ban installed
- [ ] SSL/TLS certificates (Let's Encrypt)
- [ ] Database not exposed to internet
- [ ] Regular backups automated
- [ ] Security updates automated
- [ ] Environment variables secured
- [ ] Nginx rate limiting configured

---

## 📦 Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# /usr/local/bin/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="ai_toolbox"

# Create backup
pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/
```

```bash
# Add to crontab
sudo crontab -e

# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh
```

---

## 🎯 Summary

### Self-Hosting Wins:

| Feature | Self-Hosted | Vercel |
|---------|-------------|--------|
| **Cost (10k users)** | $20-50/month | $220/month |
| **Cost (100k users)** | $100-300/month | $500+/month |
| **Control** | 100% | Limited |
| **Cold Starts** | None | Yes |
| **Customization** | Unlimited | Limited |
| **Vendor Lock-in** | None | Yes |

### Quick Start:
1. Get a VPS ($10-20/month)
2. Install Docker & Docker Compose
3. Clone repo, configure .env
4. `docker-compose up -d`
5. Done!

### Deploy Updates:
```bash
git pull && docker-compose up -d --build
```

**Your setup with self-hosting is PERFECT!** 🚀

Maximum control, minimum cost, unlimited scaling potential.
