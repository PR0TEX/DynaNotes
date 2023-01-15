package pl.edu.pg.projektGrupowy.DynaNotes.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import pl.edu.pg.projektGrupowy.DynaNotes.domain.Note;
import pl.edu.pg.projektGrupowy.DynaNotes.repository.NoteRepository;

@AllArgsConstructor
@Service
public class NoteService {
    private final NoteRepository noteRepository;

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Note save(Note note) {
        return noteRepository.save(note);
    }

    public Optional<Note> findById(String id) {
        return noteRepository.findById(id);
    }

    public void deleteById(String id) {
        noteRepository.deleteById(id);
    }

    public void update(Note note) {
        noteRepository.save(note);
    }
}
