# 🎯 Interview Preparation Guide

## 📚 Complete Interview Question Bank

### ☕ Java Interview Questions (Top 50)

#### **Basic Level (1-20)**

1. **What is Java? What are its features?**
   - Platform independent, Object-oriented, Secure, Robust, Multithreaded

2. **Difference between JDK, JRE, and JVM?**
   - JDK = Development Kit, JRE = Runtime Environment, JVM = Virtual Machine

3. **Difference between `==` and `.equals()`?**
   - `==` compares references, `.equals()` compares values

4. **What are access modifiers?**
   - public, private, protected, default

5. **Difference between String, StringBuilder, StringBuffer?**
   - String: immutable, StringBuilder: mutable/not thread-safe, StringBuffer: mutable/thread-safe

6. **What is inheritance?**
   - Child class acquires properties of parent class

7. **What is polymorphism?**
   - Method Overloading (compile-time) and Method Overriding (runtime)

8. **What is encapsulation?**
   - Wrapping data and methods, hiding internal details

9. **What is abstraction?**
   - Hiding implementation, showing only functionality

10. **Difference between abstract class and interface?**
    - Abstract class: can have concrete methods, Interface: only abstract methods (before Java 8)

11. **What is constructor?**
    - Special method to initialize objects

12. **Can we overload main method?**
    - Yes, but JVM calls only `public static void main(String[] args)`

13. **What is `this` keyword?**
    - Refers to current object

14. **What is `super` keyword?**
    - Refers to parent class

15. **What is `static` keyword?**
    - Belongs to class, not instance

16. **What is `final` keyword?**
    - Constant variable, prevent inheritance/override

17. **Difference between `final`, `finally`, `finalize()`?**
    - final: keyword, finally: block, finalize(): method

18. **What is exception handling?**
    - try-catch-finally to handle runtime errors

19. **Checked vs Unchecked exceptions?**
    - Checked: compile-time, Unchecked: runtime

20. **What is `throw` vs `throws`?**
    - throw: throw exception, throws: declare exception

#### **Intermediate Level (21-35)**

21. **Difference between ArrayList and LinkedList?**
    - ArrayList: dynamic array, LinkedList: doubly linked list

22. **What is HashMap?**
    - Stores key-value pairs using hashing

23. **Difference between HashMap and HashTable?**
    - HashMap: not synchronized, HashTable: synchronized

24. **What is HashSet?**
    - Stores unique elements using hashing

25. **What is Iterator?**
    - Interface to traverse collections

26. **What is garbage collection?**
    - Automatic memory management

27. **What is method overloading?**
    - Same method name, different parameters

28. **What is method overriding?**
    - Subclass provides specific implementation

29. **Can we override static method?**
    - No, it's method hiding

30. **Can we override private method?**
    - No, not visible to subclass

31. **What is interface?**
    - Contract with abstract methods

32. **Can interface have concrete methods?**
    - Yes, from Java 8 (default and static methods)

33. **What is multiple inheritance?**
    - Achieved through interfaces in Java

34. **What is package?**
    - Group of related classes

35. **What is import statement?**
    - Makes classes available from other packages

#### **Advanced Level (36-50)**

36. **What is Java Memory Model?**
    - Heap, Stack, Method Area, PC Register

37. **What are lambda expressions?**
    - Anonymous functions (Java 8)

38. **What is Stream API?**
    - Process collections functionally (Java 8)

39. **What is Optional class?**
    - Container to avoid NullPointerException

40. **Difference between Comparable and Comparator?**
    - Comparable: natural ordering, Comparator: custom ordering

41. **What is serialization?**
    - Converting object to byte stream

42. **What is transient keyword?**
    - Skip field during serialization

43. **What is volatile keyword?**
    - Variable value read from main memory

44. **What is synchronized keyword?**
    - Thread-safe method/block

45. **What is deadlock?**
    - Two threads waiting for each other

46. **What is thread?**
    - Lightweight process

47. **How to create thread?**
    - Extend Thread class or implement Runnable

48. **What is thread pool?**
    - Reusable threads for tasks

49. **What is ExecutorService?**
    - Framework for thread management

50. **What is reflection?**
    - Inspect and modify runtime behavior

---

### 🌐 Selenium Interview Questions (Top 50)

#### **Basic Level (1-20)**

1. **What is Selenium?**
   - Open-source automation tool for web applications

2. **Selenium components?**
   - WebDriver, IDE, Grid

3. **Difference between `close()` and `quit()`?**
   - close(): current window, quit(): all windows

4. **What are locators?**
   - ID, Name, ClassName, TagName, LinkText, PartialLinkText, CSS, XPath

