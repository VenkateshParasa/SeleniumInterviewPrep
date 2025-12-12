# 🔌 API Testing Learning Resources & Examples

## 📚 Table of Contents
1. [API Testing Fundamentals](#api-testing-fundamentals)
2. [REST API Concepts](#rest-api-concepts)
3. [Postman](#postman)
4. [REST Assured](#rest-assured)
5. [JSON Handling](#json-handling)
6. [Authentication](#authentication)
7. [Interview Questions](#interview-questions)

---

## 🎯 API Testing Fundamentals

### **What is API Testing?**
API (Application Programming Interface) testing is a type of software testing that validates APIs. It focuses on the business logic layer of the software architecture.

### **Why API Testing?**
- Faster than UI testing
- Language independent
- Early bug detection
- Better test coverage
- Easy to maintain

### **Types of API Testing**
1. **Functional Testing**: Validate API functions correctly
2. **Load Testing**: Test API under load
3. **Security Testing**: Validate authentication/authorization
4. **Integration Testing**: Test API integration with other systems
5. **Validation Testing**: Validate response data

---

## 🌐 REST API Concepts

### **HTTP Methods**
1. **GET**: Retrieve data
2. **POST**: Create new resource
3. **PUT**: Update entire resource
4. **PATCH**: Partial update
5. **DELETE**: Delete resource

### **HTTP Status Codes**
- **1xx**: Informational
- **2xx**: Success
  - 200: OK
  - 201: Created
  - 204: No Content
- **3xx**: Redirection
  - 301: Moved Permanently
  - 302: Found
- **4xx**: Client Error
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
- **5xx**: Server Error
  - 500: Internal Server Error
  - 503: Service Unavailable

### **API Components**
1. **Endpoint/URL**: https://api.example.com/users
2. **Headers**: Content-Type, Authorization
3. **Request Body**: JSON/XML data
4. **Response**: Status code + Body
5. **Parameters**: Query params, Path params

---

## 📮 Postman

### **Installation**
Download from: https://www.postman.com/downloads/

### **Example 1: GET Request**
```
Method: GET
URL: https://reqres.in/api/users/2

Response:
{
    "data": {
        "id": 2,
        "email": "janet.weaver@reqres.in",
        "first_name": "Janet",
        "last_name": "Weaver",
        "avatar": "https://reqres.in/img/faces/2-image.jpg"
    }
}
```

### **Example 2: POST Request**
```
Method: POST
URL: https://reqres.in/api/users
Headers: Content-Type: application/json

Body (JSON):
{
    "name": "John Doe",
    "job": "QA Engineer"
}

Response:
{
    "name": "John Doe",
    "job": "QA Engineer",
    "id": "123",
    "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### **Example 3: PUT Request**
```
Method: PUT
URL: https://reqres.in/api/users/2
Headers: Content-Type: application/json

Body (JSON):
{
    "name": "Jane Smith",
    "job": "Senior QA"
}

Response:
{
    "name": "Jane Smith",
    "job": "Senior QA",
    "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

### **Example 4: DELETE Request**
```
Method: DELETE
URL: https://reqres.in/api/users/2

Response: 204 No Content
```

### **Postman Tests (JavaScript)**
```javascript
// Test 1: Status code is 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Response time is less than 500ms
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Verify response body
pm.test("Verify user name", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.first_name).to.eql("Janet");
});

// Test 4: Check header
pm.test("Content-Type is present", function () {
    pm.response.to.have.header("Content-Type");
});
```

---

## 🔧 REST Assured

### **Maven Dependencies**
```xml
<dependencies>
    <!-- REST Assured -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <version>5.3.2</version>
    </dependency>
    
    <!-- TestNG -->
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.8.0</version>
    </dependency>
    
    <!-- JSON Path -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-path</artifactId>
        <version>5.3.2</version>
    </dependency>
    
    <!-- JSON Schema Validator -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-schema-validator</artifactId>
        <version>5.3.2</version>
    </dependency>
</dependencies>
```

### **Example 1: GET Request**
```java
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class GetRequestExample {
    
    @Test
    public void testGetUser() {
        // Set base URI
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Send GET request
        Response response = given()
            .when()
                .get("/users/2")
            .then()
                .statusCode(200)
                .extract().response();
        
        // Print response
        System.out.println("Response: " + response.asString());
        
        // Assertions
        Assert.assertEquals(response.getStatusCode(), 200);
        Assert.assertTrue(response.getTime() < 3000);
    }
    
    @Test
    public void testGetUserWithValidation() {
        given()
            .baseUri("https://reqres.in/api")
        .when()
            .get("/users/2")
        .then()
            .statusCode(200)
            .body("data.id", equalTo(2))
            .body("data.email", equalTo("janet.weaver@reqres.in"))
            .body("data.first_name", equalTo("Janet"))
            .log().all();
    }
}
```

### **Example 2: POST Request**
```java
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.json.simple.JSONObject;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class PostRequestExample {
    
    @Test
    public void testCreateUser() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Create JSON body
        JSONObject requestBody = new JSONObject();
        requestBody.put("name", "John Doe");
        requestBody.put("job", "QA Engineer");
        
        // Send POST request
        Response response = given()
            .contentType(ContentType.JSON)
            .body(requestBody.toJSONString())
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .extract().response();
        
        // Print response
        System.out.println("Response: " + response.asString());
        
        // Extract values from response
        String name = response.jsonPath().getString("name");
        String job = response.jsonPath().getString("job");
        String id = response.jsonPath().getString("id");
        
        System.out.println("Name: " + name);
        System.out.println("Job: " + job);
        System.out.println("ID: " + id);
        
        // Assertions
        Assert.assertEquals(name, "John Doe");
        Assert.assertEquals(job, "QA Engineer");
        Assert.assertNotNull(id);
    }
}
```

### **Example 3: PUT Request**
```java
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.json.simple.JSONObject;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class PutRequestExample {
    
    @Test
    public void testUpdateUser() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Create JSON body
        JSONObject requestBody = new JSONObject();
        requestBody.put("name", "Jane Smith");
        requestBody.put("job", "Senior QA Engineer");
        
        // Send PUT request
        given()
            .contentType(ContentType.JSON)
            .body(requestBody.toJSONString())
        .when()
            .put("/users/2")
        .then()
            .statusCode(200)
            .body("name", equalTo("Jane Smith"))
            .body("job", equalTo("Senior QA Engineer"))
            .body("updatedAt", notNullValue())
            .log().all();
    }
}
```

### **Example 4: DELETE Request**
```java
import io.restassured.RestAssured;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class DeleteRequestExample {
    
    @Test
    public void testDeleteUser() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Send DELETE request
        given()
        .when()
            .delete("/users/2")
        .then()
            .statusCode(204)
            .log().all();
    }
}
```

### **Example 5: Query Parameters**
```java
import io.restassured.RestAssured;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class QueryParametersExample {
    
    @Test
    public void testQueryParams() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Using query parameters
        given()
            .queryParam("page", 2)
            .queryParam("per_page", 6)
        .when()
            .get("/users")
        .then()
            .statusCode(200)
            .body("page", equalTo(2))
            .body("per_page", equalTo(6))
            .body("data.size()", equalTo(6))
            .log().all();
    }
}
```

### **Example 6: Path Parameters**
```java
import io.restassured.RestAssured;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class PathParametersExample {
    
    @Test
    public void testPathParams() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Using path parameters
        given()
            .pathParam("userId", 2)
        .when()
            .get("/users/{userId}")
        .then()
            .statusCode(200)
            .body("data.id", equalTo(2))
            .log().all();
    }
}
```

### **Example 7: Headers**
```java
import io.restassured.RestAssured;
import io.restassured.http.Header;
import io.restassured.http.Headers;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class HeadersExample {
    
    @Test
    public void testHeaders() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Send request with headers
        given()
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
        .when()
            .get("/users/2")
        .then()
            .statusCode(200)
            .header("Content-Type", "application/json; charset=utf-8")
            .log().all();
    }
    
    @Test
    public void testMultipleHeaders() {
        Headers headers = new Headers(
            new Header("Content-Type", "application/json"),
            new Header("Accept", "application/json"),
            new Header("User-Agent", "RestAssured")
        );
        
        given()
            .headers(headers)
        .when()
            .get("https://reqres.in/api/users/2")
        .then()
            .statusCode(200)
            .log().all();
    }
}
```

---

## 📄 JSON Handling

### **Example 1: JSON Path**
```java
import io.restassured.RestAssured;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;

public class JsonPathExample {
    
    @Test
    public void testJsonPath() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        Response response = given()
            .when()
                .get("/users?page=2")
            .then()
                .extract().response();
        
        // Create JsonPath object
        JsonPath jsonPath = response.jsonPath();
        
        // Extract single value
        int page = jsonPath.getInt("page");
        System.out.println("Page: " + page);
        
        // Extract from nested object
        String firstName = jsonPath.getString("data[0].first_name");
        System.out.println("First Name: " + firstName);
        
        // Extract list
        java.util.List<String> emails = jsonPath.getList("data.email");
        System.out.println("All Emails: " + emails);
        
        // Extract list of specific field
        java.util.List<Integer> ids = jsonPath.getList("data.id");
        System.out.println("All IDs: " + ids);
        
        // Assertions
        Assert.assertEquals(page, 2);
        Assert.assertTrue(emails.size() > 0);
    }
}
```

### **Example 2: JSON Schema Validation**
```java
import io.restassured.RestAssured;
import io.restassured.module.jsv.JsonSchemaValidator;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class JsonSchemaValidationExample {
    
    @Test
    public void testJsonSchema() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Validate response against JSON schema
        given()
        .when()
            .get("/users/2")
        .then()
            .statusCode(200)
            .body(JsonSchemaValidator.matchesJsonSchemaInClasspath("user-schema.json"))
            .log().all();
    }
}

// user-schema.json (place in src/test/resources)
/*
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "id": {"type": "number"},
        "email": {"type": "string"},
        "first_name": {"type": "string"},
        "last_name": {"type": "string"}
      },
      "required": ["id", "email", "first_name", "last_name"]
    }
  },
  "required": ["data"]
}
*/
```

### **Example 3: Serialization & Deserialization**
```java
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

// POJO Class
class User {
    private String name;
    private String job;
    private String id;
    private String createdAt;
    
    // Constructors
    public User() {}
    
    public User(String name, String job) {
        this.name = name;
        this.job = job;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

public class SerializationExample {
    
    @Test
    public void testSerialization() {
        RestAssured.baseURI = "https://reqres.in/api";
        
        // Create User object (Serialization - Java to JSON)
        User user = new User("John Doe", "QA Engineer");
        
        // Send POST request with POJO
        User responseUser = given()
            .contentType(ContentType.JSON)
            .body(user)
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .extract().as(User.class);  // Deserialization - JSON to Java
        
        // Assertions
        Assert.assertEquals(responseUser.getName(), "John Doe");
        Assert.assertEquals(responseUser.getJob(), "QA Engineer");
        Assert.assertNotNull(responseUser.getId());
    }
}
```

---

## 🔐 Authentication

### **Example 1: Basic Authentication**
```java
import io.restassured.RestAssured;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class BasicAuthExample {
    
    @Test
    public void testBasicAuth() {
        // Using basic authentication
        given()
            .auth().basic("username", "password")
        .when()
            .get("https://httpbin.org/basic-auth/username/password")
        .then()
            .statusCode(200)
            .log().all();
    }
    
    @Test
    public void testPreemptiveBasicAuth() {
        // Preemptive basic auth (sends credentials without challenge)
        given()
            .auth().preemptive().basic("username", "password")
        .when()
            .get("https://httpbin.org/basic-auth/username/password")
        .then()
            .statusCode(200)
            .log().all();
    }
}
```

### **Example 2: Bearer Token Authentication**
```java
import io.restassured.RestAssured;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class BearerTokenExample {
    
    @Test
    public void testBearerToken() {
        String token = "your_bearer_token_here";
        
        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("https://api.example.com/protected-resource")
        .then()
            .statusCode(200)
            .log().all();
    }
    
    @Test
    public void testOAuth2() {
        String accessToken = "your_access_token";
        
        given()
            .auth().oauth2(accessToken)
        .when()
            .get("https://api.example.com/protected-resource")
        .then()
            .statusCode(200)
            .log().all();
    }
}
```

### **Example 3: API Key Authentication**
```java
import io.restassured.RestAssured;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;

public class ApiKeyExample {
    
    @Test
    public void testApiKeyInHeader() {
        String apiKey = "your_api_key";
        
        given()
            .header("X-API-Key", apiKey)
        .when()
            .get("https://api.example.com/data")
        .then()
            .statusCode(200)
            .log().all();
    }
    
    @Test
    public void testApiKeyInQueryParam() {
        String apiKey = "your_api_key";
        
        given()
            .queryParam("api_key", apiKey)
        .when()
            .get("https://api.example.com/data")
        .then()
            .statusCode(200)
            .log().all();
    }
}
```

---

## 🧪 Complete API Test Suite Example

```java
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.json.simple.JSONObject;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class CompleteAPITestSuite {
    
    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "https://reqres.in/api";
    }
    
    @Test(priority = 1)
    public void testGetAllUsers() {
        given()
            .queryParam("page", 1)
        .when()
            .get("/users")
        .then()
            .statusCode(200)
            .body("page", equalTo(1))
            .body("data", notNullValue())
            .body("data.size()", greaterThan(0))
            .time(lessThan(3000L))
            .log().all();
    }
    
    @Test(priority = 2)
    public void testGetSingleUser() {
        given()
        .when()
            .get("/users/2")
        .then()
            .statusCode(200)
            .body("data.id", equalTo(2))
            .body("data.email", containsString("@reqres.in"))
            .body("data.first_name", notNullValue())
            .log().body();
    }
    
    @Test(priority = 3)
    public void testCreateUser() {
        JSONObject requestBody = new JSONObject();
        requestBody.put("name", "Test User");
        requestBody.put("job", "Automation Tester");
        
        Response response = given()
            .contentType(ContentType.JSON)
            .body(requestBody.toJSONString())
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("name", equalTo("Test User"))
            .body("job", equalTo("Automation Tester"))
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .extract().response();
        
        String userId = response.jsonPath().getString("id");
        System.out.println("Created User ID: " + userId);
    }
    
    @Test(priority = 4)
    public void testUpdateUser() {
        JSONObject requestBody = new JSONObject();
        requestBody.put("name", "Updated User");
        requestBody.put("job", "Senior Tester");
        
        given()
            .contentType(ContentType.JSON)
            .body(requestBody.toJSONString())
        .when()
            .put("/users/2")
        .then()
            .statusCode(200)
            .body("name", equalTo("Updated User"))
            .body("job", equalTo("Senior Tester"))
            .body("updatedAt", notNullValue())
            .log().all();
    }
    
    @Test(priority = 5)
    public void testDeleteUser() {
        given()
        .when()
            .delete("/users/2")
        .then()
            .statusCode(204)
            .log().all();
    }
    
    @Test(priority = 6)
    public void testUserNotFound() {
        given()
        .when()
            .get("/users/999")
        .then()
            .statusCode(404)
            .log().all();
    }
    
    @Test(priority = 7)
    public void testResponseHeaders() {
        given()
        .when()
            .get("/users/2")
        .then()
            .statusCode(200)
            .header("Content-Type", containsString("application/json"))
            .header("Connection", notNullValue())
            .log().headers();
    }
    
    @Test(priority = 8)
    public void testResponseTime() {
        given()
        .when()
            .get("/users/2")
        .then()
            .statusCode(200)
            .time(lessThan(2000L))
            .log().all();
    }
}
```

---

## 🎯 Interview Questions

### **Basic Level**
1. What is API testing?
2. What is the difference between SOAP and REST?
3. What are HTTP methods? Explain GET, POST, PUT, DELETE
4. What are HTTP status codes? Name common ones
5. What is JSON? How is it different from XML?
6. What is Postman? What are its features?

### **Intermediate Level**
1. What is REST Assured? Why use it?
2. How do you handle authentication in API testing?
3. What is the difference between PUT and PATCH?
4. How do you validate JSON response in REST Assured?
5. What is JsonPath? How do you use it?
6. How do you handle query parameters and path parameters?
7. What is serialization and deserialization?
8. How do you perform data-driven testing in API?

### **Advanced Level**
1. How do you validate JSON schema in REST Assured?
2. How do you handle file upload in API testing?
3. How do you test multipart requests?
4. How do you integrate API tests with CI/CD?
5. How do you handle OAuth 2.0 authentication?
6. How do you perform load testing on APIs?
7. How do you mock API responses?
8. How do you handle chaining of API requests?

### **Scenario-Based Questions**
1. How would you test an API that requires token-based authentication?
2. How do you validate that an API returns data in correct format?
3. How would you test API rate limiting?
4. How do you handle dynamic values in API testing?
5. How would you test API error handling?

---

## 📚 Recommended Resources

### **Online Courses**
1. **Udemy**:
   - REST API Testing (Automation) from Scratch by Rahul Shetty
   - REST Assured API Automation by Karthik KK
2. **YouTube**:
   - Raghav Pal - API Testing
   - Naveen AutomationLabs - REST Assured
3. **Official Documentation**: https://rest-assured.io/

### **Practice APIs**
1. https://reqres.in/ (Free fake API)
2. https://jsonplaceholder.typicode.com/
3. https://httpbin.org/
4. https://restful-booker.herokuapp.com/
5. https://gorest.co.in/

### **Tools**
1. **Postman**: API testing and documentation
2. **REST Assured**: Java library for API automation
3. **SoapUI**: API testing tool
4. **JMeter**: Performance testing

---

## ✅ Practice Checklist

- [ ] Understand REST API concepts thoroughly
- [ ] Master Postman for manual API testing
- [ ] Set up REST Assured with Maven
- [ ] Practice all HTTP methods (GET, POST, PUT, DELETE)
- [ ] Learn JSON parsing and validation
- [ ] Implement authentication (Basic, Bearer, OAuth)
- [ ] Create data-driven API tests
- [ ] Validate JSON schema
- [ ] Handle serialization/deserialization
- [ ] Integrate API tests with TestNG
- [ ] Test 10+ public APIs
- [ ] Build complete API automation framework

---

## 🚀 Next Steps

1. Complete all examples in this document
2. Practice with different public APIs
3. Move to [`05-Additional-Skills.md`](05-Additional-Skills.md)
4. Build an integrated test framework (UI + API)

---

**Pro Tips**:
- Always validate status codes
- Check response time in tests
- Use meaningful test names
- Implement proper logging
- Handle exceptions gracefully
- Use data-driven approach for multiple scenarios
- Integrate with CI/CD pipeline