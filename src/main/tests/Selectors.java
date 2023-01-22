import lombok.Getter;
import org.openqa.selenium.By;
@Getter
public enum Selectors {
    CreateStickyNoteSelector(By.id("create_new_note")),
    AddStickyNoteButtonSelector(By.id("add_note_button")),
    YellowStickyNoteSelector(By.classname("note yellow")),
    //TODO change id
    EditStickyNoteSelector(By.id("note1_")),
    EditStickyNoteContentSelector(By.classname("editBox"));
    private final By by;
    Selectors(By by) {
          this.by = by;
    }
}
