# Deployment Guide - Academic Management System

This guide covers deployment options and best practices for the Academic Management System.

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) + Supabase (Database)

**Recommended for:**
- Quick deployment
- Free tier available
- Easy CI/CD integration

### Option 2: AWS (EC2/ECS) + RDS + CloudFront

**Recommended for:**
- Production environments
- High scalability requirements
- Full control over infrastructure

### Option 3: Docker + Kubernetes

**Recommended for:**
- Containerized deployments
- Microservices architecture
- Multi-environment management

## Prerequisites

- All environment variables configured
- Database schema deployed
- SSL certificates (for production)
- Domain name (optional but recommended)

## Deployment Steps

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Configure Environment Variables:**
   - Go to Vercel project settings
   - Add environment variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api/v1
     ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Backend Deployment (Railway)

1. **Create Railway Account:**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository

2. **Create New Project:**
   - Select your repository
   - Add service from `backend` directory

3. **Configure Environment Variables:**
   Add all variables from `backend/.env` in Railway dashboard

4. **Deploy:**
   - Railway will automatically deploy on push
   - Or deploy manually from dashboard

### Database (Supabase)

1. **Production Project:**
   - Create a new Supabase project for production
   - Copy production URL and keys

2. **Run Migrations:**
   - Use Supabase migration tool
   - Or run SQL schema from `docs/Database_Schema.md`

3. **Configure RLS:**
   - Set up Row Level Security policies
   - Test with production credentials

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
CORS_ORIGIN=https://staging.yourdomain.com
LOG_LEVEL=info
```

### Production

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=50
```

## Security Checklist

- [ ] Use HTTPS for all connections
- [ ] Secure JWT secrets (32+ characters, random)
- [ ] Enable CORS only for trusted domains
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Use environment-specific database credentials
- [ ] Enable Supabase RLS policies
- [ ] Configure secure headers (Helmet.js)
- [ ] Set up SSL/TLS certificates

## Performance Optimization

### Backend

1. **Enable Compression:**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Database Indexing:**
   - Ensure indexes are created from schema
   - Monitor slow queries

3. **Caching:**
   - Consider Redis for session storage
   - Cache frequently accessed data

### Frontend

1. **Build Optimization:**
   ```bash
   npm run build
   ```
   - Optimized production build
   - Code splitting enabled
   - Asset optimization

2. **CDN Configuration:**
   - Serve static assets from CDN
   - Enable gzip compression

## Monitoring & Logging

### Recommended Tools

- **Backend Logging:** Winston (already configured)
- **Error Tracking:** Sentry
- **Performance:** New Relic or Datadog
- **Uptime:** UptimeRobot or Pingdom

### Setup Sentry

```bash
npm install @sentry/node @sentry/react
```

Configure in backend:
```typescript
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

Configure in frontend:
```typescript
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });
```

## Backup Strategy

### Database Backups

1. **Supabase Automated Backups:**
   - Enable daily backups in Supabase dashboard
   - Retention: 7 days (free tier), 30 days (paid)

2. **Manual Backup:**
   ```sql
   -- Export via Supabase CLI or dashboard
   ```

### Code Backups

- Use Git repository
- Tag production releases
- Keep deployment history

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd backend
          npm ci
          npm run build
          # Deploy to Railway/Render/etc.
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          npm ci
          npm run build
          # Deploy to Vercel/etc.
```

## Post-Deployment

1. **Verify Deployment:**
   - Test all critical paths
   - Check API endpoints
   - Verify database connections

2. **Monitor:**
   - Set up alerts for errors
   - Monitor response times
   - Track user activity

3. **Document:**
   - Update deployment notes
   - Document any custom configurations
   - Keep deployment logs

## Rollback Procedure

### Backend Rollback

```bash
# Railway/Render
# Use dashboard to rollback to previous deployment
```

### Database Rollback

```bash
# Restore from backup via Supabase dashboard
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancer
- Multiple backend instances
- Database connection pooling

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Cache frequently accessed data

## Maintenance Windows

1. **Schedule:**
   - Plan during low-usage hours
   - Notify users in advance

2. **Procedure:**
   - Put system in maintenance mode
   - Perform updates
   - Run health checks
   - Re-enable system

## Support & Troubleshooting

- Check application logs
- Review error tracking (Sentry)
- Monitor database performance
- Check API response times

---

**Note:** This is a general deployment guide. Adjust based on your specific hosting provider and requirements.

