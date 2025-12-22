# ☕ Java Interview Questions Bank - 555+ Questions

**Purpose**: Comprehensive question bank for Java interview preparation
**Target**: 0-12 years experience
**Total Questions**: 555+ (540 questions-only + 15 with detailed answers)
**Status**: Mixed - 540 questions-only + 15 with comprehensive answers

---

## 🎯 **PRIORITY QUESTIONS WITH ANSWERS** (15 Questions)

*These questions have detailed answers and should be studied first*

### **Q1: Explain the difference between == and .equals() in Java**
- **Difficulty**: Medium
- **Experience Level**: 0-2, 3-5 years
- **Answer**: == compares references (memory addresses) while .equals() compares object content. For primitives, == compares values. String literals with same value may share memory (interning), but new String() creates new objects.
- **Companies**: All Java applications, Banking, E-commerce
- **Topic**: Java Fundamentals
- **Follow-up**: What is String interning? When should you override equals()?

### **Q2: What is the difference between String, StringBuilder, and StringBuffer?**
- **Difficulty**: Medium
- **Experience Level**: 0-2, 3-5 years
- **Answer**: String is immutable - creates new objects on modification. StringBuilder is mutable and not thread-safe, best for single-threaded string building. StringBuffer is mutable and thread-safe but slower due to synchronization.
- **Companies**: Performance-critical applications, Banking, Real-time systems
- **Topic**: Java Fundamentals
- **Follow-up**: When would you use String, StringBuilder, or StringBuffer?

### **Q3: Explain Java exception handling and the difference between checked and unchecked exceptions**
- **Difficulty**: Medium
- **Experience Level**: 0-2, 3-5 years
- **Answer**: Exception handling manages runtime errors using try-catch-finally blocks. Checked exceptions (compile-time) must be caught or declared (IOException, SQLException). Unchecked exceptions (runtime) don't require explicit handling (NullPointerException, ArrayIndexOutOfBoundsException).
- **Companies**: All Java applications, Banking, Healthcare, E-commerce
- **Topic**: Exception Handling
- **Follow-up**: What is try-with-resources? When should you create custom exceptions?

### **Q4: What are Java Collections and explain the difference between List, Set, and Map**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: Collections framework provides data structures. List allows duplicates and maintains order (ArrayList, LinkedList). Set doesn't allow duplicates (HashSet, TreeSet). Map stores key-value pairs (HashMap, TreeMap). Choose based on use case: ArrayList for random access, LinkedList for frequent insertions, HashMap for key lookups.
- **Companies**: All Java applications, Data processing, Enterprise applications
- **Topic**: Collections
- **Follow-up**: What's the difference between ArrayList and LinkedList? When to use HashMap vs TreeMap?

### **Q5: Explain Java multithreading and synchronization**
- **Difficulty**: Hard
- **Experience Level**: 3-5, 6-8 years
- **Answer**: Multithreading allows concurrent execution. Create threads by extending Thread or implementing Runnable. Synchronization prevents race conditions using synchronized keyword, locks, or concurrent collections. Thread states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.
- **Companies**: High-performance applications, Real-time systems, Banking
- **Topic**: Multithreading
- **Follow-up**: What is deadlock and how to prevent it? Explain volatile keyword.

### **Q6: What is String interning?**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: String interning is a method of storing only one copy of each distinct string value in memory. In Java, strings are stored in the String Pool (part of heap memory). When you create a string literal, JVM checks if an identical string already exists in the pool. If yes, it returns the reference to the existing string; otherwise, it creates a new string in the pool. You can manually intern strings using the intern() method. This saves memory but can impact performance if overused.
- **Companies**: Memory optimization, Performance tuning, Large-scale applications
- **Topic**: Java Fundamentals

### **Q7: When should you override equals()?**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: Override equals() when you need logical equality instead of reference equality. Required for: 1) Using objects as keys in HashMap/HashSet, 2) Comparing objects based on their content/state, 3) Working with collections that use equals() for searching. When overriding equals(), also override hashCode() to maintain the contract: objects that are equal must have the same hash code. Follow the equals() contract: reflexive, symmetric, transitive, consistent, and null-safe.
- **Companies**: Object-oriented design, Collections usage, Framework development
- **Topic**: Java Fundamentals

### **Q8: When would you use String, StringBuilder, or StringBuffer?**
- **Difficulty**: Easy
- **Experience Level**: 0-2, 3-5 years
- **Answer**: Use String for: immutable text, small number of concatenations, thread safety not a concern. Use StringBuilder for: heavy string manipulation, single-threaded environment, performance-critical string building. Use StringBuffer for: heavy string manipulation in multi-threaded environment, when thread safety is required. StringBuilder is faster than StringBuffer due to no synchronization overhead. String concatenation with + operator creates new objects, inefficient for loops.
- **Companies**: Performance optimization, String manipulation, Multi-threaded applications
- **Topic**: Java Fundamentals

