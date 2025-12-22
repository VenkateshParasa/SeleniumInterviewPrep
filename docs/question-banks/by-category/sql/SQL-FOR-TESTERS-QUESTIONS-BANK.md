# 💾 SQL for Testers - Interview Questions Bank - 20 Questions

**Purpose**: SQL questions specifically for software testers and QA engineers
**Target**: 0-8 years experience in testing with database validation
**Total Questions**: 20
**Status**: Questions with detailed answers
**Source**: INTERVIEW-QUESTIONS-EXTENDED.md

---

## 🎯 **SQL FOR TESTERS QUESTIONS WITH ANSWERS** (20 Questions)
*Essential SQL knowledge for testing professionals*

### **SQL Basics**

#### **Q1: What is SQL?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Structured Query Language. Used to manage relational databases. Operations: SELECT, INSERT, UPDATE, DELETE.

#### **Q2: What is SELECT statement?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Retrieves data from database.
```sql
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;
```

#### **Q3: What is WHERE clause?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Filters records based on condition.
```sql
SELECT * FROM users WHERE age > 18;
```

#### **Q4: What is JOIN? Types?**
**Tags:** `#SQL` `#Advanced` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Combines rows from multiple tables. Types:
- **INNER JOIN**: Matching rows from both tables
- **LEFT JOIN**: All from left, matching from right
- **RIGHT JOIN**: All from right, matching from left
- **FULL JOIN**: All rows from both tables

#### **Q5: What is GROUP BY?**
**Tags:** `#SQL` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Groups rows with same values. Used with aggregate functions.
```sql
SELECT country, COUNT(*) FROM users GROUP BY country;
```

#### **Q6: What is HAVING clause?**
**Tags:** `#SQL` `#Advanced` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Filters grouped records. Used with GROUP BY.
```sql
SELECT country, COUNT(*) FROM users 
GROUP BY country HAVING COUNT(*) > 10;
```

#### **Q7: Difference between WHERE and HAVING?**
**Tags:** `#SQL` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **WHERE**: Filters before grouping, cannot use aggregate functions
- **HAVING**: Filters after grouping, can use aggregate functions

#### **Q8: What are aggregate functions?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** COUNT(), SUM(), AVG(), MIN(), MAX()
```sql
SELECT COUNT(*), AVG(salary) FROM employees;
```

#### **Q9: What is ORDER BY?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Sorts result set.
```sql
SELECT * FROM users ORDER BY name ASC;
SELECT * FROM users ORDER BY age DESC;
```

#### **Q10: What is DISTINCT?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Returns unique values.
```sql
SELECT DISTINCT country FROM users;
```

### **Data Manipulation**

#### **Q11: What is INSERT statement?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Adds new records.
```sql
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
```

#### **Q12: What is UPDATE statement?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Modifies existing records.
```sql
UPDATE users SET email = 'new@example.com' WHERE id = 1;
```

#### **Q13: What is DELETE statement?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Removes records.
```sql
DELETE FROM users WHERE id = 1;
```

#### **Q14: Difference between DELETE and TRUNCATE?**
**Tags:** `#SQL` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **DELETE**: Removes specific rows, can rollback, slower, fires triggers
- **TRUNCATE**: Removes all rows, cannot rollback, faster, no triggers

### **Database Concepts**

#### **Q15: What is primary key?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Unique identifier for table row. Cannot be NULL. One per table.

#### **Q16: What is foreign key?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Links two tables. References primary key of another table. Maintains referential integrity.

#### **Q17: What is index?**
**Tags:** `#SQL` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Database object that speeds up data retrieval. Trade-off: Faster SELECT, slower INSERT/UPDATE/DELETE.

#### **Q18: What is NULL?**
**Tags:** `#SQL` `#Basics` `#Tricky`  
**Difficulty:** ⭐  
**Answer:** Represents missing/unknown value. Not same as empty string or zero.
```sql
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;
```

### **Testing Applications**

#### **Q19: What is LIMIT/TOP?**
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Limits number of rows returned.
```sql
SELECT * FROM users LIMIT 10; -- MySQL
SELECT TOP 10 * FROM users; -- SQL Server
```

#### **Q20: How to test database in automation?**
**Tags:** `#SQL` `#Testing` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use JDBC to connect, execute queries, validate results. Verify data integrity, CRUD operations, constraints.

---

## 📚 Study Recommendations by Experience Level

### **Junior Level (0-2 Years)**
**Focus Areas**: Questions 1-10
- Basic SQL syntax and commands
- Simple SELECT queries
- WHERE clause usage
- Basic data retrieval

### **Mid-Level (3-5 Years)**
**Focus Areas**: Questions 1-15
- JOIN operations
- GROUP BY and aggregate functions
- Data manipulation (INSERT, UPDATE, DELETE)
- Database constraints

### **Senior Level (5+ Years)**
**Focus Areas**: All Questions 1-20
- Advanced querying techniques
- Performance considerations
- Database testing integration
- Automation framework integration

---

## 🎯 Common Interview Topics

### **Service Companies**
- Basic SQL syntax
- Simple queries and joins
- Data validation queries
- Database connectivity in automation

### **Product Companies**
- Complex queries and optimization
- Database testing strategies
- Performance testing
- Data integrity validation

### **Testing-Specific Focus**
- Database validation in test automation
- Test data setup and cleanup
- Data-driven testing with databases
- API testing with database validation

---

**Total Questions**: 20 Questions
**Preparation Time**: 1-2 weeks
**Target Audience**: Testers and QA Engineers
**Last Updated**: December 19, 2025