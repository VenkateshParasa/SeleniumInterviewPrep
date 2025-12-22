// Embedded Data for Local Mode
// Contains sample data when API is not available
// Created: December 19, 2025

window.QUESTIONS_DATA = {
    categories: [
        {
            id: "java",
            name: "Java",
            icon: "fab fa-java",
            questions: [
                {
                    id: "java-001",
                    question: "What is the difference between JDK, JRE, and JVM?",
                    answer: "JDK (Java Development Kit) is a software development environment used for developing Java applications. JRE (Java Runtime Environment) provides the libraries, Java Virtual Machine (JVM), and other components to run applications written in Java. JVM (Java Virtual Machine) is an abstract machine that enables your computer to run a Java program.",
                    difficulty: "Easy",
                    tags: ["basics", "jvm", "jdk", "jre"]
                },
                {
                    id: "java-002", 
                    question: "Explain the concept of Object-Oriented Programming in Java.",
                    answer: "Object-Oriented Programming (OOP) in Java is based on four main principles: Encapsulation (bundling data and methods), Inheritance (creating new classes based on existing ones), Polymorphism (objects taking multiple forms), and Abstraction (hiding complex implementation details).",
                    difficulty: "Medium",
                    tags: ["oop", "concepts", "inheritance", "polymorphism"]
                }
            ]
        },
        {
            id: "selenium",
            name: "Selenium",
            icon: "fas fa-robot",
            questions: [
                {
                    id: "selenium-001",
                    question: "What is Selenium WebDriver?",
                    answer: "Selenium WebDriver is a web automation framework that allows you to execute tests across different browsers and platforms. It provides a programming interface to create and execute test scripts in various programming languages like Java, Python, C#, etc.",
                    difficulty: "Easy",
                    tags: ["webdriver", "automation", "testing"]
                }
            ]
        },
        {
            id: "testng",
            name: "TestNG",
            icon: "fas fa-vial",
            questions: [
                {
                    id: "testng-001",
                    question: "What are the advantages of TestNG over JUnit?",
                    answer: "TestNG provides several advantages: annotations are easier to understand, flexible test configuration, support for data-driven testing, parallel execution, dependent test methods, and better reporting capabilities.",
                    difficulty: "Medium",
                    tags: ["testng", "junit", "testing", "framework"]
                }
            ]
        }
    ]
};

console.log('✅ Embedded data loaded successfully');