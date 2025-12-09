# 🌐 Selenium WebDriver Learning Resources & Examples

## 📚 Table of Contents
1. [Selenium Setup](#selenium-setup)
2. [Locators](#locators)
3. [WebDriver Commands](#webdriver-commands)
4. [Waits](#waits)
5. [Handling Web Elements](#handling-web-elements)
6. [Advanced Selenium](#advanced-selenium)
7. [TestNG Integration](#testng-integration)
8. [Interview Questions](#interview-questions)

---

## 🚀 Selenium Setup

### **Prerequisites**
- Java JDK 8 or higher
- Eclipse/IntelliJ IDEA
- Maven (for dependency management)
- Browser drivers (ChromeDriver, GeckoDriver)

### **Maven Dependencies (pom.xml)**
```xml
<dependencies>
    <!-- Selenium Java -->
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.15.0</version>
    </dependency>
    
    <!-- TestNG -->
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.8.0</version>
    </dependency>
    
    <!-- WebDriverManager (Auto driver management) -->
    <dependency>
        <groupId>io.github.bonigarcia</groupId>
        <artifactId>webdrivermanager</artifactId>
        <version>5.6.2</version>
    </dependency>
</dependencies>
```

### **Example 1: First Selenium Script**
```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class FirstSeleniumTest {
    public static void main(String[] args) {
        // Setup ChromeDriver automatically
        WebDriverManager.chromedriver().setup();
        
        // Create WebDriver instance
        WebDriver driver = new ChromeDriver();
        
        // Maximize browser window
        driver.manage().window().maximize();
        
        // Navigate to URL
        driver.get("https://www.google.com");
        
        // Get page title
        String title = driver.getTitle();
        System.out.println("Page Title: " + title);
        
        // Get current URL
        String currentUrl = driver.getCurrentUrl();
        System.out.println("Current URL: " + currentUrl);
        
        // Close browser
        driver.quit();
    }
}
```

---

## 🎯 Locators

### **8 Types of Locators**
1. ID
2. Name
3. Class Name
4. Tag Name
5. Link Text
6. Partial Link Text
7. CSS Selector
8. XPath

### **Example 1: Basic Locators**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class LocatorsExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.saucedemo.com/");
        
        // 1. ID Locator
        WebElement usernameField = driver.findElement(By.id("user-name"));
        usernameField.sendKeys("standard_user");
        
        // 2. Name Locator
        WebElement passwordField = driver.findElement(By.name("password"));
        passwordField.sendKeys("secret_sauce");
        
        // 3. Class Name Locator
        WebElement loginButton = driver.findElement(By.className("submit-button"));
        loginButton.click();
        
        // 4. Tag Name Locator
        WebElement heading = driver.findElement(By.tagName("h1"));
        System.out.println("Heading: " + heading.getText());
        
        driver.quit();
    }
}
```

### **Example 2: XPath Locators**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class XPathExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.saucedemo.com/");
        
        // Absolute XPath (Not recommended - brittle)
        // /html/body/div/div/div/form/input[1]
        
        // Relative XPath (Recommended)
        // 1. Basic XPath
        WebElement username = driver.findElement(By.xpath("//input[@id='user-name']"));
        username.sendKeys("standard_user");
        
        // 2. XPath with contains()
        WebElement password = driver.findElement(By.xpath("//input[contains(@id,'password')]"));
        password.sendKeys("secret_sauce");
        
        // 3. XPath with text()
        WebElement loginBtn = driver.findElement(By.xpath("//input[@value='Login']"));
        loginBtn.click();
        
        // 4. XPath with AND
        WebElement product = driver.findElement(
            By.xpath("//div[@class='inventory_item' and contains(text(),'Sauce')]")
        );
        
        // 5. XPath with OR
        WebElement element = driver.findElement(
            By.xpath("//input[@id='user-name' or @name='user-name']")
        );
        
        // 6. XPath Axes (parent, child, following-sibling)
        // Parent: //input[@id='user-name']/parent::div
        // Following-sibling: //input[@id='user-name']/following-sibling::input
        
        driver.quit();
    }
}
```

### **Example 3: CSS Selectors**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class CSSSelectorsExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.saucedemo.com/");
        
        // 1. CSS with ID (#)
        WebElement username = driver.findElement(By.cssSelector("#user-name"));
        username.sendKeys("standard_user");
        
        // 2. CSS with Class (.)
        WebElement password = driver.findElement(By.cssSelector(".input_error.form_input"));
        password.sendKeys("secret_sauce");
        
        // 3. CSS with attribute
        WebElement loginBtn = driver.findElement(By.cssSelector("input[type='submit']"));
        loginBtn.click();
        
        // 4. CSS with contains (*)
        WebElement element = driver.findElement(By.cssSelector("input[id*='user']"));
        
        // 5. CSS with starts-with (^)
        WebElement elem = driver.findElement(By.cssSelector("input[id^='user']"));
        
        // 6. CSS with ends-with ($)
        WebElement el = driver.findElement(By.cssSelector("input[id$='name']"));
        
        // 7. CSS with child (>)
        WebElement child = driver.findElement(By.cssSelector("div.login_wrapper > div"));
        
        driver.quit();
    }
}
```

---

## 🔧 WebDriver Commands

### **Example 1: Browser Commands**
```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class BrowserCommands {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        
        // 1. get() - Navigate to URL
        driver.get("https://www.google.com");
        
        // 2. getTitle() - Get page title
        String title = driver.getTitle();
        System.out.println("Title: " + title);
        
        // 3. getCurrentUrl() - Get current URL
        String url = driver.getCurrentUrl();
        System.out.println("URL: " + url);
        
        // 4. getPageSource() - Get page source
        String pageSource = driver.getPageSource();
        System.out.println("Page source length: " + pageSource.length());
        
        // 5. navigate().to() - Navigate to URL
        driver.navigate().to("https://www.selenium.dev");
        Thread.sleep(2000);
        
        // 6. navigate().back() - Go back
        driver.navigate().back();
        Thread.sleep(2000);
        
        // 7. navigate().forward() - Go forward
        driver.navigate().forward();
        Thread.sleep(2000);
        
        // 8. navigate().refresh() - Refresh page
        driver.navigate().refresh();
        
        // 9. manage().window().maximize() - Maximize window
        driver.manage().window().maximize();
        
        // 10. close() - Close current window
        // driver.close();
        
        // 11. quit() - Close all windows and end session
        driver.quit();
    }
}
```

### **Example 2: WebElement Commands**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class WebElementCommands {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.saucedemo.com/");
        
        WebElement username = driver.findElement(By.id("user-name"));
        WebElement password = driver.findElement(By.id("password"));
        WebElement loginBtn = driver.findElement(By.id("login-button"));
        
        // 1. sendKeys() - Enter text
        username.sendKeys("standard_user");
        password.sendKeys("secret_sauce");
        
        // 2. click() - Click element
        loginBtn.click();
        
        // 3. getText() - Get text
        WebElement title = driver.findElement(By.className("title"));
        System.out.println("Title: " + title.getText());
        
        // 4. getAttribute() - Get attribute value
        String className = title.getAttribute("class");
        System.out.println("Class: " + className);
        
        // 5. isDisplayed() - Check if visible
        boolean isDisplayed = title.isDisplayed();
        System.out.println("Is displayed: " + isDisplayed);
        
        // 6. isEnabled() - Check if enabled
        boolean isEnabled = title.isEnabled();
        System.out.println("Is enabled: " + isEnabled);
        
        // 7. isSelected() - Check if selected (for checkboxes/radio)
        // boolean isSelected = checkbox.isSelected();
        
        // 8. clear() - Clear text field
        // username.clear();
        
        // 9. submit() - Submit form
        // loginBtn.submit();
        
        driver.quit();
    }
}
```

---

## ⏰ Waits

### **Types of Waits**
1. **Implicit Wait**: Global wait for all elements
2. **Explicit Wait**: Wait for specific condition
3. **Fluent Wait**: Wait with polling interval

### **Example 1: Implicit Wait**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;

public class ImplicitWaitExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        // Implicit Wait - applies to all findElement calls
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        
        driver.get("https://www.saucedemo.com/");
        
        // Will wait up to 10 seconds for element to appear
        driver.findElement(By.id("user-name")).sendKeys("standard_user");
        driver.findElement(By.id("password")).sendKeys("secret_sauce");
        driver.findElement(By.id("login-button")).click();
        
        driver.quit();
    }
}
```

### **Example 2: Explicit Wait**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;

public class ExplicitWaitExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.saucedemo.com/");
        
        // Create WebDriverWait object
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        // Wait for element to be visible
        WebElement username = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.id("user-name"))
        );
        username.sendKeys("standard_user");
        
        // Wait for element to be clickable
        WebElement password = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("password"))
        );
        password.sendKeys("secret_sauce");
        
        // Wait for element to be present
        WebElement loginBtn = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("login-button"))
        );
        loginBtn.click();
        
        // Wait for title to contain text
        wait.until(ExpectedConditions.titleContains("Swag Labs"));
        
        // Wait for URL to contain text
        wait.until(ExpectedConditions.urlContains("inventory"));
        
        driver.quit();
    }
}
```

### **Example 3: Fluent Wait**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;

public class FluentWaitExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.saucedemo.com/");
        
        // Fluent Wait with polling
        Wait<WebDriver> wait = new FluentWait<>(driver)
            .withTimeout(Duration.ofSeconds(30))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(NoSuchElementException.class);
        
        WebElement username = wait.until(driver1 -> 
            driver1.findElement(By.id("user-name"))
        );
        username.sendKeys("standard_user");
        
        driver.quit();
    }
}
```

---

## 🎨 Handling Web Elements

### **Example 1: Dropdowns**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;
import io.github.bonigarcia.wdm.WebDriverManager;
import java.util.List;

public class DropdownExample {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.globalsqa.com/demo-site/select-dropdown-menu/");
        
        // Locate dropdown
        WebElement dropdown = driver.findElement(By.tagName("select"));
        
        // Create Select object
        Select select = new Select(dropdown);
        
        // Select by visible text
        select.selectByVisibleText("India");
        Thread.sleep(2000);
        
        // Select by value
        select.selectByValue("AUS");
        Thread.sleep(2000);
        
        // Select by index
        select.selectByIndex(5);
        Thread.sleep(2000);
        
        // Get all options
        List<WebElement> options = select.getOptions();
        System.out.println("Total options: " + options.size());
        
        // Print all options
        for (WebElement option : options) {
            System.out.println(option.getText());
        }
        
        // Get selected option
        WebElement selectedOption = select.getFirstSelectedOption();
        System.out.println("Selected: " + selectedOption.getText());
        
        driver.quit();
    }
}
```

