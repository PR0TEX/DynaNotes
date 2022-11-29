package pl.edu.pg.projektGrupowy.DynaNotes.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import pl.edu.pg.projektGrupowy.DynaNotes.domain.Note;
import pl.edu.pg.projektGrupowy.DynaNotes.repository.NoteRepository;
import pl.edu.pg.projektGrupowy.DynaNotes.service.NoteService;

@RestController
@RequestMapping("/api/notes")
@AllArgsConstructor
public class NoteController {

    private final NoteService noteService;
    
    @GetMapping
    public List<Note> fetchAllNotes() {
        return noteService.getAllNotes();
    }

    @GetMapping("/{id}")
    ResponseEntity<?> getNote(@PathVariable String id) {
        Optional<Note> note = noteService.findById(id);
        return note.map(response -> ResponseEntity.ok().body(response))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, 
    produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Note> createNote(@RequestBody Note note) throws URISyntaxException {
        Note result = noteService.save(note);
        return ResponseEntity.created(new URI("/api/notes/" + result.getId()))
            .body(result); 
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable String id) {
        noteService.deleteById(id);
        return ResponseEntity.ok().build();
    }

}