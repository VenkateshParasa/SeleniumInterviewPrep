
# 🎯 Extended Interview Questions Bank (200+ Additional Questions)
## Java + Selenium + API Testing - Part 2

> **200+ Additional Interview Questions with Tags and Detailed Answers**

---

## 📋 Quick Navigation

- [Additional Java Questions (60)](#additional-java-questions)
- [Additional Selenium Questions (50)](#additional-selenium-questions)
- [Additional API Testing Questions (40)](#additional-api-testing-questions)
- [SQL for Testers (20)](#sql-for-testers)
- [Cucumber/BDD Questions (15)](#cucumber-bdd-questions)
- [Docker & CI/CD (15)](#docker--cicd-questions)

**Total: 200 Questions**

---

## ☕ ADDITIONAL JAVA QUESTIONS (60 Questions)

### **Java 8+ Features**

#### 151. What is lambda expression in Java?
**Tags:** `#Java-Advanced` `#Java8`  
**Difficulty:** ⭐⭐  
**Answer:** Anonymous function introduced in Java 8. Syntax: `(parameters) -> expression`. Used with functional interfaces.
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.forEach(n -> System.out.println(n));
```

---

#### 152. What is Stream API?
**Tags:** `#Java-Advanced` `#Java8`  
**Difficulty:** ⭐⭐  
**Answer:** Process collections functionally (Java 8+). Operations: filter, map, reduce, collect.
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> even = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

---

#### 153. Difference between map() and flatMap()?
**Tags:** `#Java-Advanced` `#Java8` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **map()**: One-to-one, transforms each element, returns Stream<T>
- **flatMap()**: One-to-many, flattens nested streams, returns Stream<R>

---

#### 154. What is Optional class?
**Tags:** `#Java-Advanced` `#Java8`  
**Difficulty:** ⭐⭐  
**Answer:** Container for value that may/may not be present. Avoids NullPointerException.
```java
Optional<String> optional = Optional.ofNullable(value);
String result = optional.orElse("default");
```

---

#### 155. What is method reference?
**Tags:** `#Java-Advanced` `#Java8`  
**Difficulty:** ⭐⭐  
**Answer:** Shorthand for lambda. Types: Static (ClassName::method), Instance (object::method), Constructor (ClassName::new)

---

#### 156. Difference between intermediate and terminal operations?
**Tags:** `#Java-Advanced` `#Java8` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Intermediate**: Lazy, returns Stream (filter, map, sorted)
- **Terminal**: Eager, returns result (collect, forEach, reduce)

---

#### 157. What is @FunctionalInterface?
**Tags:** `#Java-Advanced` `#Java8`  
**Difficulty:** ⭐⭐  
**Answer:** Annotation for interface with single abstract method. Compiler checks constraint. Used with lambdas.

---

#### 158. What are default methods in interface?
**Tags:** `#Java-OOP` `#Java8`  
**Difficulty:** ⭐⭐  
**Answer:** Methods with implementation in interface (Java 8+). Allows adding methods without breaking implementations.

---

#### 159. Can interface have static methods?
**Tags:** `#Java-OOP` `#Java8` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Yes (Java 8+). Static methods must have body, cannot be overridden.

---

#### 160. What is forEach() method?
**Tags:** `#Java-Advanced` `#Java8`  
**Difficulty:** ⭐  
**Answer:** Iterates over collection using lambda.
```java
list.forEach(item -> System.out.println(item));
```

---

### **Collections Deep Dive**

#### 161. Internal working of HashMap?
**Tags:** `#Java-Advanced` `#Collections` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Array of buckets. Hash function determines index. Collisions handled by linked list (Java 8+: tree if >8 elements). Load factor 0.75, capacity doubles when threshold reached.

---

#### 162. What is ConcurrentHashMap?
**Tags:** `#Java-Advanced` `#Collections` `#Multithreading`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Thread-safe HashMap. Uses segment locking (Java 7) or CAS operations (Java 8+). Better performance than Hashtable.

---

#### 163. Difference between fail-fast and fail-safe?
**Tags:** `#Java-Advanced` `#Collections` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **Fail-fast**: Throws ConcurrentModificationException (ArrayList, HashMap)
- **Fail-safe**: Works on copy, no exception (CopyOnWriteArrayList, ConcurrentHashMap)

---

#### 164. What is WeakHashMap?
**Tags:** `#Java-Advanced` `#Collections` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Map with weak keys. Entries removed by GC if key has no strong reference. Used for caching.

---

#### 165. Difference between Iterator and ListIterator?
**Tags:** `#Java-Advanced` `#Collections` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Iterator**: Forward only, remove(), all collections
- **ListIterator**: Bidirectional, add/remove/set, List only

---

#### 166. What is NavigableMap?
**Tags:** `#Java-Advanced` `#Collections` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** SortedMap with navigation methods (lowerKey, floorKey, ceilingKey, higherKey). TreeMap implements it.

---

#### 167. Difference between Queue and Deque?
**Tags:** `#Java-Advanced` `#Collections`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Queue**: FIFO, add/remove from one end
- **Deque**: Double-ended, add/remove from both ends

---

#### 168. What is PriorityQueue?
**Tags:** `#Java-Advanced` `#Collections`  
**Difficulty:** ⭐⭐  
**Answer:** Queue ordered by natural ordering or Comparator. Elements retrieved in priority order, not FIFO.

---

#### 169. Difference between Comparable and Comparator?
**Tags:** `#Java-Advanced` `#Collections` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Comparable**: Natural ordering, compareTo(), modify class, single sort
- **Comparator**: Custom ordering, compare(), separate class, multiple sorts

---

#### 170. How to make ArrayList thread-safe?
**Tags:** `#Java-Advanced` `#Collections` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
List<String> list = Collections.synchronizedList(new ArrayList<>());
// Or use CopyOnWriteArrayList
List<String> list = new CopyOnWriteArrayList<>();
```

---

### **Multithreading Advanced**

#### 171. What is volatile keyword?
**Tags:** `#Java-Advanced` `#Multithreading` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Ensures variable read from main memory, not thread cache. Provides visibility but not atomicity.

---

#### 172. Difference between synchronized method and block?
**Tags:** `#Java-Advanced` `#Multithreading` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Method**: Locks entire method, less flexible
- **Block**: Locks specific section, more flexible, better performance

---

#### 173. What is deadlock? How to prevent?
**Tags:** `#Java-Advanced` `#Multithreading` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Two threads waiting for each other's locks. Prevention: Lock ordering, timeout, avoid nested locks, use tryLock().

---

#### 174. Difference between notify() and notifyAll()?
**Tags:** `#Java-Advanced` `#Multithreading` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **notify()**: Wakes one random waiting thread
- **notifyAll()**: Wakes all waiting threads

---

#### 175. What is ThreadLocal?
**Tags:** `#Java-Advanced` `#Multithreading` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Provides thread-local variables. Each thread has its own copy. Used for user sessions, database connections.

---

#### 176. What is Executor framework?
**Tags:** `#Java-Advanced` `#Multithreading` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Framework for thread pool management. Types: ExecutorService, ThreadPoolExecutor, ScheduledExecutorService.

---

#### 177. Difference between Runnable and Callable?
**Tags:** `#Java-Advanced` `#Multithreading` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Runnable**: No return value, no checked exception
- **Callable**: Returns value, can throw checked exception

---

#### 178. What is Future?
**Tags:** `#Java-Advanced` `#Multithreading`  
**Difficulty:** ⭐⭐  
**Answer:** Represents result of asynchronous computation. Methods: get(), cancel(), isDone(), isCancelled().

---

#### 179. What is CountDownLatch?
**Tags:** `#Java-Advanced` `#Multithreading` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Synchronization aid. Thread waits until count reaches zero. Used for coordinating multiple threads.

---

#### 180. What is CyclicBarrier?
**Tags:** `#Java-Advanced` `#Multithreading` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Synchronization point where threads wait for each other. Reusable after all threads reach barrier.

---

### **Memory Management**

#### 181. What is garbage collection?
**Tags:** `#Java-Advanced` `#Memory`  
**Difficulty:** ⭐⭐  
**Answer:** Automatic memory management. Removes unreferenced objects. Types: Serial, Parallel, CMS, G1, ZGC.

---

#### 182. How to make object eligible for GC?
**Tags:** `#Java-Advanced` `#Memory` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Set reference to null, reassign reference, object out of scope, anonymous object.

---

#### 183. Can we force garbage collection?
**Tags:** `#Java-Advanced` `#Memory` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** No. System.gc() is request, not guarantee. JVM decides when to run GC.

---

#### 184. What is finalize() method?
**Tags:** `#Java-Advanced` `#Memory` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Called by GC before object destruction. Deprecated in Java 9. Use try-with-resources instead.

---

#### 185. Difference between heap and stack?
**Tags:** `#Java-Advanced` `#Memory` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **Heap**: Objects, instance variables, slower, larger, shared, GC managed
- **Stack**: Local variables, method calls, faster, smaller, thread-specific, auto-managed

---

#### 186. What is memory leak?
**Tags:** `#Java-Advanced` `#Memory` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Objects not used but still referenced. Causes: Static collections, listeners, unclosed resources.

---

#### 187. What is OutOfMemoryError?
**Tags:** `#Java-Advanced` `#Memory` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Error when JVM cannot allocate object. Causes: Memory leak, insufficient heap, too many threads.

---

#### 188. What is StackOverflowError?
**Tags:** `#Java-Advanced` `#Memory` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Error when stack memory exhausted. Cause: Infinite recursion, too deep recursion.

---

### **Serialization**

#### 189. What is serialization?
**Tags:** `#Java-Advanced` `#Serialization`  
**Difficulty:** ⭐⭐  
**Answer:** Converting object to byte stream. Implement Serializable interface.

---

#### 190. What is transient keyword?
**Tags:** `#Java-Advanced` `#Serialization` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Prevents field from being serialized. Used for sensitive data or non-serializable fields.

---

#### 191. What is serialVersionUID?
**Tags:** `#Java-Advanced` `#Serialization` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Version number for serialized class. Ensures compatibility between sender and receiver.

---

#### 192. Difference between Serializable and Externalizable?
**Tags:** `#Java-Advanced` `#Serialization` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **Serializable**: Automatic, marker interface, default serialization
- **Externalizable**: Manual, has methods, custom serialization, better performance

---

### **Design Patterns**

#### 193. What is singleton pattern?
**Tags:** `#Java-Advanced` `#Design-Pattern`  
**Difficulty:** ⭐⭐  
**Answer:** Only one instance of class. Private constructor, static instance, getInstance() method.

---

#### 194. How to make singleton thread-safe?
**Tags:** `#Java-Advanced` `#Design-Pattern` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Synchronized method, double-checked locking, enum (best), static block.

---

#### 195. What is factory pattern?
**Tags:** `#Java-Advanced` `#Design-Pattern`  
**Difficulty:** ⭐⭐  
**Answer:** Creates objects without exposing creation logic. Factory method returns interface/abstract class.

---

#### 196. What is builder pattern?
**Tags:** `#Java-Advanced` `#Design-Pattern`  
**Difficulty:** ⭐⭐  
**Answer:** Constructs complex objects step by step. Useful for objects with many parameters.

---

#### 197. What is observer pattern?
**Tags:** `#Java-Advanced` `#Design-Pattern`  
**Difficulty:** ⭐⭐  
**Answer:** One-to-many dependency. When subject changes, all observers notified. Used in event handling.

---

#### 198. What is strategy pattern?
**Tags:** `#Java-Advanced` `#Design-Pattern`  
**Difficulty:** ⭐⭐  
**Answer:** Defines family of algorithms, encapsulates each, makes them interchangeable.

---

### **Miscellaneous**

#### 199. What is immutable class?
**Tags:** `#Java-Advanced` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Class whose state cannot change. Steps: final class, private final fields, no setters, deep copy in getters.

---

#### 200. What is shallow vs deep copy?
**Tags:** `#Java-Advanced` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **Shallow**: Copies object, references same nested objects
- **Deep**: Copies object and all nested objects recursively

---

#### 201. What is Cloneable interface?
**Tags:** `#Java-Advanced` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Marker interface for cloning. Override clone() method. Throws CloneNotSupportedException if not implemented.

---

#### 202. What is hashCode() and equals() contract?
**Tags:** `#Java-Advanced` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- If equals() true, hashCode() must be same
- If hashCode() same, equals() may be false
- Override both together

---

#### 203. What is reflection?
**Tags:** `#Java-Advanced` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Inspect and modify class behavior at runtime. Access private members, invoke methods dynamically.

---

#### 204. What is annotation?
**Tags:** `#Java-Advanced` `#Annotations`  
**Difficulty:** ⭐⭐  
**Answer:** Metadata for code. Types: Built-in (@Override, @Deprecated), Custom. Used by compiler, runtime, tools.

---

#### 205. Difference between @Override and @Overload?
**Tags:** `#Java-OOP` `#Annotations` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** @Override exists (checks overriding). @Overload doesn't exist in Java.

---

#### 206. What is covariant return type?
**Tags:** `#Java-OOP` `#Advanced` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Overriding method can return subtype of parent's return type (Java 5+).

---

#### 207. What is upcasting and downcasting?
**Tags:** `#Java-OOP` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Upcasting**: Child to parent, implicit, safe
- **Downcasting**: Parent to child, explicit, may throw ClassCastException

---

#### 208. What is instanceof operator?
**Tags:** `#Java-Core` `#Operators`  
**Difficulty:** ⭐  
**Answer:** Checks if object is instance of class/interface. Returns boolean.

---

#### 209. Difference between static and non-static nested class?
**Tags:** `#Java-Advanced` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **Static**: No access to outer instance, independent
- **Non-static (Inner)**: Access to outer instance, dependent

---

#### 210. What is anonymous inner class?
**Tags:** `#Java-Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Class without name, defined and instantiated in single expression. Used for one-time use.

---

---

## 🌐 ADDITIONAL SELENIUM QUESTIONS (50 Questions)

#### 211. What is Selenium Grid?
**Tags:** `#Selenium-Advanced` `#Grid`  
**Difficulty:** ⭐⭐  
**Answer:** Distributed testing tool. Run tests on multiple machines/browsers in parallel. Components: Hub and Nodes.

---

#### 212. Difference between Selenium Grid 3 and 4?
**Tags:** `#Selenium-Advanced` `#Grid` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Grid 3**: Separate Hub/Node, complex setup
- **Grid 4**: Standalone, distributed, fully async, Docker support

---

#### 213. What is RemoteWebDriver?
**Tags:** `#Selenium-Advanced` `#Grid`  
**Difficulty:** ⭐⭐  
**Answer:** WebDriver for remote execution. Used with Selenium Grid or cloud services.

---

#### 214. How to handle SSL certificate errors?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
ChromeOptions options = new ChromeOptions();
options.setAcceptInsecureCerts(true);
```

---

#### 215. How to run tests in headless mode?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless");
```

---

#### 216. How to handle browser notifications?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--disable-notifications");
```

---

#### 217. How to maximize browser window?
**Tags:** `#Selenium-Basics` `#Commands`  
**Difficulty:** ⭐  
**Answer:**
```java
driver.manage().window().maximize();
```

---

#### 218. How to scroll page?
**Tags:** `#Selenium-Advanced` `#JavaScript` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
JavascriptExecutor js = (JavascriptExecutor) driver;
js.executeScript("window.scrollBy(0,500)");
```

---

#### 219. How to scroll to element?
**Tags:** `#Selenium-Advanced` `#JavaScript` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
js.executeScript("arguments[0].scrollIntoView(true);", element);
```

---

#### 220. How to highlight element?
**Tags:** `#Selenium-Advanced` `#JavaScript` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
js.executeScript("arguments[0].style.border='3px solid red'", element);
```

---

#### 221. How to click hidden element?
**Tags:** `#Selenium-Advanced` `#JavaScript` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
js.executeScript("arguments[0].click();", element);
```

---

#### 222. How to handle cookies?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
driver.manage().addCookie(new Cookie("name", "value"));
driver.manage().getCookies();
driver.manage().deleteCookieNamed("name");
driver.manage().deleteAllCookies();
```

---

#### 223. What is Chrome DevTools Protocol (CDP)?
**Tags:** `#Selenium-Advanced` `#Selenium4` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Low-level protocol to control Chrome. Selenium 4 supports CDP for network interception, performance metrics.

---

#### 224. How to handle authentication popup?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
driver.get("https://username:password@example.com");
```

---

#### 225. How to verify element is clickable?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
wait.until(ExpectedConditions.elementToBeClickable(element));
```

---

#### 226. How to get CSS value?
**Tags:** `#Selenium-Basics` `#Commands`  
**Difficulty:** ⭐  
**Answer:**
```java
String color = element.getCssValue("color");
```

---

#### 227. How to perform drag and drop?
**Tags:** `#Selenium-Advanced` `#Actions`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
Actions actions = new Actions(driver);
actions.dragAndDrop(source, target).perform();
```

---

#### 228. How to perform mouse hover?
**Tags:** `#Selenium-Advanced` `#Actions`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
actions.moveToElement(element).perform();
```

---

#### 229. How to perform right click?
**Tags:** `#Selenium-Advanced` `#Actions`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
actions.contextClick(element).perform();
```

---

#### 230. How to perform double click?
**Tags:** `#Selenium-Advanced` `#Actions`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
actions.doubleClick(element).perform();
```

---

#### 231. How to send keyboard keys?
**Tags:** `#Selenium-Advanced` `#Actions`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
actions.sendKeys(Keys.ENTER).perform();
```

---

#### 232. How to handle shadow DOM?
**Tags:** `#Selenium-Advanced` `#JavaScript` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
SearchContext shadowRoot = shadowHost.getShadowRoot();
WebElement element = shadowRoot.findElement(By.cssSelector("#id"));
```

---

#### 233. How to count frames?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
List<WebElement> frames = driver.findElements(By.tagName("iframe"));
int count = frames.size();
```

---

#### 234. How to switch between tabs?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
ArrayList<String> tabs = new ArrayList<>(driver.getWindowHandles());
driver.switchTo().window(tabs.get(1));
```

---

#### 235. How to open new tab?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
driver.switchTo().newWindow(WindowType.TAB);
```

---

#### 236. How to refresh page?
**Tags:** `#Selenium-Basics` `#Commands`  
**Difficulty:** ⭐  
**Answer:**
```java
driver.navigate().refresh();
```

---

#### 237. How to handle browser zoom?
**Tags:** `#Selenium-Advanced` `#JavaScript` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
js.executeScript("document.body.style.zoom='150%'");
```

---

#### 238. How to get page load timeout?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
```

---

#### 239. How to handle AJAX calls?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use explicit wait for element visibility or JavaScript to check jQuery.active == 0.

---

#### 240. How to verify page title?
**Tags:** `#Selenium-Basics` `#Scenario`  
**Difficulty:** ⭐  
**Answer:**
```java
String title = driver.getTitle();
Assert.assertEquals(title, "Expected Title");
```

---

#### 241. How to verify URL?
**Tags:** `#Selenium-Basics` `#Scenario`  
**Difficulty:** ⭐  
**Answer:**
```java
String url = driver.getCurrentUrl();
Assert.assertTrue(url.contains("expected"));
```

---

#### 242. How to get element text?
**Tags:** `#Selenium-Basics` `#Commands`  
**Difficulty:** ⭐  
**Answer:**
```java
String text = element.getText();
```

---

#### 243. How to get attribute value?
**Tags:** `#Selenium-Basics` `#Commands`  
**Difficulty:** ⭐  
**Answer:**
```java
String value = element.getAttribute("value");
```

---

#### 244. How to check if element exists?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
List<WebElement> elements = driver.findElements(By.id("id"));
boolean exists = elements.size() > 0;
```

---

#### 245. How to wait for element to disappear?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("id")));
```

---

#### 246. How to handle dynamic dropdowns?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use explicit wait, type text to filter, select from filtered results.

---

#### 247. How to handle auto-suggest?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Type text, wait for suggestions, find elements, click desired option.

---

#### 248. How to take full page screenshot?
**Tags:** `#Selenium-Advanced` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use Ashot library or scroll and stitch multiple screenshots.

---

#### 249. How to handle captcha?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Cannot automate (by design). Solutions: Disable in test environment, use test captcha, manual intervention.

---

#### 260. How to verify broken images?
**Tags:** `#Selenium-Advanced` `#Scenario` `#Coding`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
List<WebElement> images = driver.findElements(By.tagName("img"));
for(WebElement img : images) {
    if(img.getAttribute("naturalWidth").equals("0")) {
        System.out.println("Broken: " + img.getAttribute("src"));
    }
}
```

---

---

## 🔌 ADDITIONAL API TESTING QUESTIONS (40 Questions)

#### 261. What is SOAP vs REST?
**Tags:** `#API-REST` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **SOAP**: Protocol, XML only, WSDL, complex, stateful
- **REST**: Architectural style, multiple formats, simple, stateless

---

#### 262. What is idempotency?
**Tags:** `#API-
REST` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Multiple identical requests have same effect as single request. GET, PUT, DELETE are idempotent. POST is not.

---

#### 263. What is REST API authentication types?
**Tags:** `#API-REST` `#Security`  
**Difficulty:** ⭐⭐  
**Answer:** Basic Auth, Bearer Token, API Key, OAuth 2.0, JWT, Digest Auth.

---

#### 264. What is Bearer Token?
**Tags:** `#API-REST` `#Security`  
**Difficulty:** ⭐⭐  
**Answer:** Token-based authentication. Send token in Authorization header: `Bearer <token>`

---

#### 265. What is OAuth 2.0?
**Tags:** `#API-REST` `#Security` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Authorization framework. Allows third-party access without sharing credentials. Flow: Authorization Code, Implicit, Client Credentials, Password.

---

#### 266. What is JWT?
**Tags:** `#API-REST` `#Security` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** JSON Web Token. Self-contained token with claims. Structure: Header.Payload.Signature. Used for stateless authentication.

---

#### 267. Difference between authentication and authorization?
**Tags:** `#API-REST` `#Security` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Authentication**: Who you are (login)
- **Authorization**: What you can do (permissions)

---

#### 268. What is API rate limiting?
**Tags:** `#API-REST` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Restricts number of API calls in time period. Prevents abuse. Returns 429 (Too Many Requests).

---

#### 269. What is API versioning?
**Tags:** `#API-REST` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Managing API changes. Methods: URI (/v1/users), Header (Accept: application/vnd.api.v1+json), Query parameter (?version=1).

---

#### 270. What is HATEOAS?
**Tags:** `#API-REST` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Hypermedia As The Engine Of Application State. REST constraint. Response includes links to related resources.

---

#### 271. What is Content-Type header?
**Tags:** `#API-REST` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Specifies media type of request/response body. Examples: application/json, application/xml, text/html.

---

#### 272. What is Accept header?
**Tags:** `#API-REST` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Specifies media types client can process. Server responds with matching Content-Type.

---

#### 273. How to test POST request in REST Assured?
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

---

#### 274. How to extract response in REST Assured?
**Tags:** `#API-Testing` `#REST-Assured` `#Coding`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
Response response = given().when().get("/users/1");
String name = response.jsonPath().getString("name");
int id = response.jsonPath().getInt("id");
```

---

#### 275. How to validate JSON array in REST Assured?
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

---

#### 276. How to handle query parameters?
**Tags:** `#API-Testing` `#REST-Assured`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
given()
    .queryParam("page", 1)
    .queryParam("limit", 10)
.when()
    .get("/users");
```

---

#### 277. How to handle path parameters?
**Tags:** `#API-Testing` `#REST-Assured`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
given()
    .pathParam("id", 1)
.when()
    .get("/users/{id}");
```

---

#### 278. How to handle headers in REST Assured?
**Tags:** `#API-Testing` `#REST-Assured`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
given()
    .header("Authorization", "Bearer token")
    .header("Content-Type", "application/json")
.when()
    .get("/users");
```

---

#### 279. How to validate response time?
**Tags:** `#API-Testing` `#REST-Assured` `#Performance`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
given()
.when()
    .get("/users")
.then()
    .time(lessThan(2000L)); // milliseconds
```

---

#### 280. How to log request and response?
**Tags:** `#API-Testing` `#REST-Assured` `#Debugging`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
given()
    .log().all() // Log request
.when()
    .get("/users")
.then()
    .log().all(); // Log response
```

---

#### 281. How to handle file upload in API?
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

---

#### 282. How to handle file download in API?
**Tags:** `#API-Testing` `#REST-Assured` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
byte[] bytes = given()
    .when()
        .get("/download")
    .then()
        .extract().asByteArray();
FileUtils.writeByteArrayToFile(new File("file.pdf"), bytes);
```

---

#### 283. How to validate JSON schema?
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

---

#### 284. How to handle cookies in API?
**Tags:** `#API-Testing` `#REST-Assured`  
**Difficulty:** ⭐⭐  
**Answer:**
```java
given()
    .cookie("session", "abc123")
.when()
    .get("/users");
```

---

#### 285. How to chain API requests?
**Tags:** `#API-Testing` `#REST-Assured` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
```java
// Extract from first request
String id = given().post("/users").then().extract().path("id");
// Use in second request
given().pathParam("id", id).get("/users/{id}");
```

---

#### 286. What is API mocking?
**Tags:** `#API-Testing` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Simulating API responses for testing. Tools: WireMock, MockServer, Postman Mock Server.

---

#### 287. What is contract testing?
**Tags:** `#API-Testing` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Verifies API contract between consumer and provider. Tools: Pact, Spring Cloud Contract.

---

#### 288. How to test API security?
**Tags:** `#API-Testing` `#Security` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Test authentication, authorization, input validation, SQL injection, XSS, rate limiting, HTTPS.

---

#### 289. What is API documentation?
**Tags:** `#API-REST` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Describes API endpoints, parameters, responses. Tools: Swagger/OpenAPI, Postman, API Blueprint.

---

#### 290. What is Swagger/OpenAPI?
**Tags:** `#API-REST` `#Tools`  
**Difficulty:** ⭐⭐  
**Answer:** API documentation standard. YAML/JSON format. Generates interactive documentation and client code.

---

#### 291. How to handle pagination in API?
**Tags:** `#API-REST` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Use query parameters: page, limit, offset. Response includes total count and links.

---

#### 292. What is API gateway?
**Tags:** `#API-REST` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Entry point for microservices. Handles routing, authentication, rate limiting, load balancing.

---

#### 293. What is GraphQL?
**Tags:** `#API-Advanced` `#Advanced`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Query language for APIs. Client specifies exact data needed. Single endpoint, flexible queries.

---

#### 294. Difference between REST and GraphQL?
**Tags:** `#API-Advanced` `#Tricky`  
**Difficulty:** ⭐⭐⭐  
**Answer:**
- **REST**: Multiple endpoints, over/under fetching, HTTP methods
- **GraphQL**: Single endpoint, exact data, queries/mutations

---

#### 295. What is API throttling?
**Tags:** `#API-REST` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Controlling API request rate. Prevents server overload. Returns 429 status code.

---

#### 296. How to test API performance?
**Tags:** `#API-Testing` `#Performance` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Measure response time, throughput, concurrent users. Tools: JMeter, Gatling, LoadRunner.

---

#### 297. What is API load testing?
**Tags:** `#API-Testing` `#Performance`  
**Difficulty:** ⭐⭐  
**Answer:** Testing API under expected load. Measures performance, identifies bottlenecks.

---

#### 298. What is API stress testing?
**Tags:** `#API-Testing` `#Performance`  
**Difficulty:** ⭐⭐  
**Answer:** Testing API beyond normal load. Finds breaking point, tests recovery.

---

#### 299. How to handle API errors?
**Tags:** `#API-Testing` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Validate error status codes, error messages, error format. Test edge cases, invalid inputs.

---

#### 300. What is API monitoring?
**Tags:** `#API-Testing` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Continuous checking of API availability, performance. Tools: Pingdom, New Relic, Datadog.

---

---

## 💾 SQL FOR TESTERS (20 Questions)

#### 301. What is SQL?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Structured Query Language. Used to manage relational databases. Operations: SELECT, INSERT, UPDATE, DELETE.

---

#### 302. What is SELECT statement?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Retrieves data from database.
```sql
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;
```

---

#### 303. What is WHERE clause?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Filters records based on condition.
```sql
SELECT * FROM users WHERE age > 18;
```

---

#### 304. What is JOIN? Types?
**Tags:** `#SQL` `#Advanced` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Combines rows from multiple tables. Types:
- **INNER JOIN**: Matching rows from both tables
- **LEFT JOIN**: All from left, matching from right
- **RIGHT JOIN**: All from right, matching from left
- **FULL JOIN**: All rows from both tables

---

#### 305. What is GROUP BY?
**Tags:** `#SQL` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Groups rows with same values. Used with aggregate functions.
```sql
SELECT country, COUNT(*) FROM users GROUP BY country;
```

---

#### 306. What is HAVING clause?
**Tags:** `#SQL` `#Advanced` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:** Filters grouped records. Used with GROUP BY.
```sql
SELECT country, COUNT(*) FROM users 
GROUP BY country HAVING COUNT(*) > 10;
```

---

#### 307. Difference between WHERE and HAVING?
**Tags:** `#SQL` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **WHERE**: Filters before grouping, cannot use aggregate functions
- **HAVING**: Filters after grouping, can use aggregate functions

---

#### 308. What are aggregate functions?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** COUNT(), SUM(), AVG(), MIN(), MAX()
```sql
SELECT COUNT(*), AVG(salary) FROM employees;
```

---

#### 309. What is ORDER BY?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Sorts result set.
```sql
SELECT * FROM users ORDER BY name ASC;
SELECT * FROM users ORDER BY age DESC;
```

---

#### 310. What is DISTINCT?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Returns unique values.
```sql
SELECT DISTINCT country FROM users;
```

---

#### 311. What is LIMIT/TOP?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Limits number of rows returned.
```sql
SELECT * FROM users LIMIT 10; -- MySQL
SELECT TOP 10 * FROM users; -- SQL Server
```

---

#### 312. What is INSERT statement?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Adds new records.
```sql
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
```

---

#### 313. What is UPDATE statement?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Modifies existing records.
```sql
UPDATE users SET email = 'new@example.com' WHERE id = 1;
```

---

#### 314. What is DELETE statement?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Removes records.
```sql
DELETE FROM users WHERE id = 1;
```

---

#### 315. Difference between DELETE and TRUNCATE?
**Tags:** `#SQL` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **DELETE**: Removes specific rows, can rollback, slower, fires triggers
- **TRUNCATE**: Removes all rows, cannot rollback, faster, no triggers

---

#### 316. What is primary key?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Unique identifier for table row. Cannot be NULL. One per table.

---

#### 317. What is foreign key?
**Tags:** `#SQL` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Links two tables. References primary key of another table. Maintains referential integrity.

---

#### 318. What is index?
**Tags:** `#SQL` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Database object that speeds up data retrieval. Trade-off: Faster SELECT, slower INSERT/UPDATE/DELETE.

---

#### 319. What is NULL?
**Tags:** `#SQL` `#Basics` `#Tricky`  
**Difficulty:** ⭐  
**Answer:** Represents missing/unknown value. Not same as empty string or zero.
```sql
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;
```

---

#### 320. How to test database in automation?
**Tags:** `#SQL` `#Testing` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use JDBC to connect, execute queries, validate results. Verify data integrity, CRUD operations, constraints.

---

---

## 🥒 CUCUMBER/BDD QUESTIONS (15 Questions)

#### 321. What is BDD?
**Tags:** `#BDD` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Behavior Driven Development. Collaboration between developers, testers, business. Uses natural language for test scenarios.

---

#### 322. What is Cucumber?
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** BDD framework. Executes tests written in Gherkin language. Supports multiple languages (Java, Ruby, JavaScript).

---

#### 323. What is Gherkin?
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Business-readable language for BDD. Keywords: Feature, Scenario, Given, When, Then, And, But.

---

#### 324. What is Feature file?
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

---

#### 325. What are Step Definitions?
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Java methods that implement Gherkin steps. Maps steps to code.
```java
@Given("user is on login page")
public void userIsOnLoginPage() {
    driver.get("https://example.com/login");
}
```

---

#### 326. What is Scenario Outline?
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

---

#### 327. What are Tags in Cucumber?
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Organize and filter scenarios. Run specific tests.
```gherkin
@smoke @regression
Scenario: Login test
```

---

#### 328. What is Background in Cucumber?
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Common steps for all scenarios in feature file. Runs before each scenario.
```gherkin
Background:
  Given user is logged in
```

---

#### 329. What are Hooks in Cucumber?
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Methods that run before/after scenarios. @Before, @After, @BeforeStep, @AfterStep.

---

#### 330. How to generate Cucumber reports?
**Tags:** `#BDD` `#Cucumber` `#Reporting`  
**Difficulty:** ⭐⭐  
**Answer:** Use plugins: html, json, junit. Configure in TestRunner.
```java
@CucumberOptions(
    plugin = {"pretty", "html:target/cucumber-reports"}
)
```

---

#### 331. What is Data Table in Cucumber?
**Tags:** `#BDD` `#Cucumber` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Pass multiple rows of data to step.
```gherkin
Given users exist:
  | name  | email           |
  | John  | john@email.com  |
  | Jane  | jane@email.com  |
```

---

#### 332. Difference between Scenario and Scenario Outline?
**Tags:** `#BDD` `#Cucumber` `#Tricky`  
**Difficulty:** ⭐⭐  
**Answer:**
- **Scenario**: Single test case
- **Scenario Outline**: Template for multiple test cases with different data

---

#### 333. What is TestRunner in Cucumber?
**Tags:** `#BDD` `#Cucumber` `#Basics`  
**Difficulty:** ⭐  
**Answer:** JUnit/TestNG class that runs Cucumber tests. Configures features, glue, plugins.

---

#### 334. How to integrate Cucumber with Selenium?
**Tags:** `#BDD` `#Cucumber` `#Selenium` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Create step definitions with Selenium WebDriver code. Initialize driver in hooks.

---

#### 335. What are advantages of BDD?
**Tags:** `#BDD` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Better collaboration, living documentation, business-readable tests, early bug detection, reusable steps.

---

---

## 🐳 DOCKER & CI/CD QUESTIONS (15 Questions)

#### 336. What is Docker?
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Platform for containerization. Packages application with dependencies. Ensures consistency across environments.

---

#### 337. What is container?
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Lightweight, standalone package with application and dependencies. Isolated from host system.

---

#### 338. What is Docker image?
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Template for creating containers. Read-only. Built from Dockerfile.

---

#### 339. What is Dockerfile?
**Tags:** `#Docker` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Text file with instructions to build Docker image.
```dockerfile
FROM openjdk:11
COPY target/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

#### 340. Basic Docker commands?
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

---

#### 341. What is Docker Compose?
**Tags:** `#Docker` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Tool for defining multi-container applications. Uses YAML file (docker-compose.yml).

---

#### 342. What is CI/CD?
**Tags:** `#CI-CD` `#Basics`  
**Difficulty:** ⭐  
**Answer:**
- **CI** (Continuous Integration): Frequent code integration, automated testing
- **CD** (Continuous Deployment): Automated deployment to production

---

#### 343. What is Jenkins pipeline?
**Tags:** `#Jenkins` `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** Suite of plugins for CI/CD as code. Defined in Jenkinsfile. Stages: Build, Test, Deploy.

---

#### 344. What is Jenkinsfile?
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

---

#### 345. What are Jenkins stages?
**Tags:** `#Jenkins` `#CI-CD`  
**Difficulty:** ⭐⭐  
**Answer:** Logical divisions in pipeline. Common: Checkout, Build, Test, Deploy, Notify.

---

#### 346. How to trigger Jenkins job?
**Tags:** `#Jenkins` `#CI-CD` `#Scenario`  
**Difficulty:** ⭐⭐  
**Answer:** Manual, SCM polling, webhook, scheduled (cron), upstream job.

---

#### 347. What is webhook?
**Tags:** `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** HTTP callback. Triggers Jenkins job on Git push/merge. Real-time integration.

---

#### 348. What is artifact?
**Tags:** `#CI-CD` `#Basics`  
**Difficulty:** ⭐  
**Answer:** Build output (JAR, WAR, ZIP). Stored in artifact repository (Nexus, Artifactory).

---

#### 349. How to run Selenium tests in Docker?
**Tags:** `#Docker` `#Selenium` `#Scenario`  
**Difficulty:** ⭐⭐⭐  
**Answer:** Use Selenium Docker images (standalone-chrome, standalone-firefox). Configure RemoteWebDriver.

---

#### 350. What is GitHub Actions?
**Tags:** `#CI-CD` `#Advanced`  
**Difficulty:** ⭐⭐  
**Answer:** CI/CD platform by GitHub. Automates workflows. Defined in YAML (.github/workflows/).

---

---

## 🎓 FINAL SUMMARY

### **Total Questions: 350**

| Category | Questions |
|----------|-----------|
| Java | 115 |
| Selenium | 80 |
| API Testing | 55 |
| Framework/Tools | 25 |
| Scenarios | 15 |
| Tricky | 10 |
| SQL | 20 |
| Cucumber/BDD | 15 |
| Docker/CI-CD | 15 |

---

## 🏷️ All Questions Tagged

**Search by:**
- Technology: `#Java-Core`, `#Selenium-Advanced`, `#API-REST`, `#SQL`, `#BDD`, `#Docker`
- Difficulty: ⭐ ⭐⭐ ⭐⭐⭐
- Type: `#Basics`, `#Tricky`, `#Scenario`, `#Coding`, `#Advanced`

---

## 💡 Study Plan

**Week 1-2:** Java (Q1-55, Q151-210)
**Week 3-4:** Selenium (Q56-85, Q211-260)
**Week 5:** API Testing (Q86-100, Q261-300)
**Week 6:** SQL + BDD (Q301-335)
**Week 7:** Docker/CI-CD + Framework (Q336-350, Q101-125)
**Week 8:** Scenarios + Tricky + Revision

---

## 🎯 Interview Ready!

**You now have:**
- ✅ 350+ comprehensive questions
- ✅ All topics covered
- ✅ Tagged for easy filtering
- ✅ Detailed answers with code
- ✅ Multiple difficulty levels
- ✅ Scenario-based questions

**Practice daily, answer out loud, and ace your interviews! 🚀**

---

**Good luck! You've got this! 💪**
