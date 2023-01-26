package pl.edu.pg.projektGrupowy.DynaNotes;

import lombok.Getter;
import org.openqa.selenium.By;
@Getter
public enum Selectors {
    CreateStickyNoteSelector(By.id("create_new_note")),
    AddStickyNoteButtonSelector(By.id("add_note_button")),
    YellowStickyNoteSelector(By.className("note yellow")),
    EditStickyNoteContentSelector(By.className("editBox")),
    ChangeColorButtonSelector(By.className("palette")),
    NoteColorSelector(By.className("colorPicker")),
    DeleteStickyNoteSelector(By.className("close")),
    ChangeThemeSelector(By.className("slider")),
    DarkBoardThemeSelector(By.className("dark"));
    private final By by;
    Selectors(By by) {
          this.by = by;
    }
}
