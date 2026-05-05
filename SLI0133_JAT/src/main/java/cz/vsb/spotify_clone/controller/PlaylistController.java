package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.Playlist;
import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.entity.User;
import cz.vsb.spotify_clone.repository.PlaylistRepository;
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
import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@CrossOrigin(origins = "http://localhost:5173")
public class PlaylistController {

    @Autowired
    private PlaylistRepository playlistRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SongRepository songRepository;

    @GetMapping("/user")
    public List<Playlist> getUserPlaylists(@RequestParam String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return playlistRepository.findByOwner(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Playlist> getPlaylistById(@PathVariable Long id) {
        return playlistRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<?> addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
            playlistRepository.save(playlist);
            return ResponseEntity.ok("Song added to playlist");
        } else {
            return ResponseEntity.badRequest().body("Song already in playlist");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPlaylist(
            @RequestParam("name") String name,
            @RequestParam("username") String username,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Playlist playlist = new Playlist();
            playlist.setName(name);
            playlist.setOwner(user);

            if (file != null && !file.isEmpty()) {
                playlist.setCoverImage(file.getBytes());
                playlist.setImageContentType(file.getContentType());
            }

            playlistRepository.save(playlist);
            return ResponseEntity.ok("Playlist created");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error");
        }
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<Resource> getCover(@PathVariable Long id) {
        return playlistRepository.findById(id)
                .filter(p -> p.getCoverImage() != null)
                .map(p -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(p.getImageContentType()))
                        .body((Resource) new ByteArrayResource(p.getCoverImage())))
                .orElse(ResponseEntity.notFound().build());
    }
}