# Setup Instructions for Interview Prep Platform

## Quick Start Guide

### Step 1: Start the Backend Server

1. Open a terminal in the `practice-ui` folder
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   🚀 Interview Prep Backend Server running on port 3001
   📍 API Endpoint: http://localhost:3001/api
   ```

   **Important:** Keep this terminal running!

### Step 2: Open the Frontend

**Option A: Using Python (Recommended)**
1. Open a NEW terminal in the `practice-ui` folder
2. Run one of these commands:
   ```bash
   # Python 3
   python3 -m http.server 8080
   
   # OR Python 2
   python -m SimpleHTTPServer 8080
   ```
3. Open your browser and go to: `http://localhost:8080`

**Option B: Using Node.js http-server**
1. Install http-server globally (first time only):
   ```bash
   npm install -g http-server
   ```
2. Run in the `practice-ui` folder:
   ```bash
   http-server -p 8080
   ```
3. Open your browser and go to: `http://localhost:8080`

**Option C: Using VS Code Live Server Extension**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Step 3: Login

Use these demo credentials:
- **Username:** `demo_user`
- **Password:** `demo123`

OR

- **Username:** `john_doe`
- **Password:** `password123`

## Troubleshooting

### "Cannot connect to server" error
- Make sure the backend server is running on port 3001
- Check that you started it with `npm start` in the practice-ui folder

### "Endpoint not found" error when accessing http://localhost:3001
- This is normal! The backend is an API server, not a web server
- Don't open `localhost:3001` in your browser
- Instead, open the frontend using one of the methods in Step 2

### Login modal doesn't close
- Check the browser console (F12) for error messages
- Make sure both servers are running (backend on 3001, frontend on 8080)
- Try clearing browser cache and localStorage

### CORS errors
- Make sure you're accessing the frontend through `localhost:8080` (or another allowed port)
- Don't open the HTML file directly from the file system if you see CORS errors

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (HTML/CSS/JS)             │
│  http://localhost:8080              │
│  - index.html                       │
│  - app.js                           │
│  - api-client.js                    │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               │ (fetch API)
               ▼
┌─────────────────────────────────────┐
│  Backend API Server                 │
│  http://localhost:3001/api          │
│  - Express.js                       │
│  - Authentication                   │
│  - Data Storage                     │
└─────────────────────────────────────┘
```

## Notes

- The backend runs on port **3001**
- The frontend should run on port **8080** (or any other port except 3001)
- Both need to be running simultaneously for the app to work
- The backend provides API endpoints, not HTML pages