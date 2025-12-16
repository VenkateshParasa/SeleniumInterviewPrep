# 🔌 API Documentation

## Overview
Complete API reference for the Interview Preparation Platform backend services.

> **📋 Interactive API Documentation Available**
> - **Swagger UI**: [Open Interactive Docs](./index.html) - Try API endpoints directly
> - **OpenAPI Spec**: [swagger.json](./swagger.json) - Complete API specification
> - **Postman Collection**: Import swagger.json into Postman for testing

---

## 🚀 Quick Start

### **Option 1: Interactive Documentation**
Open `docs/api/index.html` in your browser for full interactive API documentation with:
- ✅ Try-it-out functionality for all endpoints
- ✅ Request/response examples
- ✅ Schema validation
- ✅ Authentication testing

### **Option 2: Import into Postman**
1. Open Postman
2. Click "Import"
3. Select `docs/api/swagger.json`
4. Generate collection with all endpoints

### **Option 3: Use with Code Generators**
Generate client SDKs using the OpenAPI specification:
```bash
# Generate JavaScript client
npx @openapitools/openapi-generator-cli generate \
  -i docs/api/swagger.json \
  -g javascript \
  -o ./generated/js-client

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i docs/api/swagger.json \
  -g python \
  -o ./generated/python-client
```

---

## 📡 API Endpoints

### 🎯 Questions Management API

#### Get All Questions
```http
GET /api/questions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "q001",
      "category": "java",
      "question": "What is JVM?",
      "answer": "Java Virtual Machine...",
      "difficulty": "beginner",
      "tags": ["java", "basics", "jvm"]
    }
  ],
  "total": 155
}
```

#### Get Questions by Category
```http
GET /api/questions/:category
```

**Parameters:**
- `category` (string): java, selenium, api, database, etc.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "category": "java",
  "count": 32
}
```

#### Get Question by ID
```http
GET /api/questions/:category/:id
```

**Parameters:**
- `category` (string): Question category
- `id` (string): Question ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "q001",
    "question": "What is JVM?",
    "answer": "Java Virtual Machine is...",
    "difficulty": "beginner",
    "tags": ["java", "basics"]
  }
}
```

### 📊 Practice Session API

#### Start Practice Session
```http
POST /api/practice/start
```

**Request Body:**
```json
{
  "category": "java",
  "difficulty": "intermediate",
  "questionCount": 10
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_123",
  "questions": [...],
  "startTime": "2025-12-15T10:00:00Z"
}
```

#### Submit Answer
```http
POST /api/practice/submit
```

**Request Body:**
```json
{
  "sessionId": "session_123",
  "questionId": "q001",
  "userAnswer": "Java Virtual Machine",
  "timeTaken": 30
}
```

**Response:**
```json
{
  "success": true,
  "correct": true,
  "explanation": "Correct! JVM is indeed...",
  "score": 95
}
```

#### Get Session Results
```http
GET /api/practice/results/:sessionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "totalQuestions": 10,
    "correctAnswers": 8,
    "score": 80,
    "timeTaken": 300,
    "results": [...]
  }
}
```

### 📈 Analytics API

#### Get User Statistics
```http
GET /api/analytics/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 25,
    "averageScore": 82,
    "totalQuestions": 250,
    "correctAnswers": 205,
    "categoryStats": {
      "java": { "sessions": 10, "avgScore": 85 },
      "selenium": { "sessions": 8, "avgScore": 78 }
    }
  }
}
```

#### Get Progress Data
```http
GET /api/analytics/progress
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-12-15",
      "score": 85,
      "questionsAnswered": 20
    }
  ]
}
```

### ⚙️ Configuration API

#### Get Application Config
```http
GET /api/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "features": {
      "analytics": true,
      "offline": true,
      "export": true
    },
    "categories": ["java", "selenium", "api", "database"],
    "difficulties": ["beginner", "intermediate", "advanced"]
  }
}
```

#### Update Settings
```http
PUT /api/config/settings
```

**Request Body:**
```json
{
  "theme": "dark",
  "language": "en",
  "notifications": true
}
```

---

## 🔒 Authentication

### Session-Based Authentication
Currently using session-based authentication for development mode.

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "sessionId": "sess_abc123"
}
```

#### Logout
```http
POST /api/auth/logout
```

---

## 📝 Request/Response Format

### Standard Response Format
All API responses follow this format:

```json
{
  "success": boolean,
  "data": object|array,
  "message": "string (optional)",
  "error": "string (optional)",
  "timestamp": "ISO 8601 timestamp"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Detailed error information",
  "timestamp": "2025-12-15T10:00:00Z"
}
```

---

## 🚀 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## 🔧 Development Notes

### Rate Limiting
- Development: No rate limiting
- Production: 100 requests per minute per IP

### CORS Policy
- Development: All origins allowed
- Production: Specific domains only

### Data Validation
- All endpoints validate input data
- JSON schema validation used
- Sanitization applied to prevent XSS

---

## 📚 Code Examples

### JavaScript/Fetch Example
```javascript
// Get all questions
const response = await fetch('/api/questions');
const data = await response.json();

if (data.success) {
  console.log('Questions:', data.data);
} else {
  console.error('Error:', data.error);
}
```

### Node.js/Express Example
```javascript
// Server-side endpoint handler
app.get('/api/questions/:category', (req, res) => {
  const category = req.params.category;
  const questions = getQuestionsByCategory(category);

  res.json({
    success: true,
    data: questions,
    category: category,
    count: questions.length
  });
});
```

---

**API Version**: 1.0.0
**Last Updated**: December 15, 2025
**Base URL**: `http://localhost:3000/api` (development)