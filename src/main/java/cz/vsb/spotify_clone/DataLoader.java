package cz.vsb.spotify_clone;

import cz.vsb.spotify_clone.entity.*;
import cz.vsb.spotify_clone.repository.*;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(ArtistRepository artistRepository,
                                   AlbumRepository albumRepository,
                                   SongRepository songRepository,
                                   UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(BCrypt.hashpw("admin", BCrypt.gensalt()));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }

            if (artistRepository.count() == 0) {
                Artist artist = new Artist();
                artist.setName("Imagine Dragons");
                artist.setGenre("Pop Rock");
                artistRepository.save(artist);

                Album album = new Album();
                album.setName("Evolve");
                album.setYearReleased(2017);
                album.setArtist(artist);
                albumRepository.save(album);

                Song song = new Song();
                song.setTitle("Believer");
                song.setDurationSeconds(204);
                song.setAlbum(album);
                song.setContentType("audio/mpeg");
                song.setAudioData(new byte[0]);
                songRepository.save(song);
            }
        };
    }
}