package pl.edu.pg.projektGrupowy.DynaNotes.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import pl.edu.pg.projektGrupowy.DynaNotes.domain.Note;

@Repository()
public interface NoteRepository extends MongoRepository<Note, String> {
}
