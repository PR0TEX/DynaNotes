package pl.edu.pg.projektGrupowy.DynaNotes.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import pl.edu.pg.projektGrupowy.DynaNotes.domain.Note;
import pl.edu.pg.projektGrupowy.DynaNotes.service.NoteService;
/**
 * Kontroler karteczki umożliwiający obsługę zapytań do REST API
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/notes")
@AllArgsConstructor
public class NoteController {
    /**
     * Serwis karteczek
     */
    private final NoteService noteService;
    
    /**
     * Pobiera wszyskie karteczki
     * @return lista pobranych karteczek
     */
    @GetMapping
    public List<Note> fetchAllNotes() {
        return noteService.getAllNotes();
    }
    
    /**
     * Pobiera wskazaną karteczkę.
     * @param id karteczki podanej jako parametr ścieżki URL
     * @return kod odpowiedzi http wraz z obiektem klasy Note
     */
    @GetMapping("/{id}")
    ResponseEntity<?> getNote(@PathVariable String id) {
        Optional<Note> note = noteService.findById(id);
        return note.map(response -> ResponseEntity.ok().body(response))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    /**
     * Umożliwia stworzenie nowego obiektu karteczki o zawartości podanej w formie JSONa
     * @param note obiekt klasy Note
     * @return kod odpowiedzi http wraz ze ścieżką api
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, 
    produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Note> createNote(@RequestBody Note note) throws URISyntaxException {
        Note result = noteService.save(note);
        return ResponseEntity.created(new URI("/api/notes/" + result.getId()))
            .body(result); 
    }
    /**
     * Umożliwia usunięcie karteczki o podanym id
     * @param id identyfikator karteczki
     * @return kod odpowiedzi http
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable String id) {
        Optional<Note> note = noteService.findById(id);
        if (note.isPresent()) {
            noteService.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping
    public ResponseEntity<?> deleteAllNotes() {
        noteService.deleteAll();
        return ResponseEntity.ok().build();
    }

    /**
     * Umożliwia zmianę lokalizacji oraz zawartość karteczki znajdującej się na tablicy
     * @param noteDetails karteczka z nowymi danymi
     * @param id identyfikator karteczki
     * @return http response code
     */
    @PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Note> updateNote(@RequestBody Note noteDetails, @PathVariable String id) {
        Optional<Note> note = noteService.findById(id);
        if (note.isPresent()) {
            note.get().setContents(noteDetails.getContents());
            note.get().setPosition(noteDetails.getPosition());
            note.get().setColor(noteDetails.getColor());
            noteService.update(note.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
