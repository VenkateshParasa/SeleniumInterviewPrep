# Netlify Deployment Guide

## Overview

This application has **two parts** that need to be deployed separately:

1. **Frontend** (Static Files) → Deploy to **Netlify**
2. **Backend** (Node.js API) → Deploy to **Heroku/Railway/Render**

## Step 1: Deploy Backend API

### Option A: Deploy to Railway (Recommended - Free Tier)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-change-this
   PORT=3001
   FRONTEND_URL=https://your-app.netlify.app
   ```
6. Railway will auto-deploy from `practice-ui/server.js`
7. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Render (Free Tier)

1. Go to [Render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `practice-ui`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as above)
6. Copy your Render URL

### Option C: Deploy to Heroku

1. Install Heroku CLI
2. Run:
   ```bash
   cd practice-ui
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=https://your-app.netlify.app
   git push heroku main
   ```

## Step 2: Update Frontend Configuration

1. Open `practice-ui/js/api-client.js`
2. Update the `baseURL` to use your deployed backend:
   ```javascript
   constructor() {
       // Use environment-based URL
       this.baseURL = window.location.hostname === 'localhost'
           ? 'http://localhost:3001/api'
           : 'https://your-backend.railway.app/api'; // Replace with your backend URL
   }
   ```

## Step 3: Deploy Frontend to Netlify

### Method 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
netlify deploy --dir=practice-ui --prod
```

### Method 2: Netlify Dashboard

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `practice-ui`
   - **Publish directory**: `practice-ui`
   - **Build command**: (leave empty)
5. Click "Deploy site"

### Method 3: Drag & Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the `practice-ui` folder
3. Done!

## Step 4: Update Backend CORS

After deploying to Netlify, update your backend's CORS configuration:

1. In your backend deployment (Railway/Render/Heroku), set:
   ```
   FRONTEND_URL=https://your-actual-app.netlify.app
   ```

2. Or manually update `server.js` line 60:
   ```javascript
   const allowedOrigins = process.env.NODE_ENV === 'production'
     ? [
         'https://your-actual-app.netlify.app', // Your Netlify URL
         process.env.FRONTEND_URL
       ].filter(Boolean)
   ```

## Step 5: Test Your Deployment

1. Visit your Netlify URL: `https://your-app.netlify.app`
2. Try logging in with demo credentials
3. Check browser console for any errors
4. Verify API calls are going to your backend URL

## Troubleshooting

### CORS Errors in Production

**Problem**: "Access to fetch has been blocked by CORS policy"

**Solution**:
1. Verify `FRONTEND_URL` environment variable is set correctly
2. Check backend logs to see which origin is being blocked
3. Ensure your Netlify URL matches exactly (with/without trailing slash)

### Backend Not Responding

**Problem**: "Failed to fetch" or "Network error"

**Solution**:
1. Check if backend is running (visit `https://your-backend.railway.app/api/health`)
2. Verify environment variables are set
3. Check backend logs for errors

### Login Not Working

**Problem**: Login fails even with correct credentials

**Solution**:
1. Verify `credentials.json` exists in backend deployment
2. Check JWT_SECRET is set
3. Ensure backend database/file storage is working

## Environment Variables Summary

### Backend (Railway/Render/Heroku)
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=https://your-app.netlify.app
```

### Frontend (Netlify)
No environment variables needed - configuration is in code.

## Cost Estimate

- **Netlify**: Free (100GB bandwidth/month)
- **Railway**: Free tier (500 hours/month, $5 credit)
- **Render**: Free tier (750 hours/month)
- **Heroku**: Free tier deprecated, starts at $7/month

## Recommended Setup

For **zero cost**:
1. Frontend → Netlify (Free)
2. Backend → Railway (Free tier)

Total: **$0/month** 🎉