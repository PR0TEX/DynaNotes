package pl.edu.pg.projektGrupowy.DynaNotes.domain;


import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.GeneratedValue;

@Data
@NoArgsConstructor
@Document("notes")
public class Note {
    
    @Id @GeneratedValue
    private String id;
    private String contents;

    public Note(String contents) {
        this.contents = contents;
    }
}
