# 🚀 Deployment Guide: localStorage + Netlify Blobs Sync

## Overview

This guide will help you deploy your Interview Prep Platform with automatic cloud backup using Netlify Functions and Netlify Blobs.

**Architecture:**
- **Frontend:** Static files hosted on Netlify
- **Backend:** Netlify Functions (serverless)
- **Storage:** localStorage (primary) + Netlify Blobs (cloud backup)
- **Authentication:** None required (device ID based)

---

## 📋 Prerequisites

- GitHub account
- Netlify account (free tier)
- Node.js 18+ installed locally
- Git installed

---

## 🎯 Step 1: Install Dependencies

```bash
cd practice-ui
npm install
```

This installs:
- `@netlify/blobs` - Cloud storage
- `netlify-cli` - Local development and deployment

---

## 🧪 Step 2: Test Locally

### Start Netlify Dev Server

```bash
npm run dev
```

This starts:
- Frontend at `http://localhost:8888`
- Netlify Functions at `http://localhost:8888/.netlify/functions/`

### Test the Application

1. Open `http://localhost:8888` in your browser
2. Open DevTools Console (F12)
3. Look for these messages:
   ```
   ✅ API Client initialized
   📱 Device ID: device_1234567890_abc123
   🌐 API URL: http://localhost:8888/.netlify/functions
   ```

4. Complete a study day or task
5. Check console for:
   ```
   ✅ Progress saved to localStorage
   ☁️ Data synced to cloud
   ```

### Test Cloud Sync

1. Complete some progress
2. Open DevTools → Application → Local Storage
3. Clear all localStorage data
4. Refresh the page
5. Your data should be restored from cloud!

---

## 🌐 Step 3: Deploy to Netlify

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Netlify Functions cloud sync"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select your repository
   - Configure build settings:
     - **Base directory:** Leave empty
     - **Build command:** Leave empty
     - **Publish directory:** `practice-ui`
     - **Functions directory:** `practice-ui/netlify/functions`
   - Click "Deploy site"

3. **Wait for deployment** (1-2 minutes)

4. **Get your URL:**
   - Copy your Netlify URL (e.g., `https://your-app.netlify.app`)

### Option B: Deploy via CLI

```bash
# Login to Netlify
netlify login

# Deploy
cd practice-ui
netlify deploy --prod
```

Follow the prompts and your site will be deployed!

---

## ✅ Step 4: Verify Deployment

### Test Production Site

1. **Open your Netlify URL** in browser

2. **Check Console** for initialization:
   ```
   ✅ API Client initialized
   📱 Device ID: device_xxx
   🌐 API URL: /.netlify/functions
   ```

3. **Test Cloud Sync:**
   - Complete a study day
   - Check console: `☁️ Data synced to cloud`
   - Open in incognito/private window
   - Data should load from cloud

4. **Test Multi-Device:**
   - Open on your phone
   - New device ID will be created
   - Data is separate per device (by design)

---

## 🔧 Step 5: Configuration (Optional)

### Enable Netlify Blobs

Netlify Blobs is automatically enabled. No configuration needed!

**Free Tier Limits:**
- 1GB storage
- 1GB bandwidth per month
- Unlimited requests

### Monitor Usage

1. Go to Netlify Dashboard
2. Your site → "Blobs" tab
3. View storage usage and data

---

## 🎨 Step 6: Customize (Optional)

### Change Device Linking

To allow users to manually link devices, add this to your UI:

```javascript
// Show device ID to user
const deviceInfo = window.apiClient.getDeviceInfo();
console.log('Your Device ID:', deviceInfo.deviceId);

// Link to another device
await window.apiClient.linkToDevice('device_1234567890_abc123');
```

### Add Manual Sync Button

Add to your HTML:

