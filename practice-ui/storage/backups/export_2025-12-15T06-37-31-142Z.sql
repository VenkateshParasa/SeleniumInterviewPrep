PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    experience_level TEXT CHECK(experience_level IN ('beginner', 'intermediate', 'advanced', 'senior')) DEFAULT 'intermediate',
    role TEXT CHECK(role IN ('user', 'admin', 'moderator')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    settings JSON DEFAULT '{}',
    metadata JSON DEFAULT '{}'
);
INSERT INTO users VALUES(1,'d70d564f-7859-45d5-854c-fdb2546ea2de','demo_user','demo@interviewprep.com','$2a$12$2caMkRLuM.//Yi4dvcwJ8OIqWhCwZp9L6x7Bb6kSEKM26x1Jk6iW.','Demo User','senior','user',1,0,'2025-12-15 06:28:34','2025-12-15 06:28:34','2025-12-12T05:13:46.597Z','{}','{}');
INSERT INTO users VALUES(2,'6efb642e-9dfd-4241-a870-31f4363d3afe','john_doe','john.doe@email.com','$2a$12$sEXtWSNH//XiDDhcdklfmuIz8gmwPiCt90.FeqbOkiZcxApgrmQw2','John Doe','intermediate','user',1,0,'2025-12-15 06:28:34','2025-12-15 06:28:34','2024-12-10T15:30:00.000Z','{}','{}');
INSERT INTO users VALUES(3,'817c1598-1bb6-4ca7-a86d-d87d03939706','sarah_wilson','sarah.wilson@company.com','$2a$12$zp027g4CEXV0zOCRRUlOVO7.Yj53iqQJu7nOxObiKh/7oZ92E8kP.','Sarah Wilson','intermediate','user',1,0,'2025-12-15 06:28:34','2025-12-15 06:28:34','2024-12-11T09:15:00.000Z','{}','{}');
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    device_info JSON,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO categories VALUES(1,'java','Java Programming','Core Java concepts, OOP, collections, concurrency, and advanced features','☕','#ED8B00',1,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO categories VALUES(2,'selenium','Selenium WebDriver','Web automation testing with Selenium WebDriver, page objects, and best practices','🔧','#43B02A',2,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO categories VALUES(3,'api-testing','API Testing','REST API testing, HTTP methods, status codes, authentication, and tools','🌐','#0EA5E9',3,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO categories VALUES(4,'testng','TestNG Framework','TestNG annotations, test suites, data providers, and parallel execution','🧪','#DC2626',4,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO categories VALUES(5,'framework','Test Framework Design','Test automation frameworks, design patterns, and architecture','🏗️','#7C3AED',5,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO categories VALUES(6,'leadership','Leadership & Management','Team leadership, project management, and career development','👑','#F59E0B',6,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
CREATE TABLE tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK(difficulty_level IN ('fast', 'standard', 'comfortable')) NOT NULL,
    total_days INTEGER NOT NULL,
    estimated_hours_per_day REAL,
    prerequisites TEXT,
    learning_outcomes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO tracks VALUES(1,'fast','Fast Track (3 Days)','Intensive preparation for experienced professionals with limited time','fast',3,4.0,'Strong programming background, 3+ years experience','Quick review of key concepts, advanced topics, interview simulation',1,0,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO tracks VALUES(2,'standard','Standard Track (14 Days)','Comprehensive preparation covering all essential topics systematically','standard',14,2.0,'Basic programming knowledge, some testing experience','Complete coverage of Java, Selenium, API testing, frameworks',1,0,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO tracks VALUES(3,'comfortable','Comfortable Track (21 Days)','Relaxed pace with detailed explanations and extra practice time','comfortable',21,1.5,'Programming basics, willing to learn','Thorough understanding with hands-on practice and projects',1,0,'2025-12-15 06:28:34','2025-12-15 06:28:34');
CREATE TABLE track_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    learning_objectives TEXT,
    estimated_duration REAL,
    difficulty_rating INTEGER CHECK(difficulty_rating BETWEEN 1 AND 5),
    prerequisites TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    UNIQUE(track_id, day_number)
);
INSERT INTO track_days VALUES(1,1,1,'Java & Selenium Fundamentals Review','Intensive java & selenium fundamentals review session','Master java & selenium fundamentals review in accelerated format',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(2,1,2,'API Testing & Framework Design','Intensive api testing & framework design session','Master api testing & framework design in accelerated format',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(3,1,3,'Advanced Topics & Mock Interviews','Intensive advanced topics & mock interviews session','Master advanced topics & mock interviews in accelerated format',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(4,2,1,'Java Basics & OOP Concepts','Comprehensive study of java basics & oop concepts','Understand and practice java basics & oop concepts',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(5,2,2,'Collections & Exception Handling','Comprehensive study of collections & exception handling','Understand and practice collections & exception handling',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(6,2,3,'Multithreading & Concurrency','Comprehensive study of multithreading & concurrency','Understand and practice multithreading & concurrency',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(7,2,4,'Selenium WebDriver Setup','Comprehensive study of selenium webdriver setup','Understand and practice selenium webdriver setup',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(8,2,5,'Element Identification & Actions','Comprehensive study of element identification & actions','Understand and practice element identification & actions',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(9,2,6,'Page Object Model','Comprehensive study of page object model','Understand and practice page object model',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(10,2,7,'TestNG Framework Basics','Comprehensive study of testng framework basics','Understand and practice testng framework basics',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(11,2,8,'Data-Driven Testing','Comprehensive study of data-driven testing','Understand and practice data-driven testing',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(12,2,9,'API Testing Fundamentals','Comprehensive study of api testing fundamentals','Understand and practice api testing fundamentals',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(13,2,10,'REST API Automation','Comprehensive study of rest api automation','Understand and practice rest api automation',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(14,2,11,'Framework Architecture','Comprehensive study of framework architecture','Understand and practice framework architecture',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(15,2,12,'CI/CD Integration','Comprehensive study of ci/cd integration','Understand and practice ci/cd integration',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(16,2,13,'Leadership & Communication','Comprehensive study of leadership & communication','Understand and practice leadership & communication',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(17,2,14,'Mock Interviews & Review','Comprehensive study of mock interviews & review','Understand and practice mock interviews & review',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(18,3,1,'Day 1 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(19,3,2,'Day 2 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(20,3,3,'Day 3 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(21,3,4,'Day 4 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(22,3,5,'Day 5 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(23,3,6,'Day 6 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(24,3,7,'Day 7 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(25,3,8,'Day 8 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(26,3,9,'Day 9 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(27,3,10,'Day 10 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(28,3,11,'Day 11 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(29,3,12,'Day 12 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(30,3,13,'Day 13 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(31,3,14,'Day 14 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(32,3,15,'Day 15 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(33,3,16,'Day 16 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(34,3,17,'Day 17 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(35,3,18,'Day 18 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(36,3,19,'Day 19 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(37,3,20,'Day 20 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO track_days VALUES(38,3,21,'Day 21 - Gradual Learning','Comfortable pace learning session','Gradual mastery with extra practice time',2.0,3,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    category_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT,
    explanation TEXT,
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    question_type TEXT CHECK(question_type IN ('mcq', 'coding', 'theoretical', 'practical')) DEFAULT 'theoretical',
    tags TEXT, -- JSON array of tags
    code_snippets TEXT, -- JSON object with code examples
    related_concepts TEXT, -- JSON array of related topics
    estimated_time INTEGER DEFAULT 5, -- minutes
    source TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
INSERT INTO questions VALUES(1,'3f382497-616e-4f05-98ae-36f8b6ca0994',1,'Explain the difference between == and .equals() in Java','== compares references (memory addresses) while .equals() compares object content. For primitives, == compares values. String literals with same value may share memory (interning), but new String() creates new objects.',NULL,3,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(2,'eedb47a8-9ca4-4f6a-aa76-5737e6e00083',1,'What is the difference between String, StringBuilder, and StringBuffer?','String is immutable - creates new objects on modification. StringBuilder is mutable and not thread-safe, best for single-threaded string building. StringBuffer is mutable and thread-safe but slower due to synchronization.',NULL,3,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(3,'6ffd838c-f3f7-4adc-a9d0-90b372c3f580',1,'Explain Java exception handling and the difference between checked and unchecked exceptions','Exception handling manages runtime errors using try-catch-finally blocks. Checked exceptions (compile-time) must be caught or declared (IOException, SQLException). Unchecked exceptions (runtime) don''t require explicit handling (NullPointerException, ArrayIndexOutOfBoundsException).',NULL,3,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(4,'78f8b2bc-8b62-4635-a749-a372c6c8aa94',1,'What are Java Collections and explain the difference between List, Set, and Map','Collections framework provides data structures. List allows duplicates and maintains order (ArrayList, LinkedList). Set doesn''t allow duplicates (HashSet, TreeSet). Map stores key-value pairs (HashMap, TreeMap). Choose based on use case: ArrayList for random access, LinkedList for frequent insertions, HashMap for key lookups.',NULL,3,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(5,'fde20d59-9652-4415-ac16-bf57b7a0addc',1,'Explain Java multithreading and synchronization','Multithreading allows concurrent execution. Create threads by extending Thread or implementing Runnable. Synchronization prevents race conditions using synchronized keyword, locks, or concurrent collections. Thread states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.',NULL,4,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(6,'428f579b-5eda-499d-af95-7f942a4772cb',2,'What is Selenium WebDriver and how does it work?','Selenium WebDriver is a web automation tool that controls browsers programmatically. It sends HTTP requests to browser drivers (ChromeDriver, GeckoDriver) which translate commands to browser-specific actions. Supports multiple languages and browsers.',NULL,2,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(7,'e9d02fae-21c3-4fde-93cf-efbe13ee8ce0',2,'Explain different types of waits in Selenium','Implicit Wait: Global timeout for element location. Explicit Wait: Wait for specific conditions using WebDriverWait and ExpectedConditions. Fluent Wait: Configurable polling interval and exceptions to ignore. Avoid Thread.sleep() as it''s not dynamic.',NULL,3,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
INSERT INTO questions VALUES(8,'bb06babc-ac4a-416e-ad19-1dab591a734d',2,'How do you handle dynamic elements and synchronization issues?','Use explicit waits with expected conditions, implement custom wait conditions, use fluent waits for complex scenarios. Handle AJAX with WebDriverWait. For SPAs, wait for specific elements or JavaScript completion. Implement retry mechanisms and proper exception handling.',NULL,3,'theoretical','[]',NULL,NULL,5,NULL,1,'2025-12-15 06:28:34','2025-12-15 06:28:34');
CREATE TABLE practice_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_day_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    exercise_type TEXT CHECK(exercise_type IN ('coding', 'reading', 'research', 'project', 'quiz')) DEFAULT 'coding',
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    estimated_time INTEGER DEFAULT 30, -- minutes
    instructions TEXT,
    starter_code TEXT,
    solution_code TEXT,
    test_cases TEXT, -- JSON array of test cases
    resources TEXT, -- JSON array of helpful resources
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_day_id) REFERENCES track_days(id) ON DELETE CASCADE
);
CREATE TABLE resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_day_id INTEGER,
    category_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT CHECK(resource_type IN ('article', 'video', 'documentation', 'tutorial', 'book', 'tool')) NOT NULL,
    url TEXT,
    content TEXT,
    author TEXT,
    duration INTEGER, -- minutes for videos
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    tags TEXT, -- JSON array
    is_external BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_day_id) REFERENCES track_days(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
    completion_percentage REAL DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- minutes
    started_at DATETIME,
    completed_at DATETIME,
    notes TEXT,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    UNIQUE(user_id, track_id, day_number)
);
CREATE TABLE user_question_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_attempted', 'attempted', 'correct', 'incorrect', 'skipped')) DEFAULT 'not_attempted',
    attempts_count INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    user_answer TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    confidence_level INTEGER CHECK(confidence_level BETWEEN 1 AND 5),
    notes TEXT,
    first_attempted_at DATETIME,
    last_attempted_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(user_id, question_id)
);
CREATE TABLE user_exercise_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
    completion_percentage REAL DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- minutes
    submission_code TEXT,
    test_results TEXT, -- JSON object with test case results
    feedback TEXT,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES practice_exercises(id) ON DELETE CASCADE,
    UNIQUE(user_id, exercise_id)
);
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_data JSON DEFAULT '{}',
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_displayed BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE user_study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_type TEXT CHECK(session_type IN ('questions', 'exercises', 'reading', 'mixed')) NOT NULL,
    track_id INTEGER,
    day_number INTEGER,
    duration INTEGER NOT NULL, -- seconds
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    focus_time INTEGER DEFAULT 0, -- seconds of focused study
    break_time INTEGER DEFAULT 0, -- seconds of breaks
    session_data JSON DEFAULT '{}',
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);
PRAGMA writable_schema=ON;
INSERT INTO sqlite_schema(type,name,tbl_name,rootpage,sql)VALUES('table','questions_fts','questions_fts',0,'CREATE VIRTUAL TABLE questions_fts USING fts5(
    question_text,
    answer,
    explanation,
    tags,
    category_name,
    content=''questions'',
    content_rowid=''id'',
    tokenize=''porter ascii''
)');
CREATE TABLE IF NOT EXISTS 'questions_fts_data'(id INTEGER PRIMARY KEY, block BLOB);
INSERT INTO questions_fts_data VALUES(1,X'0848820d000010');
INSERT INTO questions_fts_data VALUES(10,X'000000000101010001010101');
INSERT INTO questions_fts_data VALUES(137438953473,X'000009810230610606010105020563636573730406010125030474696f6e060601011c0206646472657373010601010502036a6178080601011302046c6c6f7704080101080c010601010302026e64010206010a0901010d0f01040607010a060901010a0102050108060101200108010111090108080101220201720402030319726179696e6465786f75746f66626f756e6473657863657074030601012006046c697374040801010d17020173070601011f020475746f6d06060101070204766f6964070601011c010462617365040601011e02016503060101110302737402060101110305747765656e01020501020601020901020a02046c6f636b030601010b020601011d0206726f77736572060c01010b090a09020475696c6402060101160301740106010118010601011d0201790506010108010463617365040601012103037463680306010109030475676874030601011202046865636b03080a01010c03036f6f73040601011d0308726f6d6564726976060601011402066f6c6c656374040805010102010601011803056d6d616e6406060101180403706172010a01010208070502696c030601010e05036c6574080601011e070178080601011003056e6375727205080101041504036469740506010111020601010e010801010706040566696775720706010115040474656e74010601010a0503726f6c060601010a020472656174010601011b0106010105030601010602057573746f6d08060101090104646174610406010105020565636c617203060101140205696666657201020401020501020801020903020302016f0802030301650602080402736e040601011003016e030601011a02057269766572060601011302027565020601011f0304706c696304080101090c0204796e616d07060101230102060107656c656d656e74070601010701080701011b02047175616c010807010107020472726f72030601010602057863657074030e040b0101020d0d040601011901060101240304656375740506010105030470656374080601010607086564636f6e646974070601011204046c61696e010202020202010207010202020202050469636974030601011d04060101090106010103030474656e640506010109010566696e616c030601010a02056c75656e740706010113010601010d02026f72010601010b0106010112020a0101230606030801010608010a01010f0905020872616d65776f726b04060101030306657175656e74040601012801096765636b6f64726976060601011502056c6f62616c0706010104010568616e646c030a050101031d050a0501011215030573686d6170040801011b110503736574040601011402026f770602070202020203747470060601010f010569676e6f72070601011b02046d6d757402060101040307706c656d656e74050601010c030801010819050469636974070601010202016e010208060207030473657274040601012903047465726e0106010117060176070601011702076f6578636570740306010115020173020c030101030a0f0408030101040302737508020a02017406080901010d010601012001046a61766101080901040201060104020108030104020108040104020108030104020506736372697074080601011d01036b6569040801011816030579776f7264050601011401076c616e67756167060601011f0209696e6b65646c697374040801010e1a0302737404080b0101070303746572010601011002046f636174070601010804016b050601011503046f6b7570040601012d01036d6169010601011404056e7461696e040601010b03036e6167030601010403017004080e0101160205656368616e080601012103046d6f726901080101041402046f64696602060101090206756c7469706c060601011e060674687265616405080401010203027374030601011003047461626c020801010c0f01036e65770108010119050106010106030601011b02026f74020601010e05060101220210756c6c706f696e746572657863657074030601011f01066f626a656374010801010916010601010702016607020502016e0206010108020601011f0201720306010113020801010b0d030601011c0303646572040601010c010470616972040601011a02036f6c6c07060101160206726576656e74050601010f0304696d6974010601010c03056f6772616d0106010403010601040301060104030106010403010601040308036d6174060601010c0403706572080601012304037669640406010104010472616365050601011003046e646f6d0406010124020465666572010601010303057175657374060601011005026972030601011c030374726908060101200206756e6e61626c050801010d11040374696d0308010105160101730706010121020361666502080101100e03026d650106010112020763656e6172696f08060101110207656c656e69756d060e04010102010402010808010402010601040203026e64060601010e03017404080c01010f02046861726501060101150204696e676c020601011302046c656570070601011e03046f776572020601011e020270610806010117030465636966060601011b010601010d010601011a0208716c6578636570740306010116020474617465050601011a03036f72650406010117030472696e67010801010f0d010a070101021507046275666602080a0101170903696c6402080801010a04057563747572040601010602067570706f7274060601011d0207796e6368726f6e0206010121030a0601010e07030209010174030601011b0106010111020565726d696e050601012102036861740606010109030165010203010204010207010208030472656164020a01010f0709030a0101070511020601011d0203696d65030601010f020601011f05036f7574070601010502016f020601012004080101110a010601011a03026f6c0606010108020772616e736c61740606010117030565656d6170040601011c05037365740406010115030179030601010802037970650702040107756e636865636b03080c010117020173030601010701060101200106010112020601010f01080101020c010476616c75010801010e070306010119010477616974050801011e04020e0601010309030b010c01010408060c020265620606010106040464726976060e050101030104030106010403010601040308066572776169740706010110010601011502036861740202020202020202020303696368060601011604026c6501060101060203697468010601011107080101051102036f726b06020a0103796f7508020404080c0b0d0a112e06200c080b0b0b08091310100b0d080b0a0b0c0a0f130c0c090a080d150c0b0a150c0b0c16060609080c090c0e140c0b1a0b0b0f15150b0c11220f0d100c150d0a0a0a0c0b140b090b0b080e11070e230d0b0c0e110a0a0b080b0a0c0a090c0c0b0d0e090c150e1713060d130a0b0a0d0b200a0a0a0b0b0b0c090a0e0b080b090e1d09090b0b0b0b09150f0b0a130c0b0c0d180d0c0a0f190f0a13090e0c0a08080f1d111d0919120e0a091008');
CREATE TABLE IF NOT EXISTS 'questions_fts_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;
INSERT INTO questions_fts_idx VALUES(1,X'',2);
CREATE TABLE IF NOT EXISTS 'questions_fts_docsize'(id INTEGER PRIMARY KEY, sz BLOB);
INSERT INTO questions_fts_docsize VALUES(1,X'081c000002');
INSERT INTO questions_fts_docsize VALUES(2,X'0920000002');
INSERT INTO questions_fts_docsize VALUES(3,X'0c1f000002');
INSERT INTO questions_fts_docsize VALUES(4,X'0d2c000002');
INSERT INTO questions_fts_docsize VALUES(5,X'0520000002');
INSERT INTO questions_fts_docsize VALUES(6,X'0920000002');
INSERT INTO questions_fts_docsize VALUES(7,X'0722000002');
INSERT INTO questions_fts_docsize VALUES(8,X'0924000002');
CREATE TABLE IF NOT EXISTS 'questions_fts_config'(k PRIMARY KEY, v) WITHOUT ROWID;
INSERT INTO questions_fts_config VALUES('version',4);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('categories',6);
INSERT INTO sqlite_sequence VALUES('tracks',3);
INSERT INTO sqlite_sequence VALUES('track_days',38);
INSERT INTO sqlite_sequence VALUES('users',3);
INSERT INTO sqlite_sequence VALUES('questions',8);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_active ON sessions(is_active);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_uuid ON questions(uuid);
CREATE INDEX idx_user_progress_user_track ON user_progress(user_id, track_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_completion ON user_progress(completion_percentage);
CREATE INDEX idx_user_question_progress_user ON user_question_progress(user_id);
CREATE INDEX idx_user_question_progress_question ON user_question_progress(question_id);
CREATE INDEX idx_user_question_progress_status ON user_question_progress(status);
CREATE INDEX idx_user_question_progress_bookmarked ON user_question_progress(is_bookmarked);
CREATE INDEX idx_study_sessions_user ON user_study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON user_study_sessions(started_at);
CREATE INDEX idx_study_sessions_track ON user_study_sessions(track_id);
CREATE TRIGGER update_users_timestamp
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE TRIGGER update_categories_timestamp
    AFTER UPDATE ON categories
    BEGIN
        UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE TRIGGER update_tracks_timestamp
    AFTER UPDATE ON tracks
    BEGIN
        UPDATE tracks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE TRIGGER update_track_days_timestamp
    AFTER UPDATE ON track_days
    BEGIN
        UPDATE track_days SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE TRIGGER update_questions_timestamp
    AFTER UPDATE ON questions
    BEGIN
        UPDATE questions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE TRIGGER update_user_progress_timestamp
    AFTER UPDATE ON user_progress
    BEGIN
        UPDATE user_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE TRIGGER update_user_question_progress_timestamp
    AFTER UPDATE ON user_question_progress
    BEGIN
        UPDATE user_question_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
CREATE VIEW user_dashboard_stats AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(DISTINCT up.track_id) as active_tracks,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.id END) as completed_days,
    COUNT(DISTINCT CASE WHEN uqp.status IN ('correct', 'completed') THEN uqp.question_id END) as questions_solved,
    COALESCE(SUM(uss.duration), 0) / 60 as total_study_minutes,
    COUNT(DISTINCT uss.id) as study_sessions,
    MAX(uss.started_at) as last_study_session
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_question_progress uqp ON u.id = uqp.user_id
LEFT JOIN user_study_sessions uss ON u.id = uss.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username;
CREATE VIEW question_stats AS
SELECT
    q.id,
    q.question_text,
    c.name as category_name,
    COUNT(uqp.id) as total_attempts,
    COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) as correct_attempts,
    ROUND(
        (COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) * 100.0) /
        NULLIF(COUNT(uqp.id), 0), 2
    ) as success_rate,
    AVG(uqp.time_spent) as avg_time_spent,
    COUNT(CASE WHEN uqp.is_bookmarked = TRUE THEN 1 END) as bookmarks_count
FROM questions q
LEFT JOIN categories c ON q.category_id = c.id
LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id
GROUP BY q.id, q.question_text, c.name;
CREATE VIEW track_progress_overview AS
SELECT
    t.id as track_id,
    t.name as track_name,
    t.difficulty_level,
    COUNT(DISTINCT td.id) as total_days,
    COUNT(DISTINCT up.user_id) as enrolled_users,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.user_id END) as completed_users,
    ROUND(
        (COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.user_id END) * 100.0) /
        NULLIF(COUNT(DISTINCT up.user_id), 0), 2
    ) as completion_rate
FROM tracks t
LEFT JOIN track_days td ON t.id = td.track_id
LEFT JOIN user_progress up ON t.id = up.track_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.difficulty_level;
CREATE TRIGGER questions_fts_insert
AFTER INSERT ON questions
WHEN NEW.is_active = TRUE
BEGIN
    INSERT INTO questions_fts(rowid, question_text, answer, explanation, tags, category_name)
    SELECT
        NEW.id,
        NEW.question_text,
        COALESCE(NEW.answer, ''),
        COALESCE(NEW.explanation, ''),
        COALESCE(NEW.tags, ''),
        c.name
    FROM categories c
    WHERE c.id = NEW.category_id;
END;
CREATE TRIGGER questions_fts_update
AFTER UPDATE ON questions
WHEN NEW.is_active = TRUE
BEGIN
    UPDATE questions_fts
    SET
        question_text = NEW.question_text,
        answer = COALESCE(NEW.answer, ''),
        explanation = COALESCE(NEW.explanation, ''),
        tags = COALESCE(NEW.tags, ''),
        category_name = (SELECT name FROM categories WHERE id = NEW.category_id)
    WHERE rowid = NEW.id;
END;
CREATE TRIGGER questions_fts_delete
AFTER UPDATE ON questions
WHEN NEW.is_active = FALSE OR OLD.is_active = TRUE AND NEW.is_active = FALSE
BEGIN
    DELETE FROM questions_fts WHERE rowid = NEW.id;
END;
CREATE INDEX idx_questions_category_difficulty
ON questions(category_id, difficulty_level, is_active);
CREATE INDEX idx_questions_difficulty_type
ON questions(difficulty_level, question_type, is_active);
CREATE INDEX idx_questions_created_category
ON questions(created_at DESC, category_id, is_active);
CREATE INDEX idx_user_progress_search
ON user_progress(user_id, status, track_id, day_number);
CREATE INDEX idx_categories_search
ON categories(name, slug, is_active);
CREATE INDEX idx_tracks_search
ON tracks(name, slug, difficulty_level, is_active);
CREATE INDEX idx_sessions_search
ON sessions(user_id, is_active, expires_at);
CREATE VIEW question_search_view AS
SELECT
    q.id,
    q.uuid,
    q.question_text,
    q.answer,
    q.explanation,
    q.difficulty_level,
    q.question_type,
    q.tags,
    q.estimated_time,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    q.created_at,
    -- Search ranking fields
    CASE
        WHEN q.difficulty_level = 1 THEN 'Beginner'
        WHEN q.difficulty_level = 2 THEN 'Easy'
        WHEN q.difficulty_level = 3 THEN 'Medium'
        WHEN q.difficulty_level = 4 THEN 'Hard'
        WHEN q.difficulty_level = 5 THEN 'Expert'
        ELSE 'Unknown'
    END as difficulty_text,
    -- Question length for ranking
    LENGTH(q.question_text) as question_length,
    -- Has answer for ranking
    CASE WHEN q.answer IS NOT NULL AND LENGTH(q.answer) > 0 THEN 1 ELSE 0 END as has_answer
FROM questions q
JOIN categories c ON q.category_id = c.id
WHERE q.is_active = TRUE AND c.is_active = TRUE
;
CREATE VIEW user_search_summary AS
SELECT
    u.id,
    u.username,
    u.name,
    u.experience_level,
    COUNT(DISTINCT up.track_id) as active_tracks,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.id END) as completed_days,
    COUNT(DISTINCT uqp.question_id) as questions_attempted,
    COUNT(DISTINCT CASE WHEN uqp.status = 'correct' THEN uqp.question_id END) as questions_correct,
    MAX(up.updated_at) as last_activity,
    u.created_at as join_date
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_question_progress uqp ON u.id = uqp.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.name, u.experience_level, u.created_at;
CREATE VIEW popular_questions AS
SELECT
    q.id,
    q.question_text,
    q.category_id,
    COUNT(uqp.id) as attempt_count,
    COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) as correct_count,
    ROUND(
        (COUNT(CASE WHEN uqp.status = 'correct' THEN 1 END) * 100.0) /
        NULLIF(COUNT(uqp.id), 0), 2
    ) as success_rate,
    AVG(uqp.time_spent) as avg_time_spent
FROM questions q
LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id
WHERE q.is_active = TRUE
GROUP BY q.id, q.question_text, q.category_id;
PRAGMA writable_schema=OFF;
COMMIT;
