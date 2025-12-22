# 🐳 Docker & CI/CD - Interview Questions Bank - 15 Questions

**Purpose**: Docker containerization and CI/CD pipeline questions for testers
**Target**: 0-8 years experience in DevOps and automation testing
**Total Questions**: 15
**Status**: Questions with detailed answers
**Source**: INTERVIEW-QUESTIONS-EXTENDED.md

---

## 🎯 **DOCKER & CI/CD QUESTIONS WITH ANSWERS** (15 Questions)
*Essential DevOps knowledge for automation testers*

### **Docker Fundamentals**

#### **Q1: What is Docker?**
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Platform for containerization. Packages application with dependencies. Ensures consistency across environments.

#### **Q2: What is container?**
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Lightweight, standalone package with application and dependencies. Isolated from host system.

#### **Q3: What is Docker image?**
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Template for creating containers. Read-only. Built from Dockerfile.

#### **Q4: What is Dockerfile?**
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Text file with instructions to build Docker image.
```dockerfile
FROM openjdk:11
COPY target/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### **Q5: Basic Docker commands?**
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:**
```bash
docker build -t myapp .
docker run -p 8080:8080 myapp
docker ps
docker stop container_id
docker images
docker rm container_id
docker rmi image_id
```

#### **Q6: What is Docker Compose?**
**Tags:** `#Docker` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Tool for defining multi-container applications. Uses YAML file (docker-compose.yml).

### **CI/CD Fundamentals**

#### **Q7: What is CI/CD?**
**Tags:** `#CI-CD` `#Basics`  
**Difficulty:** ⭐  
**Answer:**
- **CI** (Continuous Integration): Frequent code integration, automated testing
- **CD** (Continuous Deployment): Automated deployment to production

#### **Q8: What is Jenkins pipeline?**
**Tags:** `#Jenkins` `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Suite of plugins for CI/CD as code. Defined in Jenkinsfile. Stages: Build, Test, Deploy.

#### **Q9: What is Jenkinsfile?**
**Tags:** `#Jenkins` `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Text file with pipeline definition. Two types: Declarative and Scripted.
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean install'
            }
        }
    }
}
```

#### **Q10: What are Jenkins stages?**
**Tags:** `#Jenkins` `#CI-CD`  
**Difficulty:** ⭐⭐  
**Answer:** Logical divisions in pipeline. Common: Checkout, Build, Test, Deploy, Notify.

### **CI/CD Integration**

#### **Q11: How to trigger Jenkins job?**
**Tags:** `#Jenkins` `#CI-CD` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Manual, SCM polling, webhook, scheduled (cron), upstream job.

#### **Q12: What is webhook?**
**Tags:** `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** HTTP callback. Triggers Jenkins job on Git push/merge. Real-time integration.

#### **Q13: What is artifact?**
**Tags:** `#CI-CD` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Build output (JAR, WAR, ZIP). Stored in artifact repository (Nexus, Artifactory).

#### **Q14: How to run Selenium tests in Docker?**
**Tags:** `#Docker` `#Selenium` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use Selenium Docker images (standalone-chrome, standalone-firefox). Configure RemoteWebDriver.

#### **Q15: What is GitHub Actions?**
**Tags:** `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** CI/CD platform by GitHub. Automates workflows. Defined in YAML (.github/workflows/).

---

## 📚 Study Recommendations by Experience Level

### **Junior Level (0-2 Years)**
**Focus Areas**: Questions 1-8
- Basic Docker concepts
- Container vs image understanding
- Basic CI/CD concepts
- Simple pipeline creation

### **Mid-Level (3-5 Years)**
**Focus Areas**: Questions 1-12
- Docker Compose usage
- Jenkins pipeline creation
- Webhook integration
- Artifact management

### **Senior Level (5+ Years)**
**Focus Areas**: All Questions 1-15
- Advanced Docker usage
- Complex pipeline design
- Multi-stage deployments
- Performance optimization

---

## 🎯 Common Interview Topics

### **Docker for Testing**
- Containerizing test environments
- Running tests in Docker containers
- Docker Compose for multi-service testing
- Container orchestration basics

### **CI/CD Pipelines**
- Pipeline design and best practices
- Test automation integration
- Deployment strategies
- Environment management

### **DevOps Integration**
- Infrastructure as Code
- Monitoring and logging
- Security considerations
- Performance optimization

---

## 🛠️ Tools & Technologies

### **Containerization**
- **Docker**: Container platform
- **Docker Compose**: Multi-container orchestration
- **Kubernetes**: Container orchestration (advanced)
- **Docker Hub**: Container registry

### **CI/CD Platforms**
- **Jenkins**: Open-source automation server
- **GitHub Actions**: GitHub-integrated CI/CD
- **GitLab CI**: GitLab-integrated pipelines
- **Azure DevOps**: Microsoft CI/CD platform
- **CircleCI**: Cloud-based CI/CD

### **Testing Integration**
- **Selenium Grid**: Distributed testing with Docker
- **TestContainers**: Integration testing with containers
- **Docker-based test environments**
- **Automated test execution in pipelines**

---

## 🚀 Practical Applications

### **Docker for Test Automation**
```dockerfile
# Selenium test container
FROM maven:3.8-openjdk-11
COPY . /app
WORKDIR /app
RUN mvn clean compile
CMD ["mvn", "test"]
```

### **Jenkins Pipeline for Testing**
```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/user/repo.git'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn clean test'
            }
        }
        stage('Report') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'target/surefire-reports',
                    reportFiles: 'index.html',
                    reportName: 'Test Report'
                ])
            }
        }
    }
}
```

### **Docker Compose for Testing**
```yaml
version: '3.8'
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
      - HUB_HOST=selenium-hub
```

---

**Total Questions**: 15 Questions
**Preparation Time**: 2-3 weeks
**Target Audience**: Automation testers moving into DevOps
**Last Updated**: December 19, 2025