package pl.edu.pg.projektGrupowy.DynaNotes.domain;


import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.GeneratedValue;
/**
 * Klasa reprezentująca obiekt karteczki znajdującej się na tablicy
 * 
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document("notes")
public class Note {
    
    @Id @GeneratedValue
    private String id;
    /**
     * Reprezentuje zawartość karteczki
     */
    private String contents;
    /**
     * Reprezentuje pozycję karteczki na tablicy
     * position[0] to pozycja x
     * position[1] to pozycja y
     */
    private int position[];
    /**
     * Reprezentuje kolor karteczki
     */
    private String color;
    /**
     * Stworzenie karteczki o zadanej zawartości
     * @param contents Zawartość karteczki
     */
    public Note(String contents) {
        this.contents = contents;
        this.position[0] = 0;
        this.position[1] = 0;
        this.color = "yellow";
    }
    /**
     * Stworzenie karteczki o zadanym identyfikatorze
     * @param id Identyfikator karteczki
     * @param contents Zawartość karteczki
     */
    public Note(String id, String contents) {
        this.id = id;
        this.contents = contents;
        this.position[0] = 0;
        this.position[1] = 0;
        this.color = "yellow";
    }

    /**
     * Stworzenie karteczki w danej pozycji
     * @param contents Zawartość karteczki
     * @param position Lokalizacja karteczki \
     * postion[0] = współrzędne x
     * postion[1] = współrzędne y
     */
    public Note(String contents, int[] position) {
        this.contents = contents;
        this.position = position;
        this.color = "yellow";
    }
}