### **Example 2: Checkboxes and Radio Buttons**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class CheckboxRadioExample {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://demo.automationtesting.in/Register.html");
        
        // Handle Checkbox
        WebElement cricketCheckbox = driver.findElement(By.id("checkbox1"));
        
        // Check if already selected
        if (!cricketCheckbox.isSelected()) {
            cricketCheckbox.click();
            System.out.println("Cricket checkbox selected");
        }
        
        Thread.sleep(2000);
        
        // Uncheck
        if (cricketCheckbox.isSelected()) {
            cricketCheckbox.click();
            System.out.println("Cricket checkbox unselected");
        }
        
        // Handle Radio Button
        WebElement maleRadio = driver.findElement(By.xpath("//input[@value='Male']"));
        maleRadio.click();
        System.out.println("Male radio selected: " + maleRadio.isSelected());
        
        driver.quit();
    }
}
```

### **Example 3: Alerts**
```java
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class AlertsExample {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://the-internet.herokuapp.com/javascript_alerts");
        
        // 1. Simple Alert
        driver.findElement(By.xpath("//button[text()='Click for JS Alert']")).click();
        Thread.sleep(1000);
        
        Alert alert = driver.switchTo().alert();
        System.out.println("Alert text: " + alert.getText());
        alert.accept(); // Click OK
        Thread.sleep(1000);
        
        // 2. Confirmation Alert
        driver.findElement(By.xpath("//button[text()='Click for JS Confirm']")).click();
        Thread.sleep(1000);
        
        Alert confirmAlert = driver.switchTo().alert();
        System.out.println("Confirm text: " + confirmAlert.getText());
        confirmAlert.dismiss(); // Click Cancel
        Thread.sleep(1000);
        
        // 3. Prompt Alert
        driver.findElement(By.xpath("//button[text()='Click for JS Prompt']")).click();
        Thread.sleep(1000);
        
        Alert promptAlert = driver.switchTo().alert();
        promptAlert.sendKeys("Selenium Test");
        promptAlert.accept();
        
        driver.quit();
    }
}
```

### **Example 4: Frames**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class FramesExample {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://the-internet.herokuapp.com/iframe");
        
        // Switch to frame by index
        // driver.switchTo().frame(0);
        
        // Switch to frame by name or ID
        // driver.switchTo().frame("mce_0_ifr");
        
        // Switch to frame by WebElement
        WebElement frameElement = driver.findElement(By.id("mce_0_ifr"));
        driver.switchTo().frame(frameElement);
        
        // Now interact with elements inside frame
        WebElement textArea = driver.findElement(By.id("tinymce"));
        textArea.clear();
        textArea.sendKeys("Selenium Frame Example");
        
        // Switch back to main content
        driver.switchTo().defaultContent();
        
        // Or switch to parent frame
        // driver.switchTo().parentFrame();
        
        driver.quit();
    }
}
```

