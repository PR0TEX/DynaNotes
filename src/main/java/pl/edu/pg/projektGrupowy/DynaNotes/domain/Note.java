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
    private int xcoord;
    private int ycoord;

    public Note(String contents) {
        this.contents = contents;
        this.xcoord = 0;
        this.ycoord = 0;
    }

    public Note(String id, String contents) {
        this.id = id;
        this.contents = contents;
        this.xcoord = 0;
        this.ycoord = 0;
    }

    public Note(String contents, int xcoord, int ycoord) {
        this.contents = contents;
        this.xcoord = xcoord;
        this.ycoord = ycoord;
    }
}