5. **Difference between absolute and relative XPath?**
   - Absolute: from root (/), Relative: from anywhere (//)

6. **What is WebDriver?**
   - Interface to control browsers

7. **Difference between `findElement()` and `findElements()`?**
   - findElement(): single element, findElements(): list of elements

8. **Types of waits?**
   - Implicit, Explicit, Fluent

9. **How to handle dropdown?**
   - Using Select class

10. **How to handle alerts?**
    - `driver.switchTo().alert()`

11. **How to handle frames?**
    - `driver.switchTo().frame()`

12. **How to handle multiple windows?**
    - Using window handles

13. **What is Actions class?**
    - For complex user interactions

14. **What is JavaScriptExecutor?**
    - Execute JavaScript code

15. **How to take screenshot?**
    - Using TakesScreenshot interface

16. **What is WebElement?**
    - Represents HTML element

17. **How to get text of element?**
    - `element.getText()`

18. **How to get attribute value?**
    - `element.getAttribute("attribute")`

19. **How to check if element is displayed?**
    - `element.isDisplayed()`

20. **How to check if element is enabled?**
    - `element.isEnabled()`

#### **Intermediate Level (21-35)**

21. **What is Page Object Model?**
    - Design pattern for element repository

22. **Benefits of POM?**
    - Reusability, Maintainability, Readability

23. **What is Page Factory?**
    - Initialize web elements using @FindBy

24. **Difference between implicit and explicit wait?**
    - Implicit: global, Explicit: specific condition

25. **How to handle dynamic elements?**
    - Use explicit waits, dynamic XPath

26. **How to scroll page?**
    - Using JavaScriptExecutor

27. **How to handle hidden elements?**
    - Using JavaScriptExecutor

28. **How to handle disabled elements?**
    - Using JavaScriptExecutor

29. **How to upload file?**
    - `element.sendKeys("file path")`

30. **How to download file?**
    - Set browser preferences

31. **How to handle calendar?**
    - Using date picker locators

32. **How to handle cookies?**
    - `driver.manage().getCookies()`

33. **How to maximize window?**
    - `driver.manage().window().maximize()`

34. **How to navigate back?**
    - `driver.navigate().back()`

35. **How to refresh page?**
    - `driver.navigate().refresh()`

#### **Advanced Level (36-50)**

36. **What is Selenium Grid?**
    - Parallel execution across machines

37. **Grid components?**
    - Hub and Nodes

38. **How to handle SSL certificates?**
    - Using browser options

39. **How to run tests in headless mode?**
    - Using ChromeOptions/FirefoxOptions

40. **How to handle CAPTCHA?**
    - Disable in test environment

41. **How to perform parallel execution?**
    - Using TestNG parallel attribute

42. **What is data-driven testing?**
    - Running tests with multiple data sets

43. **How to read Excel data?**
    - Using Apache POI

44. **What is hybrid framework?**
    - Combination of data-driven and keyword-driven

45. **What is TestNG?**
    - Testing framework for Java

46. **TestNG annotations?**
    - @Test, @BeforeMethod, @AfterMethod, etc.

47. **How to create TestNG XML?**
    - Configure test suites and classes

48. **What is assertion?**
    - Verify expected vs actual results

49. **Types of assertions?**
    - Hard assertions (Assert) and Soft assertions (SoftAssert)

50. **How to generate reports?**
    - TestNG reports, ExtentReports

---

### 🔌 API Testing Interview Questions (Top 30)

#### **Basic Level (1-15)**

1. **What is API testing?**
   - Testing APIs at business logic layer

2. **Difference between SOAP and REST?**
   - SOAP: protocol, REST: architectural style

3. **HTTP methods?**
   - GET, POST, PUT, PATCH, DELETE

4. **HTTP status codes?**
   - 2xx: Success, 4xx: Client error, 5xx: Server error

5. **What is REST Assured?**
   - Java library for API testing

6. **What is Postman?**
   - API testing tool

7. **What is JSON?**
   - JavaScript Object Notation

8. **What is XML?**
   - Extensible Markup Language

9. **Difference between PUT and PATCH?**
   - PUT: full update, PATCH: partial update

10. **What is endpoint?**
    - URL to access API

11. **What are headers?**
    - Metadata sent with request/response

12. **What is request body?**
    - Data sent in POST/PUT requests

13. **What is response body?**
    - Data returned by API

14. **What are query parameters?**
    - Parameters in URL after ?

15. **What are path parameters?**
    - Parameters in URL path

#### **Intermediate Level (16-30)**

16. **How to validate JSON response?**
    - Using JsonPath or assertions

17. **What is JsonPath?**
    - Extract data from JSON

18. **What is serialization?**
    - Java object to JSON

19. **What is deserialization?**
    - JSON to Java object

20. **How to handle authentication?**
    - Basic Auth, Bearer Token, OAuth

21. **What is Bearer Token?**
    - Token-based authentication

22. **What is OAuth?**
    - Authorization framework

23. **How to validate status code?**
    - `.then().statusCode(200)`

24. **How to validate response time?**
    - `.then().time(lessThan(2000L))`

25. **How to extract response?**
    - `.extract().response()`

26. **What is BDD style?**
    - given().when().then()

27. **How to send POST request?**
    - `given().body().when().post()`

28. **How to send headers?**
    - `given().header("key", "value")`

29. **How to validate JSON schema?**
    - Using JsonSchemaValidator

30. **How to perform data-driven API testing?**
    - Using TestNG DataProvider

---

## 🎭 Scenario-Based Questions

### **Selenium Scenarios**

1. **Element not clickable - How to handle?**
   - Wait for element, scroll to element, use JavaScriptExecutor

2. **Stale element exception - How to handle?**
   - Re-find element, use explicit wait

3. **How to automate file upload?**
   - Use sendKeys() with file path

4. **How to handle dynamic table?**
   - Use dynamic XPath with row/column index

5. **How to verify broken links?**
   - Get all links, send HTTP request, check status code

### **API Scenarios**

1. **How to test API with token authentication?**
   - Get token from login API, pass in header

2. **How to test API chaining?**
   - Extract data from first API, use in second API

3. **How to validate dynamic values?**
   - Use JsonPath to extract, then validate

4. **How to test rate limiting?**
   - Send multiple requests, verify 429 status

5. **How to test error handling?**
   - Send invalid data, verify error response

---

## 💼 Behavioral Questions

1. **Tell me about yourself**
   - Current role, skills, achievements, career goals

2. **Why do you want to change job?**
   - Career growth, learning opportunities

3. **Biggest strength?**
   - Problem-solving, quick learner, team player

4. **Biggest weakness?**
   - Perfectionist (with improvement plan)

5. **Describe challenging project**
   - Use STAR method (Situation, Task, Action, Result)

6. **How do you handle tight deadlines?**
   - Prioritize, communicate, work efficiently

7. **How do you handle conflicts?**
   - Listen, understand, find solution

8. **Where do you see yourself in 5 years?**
   - Senior role, technical leadership

---

## 📝 Resume Tips

### **Structure**
```
[Name]
[Contact]

SUMMARY
2-3 lines highlighting experience

SKILLS
Languages: Java
Tools: Selenium, REST Assured, Postman
Frameworks: TestNG, Cucumber
Build: Maven
CI/CD: Jenkins
Version Control: Git

EXPERIENCE
[Company] | [Duration]
- Automated 100+ test cases
- Built hybrid framework
- Reduced testing time by 60%

PROJECTS
Project 1: E-commerce Framework
- Java, Selenium, TestNG, Maven
- POM design pattern
- Jenkins integration

EDUCATION
[Degree] from [University]
```

### **Tips**
- Keep 1-2 pages
- Use action verbs
- Quantify achievements
- Include GitHub profile
- Proofread carefully

---

## 🎤 Mock Interview Preparation

### **Week Before Interview**
- Day 1-2: Review technical concepts
- Day 3-4: Practice mock interviews
- Day 5-6: Review projects
- Day 7: Final preparation, rest

### **During Interview**
**Do's:**
- Listen carefully
- Think before answering
- Ask clarifying questions
- Be honest
- Show enthusiasm

**Don'ts:**
- Don't lie
- Don't speak negatively
- Don't interrupt
- Don't check phone

### **Questions to Ask Interviewer**
1. What does typical day look like?
2. What technologies does team use?
3. What are growth opportunities?
4. What is team structure?
5. What are next steps?

---

## ✅ Final Checklist

### **1 Week Before**
- [ ] Review all concepts
- [ ] Practice 100+ questions
- [ ] Complete mock interviews
- [ ] Update resume
- [ ] Prepare project explanations

### **1 Day Before**
- [ ] Review key concepts
- [ ] Prepare questions
- [ ] Check interview details
- [ ] Test video/audio
- [ ] Get good sleep

### **Interview Day**
- [ ] Dress professionally
- [ ] Join 5 minutes early
- [ ] Keep resume handy
- [ ] Have pen and paper
- [ ] Stay calm and confident

---

## 🚀 Next Steps

1. Complete [`08-Hands-On-Projects.md`](08-Hands-On-Projects.md)
2. Build portfolio projects
3. Practice questions daily
4. Schedule mock interviews
5. Start applying for jobs

---

**Remember**: Confidence comes from preparation!

**Pro Tip**: Practice explaining concepts in simple terms - if you can teach it, you know it!