### **Example 5: Multiple Windows**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;
import java.util.Set;

public class WindowHandlingExample {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://the-internet.herokuapp.com/windows");
        
        // Get current window handle
        String parentWindow = driver.getWindowHandle();
        System.out.println("Parent Window: " + parentWindow);
        
        // Click link to open new window
        driver.findElement(By.linkText("Click Here")).click();
        Thread.sleep(2000);
        
        // Get all window handles
        Set<String> allWindows = driver.getWindowHandles();
        System.out.println("Total windows: " + allWindows.size());
        
        // Switch to new window
        for (String window : allWindows) {
            if (!window.equals(parentWindow)) {
                driver.switchTo().window(window);
                System.out.println("New Window Title: " + driver.getTitle());
                Thread.sleep(2000);
                driver.close(); // Close new window
            }
        }
        
        // Switch back to parent window
        driver.switchTo().window(parentWindow);
        System.out.println("Back to Parent: " + driver.getTitle());
        
        driver.quit();
    }
}
```

---

## 🚀 Advanced Selenium

### **Example 1: Actions Class**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import io.github.bonigarcia.wdm.WebDriverManager;

public class ActionsClassExample {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.amazon.in/");
        
        // Create Actions object
        Actions actions = new Actions(driver);
        
        // Mouse Hover
        WebElement accountMenu = driver.findElement(By.id("nav-link-accountList"));
        actions.moveToElement(accountMenu).perform();
        Thread.sleep(2000);
        
        // Right Click (Context Click)
        actions.contextClick(accountMenu).perform();
        Thread.sleep(2000);
        
        // Double Click
        // actions.doubleClick(element).perform();
        
        // Drag and Drop
        // WebElement source = driver.findElement(By.id("source"));
        // WebElement target = driver.findElement(By.id("target"));
        // actions.dragAndDrop(source, target).perform();
        
        // Click and Hold
        // actions.clickAndHold(element).perform();
        
        // Release
        // actions.release().perform();
        
        driver.quit();
    }
}
```

