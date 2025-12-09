# ☕ Java Learning Resources & Examples

## 📚 Table of Contents
1. [Java Fundamentals](#java-fundamentals)
2. [Object-Oriented Programming](#object-oriented-programming)
3. [Collections Framework](#collections-framework)
4. [Exception Handling](#exception-handling)
5. [File I/O](#file-io)
6. [Interview Questions](#interview-questions)

---

## 🎯 Java Fundamentals

### **Topics to Master**
- Variables and Data Types
- Operators (Arithmetic, Logical, Relational)
- Control Structures (if-else, switch, loops)
- Methods and Functions
- Arrays and Strings

### **Example 1: Basic Java Program**
```java
public class HelloWorld {
    public static void main(String[] args) {
        // Variables and Data Types
        int age = 25;
        double salary = 50000.50;
        String name = "John Doe";
        boolean isEmployed = true;
        
        // Output
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Salary: " + salary);
        System.out.println("Employed: " + isEmployed);
    }
}
```

### **Example 2: Control Structures**
```java
public class ControlStructures {
    public static void main(String[] args) {
        // If-Else
        int marks = 85;
        if (marks >= 90) {
            System.out.println("Grade: A+");
        } else if (marks >= 80) {
            System.out.println("Grade: A");
        } else {
            System.out.println("Grade: B");
        }
        
        // For Loop
        System.out.println("\nNumbers 1 to 5:");
        for (int i = 1; i <= 5; i++) {
            System.out.print(i + " ");
        }
        
        // While Loop
        System.out.println("\n\nEven numbers:");
        int num = 2;
        while (num <= 10) {
            System.out.print(num + " ");
            num += 2;
        }
    }
}
```

### **Example 3: Arrays and Strings**
```java
public class ArraysAndStrings {
    public static void main(String[] args) {
        // Arrays
        int[] numbers = {10, 20, 30, 40, 50};
        System.out.println("Array length: " + numbers.length);
        System.out.println("First element: " + numbers[0]);
        
        // Loop through array
        System.out.println("\nAll elements:");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        
        // Strings
        String text = "Selenium Automation";
        System.out.println("\n\nString length: " + text.length());
        System.out.println("Uppercase: " + text.toUpperCase());
        System.out.println("Contains 'Auto': " + text.contains("Auto"));
        System.out.println("Substring: " + text.substring(0, 8));
        
        // String split
        String[] words = text.split(" ");
        System.out.println("First word: " + words[0]);
    }
}
```

### **Practice Problems**
1. Write a program to find the largest number in an array
2. Check if a string is palindrome
3. Print Fibonacci series up to n terms
4. Find factorial of a number using recursion
5. Reverse a string without using built-in methods

---

## 🏗️ Object-Oriented Programming

### **Topics to Master**
- Classes and Objects
- Constructors
- Inheritance
- Polymorphism (Method Overloading & Overriding)
- Encapsulation
- Abstraction (Abstract Classes & Interfaces)

### **Example 1: Classes and Objects**
```java
// Class definition
class Employee {
    // Instance variables (Encapsulation - private)
    private String name;
    private int id;
    private double salary;
    
    // Constructor
    public Employee(String name, int id, double salary) {
        this.name = name;
        this.id = id;
        this.salary = salary;
    }
    
    // Getter methods
    public String getName() {
        return name;
    }
    
    public int getId() {
        return id;
    }
    
    public double getSalary() {
        return salary;
    }
    
    // Setter methods
    public void setSalary(double salary) {
        if (salary > 0) {
            this.salary = salary;
        }
    }
    
    // Method
    public void displayInfo() {
        System.out.println("ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Salary: " + salary);
    }
}

// Main class
public class OOPExample {
    public static void main(String[] args) {
        // Creating objects
        Employee emp1 = new Employee("Alice", 101, 50000);
        Employee emp2 = new Employee("Bob", 102, 60000);
        
        // Using objects
        emp1.displayInfo();
        System.out.println();
        emp2.displayInfo();
        
        // Modifying through setter
        emp1.setSalary(55000);
        System.out.println("\nAfter salary update:");
        emp1.displayInfo();
    }
}
```

### **Example 2: Inheritance**
```java
// Parent class
class Vehicle {
    protected String brand;
    protected int year;
    
    public Vehicle(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }
    
    public void displayInfo() {
        System.out.println("Brand: " + brand);
        System.out.println("Year: " + year);
    }
}

// Child class
class Car extends Vehicle {
    private int doors;
    
    public Car(String brand, int year, int doors) {
        super(brand, year);  // Call parent constructor
        this.doors = doors;
    }
    
    // Method overriding
    @Override
    public void displayInfo() {
        super.displayInfo();  // Call parent method
        System.out.println("Doors: " + doors);
    }
    
    public void honk() {
        System.out.println("Beep beep!");
    }
}

public class InheritanceExample {
    public static void main(String[] args) {
        Car myCar = new Car("Toyota", 2023, 4);
        myCar.displayInfo();
        myCar.honk();
    }
}
```

### **Example 3: Polymorphism**
```java
// Method Overloading (Compile-time polymorphism)
class Calculator {
    // Same method name, different parameters
    public int add(int a, int b) {
        return a + b;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

// Method Overriding (Runtime polymorphism)
class Animal {
    public void makeSound() {
        System.out.println("Animal makes a sound");
    }
}

class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Dog barks: Woof!");
    }
}

class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Cat meows: Meow!");
    }
}

public class PolymorphismExample {
    public static void main(String[] args) {
        // Method Overloading
        Calculator calc = new Calculator();
        System.out.println("2 + 3 = " + calc.add(2, 3));
        System.out.println("2.5 + 3.5 = " + calc.add(2.5, 3.5));
        System.out.println("1 + 2 + 3 = " + calc.add(1, 2, 3));
        
        // Method Overriding
        System.out.println("\nPolymorphism:");
        Animal myAnimal = new Animal();
        Animal myDog = new Dog();
        Animal myCat = new Cat();
        
        myAnimal.makeSound();
        myDog.makeSound();
        myCat.makeSound();
    }
}
```

### **Example 4: Interface and Abstract Class**
```java
// Interface
interface Drawable {
    void draw();  // Abstract method (no body)
    
    // Default method (Java 8+)
    default void display() {
        System.out.println("Displaying shape");
    }
}

// Abstract class
abstract class Shape {
    protected String color;
    
    public Shape(String color) {
        this.color = color;
    }
    
    // Abstract method
    abstract double calculateArea();
    
    // Concrete method
    public void printColor() {
        System.out.println("Color: " + color);
    }
}

// Concrete class implementing interface and extending abstract class
class Circle extends Shape implements Drawable {
    private double radius;
    
    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }
    
    @Override
    double calculateArea() {
        return Math.PI * radius * radius;
    }
    
    @Override
    public void draw() {
        System.out.println("Drawing a circle");
    }
}

public class AbstractionExample {
    public static void main(String[] args) {
        Circle circle = new Circle("Red", 5.0);
        circle.draw();
        circle.printColor();
        System.out.println("Area: " + circle.calculateArea());
    }
}
```

---

## 📦 Collections Framework

### **Topics to Master**
- List (ArrayList, LinkedList)
- Set (HashSet, TreeSet)
- Map (HashMap, TreeMap)
- Queue and Stack
- Iterators

### **Example 1: ArrayList**
```java
import java.util.ArrayList;
import java.util.Collections;

public class ArrayListExample {
    public static void main(String[] args) {
        // Create ArrayList
        ArrayList<String> browsers = new ArrayList<>();
        
        // Add elements
        browsers.add("Chrome");
        browsers.add("Firefox");
        browsers.add("Safari");
        browsers.add("Edge");
        
        System.out.println("Browsers: " + browsers);
        System.out.println("Size: " + browsers.size());
        
        // Access element
        System.out.println("First browser: " + browsers.get(0));
        
        // Check if exists
        System.out.println("Contains Chrome? " + browsers.contains("Chrome"));
        
        // Remove element
        browsers.remove("Safari");
        System.out.println("After removal: " + browsers);
        
        // Sort
        Collections.sort(browsers);
        System.out.println("Sorted: " + browsers);
        
        // Iterate
        System.out.println("\nIterating:");
        for (String browser : browsers) {
            System.out.println("- " + browser);
        }
    }
}
```

### **Example 2: HashMap**
```java
import java.util.HashMap;
import java.util.Map;

public class HashMapExample {
    public static void main(String[] args) {
        // Create HashMap
        HashMap<String, String> credentials = new HashMap<>();
        
        // Add key-value pairs
        credentials.put("admin", "admin123");
        credentials.put("user1", "pass123");
        credentials.put("testuser", "test@123");
        
        System.out.println("Credentials: " + credentials);
        
        // Get value by key
        System.out.println("Admin password: " + credentials.get("admin"));
        
        // Check if key exists
        System.out.println("Has user1? " + credentials.containsKey("user1"));
        
        // Check if value exists
        System.out.println("Has pass123? " + credentials.containsValue("pass123"));
        
        // Iterate through HashMap
        System.out.println("\nAll credentials:");
        for (Map.Entry<String, String> entry : credentials.entrySet()) {
            System.out.println("Username: " + entry.getKey() + 
                             ", Password: " + entry.getValue());
        }
        
        // Remove entry
        credentials.remove("testuser");
        System.out.println("\nAfter removal: " + credentials);
    }
}
```

### **Example 3: HashSet**
```java
import java.util.HashSet;

public class HashSetExample {
    public static void main(String[] args) {
        // Create HashSet (no duplicates)
        HashSet<String> testCases = new HashSet<>();
        
        // Add elements
        testCases.add("Login Test");
        testCases.add("Logout Test");
        testCases.add("Search Test");
        testCases.add("Login Test");  // Duplicate - won't be added
        
        System.out.println("Test Cases: " + testCases);
        System.out.println("Size: " + testCases.size());
        
        // Check if exists
        System.out.println("Contains Login Test? " + 
                         testCases.contains("Login Test"));
        
        // Remove element
        testCases.remove("Logout Test");
        System.out.println("After removal: " + testCases);
        
        // Iterate
        System.out.println("\nAll test cases:");
        for (String test : testCases) {
            System.out.println("- " + test);
        }
    }
}
```

---

## ⚠️ Exception Handling

### **Topics to Master**
- try-catch-finally
- throw and throws
- Custom Exceptions
- Multiple catch blocks

### **Example 1: Basic Exception Handling**
```java
public class ExceptionExample {
    public static void main(String[] args) {
        // ArithmeticException
        try {
            int result = 10 / 0;
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Error: Cannot divide by zero");
            System.out.println("Exception: " + e.getMessage());
        }
        
        // ArrayIndexOutOfBoundsException
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Error: Array index out of bounds");
        }
        
        // NullPointerException
        try {
            String text = null;
            System.out.println(text.length());
        } catch (NullPointerException e) {
            System.out.println("Error: Null pointer exception");
        }
        
        System.out.println("Program continues...");
    }
}
```

### **Example 2: Multiple Catch Blocks**
```java
public class MultipleCatchExample {
    public static void main(String[] args) {
        try {
            String text = "123abc";
            int number = Integer.parseInt(text);
            System.out.println("Number: " + number);
        } catch (NumberFormatException e) {
            System.out.println("Error: Invalid number format");
        } catch (Exception e) {
            System.out.println("Error: General exception");
        } finally {
            System.out.println("Finally block always executes");
        }
    }
}
```

### **Example 3: Custom Exception**
```java
// Custom Exception class
class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message);
    }
}

class AgeValidator {
    public static void validateAge(int age) throws InvalidAgeException {
        if (age < 18) {
            throw new InvalidAgeException("Age must be 18 or above");
        } else {
            System.out.println("Age is valid: " + age);
        }
    }
}

public class CustomExceptionExample {
    public static void main(String[] args) {
        try {
            AgeValidator.validateAge(15);
        } catch (InvalidAgeException e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
        
        try {
            AgeValidator.validateAge(25);
        } catch (InvalidAgeException e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
    }
}
```

---

## 📁 File I/O

### **Example: Reading and Writing Files**
```java
import java.io.*;

public class FileIOExample {
    public static void main(String[] args) {
        // Writing to file
        try {
            FileWriter writer = new FileWriter("testdata.txt");
            writer.write("Username: admin\n");
            writer.write("Password: admin123\n");
            writer.write("URL: https://example.com\n");
            writer.close();
            System.out.println("Data written to file successfully");
        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
        
        // Reading from file
        try {
            BufferedReader reader = new BufferedReader(new FileReader("testdata.txt"));
            String line;
            System.out.println("\nReading from file:");
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            reader.close();
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
    }
}
```

---

## 🎯 Interview Questions

### **Basic Level**
1. What is the difference between JDK, JRE, and JVM?
2. Explain the difference between `==` and `.equals()`
3. What is the difference between String, StringBuilder, and StringBuffer?
4. What are access modifiers in Java?
5. Explain method overloading vs method overriding

### **Intermediate Level**
1. What is the difference between ArrayList and LinkedList?
2. Explain HashMap internal working
3. What is the difference between abstract class and interface?
4. What are checked and unchecked exceptions?
5. Explain the concept of garbage collection

### **Advanced Level**
1. What is the difference between `final`, `finally`, and `finalize()`?
2. Explain Java memory model (Heap vs Stack)
3. What are lambda expressions and functional interfaces?
4. Explain the concept of multithreading
5. What is the difference between `Comparable` and `Comparator`?

---

## 📚 Recommended Resources

### **Online Courses**
1. **Udemy**: Java Programming Masterclass by Tim Buchalka
2. **YouTube**: Java Tutorial for Beginners by Programming with Mosh
3. **Coursera**: Java Programming and Software Engineering Fundamentals

### **Practice Platforms**
1. **HackerRank**: Java practice problems
2. **LeetCode**: Coding challenges
3. **CodeChef**: Programming contests
4. **GeeksforGeeks**: Java tutorials and problems

### **Books**
1. "Head First Java" by Kathy Sierra
2. "Effective Java" by Joshua Bloch
3. "Java: The Complete Reference" by Herbert Schildt

---

## ✅ Practice Checklist

- [ ] Complete 100+ basic Java programs
- [ ] Master all OOP concepts with examples
- [ ] Practice Collections Framework extensively
- [ ] Handle exceptions in all programs
- [ ] Solve 50+ coding problems on HackerRank
- [ ] Build 3-5 small Java projects
- [ ] Review and practice interview questions daily

---

**Next**: Proceed to [`03-Selenium-Resources.md`](03-Selenium-Resources.md) for Selenium learning materials.