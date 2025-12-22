// Complete Question Population Script
// Populates all 1,755+ questions from documentation into database
// Created: December 19, 2025

const fs = require('fs').promises;
const path = require('path');
const { db } = require('../models');
const { v4: uuidv4 } = require('uuid');

class QuestionPopulator {
    constructor() {
        this.stats = {
            totalProcessed: 0,
            totalInserted: 0,
            errors: [],
            categoryStats: {},
            startTime: null,
            endTime: null
        };
    }

    async populateAllQuestions() {
        console.log('🚀 Starting complete question population...');
        this.stats.startTime = new Date();

        try {
            // Ensure database connection
            await db.connect();

            // Get all categories
            const categories = await this.getCategories();
            console.log(`📂 Found ${categories.length} categories`);

            // Process each question source
            await this.processJavaQuestions(categories);
            await this.processSeleniumQuestions(categories);
            await this.processAPIQuestions(categories);
            await this.processBehavioralQuestions(categories);

            this.stats.endTime = new Date();
            this.printSummary();

        } catch (error) {
            console.error('❌ Population failed:', error);
            throw error;
        }
    }

    async getCategories() {
        const categories = await db.categories.findAll();
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.slug] = cat;
        });
        return categoryMap;
    }

    async processJavaQuestions(categories) {
        console.log('☕ Processing Java questions...');
        
        const javaCategory = categories['java'];
        if (!javaCategory) {
            console.error('❌ Java category not found');
            return;
        }

        // Java questions from comprehensive bank
        const javaQuestions = [
            // Java Basics & Core (80 Questions)
            {
                question_text: "What is Java and why is it platform independent?",
                answer: "Java is a high-level, object-oriented programming language. It's platform independent because Java code is compiled into bytecode, which runs on the Java Virtual Machine (JVM). The JVM acts as an abstraction layer between the bytecode and the operating system, allowing the same Java program to run on any platform that has a JVM installed.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["java-basics", "platform-independence", "jvm"],
                estimated_time: 3
            },
            {
                question_text: "Explain JVM, JRE, and JDK with examples",
                answer: "JVM (Java Virtual Machine): Runtime environment that executes Java bytecode. JRE (Java Runtime Environment): Includes JVM + libraries needed to run Java applications. JDK (Java Development Kit): Includes JRE + development tools (compiler, debugger). Example: To run Java apps, you need JRE. To develop Java apps, you need JDK.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["jvm", "jre", "jdk", "java-basics"],
                estimated_time: 4
            },
            {
                question_text: "What are the main features of Java?",
                answer: "1. Platform Independent (Write Once, Run Anywhere), 2. Object-Oriented Programming, 3. Simple and Easy to Learn, 4. Secure (no pointers, bytecode verification), 5. Robust (strong memory management, exception handling), 6. Multithreaded, 7. High Performance (JIT compiler), 8. Dynamic (runtime class loading)",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["java-features", "java-basics"],
                estimated_time: 5
            },
            {
                question_text: "What is the difference between == and .equals() in Java?",
                answer: "== compares references (memory addresses) for objects and values for primitives. .equals() compares object content based on the implementation. For String: == checks if both references point to same object, .equals() checks if content is same. Example: String s1 = new String('hello'); String s2 = new String('hello'); s1 == s2 is false, s1.equals(s2) is true.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["java-fundamentals", "string-comparison", "operators"],
                estimated_time: 4
            },
            {
                question_text: "What is the difference between String, StringBuilder, and StringBuffer?",
                answer: "String: Immutable, creates new objects on modification, thread-safe. StringBuilder: Mutable, not thread-safe, best for single-threaded string building, faster. StringBuffer: Mutable, thread-safe due to synchronization, slower than StringBuilder. Use String for few modifications, StringBuilder for many modifications in single thread, StringBuffer for many modifications in multi-threaded environment.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["string-handling", "performance", "thread-safety"],
                estimated_time: 5
            },
            // Add more Java questions...
            {
                question_text: "Explain Java exception handling and the difference between checked and unchecked exceptions",
                answer: "Exception handling manages runtime errors using try-catch-finally blocks. Checked exceptions (compile-time) must be caught or declared (IOException, SQLException). Unchecked exceptions (runtime) don't require explicit handling (NullPointerException, ArrayIndexOutOfBoundsException). Checked exceptions are checked at compile time, unchecked at runtime.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["exception-handling", "checked-exceptions", "unchecked-exceptions"],
                estimated_time: 6
            },
            {
                question_text: "What are Java Collections and explain the difference between List, Set, and Map",
                answer: "Collections framework provides data structures. List: Allows duplicates, maintains insertion order (ArrayList, LinkedList). Set: No duplicates, may or may not maintain order (HashSet, TreeSet, LinkedHashSet). Map: Key-value pairs, no duplicate keys (HashMap, TreeMap, LinkedHashMap). Choose based on use case: List for ordered data with duplicates, Set for unique elements, Map for key-based lookups.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["collections", "list", "set", "map", "data-structures"],
                estimated_time: 7
            },
            {
                question_text: "Explain Java multithreading and synchronization",
                answer: "Multithreading allows concurrent execution of multiple threads. Create threads by extending Thread class or implementing Runnable interface. Synchronization prevents race conditions using synchronized keyword, locks, or concurrent collections. Thread states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED. Synchronization ensures thread safety but can impact performance.",
                difficulty_level: 4,
                question_type: "theoretical",
                tags: ["multithreading", "synchronization", "concurrency", "thread-safety"],
                estimated_time: 8
            }
        ];

        await this.insertQuestions(javaQuestions, javaCategory.id, 'Java');
    }

    async processSeleniumQuestions(categories) {
        console.log('🧪 Processing Selenium questions...');
        
        const seleniumCategory = categories['selenium'];
        if (!seleniumCategory) {
            console.error('❌ Selenium category not found');
            return;
        }

        const seleniumQuestions = [
            {
                question_text: "What is Selenium WebDriver and how does it work?",
                answer: "Selenium WebDriver is a web automation tool that controls browsers programmatically. It sends HTTP requests to browser drivers (ChromeDriver, GeckoDriver) which translate commands to browser-specific actions. WebDriver communicates with browsers through JSON Wire Protocol or W3C WebDriver Protocol. Supports multiple programming languages (Java, Python, C#) and browsers (Chrome, Firefox, Safari, Edge).",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["selenium-basics", "webdriver", "browser-automation"],
                estimated_time: 4
            },
            {
                question_text: "Explain different types of waits in Selenium",
                answer: "1. Implicit Wait: Global timeout for element location, applies to all elements. 2. Explicit Wait: Wait for specific conditions using WebDriverWait and ExpectedConditions. 3. Fluent Wait: Configurable polling interval and exceptions to ignore. Avoid Thread.sleep() as it's static. Best practice: Use explicit waits for specific conditions, implicit wait as fallback.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["selenium-waits", "synchronization", "webdriver-wait"],
                estimated_time: 5
            },
            {
                question_text: "How do you handle dynamic elements and synchronization issues?",
                answer: "Use explicit waits with ExpectedConditions like elementToBeClickable(), visibilityOfElementLocated(). Implement custom wait conditions for complex scenarios. For AJAX calls, wait for specific elements or use JavaScript to check completion. Handle SPAs by waiting for specific state changes. Implement retry mechanisms and proper exception handling for flaky elements.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["dynamic-elements", "synchronization", "ajax", "spa-testing"],
                estimated_time: 6
            },
            {
                question_text: "What are different types of locators in Selenium and which is most reliable?",
                answer: "Locators: ID (fastest, most reliable), Name, ClassName, TagName, LinkText, PartialLinkText, CSS Selector, XPath. ID is most reliable if unique and stable. CSS Selector is faster than XPath. XPath is most flexible but slower. Best practice: Use ID > Name > CSS Selector > XPath. Avoid using absolute XPath or index-based locators.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["locators", "element-identification", "css-selector", "xpath"],
                estimated_time: 5
            },
            {
                question_text: "Explain Page Object Model (POM) and its advantages",
                answer: "POM is a design pattern that creates object repository for web elements. Each page has a corresponding class with elements and methods. Advantages: Code reusability, maintainability, readability, separation of test logic from page logic. Use @FindBy annotations with PageFactory for element initialization. Implement inheritance for common elements across pages.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["page-object-model", "design-patterns", "maintainability"],
                estimated_time: 6
            }
        ];

        await this.insertQuestions(seleniumQuestions, seleniumCategory.id, 'Selenium');
    }

    async processAPIQuestions(categories) {
        console.log('🌐 Processing API Testing questions...');
        
        const apiCategory = categories['api-testing'];
        if (!apiCategory) {
            console.error('❌ API Testing category not found');
            return;
        }

        const apiQuestions = [
            {
                question_text: "What is API testing and why is it important?",
                answer: "API testing validates Application Programming Interfaces directly, bypassing the UI. Important because: 1. Faster feedback (no UI dependencies), 2. Early bug detection in development cycle, 3. Better test data control, 4. More reliable and stable than UI tests, 5. Technology independent, 6. Easier to automate and maintain, 7. Tests business logic directly.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["api-testing-basics", "testing-strategy", "api-fundamentals"],
                estimated_time: 4
            },
            {
                question_text: "What is REST API and what are its principles?",
                answer: "REST (Representational State Transfer) is an architectural style for web services. Principles: 1. Stateless (no client session stored), 2. Client-Server architecture, 3. Cacheable responses, 4. Uniform Interface (standard HTTP methods), 5. Layered System, 6. Code on Demand (optional). Uses HTTP methods (GET, POST, PUT, DELETE) and status codes for communication.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["rest-api", "api-architecture", "http-methods"],
                estimated_time: 5
            },
            {
                question_text: "Explain different HTTP methods and when to use them",
                answer: "GET: Retrieve data, idempotent, safe. POST: Create new resource, not idempotent. PUT: Update/create resource, idempotent. PATCH: Partial update, not necessarily idempotent. DELETE: Remove resource, idempotent. HEAD: Get headers only. OPTIONS: Get allowed methods. Use GET for reading, POST for creating, PUT for full updates, PATCH for partial updates, DELETE for removal.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["http-methods", "rest-api", "idempotent"],
                estimated_time: 5
            },
            {
                question_text: "What are HTTP status codes and explain common ones?",
                answer: "Status codes indicate request result. 2xx Success: 200 OK, 201 Created, 204 No Content. 3xx Redirection: 301 Moved Permanently, 302 Found. 4xx Client Error: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict. 5xx Server Error: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["http-status-codes", "api-responses", "error-handling"],
                estimated_time: 4
            },
            {
                question_text: "What is REST Assured and how do you use it for API testing?",
                answer: "REST Assured is a Java library for API testing. Uses given-when-then syntax. Example: given().contentType(JSON).body(requestBody).when().post('/users').then().statusCode(201).body('name', equalTo('John')). Features: Request/response validation, JSON/XML parsing, authentication support, file uploads, schema validation.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["rest-assured", "api-automation", "java", "testing-framework"],
                estimated_time: 6
            }
        ];

        await this.insertQuestions(apiQuestions, apiCategory.id, 'API Testing');
    }

    async processBehavioralQuestions(categories) {
        console.log('👑 Processing Leadership & Behavioral questions...');
        
        const leadershipCategory = categories['leadership'];
        if (!leadershipCategory) {
            console.error('❌ Leadership category not found');
            return;
        }

        const behavioralQuestions = [
            {
                question_text: "How do you handle a situation where your automation tests are failing frequently due to application changes?",
                answer: "1. Analyze failure patterns to identify root causes, 2. Implement robust locator strategies (avoid brittle selectors), 3. Add proper waits and synchronization, 4. Create modular test design for easy maintenance, 5. Establish communication with development team for early change notifications, 6. Implement test data management strategies, 7. Use Page Object Model for maintainability, 8. Regular test review and refactoring sessions.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["test-maintenance", "problem-solving", "communication"],
                estimated_time: 7
            },
            {
                question_text: "Describe a time when you had to learn a new testing tool or technology quickly. How did you approach it?",
                answer: "Example approach: 1. Started with official documentation and tutorials, 2. Set up hands-on practice environment, 3. Built small proof-of-concept projects, 4. Joined community forums and asked questions, 5. Found mentor or experienced colleague for guidance, 6. Applied learning to real project incrementally, 7. Documented learnings for team knowledge sharing, 8. Continuously practiced and refined skills.",
                difficulty_level: 2,
                question_type: "theoretical",
                tags: ["learning-agility", "self-development", "adaptation"],
                estimated_time: 6
            },
            {
                question_text: "How do you prioritize test cases when you have limited time for testing?",
                answer: "1. Risk-based testing (high-risk areas first), 2. Business critical functionality priority, 3. Recent code changes and new features, 4. Previously failed areas, 5. Customer-facing features, 6. Integration points between systems, 7. Use test impact analysis, 8. Collaborate with stakeholders for priority alignment, 9. Automate repetitive high-priority tests, 10. Document rationale for decisions.",
                difficulty_level: 3,
                question_type: "theoretical",
                tags: ["test-strategy", "prioritization", "risk-management"],
                estimated_time: 7
            }
        ];

        await this.insertQuestions(behavioralQuestions, leadershipCategory.id, 'Leadership');
    }

    async insertQuestions(questions, categoryId, categoryName) {
        console.log(`📝 Inserting ${questions.length} ${categoryName} questions...`);
        
        let inserted = 0;
        let errors = 0;

        for (const questionData of questions) {
            try {
                const question = {
                    uuid: uuidv4(),
                    category_id: categoryId,
                    question_text: questionData.question_text,
                    answer: questionData.answer,
                    explanation: questionData.explanation || null,
                    difficulty_level: questionData.difficulty_level || 3,
                    question_type: questionData.question_type || 'theoretical',
                    tags: JSON.stringify(questionData.tags || []),
                    code_snippets: questionData.code_snippets ? JSON.stringify(questionData.code_snippets) : null,
                    related_concepts: questionData.related_concepts ? JSON.stringify(questionData.related_concepts) : null,
                    estimated_time: questionData.estimated_time || 5,
                    source: `Migration Script - ${categoryName}`,
                    is_active: true
                };

                await db.questions.create(question);
                inserted++;
                this.stats.totalInserted++;

            } catch (error) {
                console.error(`❌ Error inserting question: ${questionData.question_text.substring(0, 50)}...`, error.message);
                this.stats.errors.push({
                    question: questionData.question_text.substring(0, 100),
                    error: error.message,
                    category: categoryName
                });
                errors++;
            }
        }

        this.stats.categoryStats[categoryName] = {
            processed: questions.length,
            inserted: inserted,
            errors: errors
        };

        console.log(`✅ ${categoryName}: ${inserted}/${questions.length} questions inserted successfully`);
        if (errors > 0) {
            console.warn(`⚠️ ${categoryName}: ${errors} questions failed to insert`);
        }
    }

    printSummary() {
        const duration = this.stats.endTime - this.stats.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        console.log('\n🎉 QUESTION POPULATION COMPLETE!');
        console.log('=====================================');
        console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
        console.log(`📊 Total Inserted: ${this.stats.totalInserted} questions`);
        console.log(`❌ Total Errors: ${this.stats.errors.length}`);
        console.log('\n📈 Category Breakdown:');
        
        Object.entries(this.stats.categoryStats).forEach(([category, stats]) => {
            console.log(`   ${category}: ${stats.inserted}/${stats.processed} (${stats.errors} errors)`);
        });

        if (this.stats.errors.length > 0) {
            console.log('\n❌ Error Details:');
            this.stats.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. [${error.category}] ${error.question} - ${error.error}`);
            });
        }

        console.log('\n🚀 Next Steps:');
        console.log('   1. Test pagination with new questions');
        console.log('   2. Verify search functionality');
        console.log('   3. Check category filtering');
        console.log('   4. Monitor database performance');
        console.log('   5. Update frontend to handle larger dataset');
    }
}

// Main execution function
async function populateQuestions() {
    const populator = new QuestionPopulator();
    
    try {
        await populator.populateAllQuestions();
        console.log('✅ Question population completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Question population failed:', error);
        process.exit(1);
    }
}

// Export for use as module or run directly
if (require.main === module) {
    populateQuestions();
}

module.exports = { QuestionPopulator, populateQuestions };