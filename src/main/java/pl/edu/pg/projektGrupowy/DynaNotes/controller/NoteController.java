package pl.edu.pg.projektGrupowy.DynaNotes.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.AllArgsConstructor;
import pl.edu.pg.projektGrupowy.DynaNotes.domain.Note;
import pl.edu.pg.projektGrupowy.DynaNotes.service.NoteService;
/**
 * Kontroler karteczki umożliwiający obsługę zapytań do REST API
 */
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/notes")
@OpenAPIDefinition(info=@Info(title="DynaNotes"))
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
    @Operation(summary = "Fetch all available notes")
    @ApiResponse(responseCode = "200", description = "Successful fetched all available notes")
    public List<Note> fetchAllNotes() {
        return noteService.getAllNotes();
    }
    
    /**
     * Pobiera wskazaną karteczkę.
     * @param id karteczki podanej jako parametr ścieżki URL
     * @return kod odpowiedzi http wraz z obiektem klasy Note
     */
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @Operation(summary = "Get note with specific id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful fetched note", content = @Content(schema = @Schema(implementation = Note.class))),
            @ApiResponse(responseCode = "404", description = "Note does not exist", content = @Content)
    })
    ResponseEntity<?> getNote(@Parameter(description = "id of note to be searched") @PathVariable String id) {
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
    @Operation(summary = "Create new note")
    @ApiResponse(responseCode = "201", description = "Successful created note")
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
    @Operation(summary = "Delete note with specific id")
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful deleted note", content = @Content),
            @ApiResponse(responseCode = "404", description = "Note does not exist", content = @Content)
    })
    public ResponseEntity<?> deleteNote(@Parameter(description = "id of note to be searched") @PathVariable String id) {
        Optional<Note> note = noteService.findById(id);
        if (note.isPresent()) {
            noteService.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping
    @Operation(summary = "Successful deleted all notes")
    @ApiResponse(responseCode = "200", description = "Successful deleted note", content = @Content)
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
    @Operation(summary = "Update note with specific id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful update of the note", content = @Content),
            @ApiResponse(responseCode = "404", description = "Note does not exist", content = @Content)
    })
    public ResponseEntity<Note> updateNote(@RequestBody Note noteDetails, @Parameter(description = "id of note to be searched") @PathVariable String id) {
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