### **Q9: What is string immutability?**
- **Difficulty**: Easy
- **Experience Level**: 0-2, 3-5 years
- **Answer**: String immutability means that once a String object is created, its value cannot be changed. Any operation that appears to modify a string actually creates a new String object. Benefits: 1) Thread safety - multiple threads can access immutable objects safely, 2) Security - string values cannot be changed after creation, 3) Caching - hashcode can be cached, 4) String pool optimization. Drawbacks: memory overhead when doing many string operations, which is why StringBuilder/StringBuffer exist for mutable string operations.
- **Companies**: Thread safety, Memory management, Security
- **Topic**: Java Fundamentals

### **Q10: What is try-with-resources?**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: Try-with-resources is a try statement that declares one or more resources automatically closed at the end of the statement. Introduced in Java 7. Syntax: try (FileReader fr = new FileReader(file)) { // use resource }. Resources must implement AutoCloseable interface. Benefits: 1) Automatic resource cleanup, 2) No explicit finally block needed, 3) Handles multiple resources, 4) Exception suppression if both try and close throw exceptions. Multiple resources separated by semicolons.
- **Companies**: Resource management, File handling, Database connections
- **Topic**: Exception Handling

### **Q11: When should you create custom exceptions?**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: Create custom exceptions when: 1) You need specific error information not provided by existing exceptions, 2) You want to group related exceptions under a common hierarchy, 3) You need to add additional data/methods to exceptions, 4) You want better error handling granularity, 5) Domain-specific errors that need special handling. Extend Exception for checked exceptions, RuntimeException for unchecked. Include meaningful error messages, cause chaining, and additional context data.
- **Companies**: Enterprise applications, API development, Framework design
- **Topic**: Exception Handling

### **Q12: What's the difference between ArrayList and LinkedList?**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: ArrayList: Array-based, O(1) random access, O(1) add at end, O(n) insert/delete at middle, better cache locality, less memory per element. LinkedList: Doubly-linked list, O(n) random access, O(1) insert/delete at known position, O(1) add at beginning/end, more memory per element due to node overhead. Use ArrayList for: frequent random access, iteration, small lists. Use LinkedList for: frequent insertions/deletions, queue/deque operations, when you don't need random access.
- **Companies**: Algorithm optimization, Data structure design, Performance tuning
- **Topic**: Collections

### **Q13: When to use HashMap vs TreeMap?**
- **Difficulty**: Medium
- **Experience Level**: 3-5, 6-8 years
- **Answer**: HashMap: Hash table based, O(1) average access time, no ordering, allows null key/values, not thread-safe, better performance. TreeMap: Red-black tree based, O(log n) access time, maintains sorted order, no null keys, implements NavigableMap with range operations. Use HashMap for: fast lookups, no ordering needed, general-purpose mapping. Use TreeMap for: sorted keys, range queries, natural ordering needed, NavigableMap operations like subMap(), headMap(), tailMap().
- **Companies**: Data structure optimization, Sorted data requirements, Performance-critical applications
- **Topic**: Collections

### **Q14: What is deadlock and how to prevent it?**
- **Difficulty**: Hard
- **Experience Level**: 6-8, 9+ years
- **Answer**: Deadlock occurs when two or more threads wait indefinitely for each other to release resources. Conditions: 1) Mutual exclusion, 2) Hold and wait, 3) No preemption, 4) Circular wait. Prevention techniques: 1) Always acquire locks in same order, 2) Use timeout with tryLock(), 3) Avoid nested locks, 4) Use concurrent collections, 5) Use higher-level concurrency utilities (CountDownLatch, Semaphore). Detection: ThreadMXBean, VisualVM, jstack. Recovery: interrupt threads, use deadlock detection algorithms.
- **Companies**: Multi-threaded applications, Concurrent programming, High-performance systems
- **Topic**: Multithreading

### **Q15: Explain volatile keyword**
- **Difficulty**: Hard
- **Experience Level**: 6-8, 9+ years
- **Answer**: Volatile ensures visibility of changes to a variable across threads. When a variable is declared volatile: 1) Reads/writes go directly to main memory, not CPU cache, 2) Prevents instruction reordering around volatile operations, 3) Guarantees happens-before relationship. Use cases: flags, status indicators, single-writer multiple-reader scenarios. Limitations: not atomic for compound operations (i++), doesn't provide mutual exclusion. Volatile is lighter than synchronized but provides weaker guarantees.
- **Companies**: Concurrent programming, Lock-free algorithms, Performance optimization
- **Topic**: Multithreading

---

## 🔥 **ADDITIONAL ADVANCED JAVA QUESTIONS WITH ANSWERS** (60 Questions)
*Advanced Java concepts with detailed explanations*

### **Java 8+ Features**

