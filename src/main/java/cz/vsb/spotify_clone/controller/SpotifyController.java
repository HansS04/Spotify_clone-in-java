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
    public ResponseEntity<String> uploadSong(@RequestParam("title") String title,
                                             @RequestParam(value = "albumId", required = false) Long albumId,
                                             @RequestParam(value = "username", required = false) String username,
                                             @RequestParam("genre") String genre,
                                             @RequestParam("file") MultipartFile file) {
        try {
            // copy file bytes now (Tomcat may delete multipart temp files when request ends)
            byte[] fileBytes = file.getBytes();
            String originalFilename = file.getOriginalFilename();
            String contentType = file.getContentType();
            // delegate heavy processing to async executor using an in-memory copy
            musicService.processSongUploadBytes(fileBytes, originalFilename, contentType, title, albumId, genre, username);
            return ResponseEntity.accepted().body("Upload started");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error");
        }
    }

    @GetMapping("/songs/{id}/play")
    public ResponseEntity<?> playSong(@PathVariable Long id, @RequestHeader(value = "Range", required = false) String rangeHeader) {
        return songRepository.findById(id).map(song -> {
            try {
                byte[] data = song.getAudioData();
                long fileLength = data.length;
                if (rangeHeader == null || rangeHeader.isEmpty()) {
                    org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                    headers.setContentType(getMediaType(song.getContentType()));
                    headers.setContentLength(fileLength);
                    headers.set("Accept-Ranges", "bytes");
                    // expose metadata in headers for player convenience
                    if (song.getAlbum()!=null) headers.set("X-Album-Name", song.getAlbum().getName());
                    if (song.getAlbum()!=null && song.getAlbum().getArtist()!=null) headers.set("X-Artist-Name", song.getAlbum().getArtist().getName());
                    if (song.getOwner()!=null) headers.set("X-Owner-Username", song.getOwner().getUsername());
                    return ResponseEntity.ok().headers(headers).body((Resource) new ByteArrayResource(data));
                }
                // parse Range header
                java.util.List<org.springframework.http.HttpRange> ranges = org.springframework.http.HttpRange.parseRanges(rangeHeader);
                org.springframework.http.HttpRange range = ranges.get(0);
                long start = range.getRangeStart(fileLength);
                long end = range.getRangeEnd(fileLength);
                if (end >= fileLength) end = fileLength - 1;
                long len = end - start + 1;
                byte[] slice = java.util.Arrays.copyOfRange(data, (int) start, (int) end + 1);

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(getMediaType(song.getContentType()));
                headers.set("Accept-Ranges", "bytes");
                headers.setContentLength(len);
                headers.set("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
                if (song.getAlbum()!=null) headers.set("X-Album-Name", song.getAlbum().getName());
                if (song.getAlbum()!=null && song.getAlbum().getArtist()!=null) headers.set("X-Artist-Name", song.getAlbum().getArtist().getName());
                if (song.getOwner()!=null) headers.set("X-Owner-Username", song.getOwner().getUsername());

                return ResponseEntity.status(org.springframework.http.HttpStatus.PARTIAL_CONTENT).headers(headers).body((Resource) new ByteArrayResource(slice));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/songs")
    public List<cz.vsb.spotify_clone.dto.SongDTO> getAllSongs() {
        return songRepository.findAll().stream().map(musicService::toDto).toList();
    }

    @GetMapping("/songs/newest")
    public List<cz.vsb.spotify_clone.dto.SongDTO> getNewestSongs() {
        return songRepository.findTop10ByOrderByIdDesc().stream().map(musicService::toDto).toList();
    }

    @GetMapping("/songs/search")
    public List<cz.vsb.spotify_clone.dto.SongDTO> searchSongs(@RequestParam("query") String query) {
        return songRepository.searchComplex(query).stream().map(musicService::toDto).toList();
    }
}