### **Example 2: JavaScript Executor**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class JavaScriptExecutorExample {
    public static void main(String[] args) throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.amazon.in/");
        
        // Create JavascriptExecutor object
        JavascriptExecutor js = (JavascriptExecutor) driver;
        
        // 1. Click element using JS
        WebElement searchBox = driver.findElement(By.id("twotabsearchtextbox"));
        js.executeScript("arguments[0].value='Laptop';", searchBox);
        Thread.sleep(2000);
        
        // 2. Scroll down
        js.executeScript("window.scrollBy(0, 500);");
        Thread.sleep(2000);
        
        // 3. Scroll to bottom
        js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
        Thread.sleep(2000);
        
        // 4. Scroll to element
        WebElement footer = driver.findElement(By.linkText("About Amazon"));
        js.executeScript("arguments[0].scrollIntoView(true);", footer);
        Thread.sleep(2000);
        
        // 5. Get page title using JS
        String title = (String) js.executeScript("return document.title;");
        System.out.println("Title: " + title);
        
        // 6. Highlight element
        js.executeScript("arguments[0].style.border='3px solid red';", searchBox);
        Thread.sleep(2000);
        
        // 7. Refresh page
        js.executeScript("location.reload();");
        
        driver.quit();
    }
}
```

### **Example 3: Taking Screenshots**
```java
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.io.FileUtils;
import java.io.File;
import java.io.IOException;

