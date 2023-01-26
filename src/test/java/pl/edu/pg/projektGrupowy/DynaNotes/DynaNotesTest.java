package pl.edu.pg.projektGrupowy.DynaNotes;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.junit.After;
import org.junit.Assert;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

class DynaNotesTest {

	public WebDriver getChromeBrowser() {
        System.setProperty("webdriver.chrome.driver", "/home/driver/chromedriver");

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
	
	@BeforeEach
	void setUp() {
		driver = this.getChromeBrowser();
		driver.get(System.getProperty("http://localhost:3000/"));
	}

	@After
	void close() {
		if ( driver != null) {
			driver.quit();
		}
	}

	@Test
	public void whenStickyNoteIsCreatedThenItIsPinnedToTheBoard() {
		driver.findElement(Selectors.CreateStickyNoteSelector.getBy()).sendKeys("TEST");
		driver.findElement(Selectors.AddStickyNoteButtonSelector.getBy()).click();

		try{
			driver.findElement(Selectors.YellowStickyNoteSelector.getBy());
		}catch (NoSuchElementException e){
			Assert.fail("Note not added");
		}
	}

	@Test
	public void whenNoteContentIsEditedThenContentChanges() {
		String edited_content="edited Content";
		driver.findElement(Selectors.YellowStickyNoteSelector.getBy()).click();
		driver.findElement(Selectors.EditStickyNoteContentSelector.getBy()).sendKeys(edited_content);

	 	assertEquals(driver.findElement(Selectors.EditStickyNoteContentSelector.getBy()).getText(),edited_content);
	}

	@Test
	public void whenNoteIsDeletedThenNoteDisappears() {
	 	driver.findElement(Selectors.DeleteStickyNoteSelector.getBy()).click();
		
		try{
			driver.findElement(Selectors.YellowStickyNoteSelector.getBy());
		}catch(NoSuchElementException e){
			return;
		}
		Assert.fail("The note has not been deleted");

	}
	
	@Test
	public void whenNoteColorIsChangedThenNoteHasNewColor() {
		String prevNoteColor = driver.findElement(Selectors.YellowStickyNoteSelector.getBy()).getAttribute("class").split(" ")[0];
		ArrayList<String> colors = getAvailableColors(prevNoteColor);
		String color = getRandomColor(colors);

		driver.findElement(Selectors.ChangeColorButtonSelector.getBy()).click();
		WebElement noteColorElement = getRandomColorElement(color).get();
		try{
			noteColorElement.click();
		}catch(NoSuchElementException e){
			Assert.fail("Note with new color is not available");
		}
	}

	ArrayList<String> getAvailableColors(String color){
		String colors[] = {"yellow", "cyan", "green", "magenta", "orange", "purple"};
		ArrayList<String>  availableColors = (ArrayList<String>) Arrays.stream(colors).collect(Collectors.toList());
		availableColors.remove(color);

		return availableColors;
	}

	String getRandomColor(ArrayList<String> colors) {
		int index = new Random().nextInt(colors.size() - 1);
		return colors.get(index);
	}

	Optional<WebElement> getRandomColorElement(String color) {
		return driver.findElements(Selectors.NoteColorSelector.getBy())
			.stream()	
			.filter(noteColor -> noteColor.getAttribute("style").equals(getStyle(color)))	
			.findFirst();	
	}

	String getStyle(String color) {
		return "background: " + color;
	}

	@Test
	public void whenDarkModeIsSelectedThenBackgroundColorChanges() {
		driver.findElement(Selectors.ChangeThemeSelector.getBy()).click();
		try{
			driver.findElement(Selectors.DarkBoardThemeSelector.getBy());
		}catch(NoSuchElementException e){
			Assert.fail("The color theme has not been changed");
		}
	}
}
