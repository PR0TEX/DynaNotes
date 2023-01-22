package pl.edu.pg.projektGrupowy.DynaNotes;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

class DynaNotesTest {

	private WebDriver driver;
	@Before
	void setUp() {
		driver = DriverCreator.getChromeBrowser();
		driver.get(System.getProperty("http://localhost:3000/")) //TODO depends on implementation
	}

	@After
	void close() {
		if ( driver != null) {
			driver.quit();
		}
	}

	@Test
	public void whenStickyNoteIsCreatedThenItIsPinnedToTheBoard() {
		//Depends from number of created notes check instances of class note_yellow
		driver.findElement(CreateStickyNoteSelector.getBy()).sendKeys("TEST");
		driver.findElement(AddStickyNoteButtonSelector.getBy()).click();

		try{
			driver.findElement(YellowStickyNoteSelector.getBy());
		}catch (NoSuchElementException e){
			throw new NoSuchElementException();
		}
		//TODO generate new element with id
		assertThat(driver.findElement(CreatedElementSelector.getBy()));
	}

	@Test
	public void whenNoteContentIsEditedThenContentChanges() {
		String edited_content="edited Content";
		driver.findElement(EditStickyNoteSelector.getBy()).click();
		driver.findElement(EditStickyNoteContentSelector.getBy()).sendKeys(edited_content);

		assertEquals(driver.findElement(EditStickyNoteContentSelector.getBy()).getText(),edited_content);
	}
	String getStyle(String color) {
		return "background " + color;
	}
	String getRandomColor(String colors[]) {
		int index = new Random().nextInt(colors.length);
		return colors[index];
	}
	@Test
	public void whenNoteColorIsChangedThenNoteHasNewColor() {
		String colors[] = {"yellow", "cyan", "green", "magenta", "orange", "purple"};
		//TODO add color-style info to the note
		String prevNoteColor = driver.findElement(StickyNoteSelector.getBy()).getAttribute("style");
		String color = getRandomColor(colors.remove(prevNoteColor));

		driver.findElement(ChangeColorButtonSelector.getBy()).click();
		WebElement noteColorElement = getRandomColorElement(color);
		driver.findElemet(noteColorElement).click();

		assertEquals(driver.findElement(StickyNoteSelector.getBy()).getAttribute("style"), getStyle(color));

	}

	@Test
	public void whenNoteIsDeletedThenNoteDisappears() {
		//Generate id and check if is dissapear
		driver.findElement(DeleteStickyNoteSelector.getBy()).click();

	}

}
