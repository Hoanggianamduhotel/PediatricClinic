# Deployment Guide - Clinic BS Khang

## Files Created for Deployment

✅ **build.js** - Build script to create production files  
✅ **start.js** - Production start script  
✅ **Procfile** - For Heroku/Railway deployment  
✅ **render.yaml** - For Render.com deployment  
✅ **server/production-server.js** - Production Express server  
✅ **deploy-test.js** - Fallback HTTP server  
✅ **dist/** - Built frontend files  

## Quick Deploy Steps

### Option 1: Render.com (Recommended)
1. Push code to GitHub repository
2. Connect GitHub repo to Render.com
3. Render will automatically detect `render.yaml` and deploy

### Option 2: Railway
1. Push code to GitHub 
2. Connect repo to Railway
3. Railway will use `Procfile` to deploy

### Option 3: Heroku
1. Push code to GitHub
2. Connect repo to Heroku
3. Heroku will use `Procfile` to deploy

## Build Commands
```bash
# Build frontend
node build.js

# Or manually
npx vite build
```

## Start Commands  
```bash
# Production start
node start.js

# Development
npm run dev (if package.json scripts available)
```

## Environment Variables Needed
- `NODE_ENV=production` (automatically set by start.js)
- `PORT` (automatically provided by hosting platforms)
- `DATABASE_URL` (optional - currently using in-memory storage)

## Features Working in Deployment
✅ Frontend Vue.js app with Vuetify Material Design  
✅ Patient registration API (`POST /api/benhnhan`)  
✅ Patient search API (`GET /api/benhnhan?search=name`)  
✅ Health check endpoint (`GET /health`)  
✅ Static file serving for SPA  
✅ Fallback server if Express fails  

## Troubleshooting
- If deployment fails with "Missing script: start", the platform should use `node start.js` directly
- The app includes fallback mechanisms for common deployment issues
- All necessary files are included and configured

## Test URLs After Deploy
- **Main App**: `https://your-app.domain.com/`
- **Health Check**: `https://your-app.domain.com/health`  
- **API Test**: `https://your-app.domain.com/api/benhnhan`