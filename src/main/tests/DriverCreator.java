import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class DriverCreator {
    public static WebDriver getChromeBrowser() {
        //TODO change location
        System.setProperty("webdriver.chrome.driver", "/usr/src/app/chromedriver");

        return new ChromeDriver(getChromeHeadlessOptions());
    }

    private static ChromeOptions getChromeHeadlessOptions() {
        ChromeOptions options = new ChromeOptions();
        options.setHeadless(true);
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        return options;
    }
}
