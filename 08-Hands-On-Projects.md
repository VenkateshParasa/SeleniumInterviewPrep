automation.com/
- https://the-internet.herokuapp.com/login

**GitHub Structure**:
```
login-automation/
├── src/
│   └── test/
│       └── java/
│           └── tests/
│               └── LoginTest.java
├── pom.xml
└── README.md
```

---

### **Project 2: Form Automation**
**Duration**: 3-4 days  
**Skills**: Handling different input types, dropdowns, checkboxes

**Requirements**:
- Fill registration form
- Handle dropdowns
- Select checkboxes/radio buttons
- Upload file
- Submit and verify

**Test Scenarios**:
1. Fill all mandatory fields
2. Validate field validations
3. Test dropdown selections
4. Test file upload
5. Verify success message

**Websites**:
- https://demo.automationtesting.in/Register.html
- https://www.globalsqa.com/samplepagetest/

---

### **Project 3: E-commerce Product Search**
**Duration**: 4-5 days  
**Skills**: Search functionality, assertions, TestNG

**Requirements**:
- Search products
- Verify search results
- Filter products
- Sort products
- Add to cart

**Test Scenarios**:
1. Search with valid keyword
2. Search with invalid keyword
3. Apply filters
4. Sort by price
5. Add product to cart

**Websites**:
- https://www.saucedemo.com/
- https://automationexercise.com/

---

## 🎓 Intermediate Projects (Month 3-4)

### **Project 4: E-commerce End-to-End Testing**
**Duration**: 1-2 weeks  
**Skills**: Complete flow, TestNG, POM basics

**Requirements**:
- Login functionality
- Product search and filter
- Add to cart
- Checkout process
- Order confirmation

**Test Scenarios**:
1. Complete purchase flow
2. Add multiple products
3. Update cart quantities
4. Apply coupon codes
5. Verify order details

**Framework Structure**:
```
ecommerce-automation/
├── src/
│   ├── main/
│   │   └── java/
│   │       ├── pages/
│   │       │   ├── LoginPage.java
│   │       │   ├── ProductPage.java
│   │       │   └── CartPage.java
│   │       └── utils/
│   │           └── DriverManager.java
│   └── test/
│       └── java/
│           └── tests/
│               └── CheckoutTest.java
├── testng.xml
├── pom.xml
└── README.md
```

---

### **Project 5: API Testing Framework**
**Duration**: 1-2 weeks  
**Skills**: REST Assured, JSON validation, TestNG

**Requirements**:
- Test CRUD operations
- Validate status codes
- Validate JSON response
- Handle authentication
- Data-driven testing

**Test Scenarios**:
1. GET all users
2. GET single user
3. CREATE new user
4. UPDATE user
5. DELETE user
6. Validate error responses

**API to Use**: https://reqres.in/

**Framework Structure**:
```
api-automation/
├── src/
│   └── test/
│       └── java/
│           ├── tests/
│           │   ├── UserAPITest.java
│           │   └── AuthenticationTest.java
│           └── utils/
│               └── APIHelper.java
├── testng.xml
├── pom.xml
└── README.md
```

---

### **Project 6: Data-Driven Testing Framework**
**Duration**: 1 week  
**Skills**: Excel integration, TestNG DataProvider

**Requirements**:
- Read data from Excel
- Execute tests with multiple data sets
- Write results back to Excel
- Generate reports

**Test Scenarios**:
1. Login with 10+ credential sets
2. Search with multiple keywords
3. Form submission with various inputs

**Framework Structure**:
```
data-driven-framework/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── utils/
│   │           └── ExcelReader.java
│   └── test/
│       └── java/
│           └── tests/
│               └── DataDrivenTest.java
├── testdata/
│   └── testdata.xlsx
├── testng.xml
└── pom.xml
```

---

## 🏆 Advanced Projects (Month 5-6)

### **Project 7: Hybrid Automation Framework**
**Duration**: 2-3 weeks  
**Skills**: POM, TestNG, Maven, Git, Jenkins

**Requirements**:
- Page Object Model
- TestNG for test management
- Maven for build
- ExtentReports for reporting
- Jenkins integration
- Git version control

**Features**:
- Modular structure
- Reusable components
- Configuration management
- Logging
- Screenshot on failure
- Parallel execution
- CI/CD integration

