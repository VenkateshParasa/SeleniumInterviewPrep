# 🥒 Cucumber/BDD - Interview Questions Bank - 15 Questions

**Purpose**: Behavior Driven Development and Cucumber framework questions
**Target**: 0-8 years experience in BDD and Cucumber automation
**Total Questions**: 15
**Status**: Questions with detailed answers
**Source**: INTERVIEW-QUESTIONS-EXTENDED.md

---

## 🎯 **CUCUMBER/BDD QUESTIONS WITH ANSWERS** (15 Questions)
*Essential BDD and Cucumber knowledge for automation testers*

### **BDD Fundamentals**

#### **Q1: What is BDD?**
**Tags:** `#BDD` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Behavior Driven Development. Collaboration between developers, testers, business. Uses natural language for test scenarios.

#### **Q2: What is Cucumber?**
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** BDD framework. Executes tests written in Gherkin language. Supports multiple languages (Java, Ruby, JavaScript).

#### **Q3: What is Gherkin?**
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Business-readable language for BDD. Keywords: Feature, Scenario, Given, When, Then, And, But.

### **Cucumber Components**

#### **Q4: What is Feature file?**
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** File with .feature extension. Contains scenarios in Gherkin language.
```gherkin
Feature: Login
  Scenario: Successful login
    Given user is on login page
    When user enters valid credentials
    Then user should see dashboard
```

#### **Q5: What are Step Definitions?**
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Java methods that implement Gherkin steps. Maps steps to code.
```java
@Given("user is on login page")
public void userIsOnLoginPage() {
    driver.get("https://example.com/login");
}
```

#### **Q6: What is Scenario Outline?**
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Template for multiple scenarios with different data. Uses Examples table.
```gherkin
Scenario Outline: Login with different users
  Given user enters "<username>" and "<password>"
  Examples:
    | username | password |
    | user1    | pass1    |
    | user2    | pass2    |
```

### **Advanced Cucumber Features**

#### **Q7: What are Tags in Cucumber?**
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Organize and filter scenarios. Run specific tests.
```gherkin
@smoke @regression
Scenario: Login test
```

#### **Q8: What is Background in Cucumber?**
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Common steps for all scenarios in feature file. Runs before each scenario.
```gherkin
Background:
  Given user is logged in
```

#### **Q9: What are Hooks in Cucumber?**
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Methods that run before/after scenarios. @Before, @After, @BeforeStep, @AfterStep.

#### **Q10: How to generate Cucumber reports?**
**Tags:** `#BDD` `#Cucumber` `#Reporting`  
**Difficulty:** ⭐⭐  
**Answer:** Use plugins: html, json, junit. Configure in TestRunner.
```java
@CucumberOptions(
    plugin = {"pretty", "html:target/cucumber-reports"}
)
```

### **Data Handling & Integration**

#### **Q11: What is Data Table in Cucumber?**
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Pass multiple rows of data to step.
```gherkin
Given users exist:
  | name  | email           |
  | John  | john@email.com  |
  | Jane  | jane@email.com  |
```

#### **Q12: Difference between Scenario and Scenario Outline?**
**Tags:** `#BDD` `#Cucumber` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Scenario**: Single test case
- **Scenario Outline**: Template for multiple test cases with different data

#### **Q13: What is TestRunner in Cucumber?**
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** JUnit/TestNG class that runs Cucumber tests. Configures features, glue, plugins.

#### **Q14: How to integrate Cucumber with Selenium?**
**Tags:** `#BDD` `#Cucumber` `#Selenium` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Create step definitions with Selenium WebDriver code. Initialize driver in hooks.

#### **Q15: What are advantages of BDD?**
**Tags:** `#BDD` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Better collaboration, living documentation, business-readable tests, early bug detection, reusable steps.

---

## 📚 Study Recommendations by Experience Level

### **Junior Level (0-2 Years)**
**Focus Areas**: Questions 1-8
- BDD concepts and benefits
- Basic Gherkin syntax
- Feature files and step definitions
- Simple Cucumber setup

### **Mid-Level (3-5 Years)**
**Focus Areas**: Questions 1-12
- Advanced Cucumber features
- Data-driven testing with Scenario Outline
- Tags and test organization
- Reporting and hooks

### **Senior Level (5+ Years)**
**Focus Areas**: All Questions 1-15
- Framework integration
- Advanced reporting
- Best practices and patterns
- Team collaboration strategies

---

## 🎯 Common Interview Topics

### **BDD Implementation**
- How to write effective feature files
- Step definition best practices
- Data-driven testing approaches
- Test organization with tags

### **Framework Integration**
- Cucumber with Selenium WebDriver
- TestNG/JUnit integration
- Maven/Gradle configuration
- CI/CD pipeline integration

### **Best Practices**
- Feature file organization
- Step definition reusability
- Reporting and documentation
- Team collaboration workflows

---

## 🛠️ Tools & Technologies

### **Core Tools**
- **Cucumber**: BDD framework
- **Gherkin**: Business-readable language
- **Selenium**: Web automation integration
- **TestNG/JUnit**: Test execution framework

### **Reporting Tools**
- **Cucumber Reports**: Built-in HTML reports
- **ExtentReports**: Rich reporting with Cucumber
- **Allure**: Interactive test reports
- **Maven Cucumber Reporting**: Advanced reporting plugin

### **IDE Support**
- **IntelliJ IDEA**: Cucumber plugin
- **Eclipse**: Cucumber Eclipse plugin
- **Visual Studio Code**: Cucumber extensions

---

**Total Questions**: 15 Questions
**Preparation Time**: 1-2 weeks
**Target Audience**: BDD practitioners and Cucumber users
**Last Updated**: December 19, 2025