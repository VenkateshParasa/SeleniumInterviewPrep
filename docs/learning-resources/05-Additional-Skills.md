# 🛠️ Additional Essential Skills for Automation Testing

## 📚 Table of Contents
1. [TestNG Framework](#testng-framework)
2. [Maven Build Tool](#maven-build-tool)
3. [Git Version Control](#git-version-control)
4. [Jenkins CI/CD](#jenkins-cicd)
5. [Cucumber BDD](#cucumber-bdd)
6. [Page Object Model](#page-object-model)
7. [Reporting](#reporting)
8. [SQL Basics](#sql-basics)
9. [Docker Basics](#docker-basics)

---

## 🧪 TestNG Framework

### **What is TestNG?**
TestNG (Test Next Generation) is a testing framework inspired by JUnit, designed for test configuration and parallel execution.

### **Key Features**
- Annotations for test configuration
- Parallel test execution
- Data-driven testing
- Test dependencies
- Grouping tests
- Detailed HTML reports

### **TestNG Annotations**
```java
import org.testng.annotations.*;

public class TestNGAnnotationsDemo {
    
    @BeforeSuite
    public void beforeSuite() {
        System.out.println("1. Before Suite - Database connection");
    }
    
    @BeforeTest
    public void beforeTest() {
        System.out.println("2. Before Test - Browser setup");
    }
    
    @BeforeClass
    public void beforeClass() {
        System.out.println("3. Before Class - Login to application");
    }
    
    @BeforeMethod
    public void beforeMethod() {
        System.out.println("4. Before Method - Navigate to page");
    }
    
    @Test(priority = 1)
    public void test1() {
        System.out.println("5. Test 1 - Executing test case 1");
    }
    
    @Test(priority = 2, dependsOnMethods = "test1")
    public void test2() {
        System.out.println("5. Test 2 - Executing test case 2");
    }
    
    @AfterMethod
    public void afterMethod() {
        System.out.println("6. After Method - Clear cache");
    }
    
    @AfterClass
    public void afterClass() {
        System.out.println("7. After Class - Logout");
    }
    
    @AfterTest
    public void afterTest() {
        System.out.println("8. After Test - Close browser");
    }
    
    @AfterSuite
    public void afterSuite() {
        System.out.println("9. After Suite - Close database connection");
    }
}
```

### **TestNG XML Configuration**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Test Suite" parallel="tests" thread-count="2">
    
    <test name="Smoke Tests">
        <classes>
            <class name="com.tests.LoginTest"/>
            <class name="com.tests.HomePageTest"/>
        </classes>
    </test>
    
    <test name="Regression Tests">
        <groups>
            <run>
                <include name="regression"/>
            </run>
        </groups>
        <classes>
            <class name="com.tests.CheckoutTest"/>
            <class name="com.tests.PaymentTest"/>
        </classes>
    </test>
    
</suite>
```

### **Data-Driven Testing with DataProvider**
```java
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class DataDrivenTest {
    
    @DataProvider(name = "loginData")
    public Object[][] getLoginData() {
        return new Object[][] {
            {"user1", "pass1"},
            {"user2", "pass2"},
            {"user3", "pass3"}
        };
    }
    
    @Test(dataProvider = "loginData")
    public void testLogin(String username, String password) {
        System.out.println("Testing with: " + username + " / " + password);
        // Your test logic here
    }
}
```

### **Grouping Tests**
```java
import org.testng.annotations.Test;

public class GroupingTests {
    
    @Test(groups = {"smoke", "regression"})
    public void test1() {
        System.out.println("Smoke and Regression test");
    }
    
    @Test(groups = {"smoke"})
    public void test2() {
        System.out.println("Smoke test only");
    }
    
    @Test(groups = {"regression"})
    public void test3() {
        System.out.println("Regression test only");
    }
}
```

---

## 📦 Maven Build Tool

### **What is Maven?**
Maven is a build automation and dependency management tool for Java projects.

### **Key Features**
- Dependency management
- Build lifecycle management
- Project structure standardization
- Plugin ecosystem

### **pom.xml Structure**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Project Information -->
    <groupId>com.automation</groupId>
    <artifactId>selenium-framework</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    
    <name>Selenium Automation Framework</name>
    <description>Complete automation framework</description>
    
    <!-- Properties -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <selenium.version>4.15.0</selenium.version>
        <testng.version>7.8.0</testng.version>
    </properties>
    
    <!-- Dependencies -->
    <dependencies>
        <!-- Selenium -->
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>${selenium.version}</version>
        </dependency>
        
        <!-- TestNG -->
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>${testng.version}</version>
        </dependency>
        
        <!-- WebDriverManager -->
        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>5.6.2</version>
        </dependency>
        
        <!-- REST Assured -->
        <dependency>
            <groupId>io.rest-assured</groupId>
            <artifactId>rest-assured</artifactId>
            <version>5.3.2</version>
        </dependency>
        
        <!-- Apache POI (Excel) -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>5.2.5</version>
        </dependency>
        
        <!-- ExtentReports -->
        <dependency>
            <groupId>com.aventstack</groupId>
            <artifactId>extentreports</artifactId>
            <version>5.1.1</version>
        </dependency>
        
        <!-- Log4j -->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.22.0</version>
        </dependency>
    </dependencies>
    
    <!-- Build Configuration -->
    <build>
        <plugins>
            <!-- Maven Compiler Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            
            <!-- Maven Surefire Plugin (TestNG) -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.2</version>
                <configuration>
                    <suiteXmlFiles>
                        <suiteXmlFile>testng.xml</suiteXmlFile>
                    </suiteXmlFiles>
                </configuration>
            </plugin>
        </plugins>
    </build>
    
</project>
```

### **Maven Commands**
```bash
# Clean project
mvn clean

# Compile code
mvn compile

# Run tests
mvn test

# Package project
mvn package

# Install to local repository
mvn install

# Clean and test
mvn clean test

# Skip tests
mvn clean install -DskipTests

# Run specific test
mvn test -Dtest=LoginTest

# Run with TestNG XML
mvn test -DsuiteXmlFile=testng.xml
```

---

## 🔧 Git Version Control

### **What is Git?**
Git is a distributed version control system for tracking changes in source code.

### **Essential Git Commands**
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository
git init

# Clone repository
git clone https://github.com/username/repo.git

# Check status
git status

# Add files to staging
git add .                    # Add all files
git add filename.txt         # Add specific file

# Commit changes
git commit -m "Commit message"

# Push to remote
git push origin main

# Pull from remote
git pull origin main

# Create branch
git branch feature-branch

# Switch branch
git checkout feature-branch

# Create and switch branch
git checkout -b new-branch

# Merge branch
git checkout main
git merge feature-branch

# View commit history
git log
git log --oneline

# Discard changes
git checkout -- filename.txt

# Remove file
git rm filename.txt

# View differences
git diff

# Stash changes
git stash
git stash pop

# View remote
git remote -v

# Add remote
git remote add origin https://github.com/username/repo.git
```

### **.gitignore File**
```
# Compiled files
*.class
target/
bin/

# IDE files
.idea/
.vscode/
*.iml
.settings/
.project
.classpath

# Test reports
test-output/
reports/
screenshots/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# Maven
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup

# Sensitive data
config.properties
credentials.txt
```

---

## 🚀 Jenkins CI/CD

### **What is Jenkins?**
Jenkins is an open-source automation server for continuous integration and continuous delivery.

### **Jenkins Setup Steps**
1. Download Jenkins from https://www.jenkins.io/
2. Install Java (prerequisite)
3. Start Jenkins: `java -jar jenkins.war`
4. Access: http://localhost:8080
5. Install suggested plugins

### **Jenkins Pipeline (Jenkinsfile)**
```groovy
pipeline {
    agent any
    
    tools {
        maven 'Maven 3.9.5'
        jdk 'JDK 11'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/username/automation-framework.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Generate Reports') {
            steps {
                publishHTML([
                    reportDir: 'test-output',
                    reportFiles: 'index.html',
                    reportName: 'Test Report'
                ])
            }
        }
    }
    
    post {
        always {
            emailext (
                subject: "Test Results: ${currentBuild.result}",
                body: "Build ${env.BUILD_NUMBER} - ${currentBuild.result}",
                to: 'team@example.com'
            )
        }
        success {
            echo 'Tests passed successfully!'
        }
        failure {
            echo 'Tests failed!'
        }
    }
}
```

### **Jenkins Job Configuration**
```xml
<!-- Example: Freestyle Job Configuration -->
1. New Item → Freestyle Project
2. Source Code Management → Git
   - Repository URL: https://github.com/username/repo.git
   - Branch: */main
3. Build Triggers
   - Poll SCM: H/5 * * * * (every 5 minutes)
   - GitHub hook trigger
4. Build
   - Execute shell: mvn clean test
5. Post-build Actions
   - Publish TestNG Results: **/testng-results.xml
   - Email Notification
```

---

## 🥒 Cucumber BDD

### **What is Cucumber?**
Cucumber is a BDD (Behavior-Driven Development) framework that uses Gherkin language.

### **Maven Dependencies**
```xml
<dependencies>
    <!-- Cucumber Java -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-java</artifactId>
        <version>7.14.1</version>
    </dependency>
    
    <!-- Cucumber TestNG -->
    <dependency>
        <groupId>io.cucumber</groupId>
        <artifactId>cucumber-testng</artifactId>
        <version>7.14.1</version>
    </dependency>
</dependencies>
```

### **Feature File (login.feature)**
```gherkin
Feature: Login Functionality
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given User is on login page

  Scenario: Successful login with valid credentials
    When User enters username "standard_user"
    And User enters password "secret_sauce"
    And User clicks on login button
    Then User should be redirected to home page
    And User should see welcome message

  Scenario: Login with invalid credentials
    When User enters username "invalid_user"
    And User enters password "wrong_password"
    And User clicks on login button
    Then User should see error message "Invalid credentials"

  Scenario Outline: Login with multiple users
    When User enters username "<username>"
    And User enters password "<password>"
    And User clicks on login button
    Then Login should be "<result>"

    Examples:
      | username      | password      | result  |
      | standard_user | secret_sauce  | success |
      | locked_user   | secret_sauce  | failed  |
      | invalid_user  | wrong_pass    | failed  |
```

### **Step Definitions**
```java
import io.cucumber.java.en.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;

public class LoginSteps {
    WebDriver driver;
    
    @Given("User is on login page")
    public void user_is_on_login_page() {
        driver = new ChromeDriver();
        driver.get("https://www.saucedemo.com/");
    }
    
    @When("User enters username {string}")
    public void user_enters_username(String username) {
        driver.findElement(By.id("user-name")).sendKeys(username);
    }
    
    @When("User enters password {string}")
    public void user_enters_password(String password) {
        driver.findElement(By.id("password")).sendKeys(password);
    }
    
    @When("User clicks on login button")
    public void user_clicks_on_login_button() {
        driver.findElement(By.id("login-button")).click();
    }
    
    @Then("User should be redirected to home page")
    public void user_should_be_redirected_to_home_page() {
        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("inventory"));
    }
    
    @Then("User should see welcome message")
    public void user_should_see_welcome_message() {
        String title = driver.findElement(By.className("title")).getText();
        Assert.assertEquals(title, "Products");
    }
    
    @Then("User should see error message {string}")
    public void user_should_see_error_message(String errorMsg) {
        String actualError = driver.findElement(By.cssSelector(".error-message-container")).getText();
        Assert.assertTrue(actualError.contains(errorMsg));
    }
}
```

### **Test Runner**
```java
import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;

@CucumberOptions(
    features = "src/test/resources/features",
    glue = "stepDefinitions",
    plugin = {
        "pretty",
        "html:target/cucumber-reports/cucumber.html",
        "json:target/cucumber-reports/cucumber.json"
    },
    monochrome = true,
    tags = "@smoke"
)
public class TestRunner extends AbstractTestNGCucumberTests {
}
```

---

## 📄 Page Object Model

### **What is POM?**
Page Object Model is a design pattern that creates an object repository for web elements.

### **Benefits**
- Code reusability
- Easy maintenance
- Reduced code duplication
- Better readability

### **Example: Login Page**
```java
package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    WebDriver driver;
    
    // Page Factory - Web Elements
    @FindBy(id = "user-name")
    WebElement usernameField;
    
    @FindBy(id = "password")
    WebElement passwordField;
    
    @FindBy(id = "login-button")
    WebElement loginButton;
    
    @FindBy(css = ".error-message-container")
    WebElement errorMessage;
    
    // Constructor
    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }
    
    // Page Methods
    public void enterUsername(String username) {
        usernameField.clear();
        usernameField.sendKeys(username);
    }
    
    public void enterPassword(String password) {
        passwordField.clear();
        passwordField.sendKeys(password);
    }
    
    public void clickLoginButton() {
        loginButton.click();
    }
    
    public String getErrorMessage() {
        return errorMessage.getText();
    }
    
    // Combined method
    public void login(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }
}
```

### **Example: Home Page**
```java
package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class HomePage {
    WebDriver driver;
    
    @FindBy(className = "title")
    WebElement pageTitle;
    
    @FindBy(id = "react-burger-menu-btn")
    WebElement menuButton;
    
    @FindBy(id = "logout_sidebar_link")
    WebElement logoutLink;
    
    public HomePage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }
    
    public String getPageTitle() {
        return pageTitle.getText();
    }
    
    public void logout() {
        menuButton.click();
        logoutLink.click();
    }
}
```

### **Test Class Using POM**
```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;
import pages.LoginPage;
import pages.HomePage;

public class LoginTest {
    WebDriver driver;
    LoginPage loginPage;
    HomePage homePage;
    
    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("https://www.saucedemo.com/");
        loginPage = new LoginPage(driver);
        homePage = new HomePage(driver);
    }
    
    @Test
    public void testValidLogin() {
        loginPage.login("standard_user", "secret_sauce");
        Assert.assertEquals(homePage.getPageTitle(), "Products");
    }
    
    @Test
    public void testInvalidLogin() {
        loginPage.login("invalid_user", "wrong_password");
        Assert.assertTrue(loginPage.getErrorMessage().contains("do not match"));
    }
    
    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

---

## 📊 Reporting

### **ExtentReports**
```java
import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import org.testng.annotations.*;

public class ExtentReportDemo {
    ExtentReports extent;
    ExtentTest test;
    
    @BeforeClass
    public void setupReport() {
        ExtentSparkReporter spark = new ExtentSparkReporter("reports/extent-report.html");
        spark.config().setDocumentTitle("Automation Report");
        spark.config().setReportName("Test Execution Report");
        
        extent = new ExtentReports();
        extent.attachReporter(spark);
        extent.setSystemInfo("Tester", "John Doe");
        extent.setSystemInfo("Environment", "QA");
        extent.setSystemInfo("Browser", "Chrome");
    }
    
    @Test
    public void test1() {
        test = extent.createTest("Login Test");
        test.log(Status.INFO, "Starting login test");
        test.log(Status.PASS, "Login successful");
    }
    
    @Test
    public void test2() {
        test = extent.createTest("Checkout Test");
        test.log(Status.INFO, "Starting checkout test");
        test.log(Status.FAIL, "Checkout failed");
    }
    
    @AfterClass
    public void tearDownReport() {
        extent.flush();
    }
}
```

---

## 🗄️ SQL Basics

### **Essential SQL Commands**
```sql
-- SELECT
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;

-- INSERT
INSERT INTO users (name, email, password) 
VALUES ('John Doe', 'john@example.com', 'pass123');

-- UPDATE
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- DELETE
DELETE FROM users WHERE id = 1;

-- JOIN
SELECT orders.id, users.name, orders.amount
FROM orders
INNER JOIN users ON orders.user_id = users.id;

-- WHERE with conditions
SELECT * FROM users WHERE age > 25 AND city = 'Bangalore';

-- ORDER BY
SELECT * FROM users ORDER BY name ASC;

-- COUNT
SELECT COUNT(*) FROM users;
```

### **JDBC Connection in Java**
```java
import java.sql.*;

public class DatabaseTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/testdb";
        String username = "root";
        String password = "password";
        
        try {
            // Load driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Create connection
            Connection conn = DriverManager.getConnection(url, username, password);
            
            // Create statement
            Statement stmt = conn.createStatement();
            
            // Execute query
            ResultSet rs = stmt.executeQuery("SELECT * FROM users");
            
            // Process results
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id"));
                System.out.println("Name: " + rs.getString("name"));
                System.out.println("Email: " + rs.getString("email"));
            }
            
            // Close connections
            rs.close();
            stmt.close();
            conn.close();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

---

## 🐳 Docker Basics

### **What is Docker?**
Docker is a platform for developing, shipping, and running applications in containers.

### **Essential Docker Commands**
```bash
# Pull image
docker pull selenium/standalone-chrome

# Run container
docker run -d -p 4444:4444 selenium/standalone-chrome

# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop container_id

# Remove container
docker rm container_id

# List images
docker images

# Remove image
docker rmi image_name

# View logs
docker logs container_id

# Execute command in container
docker exec -it container_id bash
```

### **Dockerfile Example**
```dockerfile
FROM maven:3.8.6-openjdk-11

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

CMD ["mvn", "test"]
```

### **Docker Compose for Selenium Grid**
```yaml
version: '3'
services:
  selenium-hub:
    image: selenium/hub:latest
    ports:
      - "4444:4444"
  
  chrome:
    image: selenium/node-chrome:latest
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
  
  firefox:
    image: selenium/node-firefox:latest
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
```

---

## ✅ Skills Checklist

### **Must Master (Priority 1)**
- [ ] TestNG annotations and configuration
- [ ] Maven project setup and dependencies
- [ ] Git basic commands (clone, commit, push, pull)
- [ ] Page Object Model implementation
- [ ] Basic reporting (TestNG HTML reports)

### **Highly Recommended (Priority 2)**
- [ ] Jenkins job configuration
- [ ] Cucumber BDD basics
- [ ] ExtentReports integration
- [ ] SQL SELECT queries
- [ ] Data-driven testing with Excel/CSV

### **Good to Have (Priority 3)**
- [ ] Jenkins Pipeline
- [ ] Docker basics
- [ ] Advanced Git (branching, merging)
- [ ] Database testing with JDBC
- [ ] Selenium Grid

---

## 🚀 Next Steps

1. Master TestNG and Maven first
2. Learn Git for version control
3. Set up Jenkins for CI/CD
4. Implement POM in your framework
5. Move to [`06-Study-Schedule.md`](06-Study-Schedule.md)

---

**Pro Tips**:
- Practice TestNG extensively - it's used in 90%+ companies
- Maven is essential - learn dependency management
- Git is mandatory - practice daily
- POM makes code maintainable - always use it
- Jenkins knowledge gives you an edge in interviews