**Framework Structure**:
```
hybrid-framework/
├── src/
│   ├── main/
│   │   └── java/
│   │       ├── pages/
│   │       │   ├── BasePage.java
│   │       │   ├── LoginPage.java
│   │       │   └── HomePage.java
│   │       ├── utils/
│   │       │   ├── DriverManager.java
│   │       │   ├── ConfigReader.java
│   │       │   ├── ExcelReader.java
│   │       │   └── ExtentManager.java
│   │       └── constants/
│   │           └── Constants.java
│   └── test/
│       └── java/
│           ├── tests/
│           │   ├── BaseTest.java
│           │   └── LoginTest.java
│           └── listeners/
│               └── TestListener.java
├── config/
│   └── config.properties
├── testdata/
│   └── testdata.xlsx
├── reports/
├── screenshots/
├── logs/
├── testng.xml
├── pom.xml
├── Jenkinsfile
└── README.md
```

---

### **Project 8: BDD Framework with Cucumber**
**Duration**: 2 weeks  
**Skills**: Cucumber, Gherkin, BDD approach

**Requirements**:
- Feature files in Gherkin
- Step definitions
- Hooks for setup/teardown
- Cucumber reports
- Integration with Selenium

**Framework Structure**:
```
bdd-framework/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── pages/
│   └── test/
│       ├── java/
│       │   ├── stepdefinitions/
│       │   │   └── LoginSteps.java
│       │   ├── hooks/
│       │   │   └── Hooks.java
│       │   └── runners/
│       │       └── TestRunner.java
│       └── resources/
│           └── features/
│               └── login.feature
├── testng.xml
├── pom.xml
└── README.md
```

**Sample Feature File**:
```gherkin
Feature: Login Functionality

  Scenario: Successful login
    Given User is on login page
    When User enters valid credentials
    And User clicks login button
    Then User should be logged in successfully

  Scenario Outline: Login with multiple users
    Given User is on login page
    When User enters "<username>" and "<password>"
    Then Login should be "<result>"

    Examples:
      | username | password | result  |
      | user1    | pass1    | success |
      | user2    | pass2    | failed  |
```

---

### **Project 9: API + UI Integrated Framework**
**Duration**: 2-3 weeks  
**Skills**: REST Assured, Selenium, Integration testing

**Requirements**:
- API tests for backend
- UI tests for frontend
- Integration tests
- Single framework for both
- Shared utilities

**Test Scenarios**:
1. Create user via API, verify in UI
2. Update user in UI, verify via API
3. Delete user via API, verify in UI
4. End-to-end workflow testing

**Framework Structure**:
```
integrated-framework/
├── src/
│   ├── main/
│   │   └── java/
│   │       ├── pages/
│   │       ├── api/
│   │       │   └── UserAPI.java
│   │       └── utils/
│   └── test/
│       └── java/
│           ├── uitests/
│           ├── apitests/
│           └── integrationtests/
├── testng.xml
├── pom.xml
└── README.md
```

---

## 💼 Portfolio Projects (For Resume)

### **Project 10: Complete Test Automation Suite**
**Duration**: 3-4 weeks  
**Skills**: All learned skills combined

**Requirements**:
- 3+ modules (Login, Products, Checkout)
- 50+ test cases
- POM design pattern
- Data-driven approach
- API + UI testing
- Parallel execution
- CI/CD pipeline
- Detailed documentation

**Features to Include**:
1. **Framework Features**:
   - Page Object Model
   - TestNG for test management
   - Maven for build
   - Log4j for logging
   - ExtentReports for reporting
   - Screenshot on failure
   - Retry mechanism
   - Parallel execution

2. **Test Coverage**:
   - Smoke tests
   - Regression tests
   - Integration tests
   - API tests
   - Data-driven tests

3. **CI/CD**:
   - Jenkins pipeline
   - Automated execution
   - Email notifications
   - Report generation

4. **Documentation**:
   - README with setup instructions
   - Framework architecture diagram
   - Test execution guide
   - Sample reports

**GitHub Repository Structure**:
```
automation-framework/
├── src/
│   ├── main/
│   │   └── java/
│   │       ├── pages/
│   │       ├── api/
│   │       ├── utils/
│   │       └── constants/
│   └── test/
│       └── java/
│           ├── tests/
│           │   ├── ui/
│           │   └── api/
│           └── listeners/
├── config/
├── testdata/
├── reports/
├── screenshots/
├── logs/
├── .github/
│   └── workflows/
│       └── ci.yml
├── testng.xml
├── pom.xml
├── Jenkinsfile
├── README.md
└── ARCHITECTURE.md
```

---

## 📋 Project Implementation Guide

### **Step 1: Planning (Day 1)**
- [ ] Define project scope
- [ ] List test scenarios
- [ ] Choose website/API
- [ ] Create project structure
- [ ] Set up Git repository

### **Step 2: Setup (Day 1-2)**
- [ ] Create Maven project
- [ ] Add dependencies in pom.xml
- [ ] Set up folder structure
- [ ] Create base classes
- [ ] Configure TestNG XML

