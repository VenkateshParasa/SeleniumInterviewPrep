# 📁 Question Banks Organization Plan

## 🎯 **Current Issues**
- TestNG and Framework Design questions scattered across multiple files
- Duplicate content in different JSON files
- Database not reflecting JSON file contents
- Inconsistent question counts between files

## 🏗️ **Proposed Centralized Structure**

```
docs/question-banks/
├── README.md                           # Main documentation
├── ORGANIZATION-PLAN.md               # This file
├── 
├── by-category/                       # Organized by topic
│   ├── java/
│   │   ├── java-core-questions.md
│   │   ├── java-collections-questions.md
│   │   └── java-multithreading-questions.md
│   ├── selenium/
│   │   ├── selenium-basics-questions.md
│   │   ├── selenium-advanced-questions.md
│   │   └── selenium-pom-questions.md
│   ├── testng/                       # ✅ CENTRALIZED TESTNG
│   │   ├── testng-basics-questions.md
│   │   ├── testng-advanced-questions.md
│   │   ├── testng-parallel-questions.md
│   │   └── testng-integration-questions.md
│   ├── framework-design/             # ✅ CENTRALIZED FRAMEWORK DESIGN
│   │   ├── framework-architecture-questions.md
│   │   ├── framework-patterns-questions.md
│   │   ├── framework-scalability-questions.md
│   │   └── framework-best-practices-questions.md
│   └── api-testing/
│       ├── api-basics-questions.md
│       └── api-advanced-questions.md
│
├── by-difficulty/                     # Organized by difficulty
│   ├── easy-questions.md
│   ├── medium-questions.md
│   └── hard-questions.md
│
├── by-experience/                     # Organized by experience level
│   ├── junior-0-2-years.md
│   ├── mid-3-5-years.md
│   ├── senior-6-8-years.md
│   └── lead-9-plus-years.md
│
├── production-active/                 # Current active files
│   ├── INTERVIEW-QUESTIONS-DASHBOARD.md
│   └── consolidated-questions.json    # Single source of truth
│
└── archive/                          # Backup and old versions
    ├── old-versions/
    └── duplicates/
```

## 🎯 **Consolidation Strategy**

### **Phase 1: TestNG Questions Consolidation**
1. **Source Files:**
   - `practice-ui/public/data/questions/testng-framework-questions.json` (30 questions)
   - `practice-ui/public/data/questions/interview-questions-fixed.json` (46 TestNG questions)
   
2. **Action:** 
   - Merge and deduplicate questions
   - Create comprehensive TestNG question bank
   - Organize by subtopics (basics, advanced, parallel, integration)

### **Phase 2: Framework Design Questions Consolidation**
1. **Source Files:**
   - `practice-ui/public/data/questions/testng-framework-questions.json` (25 questions)
   - `practice-ui/public/data/questions/interview-questions-fixed.json` (5 questions)
   
2. **Action:**
   - Merge and deduplicate questions
   - Create comprehensive Framework Design question bank
   - Organize by subtopics (architecture, patterns, scalability, best practices)

### **Phase 3: Database Integration**
1. Update database schema to reflect new organization
2. Import consolidated questions into database
3. Update dashboard to show correct counts
4. Verify all integrations work correctly

## 📊 **Expected Outcome**

### **Consolidated Question Counts:**
- **TestNG Questions:** ~50-60 unique questions (after deduplication)
- **Framework Design Questions:** ~25-30 unique questions (after deduplication)
- **Total New Questions:** ~75-90 questions

### **Benefits:**
1. ✅ Single source of truth for each category
2. ✅ No duplicate questions
3. ✅ Consistent database integration
4. ✅ Easy maintenance and updates
5. ✅ Clear organization by topic and difficulty
6. ✅ Better searchability and reference

## 🚀 **Implementation Steps**

1. **Create centralized directories** in `docs/question-banks/by-category/`
2. **Extract and deduplicate** TestNG questions from all sources
3. **Extract and deduplicate** Framework Design questions from all sources
4. **Organize questions** by subtopics and difficulty
5. **Update database** with consolidated questions
6. **Update references** in practice-ui application
7. **Archive old files** to prevent confusion
8. **Update documentation** and dashboard

## 📝 **File Naming Convention**

- Use kebab-case for file names
- Include category prefix: `testng-`, `framework-`, `selenium-`, etc.
- Include subtopic: `testng-parallel-execution.md`
- Use `.md` for documentation, `.json` for data files

## 🔄 **Maintenance Process**

1. All new questions go into appropriate category files
2. Regular deduplication checks
3. Database sync verification
4. Dashboard accuracy monitoring
5. Quarterly organization review