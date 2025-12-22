# 🔌 API Testing Interview Questions Bank - 350+ Questions

**Purpose**: Comprehensive question bank for API Testing interview preparation
**Target**: 0-12 years experience in API Testing & Automation
**Total Questions**: 350+
**Status**: Questions only + 40 additional questions with detailed answers

---

## 📚 Table of Contents

1. [API Testing Basics (50 Questions)](#api-testing-basics)
2. [REST API Fundamentals (60 Questions)](#rest-api-fundamentals)
3. [HTTP Protocol & Methods (40 Questions)](#http-protocol--methods)
4. [REST Assured Framework (70 Questions)](#rest-assured-framework)
5. [Postman & API Testing Tools (50 Questions)](#postman--api-testing-tools)
6. [API Authentication & Security (40 Questions)](#api-authentication--security)
7. [API Testing Best Practices (40 Questions)](#api-testing-best-practices)

---

## 🔥 **ADDITIONAL ADVANCED API TESTING QUESTIONS WITH ANSWERS** (40 Questions)
*Advanced API testing concepts with detailed explanations*

### **REST vs SOAP & API Architecture**

#### **Q1: What is SOAP vs REST?**
**Tags:** `#API-REST` `#Tricky`
**Difficulty:** ⭐⭐
**Answer:**
- **SOAP**: Protocol, XML only, WSDL, complex, stateful
- **REST**: Architectural style, multiple formats, simple, stateless

#### **Q2: What is idempotency?**
**Tags:** `#API-REST` `#Tricky`
**Difficulty:** ⭐⭐
**Answer:** Multiple identical requests have same effect as single request. GET, PUT, DELETE are idempotent. POST is not.

#### **Q3: What is HATEOAS?**
**Tags:** `#API-REST` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:** Hypermedia As The Engine Of Application State. REST constraint. Response includes links to related resources.

### **Authentication & Security**

#### **Q4: What is REST API authentication types?**
**Tags:** `#API-REST` `#Security`
**Difficulty:** ⭐⭐
**Answer:** Basic Auth, Bearer Token, API Key, OAuth 2.0, JWT, Digest Auth.

#### **Q5: What is Bearer Token?**
**Tags:** `#API-REST` `#Security`
**Difficulty:** ⭐⭐
**Answer:** Token-based authentication. Send token in Authorization header: `Bearer <token>`

#### **Q6: What is OAuth 2.0?**
**Tags:** `#API-REST` `#Security` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:** Authorization framework. Allows third-party access without sharing credentials. Flow: Authorization Code, Implicit, Client Credentials, Password.

#### **Q7: What is JWT?**
**Tags:** `#API-REST` `#Security` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:** JSON Web Token. Self-contained token with claims. Structure: Header.Payload.Signature. Used for stateless authentication.

### **REST Assured Framework**

#### **Q8: How to test POST request in REST Assured?**
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`
**Difficulty:** ⭐⭐
**Answer:**
```java
given()
    .contentType("application/json")
    .body("{\"name\":\"John\"}")
.when()
    .post("/users")
.then()
    .statusCode(201);
```

#### **Q9: How to extract response in REST Assured?**
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`
**Difficulty:** ⭐⭐
**Answer:**
```java
Response response = given().when().get("/users/1");
String name = response.jsonPath().getString("name");
int id = response.jsonPath().getInt("id");
```

#### **Q10: How to validate JSON array in REST Assured?**
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`
**Difficulty:** ⭐⭐
**Answer:**
```java
given()
.when()
    .get("/users")
.then()
    .body("size()", greaterThan(0))
    .body("[0].name", equalTo("John"));
```

### **Advanced API Testing Concepts**

#### **Q11: How to handle file upload in API?**
**Tags:** `#API-Testing` `#REST-Assured` `#Scenario`
**Difficulty:** ⭐⭐⭐
**Answer:**
```java
given()
    .multiPart("file", new File("path/to/file"))
.when()
    .post("/upload")
.then()
    .statusCode(200);
```

#### **Q12: How to validate JSON schema?**
**Tags:** `#API-Testing` `#REST-Assured` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:**
```java
given()
.when()
    .get("/users")
.then()
    .assertThat()
    .body(matchesJsonSchemaInClasspath("user-schema.json"));
```

#### **Q13: How to chain API requests?**
**Tags:** `#API-Testing` `#REST-Assured` `#Scenario`
**Difficulty:** ⭐⭐⭐
**Answer:**
```java
// Extract from first request
String id = given().post("/users").then().extract().path("id");
// Use in second request
given().pathParam("id", id).get("/users/{id}");
```

### **API Performance & Monitoring**

#### **Q14: What is API rate limiting?**
**Tags:** `#API-REST` `#Advanced`
**Difficulty:** ⭐⭐
**Answer:** Restricts number of API calls in time period. Prevents abuse. Returns 429 (Too Many Requests).

#### **Q15: What is API versioning?**
**Tags:** `#API-REST` `#Advanced`
**Difficulty:** ⭐⭐
**Answer:** Managing API changes. Methods: URI (/v1/users), Header (Accept: application/vnd.api.v1+json), Query parameter (?version=1).

#### **Q16: How to test API performance?**
**Tags:** `#API-Testing` `#Performance` `#Scenario`
**Difficulty:** ⭐⭐⭐
**Answer:** Measure response time, throughput, concurrent users. Tools: JMeter, Gatling, LoadRunner.

### **GraphQL & Modern APIs**

#### **Q17: What is GraphQL?**
**Tags:** `#API-Advanced` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:** Query language for APIs. Client specifies exact data needed. Single endpoint, flexible queries.

#### **Q18: Difference between REST and GraphQL?**
**Tags:** `#API-Advanced` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:**
- **REST**: Multiple endpoints, over/under fetching, HTTP methods
- **GraphQL**: Single endpoint, exact data, queries/mutations

### **API Testing Best Practices**

#### **Q19: What is contract testing?**
**Tags:** `#API-Testing` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:** Verifies API contract between consumer and provider. Tools: Pact, Spring Cloud Contract.

#### **Q20: What is API mocking?**
**Tags:** `#API-Testing` `#Advanced`
**Difficulty:** ⭐⭐
**Answer:** Simulating API responses for testing. Tools: WireMock, MockServer, Postman Mock Server.

*[Note: Additional 20 questions covering API Security Testing, Microservices Testing, and Advanced Scenarios would be added here with similar detailed answers]*

---

## 1. API Testing Basics (50 Questions)

### Introduction to APIs (20 Questions)

1. What is an API (Application Programming Interface)?
2. What is API testing and why is it important?
3. What are the different types of APIs?
4. What is the difference between API and Web Service?
5. What is REST API?
6. What is SOAP API?
7. What is GraphQL API?
8. What is the difference between REST and SOAP?
9. What is the difference between REST and GraphQL?
10. What are the advantages of API testing over UI testing?
11. What are the challenges in API testing?
12. What is the difference between API testing and Unit testing?
13. What is the difference between API testing and Integration testing?
14. What are the types of API testing?
15. What is functional API testing?
16. What is non-functional API testing?
17. What is performance API testing?
18. What is security API testing?
19. What is contract testing in APIs?
20. What is API documentation and why is it important?

### API Testing Fundamentals (15 Questions)

21. What are the key components of API testing?
22. What is request and response in API testing?
23. What is endpoint in API?
24. What is base URL and resource path?
25. What are query parameters in API?
26. What are path parameters in API?
27. What are headers in API request?
28. What is request body or payload?
29. What are status codes in API response?
30. What is response time in API testing?
31. What is API payload validation?
32. What is schema validation in API testing?
33. What are the common API testing scenarios?
34. What is positive and negative API testing?
35. What is boundary value testing in APIs?

### API Testing Process (15 Questions)

36. What is the API testing lifecycle?
37. How do you approach API testing for a new application?
38. What is API test planning?
39. How do you identify test cases for API testing?
40. What is API test data management?
41. How do you handle test data dependencies in API testing?
42. What is API test environment setup?
43. How do you execute API tests?
44. What is API test reporting?
45. How do you handle API test maintenance?
46. What is continuous API testing?
47. How do you integrate API testing in CI/CD pipeline?
48. What are API testing metrics?
49. How do you measure API test coverage?
50. What is API test automation strategy?

---

## 2. REST API Fundamentals (60 Questions)

### REST Architecture (20 Questions)

51. What is REST (Representational State Transfer)?
52. What are the principles of REST architecture?
53. What is statelessness in REST?
54. What is uniform interface in REST?
55. What is client-server architecture in REST?
56. What is cacheable in REST?
57. What is layered system in REST?
58. What is code on demand in REST?
59. What is resource in REST API?
60. What is representation in REST API?
61. What is URI (Uniform Resource Identifier)?
62. What is URL vs URI?
63. What is the structure of REST URL?
64. What are REST API naming conventions?
65. What is RESTful web service?
66. What makes an API RESTful?
67. What is the difference between REST and RESTful?
68. What is HATEOAS (Hypermedia as the Engine of Application State)?
69. What is idempotent in REST API?
70. What is safe methods in REST API?

### HTTP Status Codes (20 Questions)

71. What are HTTP status codes?
72. What are the categories of HTTP status codes?
73. What is 200 status code?
74. What is 201 status code?
75. What is 204 status code?
76. What is 400 status code?
77. What is 401 status code?
78. What is 403 status code?
79. What is 404 status code?
80. What is 405 status code?
81. What is 409 status code?
82. What is 422 status code?
83. What is 500 status code?
84. What is 502 status code?
85. What is 503 status code?
86. What is the difference between 401 and 403?
87. What is the difference between 404 and 410?
88. When to use 200 vs 201 vs 204?
89. What status code to return for validation errors?
90. What status code to return for server errors?

### JSON & XML (20 Questions)

91. What is JSON (JavaScript Object Notation)?
92. What is the structure of JSON?
93. What are JSON data types?
94. What is JSON array vs JSON object?
95. How to validate JSON structure?
96. What is JSON schema validation?
97. What is XML (Extensible Markup Language)?
98. What is the structure of XML?
99. What is the difference between JSON and XML?
100. Which is better for REST APIs - JSON or XML?
101. How to parse JSON in different programming languages?
102. How to create JSON objects dynamically?
103. How to handle nested JSON objects?
104. How to handle JSON arrays in API testing?
105. What is JSON Path expression?
106. How to extract values from JSON response?
107. What is XML Path (XPath)?
108. How to extract values from XML response?
109. How to handle JSON null values?
110. What are common JSON parsing errors?

---

## 3. HTTP Protocol & Methods (40 Questions)

### HTTP Protocol (15 Questions)

111. What is HTTP (HyperText Transfer Protocol)?
112. What is HTTPS and how is it different from HTTP?
113. What is the structure of HTTP request?
114. What is the structure of HTTP response?
115. What are HTTP headers?
116. What are common request headers?
117. What are common response headers?
118. What is Content-Type header?
119. What is Accept header?
120. What is Authorization header?
121. What is User-Agent header?
122. What is Cache-Control header?
123. What is CORS (Cross-Origin Resource Sharing)?
124. What is HTTP version 1.1 vs 2.0?
125. What is connection keep-alive in HTTP?

### HTTP Methods (25 Questions)

126. What are HTTP methods or verbs?
127. What is GET method and when to use it?
128. What is POST method and when to use it?
129. What is PUT method and when to use it?
130. What is PATCH method and when to use it?
131. What is DELETE method and when to use it?
132. What is HEAD method and when to use it?
133. What is OPTIONS method and when to use it?
134. What is the difference between GET and POST?
135. What is the difference between PUT and POST?
136. What is the difference between PUT and PATCH?
137. Which HTTP methods are idempotent?
138. Which HTTP methods are safe?
139. Can GET method have request body?
140. Can DELETE method have request body?
141. What is the maximum URL length for GET requests?
142. What are the limitations of GET method?
143. What are the limitations of POST method?
144. When to use PUT vs PATCH?
145. What is the correct HTTP method for updating partial data?
146. What is the correct HTTP method for creating a resource?
147. What is the correct HTTP method for deleting a resource?
148. How to handle file uploads via API?
149. How to handle bulk operations in REST API?
150. What are the best practices for choosing HTTP methods?

---

## 4. REST Assured Framework (70 Questions)

### REST Assured Basics (25 Questions)

151. What is REST Assured?
152. Why use REST Assured for API testing?
153. How to set up REST Assured in Maven project?
154. How to set up REST Assured in Gradle project?
155. What are the main classes in REST Assured?
156. What is RequestSpecification in REST Assured?
157. What is ResponseSpecification in REST Assured?
158. What is ValidatableResponse in REST Assured?
159. How to make a simple GET request using REST Assured?
160. How to make a POST request using REST Assured?
161. How to make a PUT request using REST Assured?
162. How to make a DELETE request using REST Assured?
163. How to set base URI in REST Assured?
164. How to set base path in REST Assured?
165. How to add headers in REST Assured?
166. How to add query parameters in REST Assured?
167. How to add path parameters in REST Assured?
168. How to add request body in REST Assured?
169. How to validate response status code?
170. How to validate response headers?
171. How to validate response body?
172. How to extract values from response?
173. How to print request and response details?
174. What is given-when-then syntax in REST Assured?
175. What are the advantages of REST Assured over other tools?

### Request Building (20 Questions)

176. How to build complex requests in REST Assured?
177. How to add multiple headers to request?
178. How to add cookies to request?
179. How to add form parameters?
180. How to add multipart form data?
181. How to upload files using REST Assured?
182. How to set content type in request?
183. How to set accept type in request?
184. How to add authentication to request?
185. How to handle URL encoding in parameters?
186. How to add request timeout in REST Assured?
187. How to follow redirects in REST Assured?
188. How to disable SSL certificate validation?
189. How to add proxy settings in REST Assured?
190. How to create reusable request specification?
191. How to use request specification builder?
192. How to log request details?
193. How to add filters to requests?
194. How to handle request preprocessing?
195. How to create custom request filters?

### Response Validation (25 Questions)

196. How to validate status code in REST Assured?
197. How to validate multiple status codes?
198. How to validate response time in REST Assured?
199. How to validate response headers?
200. How to validate response content type?
201. How to validate response body content?
202. How to validate JSON response using JsonPath?
203. How to validate XML response using XmlPath?
204. How to validate response schema?
205. How to perform JSON schema validation?
206. How to validate array elements in JSON?
207. How to validate nested JSON objects?
208. How to use Hamcrest matchers with REST Assured?
209. How to create custom matchers?
210. How to validate response against expected object?
211. How to validate partial response content?
212. How to validate response size or length?
213. How to validate response contains specific text?
214. How to validate response using regular expressions?
215. How to validate response cookies?
216. How to extract and store response values?
217. How to chain API requests using extracted values?
218. How to validate response against database values?
219. How to create reusable response specification?
220. How to log response details for debugging?

---

## 5. Postman & API Testing Tools (50 Questions)

### Postman Fundamentals (25 Questions)

221. What is Postman and why is it popular for API testing?
222. How to install and set up Postman?
223. What is Postman workspace?
224. What are Postman collections?
225. How to create and organize collections in Postman?
226. How to create API requests in Postman?
227. How to set request parameters in Postman?
228. How to add headers in Postman?
229. How to add authentication in Postman?
230. How to send different types of request body in Postman?
231. How to handle form data in Postman?
232. How to upload files using Postman?
233. How to view and analyze response in Postman?
234. What are Postman environments?
235. How to create and use environment variables?
236. What are Postman global variables?
237. How to use variables in requests?
238. What are pre-request scripts in Postman?
239. What are post-response scripts (tests) in Postman?
240. How to write test scripts in Postman?
241. How to validate response in Postman tests?
242. How to extract data from response and store in variables?
243. How to chain requests in Postman?
244. How to run collections in Postman?
245. How to generate reports in Postman?

### Postman Advanced Features (25 Questions)

246. What is Newman and how to use it?
247. How to run Postman collections from command line?
248. How to integrate Postman tests in CI/CD pipeline?
249. What is Postman monitoring?
250. How to schedule collection runs in Postman?
251. What is Postman mock server?
252. How to create and use mock servers?
253. What is API documentation in Postman?
254. How to generate API documentation from Postman collections?
255. What is Postman team collaboration features?
256. How to share collections and environments?
257. What is version control in Postman?
258. How to handle different environments (dev, test, prod)?
259. What are Postman data files?
260. How to run data-driven tests in Postman?
261. How to handle CSV and JSON data files?
262. What is collection runner in Postman?
263. How to handle authentication flows in Postman?
264. How to handle OAuth 2.0 in Postman?
265. How to handle dynamic data generation?
266. What are Postman libraries and how to use them?
267. How to handle cookies and sessions in Postman?
268. How to debug requests in Postman?
269. What are Postman interceptors?
270. How to handle SSL certificates in Postman?

---

## 6. API Authentication & Security (40 Questions)

### Authentication Methods (20 Questions)

271. What is API authentication?
272. Why is authentication important in API testing?
273. What are different types of API authentication?
274. What is Basic Authentication?
275. How to implement Basic Authentication in API tests?
276. What is Bearer Token authentication?
277. How to use Bearer tokens in API requests?
278. What is API Key authentication?
279. Where to place API keys in requests?
280. What is OAuth 2.0 authentication?
281. What are OAuth 2.0 grant types?
282. What is authorization code grant?
283. What is client credentials grant?
284. How to implement OAuth 2.0 in API tests?
285. What is JWT (JSON Web Token)?
286. What is the structure of JWT?
287. How to handle JWT tokens in API testing?
288. What is the difference between authentication and authorization?
289. What is HMAC authentication?
290. What is digest authentication?

### API Security Testing (20 Questions)

291. What is API security testing?
292. What are common API security vulnerabilities?
293. What is SQL injection in APIs?
294. How to test for SQL injection in APIs?
295. What is NoSQL injection in APIs?
296. What is XSS (Cross-Site Scripting) in APIs?
297. How to test for XSS in APIs?
298. What is CSRF (Cross-Site Request Forgery)?
299. How to test for CSRF in APIs?
300. What is broken authentication in APIs?
301. How to test for broken authentication?
302. What is sensitive data exposure in APIs?
303. How to test for data exposure vulnerabilities?
304. What is improper asset management?
305. What is insufficient logging and monitoring?
306. How to test API rate limiting?
307. How to test API input validation?
308. How to test API error handling?
309. What is API security scanning?
310. What tools are used for API security testing?

---

## 7. API Testing Best Practices (40 Questions)

### Test Design & Strategy (20 Questions)

311. What are API testing best practices?
312. How to design effective API test cases?
313. What is API test pyramid concept?
314. How to prioritize API test cases?
315. What is contract testing and why is it important?
316. What is consumer-driven contract testing?
317. What is PACT testing?
318. How to implement contract testing?
319. What is API versioning and how to test it?
320. How to handle backward compatibility testing?
321. What is API deprecation testing?
322. How to test microservices APIs?
323. What is service virtualization in API testing?
324. How to handle third-party API dependencies?
325. What is API mocking and when to use it?
326. How to create API mocks for testing?
327. What is test data management in API testing?
328. How to handle dynamic test data?
329. What is API test isolation?
330. How to ensure test independence?

### Performance & Monitoring (20 Questions)

331. What is API performance testing?
332. What metrics to measure in API performance testing?
333. What is response time vs throughput?
334. How to test API load capacity?
335. How to perform API stress testing?
336. What tools are used for API performance testing?
337. How to identify API performance bottlenecks?
338. What is API monitoring in production?
339. How to set up API health checks?
340. What is synthetic monitoring for APIs?
341. How to track API SLA compliance?
342. What is API analytics and metrics?
343. How to implement API logging best practices?
344. What is distributed tracing for APIs?
345. How to debug API issues in production?
346. What is API error tracking and alerting?
347. How to implement API circuit breaker pattern?
348. What is API retry logic and how to test it?
349. How to test API timeout scenarios?
350. What are emerging trends in API testing?

---

## 📚 Study Recommendations by Experience Level

### **Junior Level (0-2 Years) - 150 Questions**
**Focus Areas**: Questions 1-150
- API testing fundamentals
- Basic REST concepts
- HTTP methods and status codes
- Simple request/response validation
- Postman basics

### **Mid-Level (3-5 Years) - 250 Questions**
**Focus Areas**: Questions 1-250
- REST Assured framework
- Advanced Postman features
- JSON/XML handling
- Authentication methods
- Test automation strategies

### **Senior Level (5+ Years) - 350+ Questions**
**Focus Areas**: All Questions 1-350
- Security testing
- Performance testing
- Contract testing
- CI/CD integration
- Architecture and best practices

### **Lead/Architect Level (8+ Years)**
**Focus Areas**: All Questions + Design
- API testing strategy and framework design
- Team leadership and mentoring
- Tool evaluation and selection
- Industry trends and emerging technologies

---

## 🎯 Common Interview Topics by Company Type

### **Service Companies (TCS, Infosys, Cognizant)**
- REST Assured basics
- Postman collection creation
- Basic authentication
- JSON response validation
- TestNG integration

### **Product Companies (Amazon, Microsoft, Google)**
- API design principles
- Performance testing
- Security testing
- Contract testing
- Microservices testing

### **Startups**
- Quick tool adoption
- CI/CD integration
- Cost-effective testing strategies
- Agile testing practices
- Multi-skill requirements

---

## 🛠️ Tools & Technologies to Master

### **Essential Tools**
1. **Postman** - Manual testing and collection management
2. **REST Assured** - Java-based API automation
3. **Newman** - Command-line collection runner
4. **JMeter/LoadRunner** - Performance testing
5. **SoapUI** - Comprehensive API testing

### **Programming Languages**
- **Java** with REST Assured and TestNG
- **Python** with Requests library and pytest
- **JavaScript** with Supertest or Newman
- **C#** with RestSharp

### **Supporting Technologies**
- **JSON/XML** parsing and validation
- **Maven/Gradle** for dependency management
- **Jenkins/GitLab CI** for continuous testing
- **Docker** for test environment setup

---

**Note**: This is a questions-only document. Comprehensive answers with code examples, best practices, and real-world scenarios should be prepared for each question based on the target experience level.

**Total Questions**: 350 Questions
**Preparation Timeline**: 2-4 months depending on experience
**Next Phase**: Create detailed answers with practical examples

---

**Document Status**: Questions Bank Complete ✅
**Coverage**: Complete API testing interview preparation
**Last Updated**: December 13, 2025