```html
<button onclick="manualSync()">🔄 Sync Now</button>

<script>
async function manualSync() {
    const result = await window.apiClient.syncToCloud(
        portal.progress,
        portal.dashboardData,
        portal.settings
    );
    
    if (result.success) {
        alert('✅ Synced to cloud!');
    } else {
        alert('❌ Sync failed');
    }
}
</script>
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"

**Solution:** This error should be gone now! If you still see it:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check console for actual errors

### Issue: Data not syncing to cloud

**Symptoms:** Console shows sync errors

**Solutions:**
1. Check Netlify Functions logs:
   - Netlify Dashboard → Functions → View logs
2. Verify Netlify Blobs is enabled:
   - Netlify Dashboard → Blobs tab
3. Check network tab for failed requests

### Issue: "Device ID not found"

**Solution:** This is normal for new devices. Each device gets its own ID.

To link devices:
```javascript
// On device 1: Get device ID
console.log(window.apiClient.deviceId);

// On device 2: Link to device 1
await window.apiClient.linkToDevice('device_from_device_1');
```

### Issue: Functions not deploying

**Solution:**
1. Check `netlify.toml` is in project root
2. Verify functions are in `practice-ui/netlify/functions/`
3. Check Netlify build logs for errors
4. Ensure `@netlify/blobs` is in dependencies

### Issue: CORS errors

**Solution:** Already configured in `netlify.toml`. If still seeing errors:
1. Check browser console for exact error
2. Verify `netlify.toml` headers section
3. Redeploy site

---

## 📊 Monitoring

### Check Sync Status

Add this to your app:

```javascript
// Show last sync time
const deviceInfo = window.apiClient.getDeviceInfo();
console.log('Last sync:', deviceInfo.lastSyncTime);

// Check if online
const isOnline = await window.apiClient.isOnline();
console.log('API online:', isOnline);
```

### View Netlify Logs

1. Netlify Dashboard → Your site
2. "Functions" tab
3. Click on `sync-data` function
4. View real-time logs

---

## 🔐 Security Notes

### Current Setup (No Auth)

- Each device has unique ID
- No passwords required
- Data is device-specific
- Anyone with device ID can access that device's data

### Future: Add Authentication

When you're ready to add user accounts:

1. Replace device ID with user ID
2. Add login/signup UI
3. Use Netlify Identity or Supabase Auth
4. Update sync function to use user ID instead of device ID

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)

**Netlify:**
- Hosting: Free (100GB bandwidth)
- Functions: Free (125k requests/month)
- Blobs: Free (1GB storage, 1GB bandwidth)

**Total: $0/month** 🎉

### If You Exceed Free Tier

- Netlify Pro: $19/month (1TB bandwidth, 2M function requests)
- Blobs overage: $0.10/GB storage, $0.10/GB bandwidth

---

## 🎓 How It Works

### Data Flow

```
User Action (Complete Day)
    ↓
Save to localStorage (instant)
    ↓
Trigger background sync
    ↓
Netlify Function receives data
    ↓
Store in Netlify Blobs
    ↓
Return success
```

### On App Load

```
App starts
    ↓
Check for cloud data
    ↓
If found: Restore from cloud
    ↓
If not found: Use localStorage
    ↓
Continue with local data
```

---

## 📚 Additional Resources

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify Blobs Docs](https://docs.netlify.com/blobs/overview/)
- [Netlify CLI Docs](https://docs.netlify.com/cli/get-started/)

---

## 🎉 Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Local testing works (`npm run dev`)
- [ ] Cloud sync working locally
- [ ] Pushed to GitHub
- [ ] Connected to Netlify
- [ ] Production deployment successful
- [ ] Cloud sync working in production
- [ ] Tested on multiple devices
- [ ] No "Cannot connect to server" error

---

## 🆘 Need Help?

If you encounter issues:

1. Check Netlify build logs
2. Check browser console for errors
3. Check Netlify Functions logs
4. Verify all files are committed to Git
5. Try redeploying: `netlify deploy --prod`

---

**Congratulations! Your app now has automatic cloud backup! 🎊**