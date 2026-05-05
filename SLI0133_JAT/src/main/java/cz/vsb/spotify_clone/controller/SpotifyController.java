package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.Album;
import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.repository.AlbumRepository;
import cz.vsb.spotify_clone.repository.ArtistRepository;
import cz.vsb.spotify_clone.repository.SongRepository;
import cz.vsb.spotify_clone.service.MusicService;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SpotifyController {

    @Autowired private MusicService musicService;
    @Autowired private SongRepository songRepository;
    @Autowired private AlbumRepository albumRepository;
    @Autowired private ArtistRepository artistRepository;

    private MediaType getMediaType(String contentType) {
        if (contentType == null || contentType.trim().isEmpty()) {
            return MediaType.IMAGE_PNG;
        }
        try {
            return MediaType.parseMediaType(contentType);
        } catch (Exception e) {
            return MediaType.IMAGE_PNG;
        }
    }

    // --- ARTIST IMAGES ---
    @PostMapping("/artists/{id}/image")
    public ResponseEntity<?> uploadArtistImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return artistRepository.findById(id).map(artist -> {
            try {
                artist.setProfileImage(file.getBytes());
                artist.setImageContentType(file.getContentType());
                artistRepository.save(artist);
                return ResponseEntity.ok("Updated");
            } catch (IOException e) { return ResponseEntity.internalServerError().body("Error"); }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/artists/{id}/image")
    public ResponseEntity<Resource> getArtistImage(@PathVariable Long id) {
        return artistRepository.findById(id)
                .filter(a -> a.getProfileImage() != null)
                .map(a -> ResponseEntity.ok()
                        .contentType(getMediaType(a.getImageContentType()))
                        .body((Resource) new ByteArrayResource(a.getProfileImage())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/artists/{id}/cover")
    public ResponseEntity<?> uploadArtistCover(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return artistRepository.findById(id).map(artist -> {
            try {
                artist.setCoverImage(file.getBytes());
                artist.setCoverContentType(file.getContentType());
                artistRepository.save(artist);
                return ResponseEntity.ok("Updated");
            } catch (IOException e) { return ResponseEntity.internalServerError().body("Error"); }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/artists/{id}/cover")
    public ResponseEntity<Resource> getArtistCover(@PathVariable Long id) {
        return artistRepository.findById(id)
                .filter(a -> a.getCoverImage() != null)
                .map(a -> ResponseEntity.ok()
                        .contentType(getMediaType(a.getCoverContentType()))
                        .body((Resource) new ByteArrayResource(a.getCoverImage())))
                .orElse(ResponseEntity.notFound().build());
    }

    // --- ALBUMS ---

    // [REMOVED] getAlbumCover was here. It is now in AlbumController.

    // --- OSTATNÍ METODY ---

    @GetMapping("/artists")
    public List<Artist> getArtists() { return musicService.getAllArtists(); }

    @GetMapping("/artists/{id}")
    public ResponseEntity<Artist> getArtistById(@PathVariable Long id) {
        return artistRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/albums")
    public List<Album> getAllAlbums() { return albumRepository.findAll(); }

    @PostMapping("/artists/{artistId}/albums")
    public ResponseEntity<?> createAlbumWithCover(@PathVariable Long artistId, @RequestParam("name") String name, @RequestParam("year") int year, @RequestParam(value="file", required=false) MultipartFile file) {
        try {
            Album album = new Album(); album.setName(name); album.setYearReleased(year);
            if(file!=null && !file.isEmpty()) {
                album.setCoverImage(file.getBytes());
                album.setImageContentType(file.getContentType());
            } else {
                album.setCoverImage(new byte[0]);
                album.setImageContentType("image/png");
            }
            return musicService.getArtistById(artistId).map(artist -> {
                album.setArtist(artist); albumRepository.save(album); return ResponseEntity.ok("Created");
            }).orElse(ResponseEntity.status(404).body("Artist not found"));
        } catch(IOException e) { return ResponseEntity.internalServerError().body("Error"); }
    }

    @PostMapping("/songs/upload")
    public ResponseEntity<String> uploadSong(@RequestParam("title") String title, @RequestParam("albumId") Long albumId, @RequestParam("genre") String genre, @RequestParam("file") MultipartFile file) {
        File tempFile = null;
        try {
            String suffix = ".mp3";
            if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
                suffix = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
            }
            tempFile = File.createTempFile("upload_", suffix);
            file.transferTo(tempFile);

            int durationSeconds = 0;
            try {
                AudioFile audioFile = AudioFileIO.read(tempFile);
                durationSeconds = audioFile.getAudioHeader().getTrackLength();
            } catch (Exception e) {}

            Song song = new Song();
            song.setTitle(title);
            song.setDurationSeconds(durationSeconds);
            song.setAudioData(Files.readAllBytes(tempFile.toPath()));
            song.setContentType(file.getContentType());
            song.setGenre(genre);

            Album album = albumRepository.findById(albumId).orElseThrow(() -> new RuntimeException("Album not found"));
            song.setAlbum(album);
            songRepository.save(song);

            return ResponseEntity.ok("Uploaded");
        } catch (IOException e) { return ResponseEntity.internalServerError().body("Error"); }
        finally { if (tempFile != null) tempFile.delete(); }
    }

    @GetMapping("/songs/{id}/play")
    public ResponseEntity<Resource> playSong(@PathVariable Long id) {
        return songRepository.findById(id).map(song -> ResponseEntity.ok()
                        .contentLength(song.getAudioData().length)
                        .contentType(getMediaType(song.getContentType()))
                        .body((Resource)new ByteArrayResource(song.getAudioData())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/songs")
    public List<Song> getAllSongs() { return songRepository.findAll(); }

    @GetMapping("/songs/newest")
    public List<Song> getNewestSongs() { return songRepository.findTop10ByOrderByIdDesc(); }

    @GetMapping("/songs/search")
    public List<Song> searchSongs(@RequestParam("query") String query) { return songRepository.searchComplex(query); }
}