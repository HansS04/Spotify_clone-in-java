package cz.vsb.spotify_clone.component;

import cz.vsb.spotify_clone.entity.*;
import cz.vsb.spotify_clone.repository.*;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ArtistRepository artistRepository;
    @Autowired private AlbumRepository albumRepository;
    @Autowired private SongRepository songRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Loading initial data...");



            Artist dragons = createArtist("imaginedragons", "password", "Imagine Dragons");
            Album idAlbum = createAlbum("Evolve", 2017, dragons, "#002F4F");
            createSong("Believer", 204, "Pop Rock", idAlbum);
            createSong("Thunder", 187, "Synth-pop", idAlbum);

            Artist weeknd = createArtist("theweeknd", "password", "The Weeknd");
            Album weekndAlbum = createAlbum("After Hours", 2020, weeknd, "#8B0000");
            createSong("Blinding Lights", 200, "Synth-pop", weekndAlbum);

            Artist lorna = createArtist("lornashore", "password", "Lorna Shore");
            Album lsAlbum = createAlbum("Pain Remains", 2022, lorna, "#222222");
            createSong("Sun//Eater", 369, "Deathcore", lsAlbum);

            Artist taylor = createArtist("taylorswift", "password", "Taylor Swift");
            Album tsAlbum = createAlbum("Midnights", 2022, taylor, "#2C3E50");
            createSong("Anti-Hero", 200, "Pop", tsAlbum);

            createUser("user", "password");
            createUser("admin", "admin");

            System.out.println("Data loaded successfully!");
        }
    }

    private Artist createArtist(String username, String password, String artistName) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setRole(Role.ARTIST);
        user.setAvatar(new byte[0]);
        user.setAvatarContentType("image/png");
        userRepository.save(user);

        Artist artist = new Artist();
        artist.setName(artistName);

        artist.setProfileImage(new byte[0]);
        artist.setImageContentType("image/png");

        artist.setCoverImage(new byte[0]);
        artist.setCoverContentType("image/png");

        return artistRepository.save(artist);
    }

    private Album createAlbum(String name, int year, Artist artist, String bgColor) {
        Album album = new Album();
        album.setName(name);
        album.setYearReleased(year);
        album.setArtist(artist);
        album.setBgColor(bgColor);

        album.setCoverImage(new byte[0]);
        album.setImageContentType("image/png");

        return albumRepository.save(album);
    }

    private void createSong(String title, int durationSeconds, String genre, Album album) {
        Song song = new Song();
        song.setTitle(title);
        song.setDurationSeconds(durationSeconds);
        song.setGenre(genre);
        song.setAlbum(album);
        song.setAudioData(new byte[0]);
        song.setContentType("audio/mpeg");
        songRepository.save(song);
    }

    private void createUser(String username, String password) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setRole(Role.USER);
        userRepository.save(user);
    }
}