#### **Q16: What is lambda expression in Java?**
**Tags:** `#Java-Advanced` `#Java8`
**Difficulty:** ⭐⭐
**Answer:** Anonymous function introduced in Java 8. Syntax: `(parameters) -> expression`. Used with functional interfaces.
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.forEach(n -> System.out.println(n));
```

#### **Q17: What is Stream API?**
**Tags:** `#Java-Advanced` `#Java8`
**Difficulty:** ⭐⭐
**Answer:** Process collections functionally (Java 8+). Operations: filter, map, reduce, collect.
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> even = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

#### **Q18: Difference between map() and flatMap()?**
**Tags:** `#Java-Advanced` `#Java8` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:**
- **map()**: One-to-one, transforms each element, returns Stream<T>
- **flatMap()**: One-to-many, flattens nested streams, returns Stream<R>

#### **Q19: What is Optional class?**
**Tags:** `#Java-Advanced` `#Java8`
**Difficulty:** ⭐⭐
**Answer:** Container for value that may/may not be present. Avoids NullPointerException.
```java
Optional<String> optional = Optional.ofNullable(value);
String result = optional.orElse("default");
```

#### **Q20: What is method reference?**
**Tags:** `#Java-Advanced` `#Java8`
**Difficulty:** ⭐⭐
**Answer:** Shorthand for lambda. Types: Static (ClassName::method), Instance (object::method), Constructor (ClassName::new)

### **Collections Deep Dive**

#### **Q21: Internal working of HashMap?**
**Tags:** `#Java-Advanced` `#Collections` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:** Array of buckets. Hash function determines index. Collisions handled by linked list (Java 8+: tree if >8 elements). Load factor 0.75, capacity doubles when threshold reached.

#### **Q22: What is ConcurrentHashMap?**
**Tags:** `#Java-Advanced` `#Collections` `#Multithreading`
**Difficulty:** ⭐⭐⭐
**Answer:** Thread-safe HashMap. Uses segment locking (Java 7) or CAS operations (Java 8+). Better performance than Hashtable.

#### **Q23: Difference between fail-fast and fail-safe?**
**Tags:** `#Java-Advanced` `#Collections` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:**
- **Fail-fast**: Throws ConcurrentModificationException (ArrayList, HashMap)
- **Fail-safe**: Works on copy, no exception (CopyOnWriteArrayList, ConcurrentHashMap)

### **Multithreading Advanced**

#### **Q24: What is volatile keyword?**
**Tags:** `#Java-Advanced` `#Multithreading` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:** Ensures variable read from main memory, not thread cache. Provides visibility but not atomicity.

#### **Q25: What is deadlock? How to prevent?**
**Tags:** `#Java-Advanced` `#Multithreading` `#Scenario`
**Difficulty:** ⭐⭐⭐
**Answer:** Two threads waiting for each other's locks. Prevention: Lock ordering, timeout, avoid nested locks, use concurrent collections.

#### **Q26: What is ThreadLocal?**
**Tags:** `#Java-Advanced` `#Multithreading` `#Advanced`
**Difficulty:** ⭐⭐⭐
**Answer:** Provides thread-local variables. Each thread has its own copy. Used for user sessions, database connections.

### **Memory Management**

#### **Q27: What is garbage collection?**
**Tags:** `#Java-Advanced` `#Memory`
**Difficulty:** ⭐⭐
**Answer:** Automatic memory management. Removes unreferenced objects. Types: Serial, Parallel, CMS, G1, ZGC.

#### **Q28: Difference between heap and stack?**
**Tags:** `#Java-Advanced` `#Memory` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:**
- **Heap**: Objects, instance variables, slower, larger, shared, GC managed
- **Stack**: Local variables, method calls, faster, smaller, thread-specific, auto-managed

### **Design Patterns**

#### **Q29: What is singleton pattern?**
**Tags:** `#Java-Advanced` `#Design-Pattern`
**Difficulty:** ⭐⭐
**Answer:** Only one instance of class. Private constructor, static instance, getInstance() method.

#### **Q30: How to make singleton thread-safe?**
**Tags:** `#Java-Advanced` `#Design-Pattern` `#Tricky`
**Difficulty:** ⭐⭐⭐
**Answer:** Synchronized method, double-checked locking, enum (best), static block.

*[Note: Additional 30 questions from Q31-Q60 covering Serialization, Reflection, Annotations, and Advanced Java topics would be added here with similar detailed answers]*

---

## 📚 Table of Contents

