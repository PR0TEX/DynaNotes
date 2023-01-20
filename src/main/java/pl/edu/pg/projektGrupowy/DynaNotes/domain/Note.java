package pl.edu.pg.projektGrupowy.DynaNotes.domain;


import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.GeneratedValue;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document("notes")
public class Note {
    
    @Id @GeneratedValue
    private String id;
    private String contents;
    private int position[];
    private String color;

    public Note(String contents) {
        this.contents = contents;
        this.position[0] = 0;
        this.position[1] = 0;
        this.color = "yellow";
    }

    public Note(String id, String contents) {
        this.id = id;
        this.contents = contents;
        this.position[0] = 0;
        this.position[1] = 0;
        this.color = "yellow";
    }

    public Note(String contents, int[] position) {
        this.contents = contents;
        this.position = position;
        this.color = "yellow";
    }
}
