package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.Album;
import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.entity.User;
import cz.vsb.spotify_clone.repository.AlbumRepository;
import cz.vsb.spotify_clone.repository.ArtistRepository;
import cz.vsb.spotify_clone.repository.SongRepository;
import cz.vsb.spotify_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/albums")
@CrossOrigin(origins = "http://localhost:5173")
public class AlbumController {

    @Autowired private AlbumRepository albumRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ArtistRepository artistRepository;
    @Autowired private SongRepository songRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createAlbum(
            @RequestParam("title") String title,
            @RequestParam("releaseYear") int releaseYear,
            @RequestParam("bgColor") String bgColor,
            @RequestParam("username") String username,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Artist artist = artistRepository.findAll().stream()
                    .filter(a -> a.getName().replace(" ", "").equalsIgnoreCase(user.getUsername().replace(" ", "")))
                    .findFirst()
                    .orElse(null);

            if (artist == null) {
                artist = new Artist();
                artist.setName(user.getUsername());
                artist.setProfileImage(new byte[0]);
                artist.setCoverImage(new byte[0]);
                artist = artistRepository.save(artist);
            }

            Album album = new Album();
            album.setName(title);
            album.setYearReleased(releaseYear);
            album.setBgColor(bgColor);
            album.setArtist(artist);

            if (file != null && !file.isEmpty()) {
                album.setCoverImage(file.getBytes());
                album.setImageContentType(file.getContentType());
            } else {
                album.setCoverImage(new byte[0]);
                album.setImageContentType("image/png");
            }

            Album savedAlbum = albumRepository.save(album);
            return ResponseEntity.ok(savedAlbum);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error uploading file");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-albums")
    public ResponseEntity<List<Album>> getMyAlbums(@RequestParam String username) {
        Optional<Artist> artistOpt = artistRepository.findAll().stream()
                .filter(a -> a.getName().replace(" ", "").equalsIgnoreCase(username.replace(" ", "")))
                .findFirst();

        if (artistOpt.isPresent()) {
            return ResponseEntity.ok(artistOpt.get().getAlbums());
        }

        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<?> updateAlbum(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("year") int year,
            @RequestParam(value = "cover", required = false) MultipartFile cover
    ) {
        return albumRepository.findById(id).map(album -> {
            album.setName(name);
            album.setYearReleased(year);
            try {
                if (cover != null && !cover.isEmpty()) {
                    album.setCoverImage(cover.getBytes());
                    album.setImageContentType(cover.getContentType());
                }
                albumRepository.save(album);
                return ResponseEntity.ok("Album updated");
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error uploading cover");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/songs/{songId}")
    public ResponseEntity<?> deleteSong(@PathVariable Long songId) {
        if (songRepository.existsById(songId)) {
            songRepository.deleteById(songId);
            return ResponseEntity.ok("Song deleted");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<byte[]> getAlbumCover(@PathVariable Long id) {
        return albumRepository.findById(id)
                .map(album -> ResponseEntity.ok()
                        .header("Content-Type", album.getImageContentType() != null ? album.getImageContentType() : "image/png")
                        .body(album.getCoverImage()))
                .orElse(ResponseEntity.notFound().build());
    }
}