1. [Java Basics & Core (80 Questions)](#java-basics--core)
2. [OOP Concepts (60 Questions)](#oop-concepts)
3. [Collections Framework (70 Questions)](#collections-framework)
4. [Exception Handling (40 Questions)](#exception-handling)
5. [Multithreading & Concurrency (60 Questions)](#multithreading--concurrency)
6. [Java 8+ Features (50 Questions)](#java-8-features)
7. [JVM & Memory Management (45 Questions)](#jvm--memory-management)
8. [String Handling (35 Questions)](#string-handling)
9. [Design Patterns (30 Questions)](#design-patterns)
10. [Spring Framework (40 Questions)](#spring-framework)
11. [Advanced Java Topics (30 Questions)](#advanced-java-topics)

---

## 1. Java Basics & Core (80 Questions)

### Basic Concepts (25 Questions)

1. What is Java and why is it platform independent?
2. Explain JVM, JRE, and JDK with examples
3. What are the main features of Java?
4. Difference between JDK 8, JDK 11, JDK 17, and JDK 21
5. What is bytecode in Java?
6. How does Java achieve platform independence?
7. What is the difference between Path and Classpath?
8. Explain the Java compilation process
9. What is the difference between JIT and JVM?
10. What are Java keywords? List some reserved keywords
11. What is the difference between JVM, JRE, and JDK in terms of size?
12. What is the role of javac command?
13. What is the role of java command?
14. How is Java different from C++?
15. What is the significance of public static void main(String[] args)?
16. Can we have multiple main methods in Java?
17. What happens if we don't have main method in Java class?
18. What is the difference between System.out.print() and System.out.println()?
19. What are access modifiers in Java?
20. What is the default access modifier in Java?
21. Can we have private constructor in Java?
22. What is the difference between compile-time and runtime?
23. What is the difference between source code and bytecode?
24. What is WORA (Write Once Run Anywhere)?
25. What is the difference between Oracle JDK and OpenJDK?

### Data Types & Variables (20 Questions)

26. What are the primitive data types in Java?
27. What is the difference between int and Integer?
28. What is autoboxing and unboxing in Java?
29. What is the size of int, float, double, char, and boolean in Java?
30. What is the difference between float and double?
31. What is the range of byte data type in Java?
32. What happens when we assign a long value to an int variable?
33. What is type casting in Java?
34. Difference between implicit and explicit type casting
35. What is the difference between == and equals() for primitives?
36. Can we compare int and float using ==?
37. What is the default value of instance variables?
38. What is the default value of local variables?
39. What is the difference between instance variables and local variables?
40. What is a constant in Java and how to declare it?
41. What is the difference between final, static final, and const?
42. What is var keyword in Java?
43. What is type inference in Java?
44. What happens when we divide an integer by zero?
45. What happens when we divide a float by zero?

### Operators & Control Statements (20 Questions)

46. What are different types of operators in Java?
47. What is the difference between & and &&?
48. What is the difference between | and ||?
49. What is the difference between ++ and += operators?
50. What is the precedence order of operators in Java?
51. What is the difference between pre-increment and post-increment?
52. What is the ternary operator in Java?
53. What is instanceof operator in Java?
54. What is the difference between == and equals() method?
55. What is the difference between if-else and switch case?
56. Can we use String in switch case?
57. What is enhanced switch statement in Java 14+?
58. What is the difference between for loop and enhanced for loop?
59. When to use while loop vs for loop?
60. What is the difference between while and do-while loop?
61. What is break and continue statement?
62. Can we use break and continue with labels?
63. What is the difference between break and return statement?
64. Can we have nested loops in Java?
65. What is infinite loop and how to avoid it?

### Methods & Constructors (15 Questions)

66. What is method overloading in Java?
67. What is method overriding in Java?
68. What is the difference between overloading and overriding?
69. What are the rules for method overriding?
70. Can we override static methods in Java?
71. Can we overload static methods in Java?
72. What is constructor in Java?
73. What is the difference between constructor and method?
74. What is default constructor in Java?
75. What is constructor overloading?
76. What is constructor chaining?
77. What is the difference between this() and super()?
78. Can we have private constructor in Java?
79. What happens if we don't define any constructor?
80. Can constructor be inherited in Java?

---

## 2. OOP Concepts (60 Questions)

### Classes & Objects (20 Questions)

81. What is a class in Java?
82. What is an object in Java?
83. What is the difference between class and object?
84. How to create an object in Java?
85. What are different ways to create objects in Java?
86. What is the difference between new and newInstance()?
87. What is anonymous object in Java?
88. What is the lifecycle of an object in Java?
89. What is garbage collection in Java?
90. When is an object eligible for garbage collection?
91. What is finalize() method in Java?
92. What is the difference between finalize() and finally?
93. What is shallow copy and deep copy?
94. What is cloning in Java?
95. What is the difference between Cloneable and Serializable?
96. What is singleton design pattern?
97. How to implement singleton pattern in Java?
98. What is thread-safe singleton?
99. What is enum in Java?
100. What are the advantages of enum over constants?

### Inheritance (20 Questions)

101. What is inheritance in Java?
102. What are the types of inheritance in Java?
103. Why multiple inheritance is not supported in Java?
104. What is the difference between extends and implements?
105. What is super keyword in Java?
106. What is the difference between this and super?
107. What is method hiding in Java?
108. What is dynamic method dispatch?
109. What is runtime polymorphism?
110. What is the difference between compile-time and runtime polymorphism?
111. What is abstract class in Java?
112. What is the difference between abstract class and concrete class?
113. Can we create object of abstract class?
114. Can abstract class have constructor?
115. Can abstract class have static methods?
116. What is the difference between abstract class and interface?
117. When to use abstract class vs interface?
118. What is diamond problem in inheritance?
119. How Java solves diamond problem?
120. What is composition vs inheritance?

### Interfaces (20 Questions)

121. What is interface in Java?
122. What are the rules for interface in Java?
123. Can interface have variables? What type?
124. Can interface have constructor?
125. Can interface have static methods?
126. Can interface have default methods?
127. What are default methods in interface (Java 8)?
128. What are static methods in interface (Java 8)?
129. What are private methods in interface (Java 9)?
130. Can we override default methods?
131. What happens if a class implements two interfaces with same default method?
132. What is functional interface in Java?
133. What is @FunctionalInterface annotation?
134. What is the difference between abstract class and interface in Java 8?
135. Can interface extend another interface?
136. Can interface extend multiple interfaces?
137. What is marker interface in Java?
138. What are examples of marker interfaces?
139. What is the purpose of Serializable interface?
140. What is the purpose of Cloneable interface?

---

## 3. Collections Framework (70 Questions)

### Collection Basics (25 Questions)

141. What is Collections Framework in Java?
142. What is the difference between Collection and Collections?
143. What is the hierarchy of Collections Framework?
144. What are the main interfaces in Collections Framework?
145. What is the difference between Collection and Map?
146. What is Iterator in Java?
147. What is the difference between Iterator and Enumeration?
148. What is ListIterator in Java?
149. What is the difference between Iterator and ListIterator?
150. What is fail-fast and fail-safe iterators?
151. What is ConcurrentModificationException?
152. How to avoid ConcurrentModificationException?
153. What is the difference between remove() method of Iterator and Collection?
154. What is Comparable interface in Java?
155. What is Comparator interface in Java?
156. What is the difference between Comparable and Comparator?
157. What is natural ordering in Java?
158. What is the difference between Collections.sort() and Arrays.sort()?
159. What is binary search in Collections?
160. What are utility methods in Collections class?
161. What is the difference between Collections.synchronizedList() and Vector?
162. What is the difference between checked and unchecked collections?
163. What are generic collections in Java?
164. What is diamond operator in Java?
165. What is type erasure in generics?

### List Interface (15 Questions)

166. What is List interface in Java?
167. What are the implementations of List interface?
168. What is the difference between ArrayList and LinkedList?
169. What is the difference between ArrayList and Vector?
170. When to use ArrayList vs LinkedList?
171. What is the initial capacity of ArrayList?
172. How ArrayList grows its size?
173. What is the difference between ArrayList and Array?
174. What is the time complexity of ArrayList operations?
175. What is the time complexity of LinkedList operations?
176. How to synchronize ArrayList?
177. What is CopyOnWriteArrayList?
178. What is the difference between ArrayList and CopyOnWriteArrayList?
179. How to convert Array to ArrayList?
180. How to convert ArrayList to Array?

### Set Interface (15 Questions)

181. What is Set interface in Java?
182. What are the implementations of Set interface?
183. What is the difference between HashSet and LinkedHashSet?
184. What is the difference between HashSet and TreeSet?
185. What is the internal working of HashSet?
186. How HashSet ensures uniqueness?
187. What happens if we add duplicate elements to Set?
188. What is the difference between HashSet and HashMap?
189. What is NavigableSet interface?
190. What is SortedSet interface?
191. What is the difference between SortedSet and NavigableSet?
192. What is CopyOnWriteArraySet?
193. What is EnumSet in Java?
194. How to iterate Set in Java?
195. How to convert Set to List?

### Map Interface (15 Questions)

196. What is Map interface in Java?
197. What are the implementations of Map interface?
198. What is the difference between HashMap and Hashtable?
199. What is the difference between HashMap and LinkedHashMap?
200. What is the difference between HashMap and TreeMap?
201. What is the internal working of HashMap?
202. What is hashing in HashMap?
203. What is collision in HashMap and how it's resolved?
204. What is the time complexity of HashMap operations?
205. What is load factor and initial capacity in HashMap?
206. What happens when load factor is reached in HashMap?
207. What is ConcurrentHashMap?
208. What is the difference between HashMap and ConcurrentHashMap?
209. What is WeakHashMap in Java?
210. What is IdentityHashMap in Java?

---

## 4. Exception Handling (40 Questions)

### Exception Basics (20 Questions)

211. What is Exception in Java?
212. What is the difference between Error and Exception?
213. What is the hierarchy of Exception classes?
214. What are checked and unchecked exceptions?
215. What is the difference between checked and unchecked exceptions?
216. What is RuntimeException in Java?
217. What are some common RuntimeExceptions?
218. What is ClassCastException?
219. What is NullPointerException?
220. What is ArrayIndexOutOfBoundsException?
221. What is NumberFormatException?
222. What is IllegalArgumentException?
223. What is the difference between throw and throws?
224. What is try-catch block in Java?
225. What is finally block in Java?
226. When finally block is not executed?
227. What is try-with-resources in Java?
228. What is the difference between final, finally, and finalize?
229. Can we have multiple catch blocks?
230. What is the order of catch blocks?

### Exception Handling Best Practices (20 Questions)

231. Can we have try block without catch?
232. Can we have nested try-catch blocks?
233. What is exception propagation?
234. What is rethrowing an exception?
235. What is chained exceptions or exception chaining?
236. What is suppressed exceptions in Java?
237. How to create custom exceptions in Java?
238. What are best practices for exception handling?
239. When to use checked vs unchecked exceptions?
240. What is the performance impact of exception handling?
241. What is the difference between getMessage() and printStackTrace()?
242. How to log exceptions properly?
243. What is exception translation?
244. What is exception wrapping?
245. Can we override methods with different exception types?
246. What happens if exception occurs in finally block?
247. What happens if both try and finally blocks throw exceptions?
248. How to handle exceptions in multi-threaded environment?
249. What is fail-fast vs fail-safe exception handling?
250. What are some common exception handling anti-patterns?

---

## 5. Multithreading & Concurrency (60 Questions)

### Thread Basics (20 Questions)

251. What is multithreading in Java?
252. What is the difference between process and thread?
253. What are the advantages of multithreading?
254. What are the ways to create thread in Java?
255. What is the difference between extending Thread and implementing Runnable?
256. Which approach is better: Thread class or Runnable interface?
257. What is the life cycle of a thread?
258. What are different thread states in Java?
259. What is the difference between start() and run() method?
260. What happens if we call run() method directly?
261. What is main thread in Java?
262. What is daemon thread in Java?
263. What is the difference between user thread and daemon thread?
264. How to check if a thread is daemon thread?
265. What is thread priority in Java?
266. What is the range of thread priority?
267. What is the default priority of a thread?
268. Does setting thread priority guarantee execution order?
269. What is thread scheduling?
270. What is preemptive and cooperative multitasking?

### Thread Synchronization (20 Questions)

271. What is thread synchronization?
272. Why do we need synchronization?
273. What is race condition?
274. What is synchronized keyword in Java?
275. What are different ways to achieve synchronization?
276. What is the difference between synchronized method and synchronized block?
277. What is class level synchronization?
278. What is object level synchronization?
279. What is static synchronization?
280. Can we synchronize constructor?
281. What is deadlock in multithreading?
282. How to avoid deadlock?
283. What is livelock?
284. What is starvation in multithreading?
285. What is atomic operations in Java?
286. What is volatile keyword in Java?
287. What is the difference between volatile and synchronized?
288. What is happens-before relationship?
289. What is memory consistency errors?
290. What is thread confinement?

### Advanced Concurrency (20 Questions)

291. What is java.util.concurrent package?
292. What is ExecutorService in Java?
293. What is the difference between Executor and ExecutorService?
294. What are different types of thread pools?
295. What is ThreadPoolExecutor?
296. What is ForkJoinPool?
297. What is CompletableFuture in Java?
298. What is the difference between Future and CompletableFuture?
299. What is CountDownLatch?
300. What is CyclicBarrier?
301. What is Semaphore in Java?
302. What is ReentrantLock?
303. What is the difference between ReentrantLock and synchronized?
304. What is ReadWriteLock?
305. What is AtomicInteger and other atomic classes?
306. What is ConcurrentHashMap and how it works?
307. What is BlockingQueue?
308. What are different implementations of BlockingQueue?
309. What is producer-consumer problem?
310. What is thread-safe and thread-unsafe collections?

---

## 6. Java 8+ Features (50 Questions)

### Lambda Expressions (15 Questions)

311. What is lambda expression in Java 8?
312. What is the syntax of lambda expression?
313. What are the benefits of lambda expressions?
314. What is functional interface?
315. What are built-in functional interfaces in Java 8?
316. What is Predicate functional interface?
317. What is Function functional interface?
318. What is Consumer functional interface?
319. What is Supplier functional interface?
320. What is BiFunction, BiConsumer, BiPredicate?
321. What is method reference in Java 8?
322. What are types of method references?
323. What is constructor reference?
324. What is the difference between lambda expression and anonymous class?
325. Can lambda expressions access local variables?

### Stream API (20 Questions)

326. What is Stream API in Java 8?
327. What are the characteristics of Stream?
328. What is the difference between Collection and Stream?
329. How to create streams in Java?
330. What are intermediate operations in Stream?
331. What are terminal operations in Stream?
332. What is the difference between intermediate and terminal operations?
333. What is filter() operation in Stream?
334. What is map() operation in Stream?
335. What is flatMap() operation in Stream?
336. What is reduce() operation in Stream?
337. What is collect() operation in Stream?
338. What is forEach() operation in Stream?
339. What is parallel stream in Java?
340. What is the difference between sequential and parallel streams?
341. When to use parallel streams?
342. What is Collectors class in Java?
343. What are common Collectors methods?
344. How to convert Stream to List, Set, Map?
345. What is groupingBy collector?

### Optional & Date-Time API (15 Questions)

346. What is Optional class in Java 8?
347. Why was Optional introduced?
348. How to create Optional objects?
349. What is the difference between Optional.of() and Optional.ofNullable()?
350. What are common Optional methods?
351. What is ifPresent() method in Optional?
352. What is orElse() and orElseGet() in Optional?
353. What is orElseThrow() in Optional?
354. What is the new Date-Time API in Java 8?
355. What is LocalDate, LocalTime, LocalDateTime?
356. What is ZonedDateTime?
357. What is the difference between Date and LocalDate?
358. What is DateTimeFormatter?
359. What is Duration and Period?
360. What are the advantages of new Date-Time API over old Date API?

---

## 7. JVM & Memory Management (45 Questions)

### JVM Architecture (20 Questions)

361. What is JVM architecture?
362. What are the components of JVM?
363. What is Class Loader in JVM?
364. What are different types of class loaders?
365. What is the class loading process?
366. What is bytecode verification?
367. What is JIT (Just-In-Time) compiler?
368. What is the difference between interpreter and JIT compiler?
369. What is HotSpot JVM?
370. What is the difference between client and server JVM?
371. What is JVM stack?
372. What is heap memory?
373. What is method area in JVM?
374. What is PC (Program Counter) register?
375. What is native method stack?
376. What is direct memory in JVM?
377. What is metaspace in Java 8?
378. What is the difference between permgen and metaspace?
379. What are JVM flags and parameters?
380. How to monitor JVM performance?

### Memory Management (25 Questions)

381. What is memory management in Java?
382. What is garbage collection?
383. What are different areas of heap memory?
384. What is young generation and old generation?
385. What is eden space, survivor space?
386. What is promotion in garbage collection?
387. What are different garbage collection algorithms?
388. What is mark and sweep algorithm?
389. What is generational garbage collection?
390. What is stop-the-world in garbage collection?
391. What is incremental garbage collection?
392. What is concurrent garbage collection?
393. What is G1 garbage collector?
394. What is ZGC and Shenandoah GC?
395. What are different GC tuning parameters?
396. What is memory leak in Java?
397. How to detect memory leaks?
398. What is OutOfMemoryError?
399. What are different types of OutOfMemoryError?
400. What is heap dump analysis?
401. What tools are used for memory analysis?
402. What is weak reference, soft reference, phantom reference?
403. What is the difference between strong, weak, soft, phantom references?
404. What is memory profiling?
405. What are best practices for memory management?

---

## 8. String Handling (35 Questions)

### String Basics (20 Questions)

406. What is String in Java?
407. Why String is immutable in Java?
408. What are the advantages of String immutability?
409. What is String pool in Java?
410. What is the difference between String literal and new String()?
411. What is intern() method in String?
412. What is the difference between == and equals() for String?
413. What is the difference between String, StringBuffer, and StringBuilder?
414. When to use String vs StringBuffer vs StringBuilder?
415. What is the performance difference between String concatenation methods?
416. What is the + operator for String concatenation?
417. What is concat() method in String?
418. What are common String methods in Java?
419. What is substring() method and its variations?
420. What is indexOf() and lastIndexOf() methods?
421. What is charAt() method?
422. What is length() method vs isEmpty() method?
423. What is trim() method?
424. What is replace() vs replaceAll() vs replaceFirst()?
425. What is split() method in String?

### String Advanced (15 Questions)

426. What is regular expression in String methods?
427. What is matches() method in String?
428. What is the difference between String.valueOf() and toString()?
429. How to convert String to int, float, double?
430. How to convert int, float, double to String?
431. What is String formatting in Java?
432. What is String.format() method?
433. What is printf() style formatting?
434. What is StringBuilder capacity and how it grows?
435. What is StringJoiner class in Java?
436. What is the difference between StringJoiner and String.join()?
437. What is text blocks in Java 13+?
438. What are escape sequences in String?
439. How to handle Unicode characters in String?
440. What are best practices for String handling?

---

## 9. Design Patterns (30 Questions)

### Creational Patterns (10 Questions)

441. What are design patterns in Java?
442. What are the categories of design patterns?
443. What is Singleton design pattern?
444. What are different ways to implement Singleton?
445. What is thread-safe Singleton implementation?
446. What is Factory design pattern?
447. What is Abstract Factory design pattern?
448. What is Builder design pattern?
449. What is Prototype design pattern?
450. When to use creational design patterns?

### Structural Patterns (10 Questions)

451. What is Adapter design pattern?
452. What is Decorator design pattern?
453. What is Facade design pattern?
454. What is Proxy design pattern?
455. What is Bridge design pattern?
456. What is Composite design pattern?
457. What is Flyweight design pattern?
458. When to use structural design patterns?
459. What is the difference between Adapter and Bridge pattern?
460. What is the difference between Decorator and Proxy pattern?

### Behavioral Patterns (10 Questions)

461. What is Observer design pattern?
462. What is Strategy design pattern?
463. What is Command design pattern?
464. What is State design pattern?
465. What is Template Method design pattern?
466. What is Chain of Responsibility design pattern?
467. What is Iterator design pattern?
468. What is Visitor design pattern?
469. What is Mediator design pattern?
470. When to use behavioral design patterns?

---

## 10. Spring Framework (40 Questions)

### Spring Core (20 Questions)

471. What is Spring Framework?
472. What are the features of Spring Framework?
473. What are the modules of Spring Framework?
474. What is Inversion of Control (IoC)?
475. What is Dependency Injection (DI)?
476. What are types of Dependency Injection?
477. What is Spring IoC Container?
478. What is ApplicationContext in Spring?
479. What is BeanFactory vs ApplicationContext?
480. What is Spring Bean?
481. What are Spring Bean scopes?
482. What is singleton scope in Spring?
483. What is prototype scope in Spring?
484. What is bean lifecycle in Spring?
485. What are bean lifecycle methods?
486. What is @Component annotation?
487. What is @Service annotation?
488. What is @Repository annotation?
489. What is @Controller annotation?
490. What is @Autowired annotation?

### Spring Boot (20 Questions)

491. What is Spring Boot?
492. What are the advantages of Spring Boot?
493. What is auto-configuration in Spring Boot?
494. What is @SpringBootApplication annotation?
495. What is application.properties vs application.yml?
496. What is Spring Boot Starter?
497. What are common Spring Boot Starters?
498. What is Spring Boot Actuator?
499. What is embedded server in Spring Boot?
500. What is the difference between Spring and Spring Boot?
501. What is @RestController annotation?
502. What is @RequestMapping annotation?
503. What is @PathVariable and @RequestParam?
504. What is @ResponseBody annotation?
505. What is Spring Boot DevTools?
506. What is Spring Boot Test?
507. What is @SpringBootTest annotation?
508. How to handle exceptions in Spring Boot?
509. What is Spring Boot profiles?
510. How to deploy Spring Boot application?

---

## 11. Advanced Java Topics (30 Questions)

### Reflection & Annotations (15 Questions)

511. What is Reflection in Java?
512. What are the uses of Reflection?
513. What are the disadvantages of Reflection?
514. What is Class class in Java?
515. How to get Class object in Java?
516. What is the difference between getClass() and .class?
517. What are annotations in Java?
518. What are built-in annotations in Java?
519. What is @Override annotation?
520. What is @Deprecated annotation?
521. What is @SuppressWarnings annotation?
522. How to create custom annotations?
523. What is retention policy in annotations?
524. What is target type in annotations?
525. What is annotation processing?

### Serialization & I/O (15 Questions)

526. What is Serialization in Java?
527. What is the purpose of Serialization?
528. What is Deserialization?
529. What is Serializable interface?
530. What is serialVersionUID?
531. What happens if we don't define serialVersionUID?
532. What is Externalizable interface?
533. What is the difference between Serializable and Externalizable?
534. What is transient keyword?
535. What is readObject() and writeObject() methods?
536. What are the rules for Serialization?
537. What is I/O in Java?
538. What are different types of streams in Java?
539. What is the difference between byte stream and character stream?
540. What is NIO (New I/O) in Java?

---

## 📚 Study Recommendations

### For 0-3 Years Experience:
Focus on Questions: 1-200, 406-440 (Basics, OOP, Basic Collections, String Handling)

### For 3-5 Years Experience:
Focus on Questions: 1-350, 406-470 (Add Exceptions, Multithreading, Java 8 Features)

### For 5-8 Years Experience:
Focus on Questions: 1-440, 471-510 (Add JVM, Design Patterns, Spring Basics)

### For 8+ Years Experience:
Focus on All Questions 1-540 (Complete coverage including advanced topics)

---

**Note**: This is a questions-only document. Each question requires detailed answers with code examples, explanations, and practical scenarios. The answers should be prepared separately based on the experience level and specific interview requirements.

**Total Questions**: 540 Questions
**Preparation Time**: 3-6 months depending on experience level
**Next Step**: Create comprehensive answers for each question