public class ScreenshotExample {
    public static void main(String[] args) throws IOException {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        
        driver.get("https://www.google.com");
        
        // Take screenshot
        TakesScreenshot ts = (TakesScreenshot) driver;
        File source = ts.getScreenshotAs(OutputType.FILE);
        
        // Save screenshot
        File destination = new File("./screenshots/google_homepage.png");
        FileUtils.copyFile(source, destination);
        
        System.out.println("Screenshot saved: " + destination.getAbsolutePath());
        
        driver.quit();
    }
}
```

---

## 🧪 TestNG Integration

### **Example 1: Basic TestNG Test**
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;
import io.github.bonigarcia.wdm.WebDriverManager;

public class TestNGExample {
    WebDriver driver;
    
    @BeforeClass
    public void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }
    
    @Test(priority = 1)
    public void testLogin() {
        driver.get("https://www.saucedemo.com/");
        
        driver.findElement(By.id("user-name")).sendKeys("standard_user");
        driver.findElement(By.id("password")).sendKeys("secret_sauce");
        driver.findElement(By.id("login-button")).click();
        
        String expectedTitle = "Swag Labs";
        String actualTitle = driver.getTitle();
        Assert.assertEquals(actualTitle, expectedTitle, "Title mismatch!");
    }
    
    @Test(priority = 2, dependsOnMethods = "testLogin")
    public void testAddToCart() {
        driver.findElement(By.xpath("//button[@id='add-to-cart-sauce-labs-backpack']")).click();
        
        String cartBadge = driver.findElement(By.className("shopping_cart_badge")).getText();
        Assert.assertEquals(cartBadge, "1", "Cart count mismatch!");
    }
    
    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

### **Example 2: TestNG Annotations**
```java
import org.testng.annotations.*;

public class TestNGAnnotations {
    
    @BeforeSuite
    public void beforeSuite() {
        System.out.println("Before Suite - Runs once before all tests");
    }
    
    @BeforeTest
    public void beforeTest() {
        System.out.println("Before Test - Runs before each <test> tag");
    }
    
    @BeforeClass
    public void beforeClass() {
        System
        System.out.println("Before Class - Runs once before class");
    }
    
    @BeforeMethod
    public void beforeMethod() {
        System.out.println("Before Method - Runs before each test method");
    }
    
    @Test
    public void test1() {
        System.out.println("Test 1 executed");
    }
    
    @Test
    public void test2() {
        System.out.println("Test 2 executed");
    }
    
    @AfterMethod
    public void afterMethod() {
        System.out.println("After Method - Runs after each test method");
    }
    
    @AfterClass
    public void afterClass() {
        System.out.println("After Class - Runs once after class");
    }
    
    @AfterTest
    public void afterTest() {
        System.out.println("After Test - Runs after each <test> tag");
    }
    
    @AfterSuite
    public void afterSuite() {
        System.out.println("After Suite - Runs once after all tests");
    }
}
```

### **Example 3: TestNG Assertions**
```java
import org.testng.Assert;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

public class TestNGAssertions {
    
