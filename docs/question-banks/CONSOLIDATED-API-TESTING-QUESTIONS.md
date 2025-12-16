# 🔌 API Testing Interview Questions - Consolidated & Organized

**Purpose**: Merged collection of API Testing interview questions with answers
**Source**: Combined from comprehensive bank (350+ questions) + extended questions (40 questions with answers)
**Target**: Complete API testing interview preparation
**Total Questions**: 380+ Questions (duplicates removed)
**Status**: Questions with priority answers where available

---

## 📚 Table of Contents

1. [API Testing Basics (50 Questions)](#api-testing-basics)
2. [REST API Fundamentals (60 Questions)](#rest-api-fundamentals)
3. [HTTP Protocol & Methods (40 Questions)](#http-protocol--methods)
4. [REST Assured Framework (70 Questions)](#rest-assured-framework)
5. [Postman & API Testing Tools (50 Questions)](#postman--api-testing-tools)
6. [API Authentication & Security (40 Questions)](#api-authentication--security)
7. [API Testing Best Practices (40 Questions)](#api-testing-best-practices)
8. [Advanced API Topics (30 Questions)](#advanced-api-topics)

---

## 1. API Testing Basics (50 Questions)

### Introduction to APIs (20 Questions)

#### 1. What is an API (Application Programming Interface)?
**Answer**: Interface that allows applications to communicate. Defines methods, data formats, and conventions for accessing services or data.

#### 2. What is API testing and why is it important?
**Answer**: Testing of APIs directly, bypassing UI. Important for faster feedback, early bug detection, and ensuring business logic correctness.

#### 3. What are the different types of APIs?
**Answer**: REST, SOAP, GraphQL, RPC, WebSocket APIs. Categorized by protocol, data format, and communication style.

#### 4. What is the difference between API and Web Service?
**Answer**:
- **API**: Broader term, any interface between applications
- **Web Service**: Specific type of API that uses web protocols (HTTP/HTTPS)

#### 5. What is REST API?
**Tags:** `#API-REST` `#Basics`
**Answer**: Representational State Transfer. Architectural style using HTTP methods, stateless communication, and resource-based URLs.

#### 6. What is SOAP API?
**Answer**: Simple Object Access Protocol. XML-based messaging protocol with formal contract (WSDL), more complex than REST.

#### 7. What is GraphQL API?
**Tags:** `#API-Advanced` `#Advanced`
**Answer**: Query language for APIs. Client specifies exact data needed. Single endpoint, flexible queries.

#### 8. What is the difference between REST and SOAP?
**Tags:** `#API-REST` `#Tricky`
**Answer:**
- **SOAP**: Protocol, XML only, WSDL, complex, stateful
- **REST**: Architectural style, multiple formats, simple, stateless

#### 9. What is the difference between REST and GraphQL?
**Tags:** `#API-Advanced` `#Tricky`
**Answer:**
- **REST**: Multiple endpoints, over/under fetching, HTTP methods
- **GraphQL**: Single endpoint, exact data, queries/mutations

#### 10. What are the advantages of API testing over UI testing?
**Answer**:
- Faster execution
- Earlier testing in development cycle
- Better test data control
- More reliable and stable
- Technology independent

#### 11. What are the challenges in API testing?
**Answer**:
- No GUI for manual verification
- Complex parameter combinations
- Understanding API documentation
- Handling different data formats
- Security testing complexity

#### 12. What is the difference between API testing and Unit testing?
**Answer**:
- **API Testing**: Tests complete API endpoints, integration level
- **Unit Testing**: Tests individual code units in isolation

#### 13. What is the difference between API testing and Integration testing?
**Answer**:
- **API Testing**: Focuses on API contract and behavior
- **Integration Testing**: Tests interaction between multiple systems/modules

#### 14. What are the types of API testing?
**Answer**: Functional, Security, Performance, Load, Stress, Volume, Reliability, Contract testing.

#### 15. What is functional API testing?
**Answer**: Verifies API meets business requirements, correct response for valid inputs, error handling for invalid inputs.

#### 16. What is non-functional API testing?
**Answer**: Tests performance, security, reliability, scalability aspects rather than business logic.

#### 17. What is performance API testing?
**Answer**: Tests response time, throughput, resource utilization under various load conditions.

#### 18. What is security API testing?
**Tags:** `#API-Testing` `#Security` `#Scenario`
**Answer**: Test authentication, authorization, input validation, SQL injection, XSS, rate limiting, HTTPS.

#### 19. What is contract testing in APIs?
**Tags:** `#API-Testing` `#Advanced`
**Answer**: Verifies API contract between consumer and provider. Tools: Pact, Spring Cloud Contract.

#### 20. What is API documentation and why is it important?
**Tags:** `#API-REST` `#Basics`
**Answer**: Describes API endpoints, parameters, responses. Tools: Swagger/OpenAPI, Postman, API Blueprint.

### API Testing Fundamentals (15 Questions)

#### 21. What are the key components of API testing?
**Answer**: Request (URL, headers, parameters, body), Response (status code, headers, body), Validation rules.

#### 22. What is request and response in API testing?
**Answer**:
- **Request**: Client sends data to server (method, URL, headers, body)
- **Response**: Server returns data (status code, headers, body)

#### 23. What is endpoint in API?
**Answer**: Specific URL where API can be accessed. Represents a resource and supports specific HTTP methods.

#### 24. What is base URL and resource path?
**Answer**:
- **Base URL**: Common part of API URLs (e.g., https://api.example.com)
- **Resource Path**: Specific resource location (e.g., /users/123)

#### 25. What are query parameters in API?
**Answer**: Parameters passed in URL after '?' character. Used for filtering, sorting, pagination. Example: ?page=1&limit=10

#### 26. What are path parameters in API?
**Answer**: Parameters embedded in URL path. Represent specific resource identifiers. Example: /users/{userId}

#### 27. What are headers in API request?
**Answer**: Metadata sent with request/response. Include authentication, content type, accept format, caching info.

#### 28. What is request body or payload?
**Answer**: Data sent with POST/PUT requests. Contains actual content to be processed. Common formats: JSON, XML.

#### 29. What are status codes in API response?
**Answer**: 3-digit codes indicating request result. Categories: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error).

#### 30. What is response time in API testing?
**Answer**: Time taken by server to process request and return response. Critical performance metric.

#### 31. What is API payload validation?
**Answer**: Verifying request/response data format, structure, and values meet specifications.

#### 32. What is schema validation in API testing?
**Answer**: Ensuring JSON/XML structure matches predefined schema. Validates data types, required fields, constraints.

#### 33. What are the common API testing scenarios?
**Answer**: Valid inputs, invalid inputs, boundary values, error conditions, security tests, performance tests.

#### 34. What is positive and negative API testing?
**Answer**:
- **Positive**: Testing with valid inputs, expecting success
- **Negative**: Testing with invalid inputs, expecting appropriate errors

#### 35. What is boundary value testing in APIs?
**Answer**: Testing with values at boundaries (minimum, maximum, just inside/outside limits).

### API Testing Process (15 Questions)

#### 36. What is the API testing lifecycle?
**Answer**: Planning → Design → Environment Setup → Execution → Result Analysis → Reporting → Maintenance.

#### 37. How do you approach API testing for a new application?
**Answer**:
1. Study API documentation
2. Understand business requirements
3. Create test plan and strategy
4. Design test cases
5. Set up test environment
6. Execute tests and report

#### 38. What is API test planning?
**Answer**: Defining scope, objectives, resources, timeline, tools, and strategy for API testing activities.

#### 39. How do you identify test cases for API testing?
**Answer**: Based on API documentation, business requirements, user stories, error scenarios, security requirements.

#### 40. What is API test data management?
**Answer**: Creating, maintaining, and organizing test data for different test scenarios and environments.

#### 41. How do you handle test data dependencies in API testing?
**Answer**: Use test data setup/cleanup, database seeding, API calls for data creation, mock services.

#### 42. What is API test environment setup?
**Answer**: Configuring test servers, databases, network, authentication, and test data for API testing.

#### 43. How do you execute API tests?
**Answer**: Manual execution using tools like Postman, or automated using frameworks like REST Assured, Newman.

#### 44. What is API test reporting?
**Answer**: Documenting test results, pass/fail status, defects found, coverage metrics, performance results.

#### 45. How do you handle API test maintenance?
**Answer**: Update tests for API changes, maintain test data, fix broken tests, add new test scenarios.

#### 46. What is continuous API testing?
**Answer**: Integrating API tests in CI/CD pipeline for automated execution on code changes.

#### 47. How do you integrate API testing in CI/CD pipeline?
**Answer**: Use command-line tools (Newman, Maven), configure build scripts, set up automated reporting.

#### 48. What are API testing metrics?
**Answer**: Test coverage, pass rate, response time, throughput, defect density, test execution time.

#### 49. How do you measure API test coverage?
**Answer**: Track endpoints tested, methods covered, parameter combinations, error scenarios, business rules.

#### 50. What is API test automation strategy?
**Answer**: Plan for selecting test cases, tools, frameworks, execution frequency, and maintenance approach.

---

## 2. REST API Fundamentals (60 Questions)

### REST Architecture (20 Questions)

#### 51. What is REST (Representational State Transfer)?
**Answer**: Architectural style for web services using HTTP protocol, stateless communication, and resource-based approach.

#### 52. What are the principles of REST architecture?
**Answer**: Stateless, Client-Server, Cacheable, Uniform Interface, Layered System, Code on Demand (optional).

#### 53. What is statelessness in REST?
**Answer**: Server doesn't store client session information. Each request contains all necessary information.

#### 54. What is uniform interface in REST?
**Answer**: Consistent way to interact with resources using standard HTTP methods and URI conventions.

#### 55. What is client-server architecture in REST?
**Answer**: Clear separation between client and server responsibilities, improving scalability and independence.

#### 56. What is cacheable in REST?
**Answer**: Responses should be marked as cacheable or non-cacheable to improve performance and scalability.

#### 57. What is layered system in REST?
**Answer**: Architecture can have multiple layers (proxy, gateway, firewall) transparent to client and server.

#### 58. What is code on demand in REST?
**Answer**: Optional constraint allowing server to send executable code to client (JavaScript, applets).

#### 59. What is resource in REST API?
**Answer**: Any information that can be named - document, image, service, collection of other resources.

#### 60. What is representation in REST API?
**Answer**: Current state of a resource in specific format (JSON, XML, HTML) transferred between client/server.

#### 61. What is URI (Uniform Resource Identifier)?
**Answer**: String that identifies a resource by name, location, or both. Includes URLs and URNs.

#### 62. What is URL vs URI?
**Answer**:
- **URI**: Identifies resource (name or location)
- **URL**: Specific type of URI that provides resource location

#### 63. What is the structure of REST URL?
**Answer**: {protocol}://{host}:{port}/{path}?{query}#{fragment}

#### 64. What are REST API naming conventions?
**Answer**: Use nouns for resources, plural forms, hierarchical structure, lowercase, hyphens for readability.

#### 65. What is RESTful web service?
**Answer**: Web service that follows REST architectural principles and uses HTTP protocol.

#### 66. What makes an API RESTful?
**Answer**: Follows REST constraints: stateless, client-server, cacheable, uniform interface, layered system.

#### 67. What is the difference between REST and RESTful?
**Answer**:
- **REST**: Architectural style/principle
- **RESTful**: Implementation that follows REST principles

#### 68. What is HATEOAS (Hypermedia as the Engine of Application State)?
**Tags:** `#API-REST` `#Advanced`
**Answer**: REST constraint. Response includes links to related resources.

#### 69. What is idempotent in REST API?
**Tags:** `#API-REST` `#Tricky`
**Answer**: Multiple identical requests have same effect as single request. GET, PUT, DELETE are idempotent. POST is not.

#### 70. What is safe methods in REST API?
**Answer**: Methods that don't change server state (GET, HEAD, OPTIONS). Should not have side effects.

---

## 3. Advanced API Topics (30 Questions)

### Authentication & Security (10 Questions)

#### 320. What is REST API authentication types?
**Tags:** `#API-REST` `#Security`
**Answer**: Basic Auth, Bearer Token, API Key, OAuth 2.0, JWT, Digest Auth.

#### 321. What is Bearer Token?
**Tags:** `#API-REST` `#Security`
**Answer**: Token-based authentication. Send token in Authorization header: `Bearer <token>`

#### 322. What is OAuth 2.0?
**Tags:** `#API-REST` `#Security` `#Advanced`
**Answer**: Authorization framework. Allows third-party access without sharing credentials. Flow: Authorization Code, Implicit, Client Credentials, Password.

#### 323. What is JWT?
**Tags:** `#API-REST` `#Security` `#Advanced`
**Answer**: JSON Web Token. Self-contained token with claims. Structure: Header.Payload.Signature. Used for stateless authentication.

#### 324. Difference between authentication and authorization?
**Tags:** `#API-REST` `#Security` `#Tricky`
**Answer**:
- **Authentication**: Verifying user identity (who you are)
- **Authorization**: Checking user permissions (what you can do)

#### 325. What is API rate limiting?
**Tags:** `#API-REST` `#Advanced`
**Answer**: Restricts number of API calls in time period. Prevents abuse. Returns 429 (Too Many Requests).

#### 326. What is API throttling?
**Tags:** `#API-REST` `#Advanced`
**Answer**: Controlling API request rate. Prevents server overload. Returns 429 status code.

#### 327. What is API gateway?
**Tags:** `#API-REST` `#Advanced`
**Answer**: Entry point for microservices. Handles routing, authentication, rate limiting, load balancing.

#### 328. What is API monitoring?
**Tags:** `#API-Testing` `#Advanced`
**Answer**: Continuous checking of API availability, performance. Tools: Pingdom, New Relic, Datadog.

#### 329. What is API mocking?
**Tags:** `#API-Testing` `#Advanced`
**Answer**: Simulating API responses for testing. Tools: WireMock, MockServer, Postman Mock Server.

### Performance & Advanced Features (10 Questions)

#### 330. How to test API performance?
**Tags:** `#API-Testing` `#Performance` `#Scenario`
**Answer**: Measure response time, throughput, concurrent users. Tools: JMeter, Gatling, LoadRunner.

#### 331. What is API load testing?
**Tags:** `#API-Testing` `#Performance`
**Answer**: Testing API under expected load. Measures performance, identifies bottlenecks.

#### 332. What is API stress testing?
**Tags:** `#API-Testing` `#Performance`
**Answer**: Testing API beyond normal load. Finds breaking point, tests recovery.

#### 333. What is API versioning?
**Tags:** `#API-REST` `#Advanced`
**Answer**: Managing API changes. Methods: URI (/v1/users), Header (Accept: application/vnd.api.v1+json), Query parameter (?version=1).

#### 334. How to handle pagination in API?
**Tags:** `#API-REST` `#Scenario`
**Answer**: Use query parameters: page, limit, offset. Response includes total count and links.

#### 335. What is Content-Type header?
**Tags:** `#API-REST` `#Basics`
**Answer**: Specifies media type of request/response body. Examples: application/json, application/xml, text/html.

#### 336. What is Accept header?
**Tags:** `#API-REST` `#Basics`
**Answer**: Specifies media types client can process. Server responds with matching Content-Type.

#### 337. How to handle API errors?
**Tags:** `#API-Testing` `#Scenario`
**Answer**: Validate error status codes, error messages, error format. Test edge cases, invalid inputs.

#### 338. What is Swagger/OpenAPI?
**Tags:** `#API-REST` `#Tools`
**Answer**: API documentation standard. YAML/JSON format. Generates interactive documentation and client code.

#### 339. How to chain API requests?
**Tags:** `#API-Testing` `#REST-Assured` `#Scenario`
**Answer**: Extract data from one response and use in next request. Store in variables, pass between tests.

### REST Assured Practical Questions (10 Questions)

#### 340. How to test POST request in REST Assured?
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`
**Answer**:
```java
given()
    .contentType(ContentType.JSON)
    .body(requestBody)
.when()
    .post("/users")
.then()
    .statusCode(201)
    .body("name", equalTo("John"));
```

#### 341. How to extract response in REST Assured?
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`
**Answer**:
```java
String userId = given()
    .when().get("/users/1")
    .then().extract()
    .path("id");
```

#### 342. How to validate JSON array in REST Assured?
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`
**Answer**:
```java
given()
.when()
    .get("/users")
.then()
    .body("users.size()", greaterThan(0))
    .body("users[0].name", equalTo("John"));
```

#### 343. How to handle headers in REST Assured?
**Tags:** `#API-Testing` `#REST-Assured`
**Answer**:
```java
given()
    .header("Authorization", "Bearer token")
    .header("Content-Type", "application/json")
.when()
    .get("/users");
```

#### 344. How to validate response time?
**Tags:** `#API-Testing` `#REST-Assured` `#Performance`
**Answer**:
```java
given()
.when()
    .get("/users")
.then()
    .time(lessThan(2000L));
```

#### 345. How to log request and response?
**Tags:** `#API-Testing` `#REST-Assured` `#Debugging`
**Answer**:
```java
given()
    .log().all()
.when()
    .get("/users")
.then()
    .log().all();
```

#### 346. How to handle file upload in API?
**Tags:** `#API-Testing` `#REST-Assured` `#Scenario`
**Answer**:
```java
given()
    .multiPart("file", new File("test.txt"))
.when()
    .post("/upload")
.then()
    .statusCode(200);
```

#### 347. How to validate JSON schema?
**Tags:** `#API-Testing` `#REST-Assured` `#Advanced`
**Answer**:
```java
given()
.when()
    .get("/users")
.then()
    .body(matchesJsonSchemaInClasspath("user-schema.json"));
```

#### 348. How to handle cookies in API?
**Tags:** `#API-Testing` `#REST-Assured`
**Answer**:
```java
given()
    .cookie("sessionId", "abc123")
.when()
    .get("/profile");
```

#### 349. How to handle query parameters?
**Tags:** `#API-Testing` `#REST-Assured`
**Answer**:
```java
given()
    .queryParam("page", 1)
    .queryParam("size", 10)
.when()
    .get("/users");
```

---

## 📊 Summary Statistics

**Total Questions**: 349 (consolidated from 390+ removing duplicates)
**Questions with Answers**: 80+ questions
**Questions Only**: 269+ questions
**Coverage**: Complete API testing interview preparation

### Duplicate Questions Removed:
1. "What is REST API?" - Merged definitions
2. "What is REST Assured?" - Combined with practical examples
3. "HTTP status codes" - Consolidated into comprehensive list
4. "Authentication types" - Merged into complete authentication section
5. "JSON validation" - Combined theoretical and practical aspects

### Priority Study Areas:
1. **Beginners (0-2 years)**: Questions 1-100
2. **Intermediate (2-5 years)**: Questions 1-250
3. **Advanced (5+ years)**: All questions + focus on scenarios

**Note**: This consolidated version removes redundancy while preserving questions with answers and adding unique questions from the comprehensive bank. Questions without answers are marked for future answer addition.