### **Step 3: Development (Day 3-10)**
- [ ] Create page objects
- [ ] Write test cases
- [ ] Implement utilities
- [ ] Add logging
- [ ] Add reporting

### **Step 4: Enhancement (Day 11-15)**
- [ ] Add data-driven testing
- [ ] Implement parallel execution
- [ ] Add screenshot capability
- [ ] Create configuration file
- [ ] Add retry mechanism

### **Step 5: CI/CD (Day 16-18)**
- [ ] Set up Jenkins
- [ ] Create Jenkins job
- [ ] Configure pipeline
- [ ] Add email notifications
- [ ] Test automated execution

### **Step 6: Documentation (Day 19-20)**
- [ ] Write README
- [ ] Add setup instructions
- [ ] Document test cases
- [ ] Add sample reports
- [ ] Create architecture diagram

### **Step 7: Testing & Refinement (Day 21)**
- [ ] Run complete suite
- [ ] Fix issues
- [ ] Optimize code
- [ ] Clean up code
- [ ] Final commit

---

## 🎯 Project Evaluation Criteria

### **Code Quality**
- [ ] Clean and readable code
- [ ] Proper naming conventions
- [ ] Comments where needed
- [ ] No hardcoded values
- [ ] Proper exception handling

### **Framework Design**
- [ ] Modular structure
- [ ] Reusable components
- [ ] Scalable architecture
- [ ] Easy to maintain
- [ ] Well organized

### **Test Coverage**
- [ ] Positive scenarios
- [ ] Negative scenarios
- [ ] Edge cases
- [ ] Integration tests
- [ ] Adequate assertions

### **Documentation**
- [ ] Clear README
- [ ] Setup instructions
- [ ] Execution guide
- [ ] Architecture explanation
- [ ] Sample outputs

### **Best Practices**
- [ ] Version control (Git)
- [ ] CI/CD integration
- [ ] Reporting
- [ ] Logging
- [ ] Configuration management

---

## 📊 Project Timeline

### **3-Month Track**
- Month 1: Projects 1-3 (Beginner)
- Month 2: Projects 4-6 (Intermediate)
- Month 3: Projects 7-10 (Advanced + Portfolio)

### **6-Month Track**
- Month 1-2: Projects 1-3 (Beginner)
- Month 3-4: Projects 4-6 (Intermediate)
- Month 5-6: Projects 7-10 (Advanced + Portfolio)

---

## 🚀 GitHub Portfolio Tips

### **Repository Naming**
- Use descriptive names
- Follow naming conventions
- Examples:
  - `selenium-automation-framework`
  - `api-testing-restassured`
  - `hybrid-test-framework`

### **README Template**
```markdown
# Project Name

## Description
Brief description of the project

## Technologies Used
- Java
- Selenium WebDriver
- TestNG
- Maven
- Jenkins

## Features
- Page Object Model
- Data-driven testing
- Parallel execution
- CI/CD integration

## Setup Instructions
1. Clone repository
2. Import as Maven project
3. Update config.properties
4. Run: mvn clean test

## Test Execution
- Run all tests: mvn test
- Run specific suite: mvn test -DsuiteXmlFile=smoke.xml

## Reports
Reports are generated in: target/extent-reports/

## Author
[Your Name]

## License
MIT
```

### **What to Include**
- [ ] Clear README
- [ ] Sample test reports
- [ ] Screenshots
- [ ] Architecture diagram
- [ ] Setup video (optional)

---

## ✅ Project Checklist

### **Before Starting**
- [ ] Choose appropriate project
- [ ] Understand requirements
- [ ] Set up development environment
- [ ] Create Git repository

### **During Development**
- [ ] Follow coding standards
- [ ] Commit regularly
- [ ] Write meaningful commit messages
- [ ] Test frequently
- [ ] Document as you go

### **After Completion**
- [ ] Complete testing
- [ ] Update documentation
- [ ] Add to resume
- [ ] Share on LinkedIn
- [ ] Prepare to explain in interviews

---

## 🎓 Learning Outcomes

By completing these projects, you will:
- Master Selenium WebDriver
- Understand framework design
- Learn API testing
- Gain CI/CD experience
- Build impressive portfolio
- Be interview-ready

---

## 🚀 Next Steps

1. Start with beginner projects
2. Progress to intermediate
3. Build advanced frameworks
4. Create portfolio projects
5. Update resume with projects
6. Prepare project explanations
7. Review [`09-Resources-Links.md`](09-Resources-Links.md)

---

**Remember**: Quality over quantity. One well-built framework is better than five incomplete projects!

**Pro Tip**: Record a demo video of your framework and add to GitHub README!