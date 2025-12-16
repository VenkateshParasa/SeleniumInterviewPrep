# Interview Preparation Platform - Backend Setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Git (optional)

### Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd /Users/venkateshparasa/Desktop/Interview-Prep-Java-Selenium-API/practice-ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open the application:**
   - Backend API: http://localhost:3001
   - Frontend: Open `index.html` in browser or serve with live server

### 🔐 Demo Authentication

The backend uses a JSON-based authentication system with demo accounts:

| Username | Password | Experience Level |
|----------|----------|------------------|
| `demo_user` | `demo123` | Senior |
| `john_doe` | `password123` | Mid |
| `sarah_wilson` | `secure456` | Junior |

### 📁 Project Structure

```
practice-ui/
├── server.js              # Express backend server
├── credentials.json       # User credentials & sessions
├── package.json          # Dependencies
├── .env                  # Environment variables
├── user-data/           # Individual user progress files
├── backups/             # Automatic data backups
├── js/
│   └── api-client.js    # Frontend API client
├── app.js               # Main frontend application
├── styles.css           # Styling
└── index.html          # Entry point
```

### 🔧 API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

#### User Data
- `GET /api/user/data` - Get user progress & settings
- `POST /api/user/progress` - Update user progress
- `POST /api/user/settings` - Update user settings

#### Content
- `GET /api/content/practice-data?level=senior` - Get practice content
- `GET /api/content/interview-questions` - Get interview questions

#### Monitoring
- `GET /api/health` - Server health check
- `GET /api/status` - Server status (requires auth)
- `GET /api/analytics/stats` - User analytics (requires auth)

### 🌟 Features

#### Frontend (Enhanced PWA)
- ✅ **Authentication Integration** - Login/logout with demo accounts
- ✅ **Real-time Data Sync** - Automatic sync with backend
- ✅ **Offline Support** - Works without internet connection
- ✅ **PWA Installation** - Install as native app
- ✅ **Dark Mode** - System preference aware
- ✅ **Settings Panel** - Comprehensive customization
- ✅ **Progress Tracking** - Advanced analytics dashboard
- ✅ **Interview Questions** - Searchable question database

#### Backend (JSON-based)
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **File-based Storage** - JSON credentials & user data
- ✅ **Automatic Backups** - Data protection
- ✅ **Rate Limiting** - API protection
- ✅ **CORS Support** - Cross-origin requests
- ✅ **Security Headers** - Helmet.js protection
- ✅ **Logging** - Morgan request logging
- ✅ **Error Handling** - Comprehensive error responses

### 🔄 Data Synchronization

The application automatically:
1. **Syncs on login** - Merges local and server data
2. **Queues offline changes** - Saves when connection restored
3. **Handles conflicts** - Prefers most recent data
4. **Backs up data** - Automatic server-side backups

### 🛠️ Development

#### Environment Variables
Copy `.env` and adjust if needed:
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### Scripts
- `npm start` - Production server
- `npm run dev` - Development with nodemon
- `npm test` - Run tests (when added)
- `npm run lint` - Code linting

### 🚨 Important Notes

#### Security Considerations
- **Demo passwords are plain text** - Use bcrypt for production
- **JWT secret should be strong** - Generate secure random key
- **HTTPS required in production** - Enable SSL/TLS
- **Rate limiting configured** - 100 requests/15min, 5 auth/15min

#### File Locations
- **User data:** `user-data/{userId}.json`
- **Credentials:** `credentials.json` (excluded from git)
- **Backups:** `backups/credentials-backup-{timestamp}.json`
- **Logs:** Console output (configure file logging if needed)

### 🎯 Next Steps

1. **Enhanced Authentication:** Replace JSON auth with proper database
2. **Real Database:** Move from files to MongoDB/PostgreSQL
3. **Email Features:** Password reset, notifications
4. **Admin Panel:** User management interface
5. **Analytics:** Advanced reporting dashboard
6. **Cloud Deployment:** Deploy to AWS/Heroku/Netlify

### 📞 Support

For issues or questions:
- Check console logs for error details
- Verify all dependencies are installed
- Ensure ports 3001 (backend) and 3000 (frontend) are available
- Check network connectivity for API calls

---

**Status:** ✅ Phase 4 Backend Integration Complete
**Last Updated:** December 2024
**Version:** 1.0.0