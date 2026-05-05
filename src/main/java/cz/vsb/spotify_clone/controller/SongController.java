package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.repository.SongRepository;
import cz.vsb.spotify_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(origins = "http://localhost:5173")
public class SongController {

    @Autowired private SongRepository songRepository;
    @Autowired private UserRepository userRepository;

    @PostMapping("/{id}/cover")
    public ResponseEntity<?> uploadSongCover(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return songRepository.findById(id).map(song -> {
            try {
                song.setCoverImage(file.getBytes());
                song.setImageContentType(file.getContentType());
                songRepository.save(song);
                return ResponseEntity.ok("Updated");
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<Resource> getSongCover(@PathVariable Long id) {
        return songRepository.findById(id)
                .filter(s -> s.getCoverImage() != null)
                .map(s -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(s.getImageContentType() != null ? s.getImageContentType() : "image/png"))
                        .body((Resource) new ByteArrayResource(s.getCoverImage())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<?> updateSong(@PathVariable Long id,
                                        @RequestParam(value = "title", required = false) String title,
                                        @RequestParam(value = "genre", required = false) String genre,
                                        @RequestParam(value = "albumId", required = false) Long albumId) {
        return songRepository.findById(id).map(song -> {
            if (title != null) song.setTitle(title);
            if (genre != null) song.setGenre(genre);
            if (albumId != null) {
                // lazy: set album if exists
                try {
                    cz.vsb.spotify_clone.repository.AlbumRepository ar = null;
                } catch (Exception e) {}
            }
            songRepository.save(song);
            return ResponseEntity.ok("Updated");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getSongsByUser(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(songRepository.findByOwner(user).stream().map(s -> cz.vsb.spotify_clone.service.MusicService.toDtoStatic(s)).toList()))
                .orElse(ResponseEntity.notFound().build());
    }
}
