package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.Album;
import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.repository.AlbumRepository;
import cz.vsb.spotify_clone.repository.SongRepository;
import cz.vsb.spotify_clone.service.MusicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SpotifyController {

    @Autowired
    private MusicService musicService;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private AlbumRepository albumRepository;

    @GetMapping("/artists")
    public List<Artist> getArtists() {
        return musicService.getAllArtists();
    }

    @GetMapping("/albums")
    public List<Album> getAllAlbums() {
        return albumRepository.findAll();
    }

    @PostMapping("/artists/{artistId}/albums")
    public Album createAlbum(@PathVariable Long artistId, @RequestBody Album album) {
        return musicService.createAlbumForArtist(artistId, album);
    }

    @PostMapping("/songs/upload")
    public ResponseEntity<String> uploadSong(
            @RequestParam("title") String title,
            @RequestParam("albumId") Long albumId,
            @RequestParam("file") MultipartFile file) {
        File tempFile = null;

        try {
            String originalFilename = file.getOriginalFilename();
            String suffix = ".mp3";

            if (originalFilename != null && originalFilename.contains(".")) {
                suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            tempFile = File.createTempFile("upload_", suffix);
            file.transferTo(tempFile);

            int durationSeconds = 0;
            try {
                AudioFile audioFile = AudioFileIO.read(tempFile);
                durationSeconds = audioFile.getAudioHeader().getTrackLength();
            } catch (Exception e) {
                System.err.println("ERROR during reading metadata " + e.getMessage());
                throw new RuntimeException("Song cannot be read.");
            }

            Song song = new Song();
            song.setTitle(title);
            song.setDurationSeconds(durationSeconds);

            song.setAudioData(Files.readAllBytes(tempFile.toPath()));

            song.setContentType(file.getContentType());

            Album album = albumRepository.findById(albumId)
                    .orElseThrow(() -> new RuntimeException("Album nenalezeno"));
            song.setAlbum(album);

            songRepository.save(song);

            return ResponseEntity.ok("Song ID:" + song.getId() + "was uploaded successfully with length:" + durationSeconds);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error while reading file: " + e.getMessage());
        }  finally {
            if (tempFile != null && tempFile.exists()) {
                try {
                    boolean deleted = tempFile.delete();
                    if (!deleted) {
                        System.err.println("VAROVÁNÍ: Nepodařilo se smazat dočasný soubor: " + tempFile.getAbsolutePath());
                    }
                } catch (Exception ex) {
                    System.err.println("KRITICKÁ CHYBA: Výjimka při mazání temp souboru: " + ex.getMessage());
                }
            }
        }
    }

    @GetMapping("/songs/{id}/play")
    public ResponseEntity<Resource> playSong(@PathVariable Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Písnička nenalezena"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(song.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + song.getTitle() + "\"")
                .body(new ByteArrayResource(song.getAudioData()));
    }

    @GetMapping("/songs")
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }
}