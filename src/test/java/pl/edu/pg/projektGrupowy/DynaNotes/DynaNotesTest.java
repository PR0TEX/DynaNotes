package pl.edu.pg.projektGrupowy.DynaNotes;

import static org.junit.Assert.assertEquals;

import java.util.NoSuchElementException;
import java.util.Random;

import org.junit.After;
import org.junit.Before;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.boot.test.context.SpringBootTest;

class DynaNotesTest {

	public WebDriver getChromeBrowser() {
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
	
	private WebDriver driver;
	
	@Before
	void setUp() {
		driver = this.getChromeBrowser();
		driver.get(System.getProperty("http://localhost:3000/")); //TODO depends on implementation
	}

	@After
	void close() {
		if ( driver != null) {
			driver.quit();
		}
	}

	//Zmiana koloru zła

	@Test
	public void whenStickyNoteIsCreatedThenItIsPinnedToTheBoard() {
		//Depends from number of created notes check instances of class note_yellow
		driver.findElement(Selectors.CreateStickyNoteSelector.getBy()).sendKeys("TEST");
		// driver.findElement(Selectors.AddStickyNoteButtonSelector.getBy()).click();

		// try{
			// driver.findElement(Selectors.YellowStickyNoteSelector.getBy());
		// }catch (NoSuchElementException e){
			// throw new NoSuchElementException();
		// }
		//TODO generate new element with id
		// assertThat(driver.findElement(Selectors.CreatedElementSelector.getBy()));
	}
	//CO JAK KARTECZKI NIE MA
	// @Test
	// public void whenNoteContentIsEditedThenContentChanges() {
	// 	String edited_content="edited Content";
	// 	driver.findElement(Selectors.EditStickyNoteSelector.getBy()).click();
	// 	driver.findElement(Selectors.EditStickyNoteContentSelector.getBy()).sendKeys(edited_content);

	// 	assertEquals(driver.findElement(Selectors.EditStickyNoteContentSelector.getBy()).getText(),edited_content);
	// }
	// String getStyle(String color) {
	// 	return "background " + color;
	// }
	// String getRandomColor(String colors[]) {
	// 	int index = new Random().nextInt(colors.length);
	// 	return colors[index];
	// }
	// @Test
	// public void whenNoteColorIsChangedThenNoteHasNewColor() {
	// 	String colors[] = {"yellow", "cyan", "green", "magenta", "orange", "purple"};
	// 	//TODO add color-style info to the note
	// 	String prevNoteColor = driver.findElement(Selectors.StickyNoteSelector.getBy()).getAttribute("style");
	// 	String color = getRandomColor(colors.remove(prevNoteColor));

	// 	driver.findElement(Selectors.ChangeColorButtonSelector.getBy()).click();
	// 	WebElement noteColorElement = getRandomColorElement(color);
	// 	noteColorElement.click();

	// 	assertEquals(driver.findElement(Selectors.StickyNoteSelector.getBy()).getAttribute("style"), getStyle(color));

	// }

	// @Test
	// public void whenNoteIsDeletedThenNoteDisappears() {
	// 	//Generate id and check if is dissapear
	// 	driver.findElement(Selectors.DeleteStickyNoteSelector.getBy()).click();

	// }

}
