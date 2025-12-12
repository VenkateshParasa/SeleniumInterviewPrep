# 🚨 Critical Path Updates Required

## Status: PARTIALLY COMPLETE

The project has been successfully reorganized (Phases 1-4 complete), but **critical file path updates are still needed** for the application to function properly.

---

## ✅ What's Already Done

### HTML File (public/index.html)
- ✅ **No changes needed** - All referenced files are in the same `public/` directory
- ✅ CSS: `styles.css` (correct - in public/)
- ✅ JS: `app.js` (correct - in public/)
- ✅ JS: `js/api-client.js` (correct - in public/js/)
- ✅ Service Worker: `/sw.js` (correct - in public/)
- ✅ Assets: `assets/icons/` (correct - in public/assets/)

---

## 🔴 CRITICAL: Updates Still Required

### 1. app.js - Data File Paths (HIGH PRIORITY)

**File**: `practice-ui/public/app.js`  
**Lines to Update**: ~150-160, ~185-195

#### Current Paths (BROKEN):
```javascript
// Line ~154
dataFile = 'practice-data-senior.json';

// Line ~156
dataFile = 'practice-data.json';

// Line ~188
const response = await fetch('interview-questions.json');
```

#### Required New Paths:
```javascript
// Line ~154
dataFile = '../data/practice/practice-data-senior.json';

// Line ~156
dataFile = '../data/practice/practice-data.json';

// Line ~188
const response = await fetch('../data/questions/interview-questions.json');
```

#### All Data Files to Update:
1. `practice-data.json` → `../data/practice/practice-data.json`
2. `practice-data-senior.json` → `../data/practice/practice-data-senior.json`
3. `practice-data-comprehensive.json` → `../data/practice/practice-data-comprehensive.json`
4. `interview-questions.json` → `../data/questions/interview-questions.json`
5. `interview-questions-comprehensive.json` → `../data/questions/interview-questions-comprehensive.json`
6. `expanded-questions-phase1.json` → `../data/questions/expanded-questions-phase1.json`
7. `expanded-questions-comprehensive.json` → `../data/questions/expanded-questions-comprehensive.json`
8. `question-metrics-analysis.json` → `../data/analytics/question-metrics-analysis.json`

---

### 2. netlify.toml - Configuration (MEDIUM PRIORITY)

**File**: `practice-ui/netlify.toml`

#### Updates Needed:
```toml
[build]
  publish = "public"  # Changed from "." or root
  
[functions]
  directory = "server/functions/netlify"  # Updated path
```

---

### 3. Service Worker (sw.js) - Cache Paths (MEDIUM PRIORITY)

**File**: `practice-ui/public/sw.js`

#### Updates Needed:
Update cached file paths to reflect new structure:
- Data files: `/data/practice/`, `/data/questions/`, `/data/analytics/`
- Keep public files as-is (they're in same directory)

---

### 4. api-client.js - Check for Hardcoded Paths (LOW PRIORITY)

**File**: `practice-ui/public/js/api-client.js`

#### Action Required:
- Review for any hardcoded file paths
- Update if necessary

---

## 📋 Step-by-Step Update Process

### Step 1: Update app.js (CRITICAL - DO THIS FIRST)
```bash
# Edit practice-ui/public/app.js
# Update all data file paths as listed above
```

### Step 2: Update netlify.toml
```bash
# Edit practice-ui/netlify.toml
# Update publish and functions directories
```

### Step 3: Update sw.js
```bash
# Edit practice-ui/public/sw.js
# Update cache paths for data files
```

### Step 4: Test Locally
```bash
cd practice-ui/public
# Open index.html in browser
# Check browser console for errors
# Verify data loads correctly
```

---

## 🧪 Testing Checklist

After making updates, verify:

- [ ] Application loads without console errors
- [ ] Practice data loads (check Schedule tab)
- [ ] Interview questions load (check Questions tab)
- [ ] Dashboard displays correctly
- [ ] Progress tracking works
- [ ] Settings save/load
- [ ] Service worker caches correctly
- [ ] All navigation works

---

## 🚀 Quick Fix Commands

### Find all data file references in app.js:
```bash
cd practice-ui/public
grep -n "\.json" app.js | grep -E "(practice-data|interview-questions|expanded-questions|question-metrics)"
```

### Search and replace (use with caution):
```bash
# Example for practice-data.json
sed -i '' 's|practice-data\.json|../data/practice/practice-data.json|g' app.js
```

---

## ⚠️ Important Notes

1. **Relative Paths**: Use `../data/` because app.js is in `public/` and data is in `data/`
2. **Service Worker**: May need absolute paths starting with `/`
3. **Testing**: Test thoroughly after each change
4. **Backup**: Keep a backup of original app.js before editing

---

## 📊 Impact Assessment

### If Not Updated:
- ❌ Application will fail to load data
- ❌ Schedule tab will be empty
- ❌ Questions tab will show no questions
- ❌ Dashboard will have no data
- ❌ Console will show 404 errors

### After Update:
- ✅ All features work correctly
- ✅ Data loads from new locations
- ✅ Application fully functional
- ✅ Ready for deployment

---

## 🎯 Priority Order

1. **CRITICAL**: Update `app.js` data paths
2. **HIGH**: Test application locally
3. **MEDIUM**: Update `netlify.toml`
4. **MEDIUM**: Update `sw.js` cache paths
5. **LOW**: Review `api-client.js`

---

**Next Action**: Update `practice-ui/public/app.js` with new data file paths

**Estimated Time**: 15-20 minutes for all updates + testing

**Status**: Ready to proceed with updates