    @Test
    public void hardAssertions() {
        // Hard Assertions - Test stops on first failure
        
        // 1. assertEquals
        Assert.assertEquals("Selenium", "Selenium", "Strings don't match");
        
        // 2. assertTrue
        Assert.assertTrue(5 > 3, "Condition is false");
        
        // 3. assertFalse
        Assert.assertFalse(5 < 3, "Condition is true");
        
        // 4. assertNotNull
        String text = "Test";
        Assert.assertNotNull(text, "Object is null");
        
        // 5. assertNull
        String nullText = null;
        Assert.assertNull(nullText, "Object is not null");
    }
    
    @Test
    public void softAssertions() {
        // Soft Assertions - Test continues even after failure
        SoftAssert softAssert = new SoftAssert();
        
        softAssert.assertEquals("Selenium", "Selenium");
        softAssert.assertTrue(5 > 3);
        softAssert.assertFalse(5 < 3);
        
        // Must call assertAll() at the end
        softAssert.assertAll();
    }
}
```

---

## 🎯 Interview Questions

### **Basic Level**
1. What is Selenium? What are its components?
2. What is the difference between `driver.close()` and `driver.quit()`?
3. What are locators in Selenium? Name all 8 types.
4. What is the difference between absolute and relative XPath?
5. What is WebDriver? How is it different from Selenium RC?

### **Intermediate Level**
1. Explain different types of waits in Selenium
2. How do you handle dropdowns in Selenium?
3. How do you handle alerts/popups in Selenium?
4. What is the difference between `findElement()` and `findElements()`?
5. How do you handle frames in Selenium?
6. How do you take screenshots in Selenium?
7. What is Actions class? When do you use it?
8. How do you handle multiple windows in Selenium?

### **Advanced Level**
1. What is Page Object Model (POM)? Why is it used?
2. How do you handle dynamic elements in Selenium?
3. What is JavaScriptExecutor? When do you use it?
4. How do you handle SSL certificates in Selenium?
5. What is the difference between implicit and explicit wait?
6. How do you perform parallel execution in Selenium?
7. Explain Selenium Grid and its architecture
8. How do you integrate Selenium with TestNG/JUnit?

### **Scenario-Based Questions**
1. How would you automate a scenario where an element is not clickable?
2. How do you handle CAPTCHA in automation?
3. How do you verify if an element is present on the page?
4. How do you handle file upload in Selenium?
5. How do you handle calendar/date picker in Selenium?

---

## 📚 Recommended Resources

### **Online Courses**
1. **Udemy**: 
   - Selenium WebDriver with Java by Rahul Shetty
   - Complete Selenium WebDriver with Java by Karthik KK
2. **YouTube**:
   - Naveen AutomationLabs
   - Raghav Pal (AutomationStepByStep)
   - Software Testing Mentor
3. **Official Documentation**: https://www.selenium.dev/documentation/

### **Practice Websites**
1. https://www.saucedemo.com/
2. https://the-internet.herokuapp.com/
3. https://demo.automationtesting.in/
4. https://www.globalsqa.com/demo-site/
5. https://automationexercise.com/

### **Books**
1. "Selenium WebDriver 3 Practical Guide" by Unmesh Gundecha
2. "Selenium Testing Tools Cookbook" by Unmesh Gundecha

---

## ✅ Practice Checklist

- [ ] Set up Selenium with Java and Maven
- [ ] Practice all 8 types of locators
- [ ] Master XPath and CSS Selectors
- [ ] Implement all types of waits
- [ ] Handle dropdowns, alerts, frames, windows
- [ ] Use Actions class for mouse/keyboard operations
- [ ] Implement JavaScriptExecutor
- [ ] Take screenshots on test failure
- [ ] Integrate with TestNG
- [ ] Create 10+ automation scripts
- [ ] Automate 3-5 real websites end-to-end

---

## 🚀 Next Steps

1. Complete all examples in this document
2. Practice on different websites
3. Move to [`04-API-Testing-Resources.md`](04-API-Testing-Resources.md)
4. Build a complete automation framework

---

**Pro Tips**:
- Always use explicit waits over implicit waits
- Prefer CSS Selectors over XPath for better performance
- Use Page Object Model for maintainable code
- Handle exceptions properly
- Take screenshots on failures
- Use meaningful test names and comments