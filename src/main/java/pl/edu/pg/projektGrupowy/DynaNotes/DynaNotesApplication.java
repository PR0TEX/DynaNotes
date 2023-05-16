package pl.edu.pg.projektGrupowy.DynaNotes;

import org.springframework.boot.SpringApplication; 
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import pl.edu.pg.projektGrupowy.DynaNotes.configuration.DocumentDBConf;

/**
 * Klasa inicjalizująca aplikację DynaNotes
 */
@SpringBootApplication
public class DynaNotesApplication {

	public static void main(String[] args) {
		SpringApplication.run(DynaNotesApplication.class, args);
		MongoClientSettings settings = DocumentDBConf.mongoClientSettings();
        MongoClient client = MongoClients.create(settings);

        try {
            MongoDatabase db = client.getDatabase("dynanotes");
            db.listCollectionNames();

        }catch(Exception e){
            System.out.println("BLAD");
        }
	}

}
