package cz.vsb.spotify_clone.service;

import cz.vsb.spotify_clone.entity.Album;
import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.repository.AlbumRepository;
import cz.vsb.spotify_clone.repository.ArtistRepository;
import cz.vsb.spotify_clone.repository.SongRepository;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

@Service
public class MusicService {

    private static final Logger logger = LoggerFactory.getLogger(MusicService.class);

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private cz.vsb.spotify_clone.repository.UserRepository userRepository;

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public Optional<Artist> getArtistById(Long id) {
        return artistRepository.findById(id);
    }

    public Album createAlbumForArtist(Long artistId, Album album) {
        return artistRepository.findById(artistId).map(artist -> {
            album.setArtist(artist);
            return albumRepository.save(album);
        }).orElseThrow(() -> new RuntimeException("Artist not found"));
    }

    public cz.vsb.spotify_clone.dto.SongDTO toDto(Song song) {
        return toDtoStatic(song);
    }

    public static cz.vsb.spotify_clone.dto.SongDTO toDtoStatic(Song song) {
        cz.vsb.spotify_clone.dto.SongDTO dto = new cz.vsb.spotify_clone.dto.SongDTO();
        dto.id = song.getId();
        dto.title = song.getTitle();
        dto.durationSeconds = song.getDurationSeconds();
        dto.contentType = song.getContentType();
        dto.genre = song.getGenre();
        if (song.getAlbum() != null) {
            dto.albumId = song.getAlbum().getId();
            dto.albumName = song.getAlbum().getName();
            if (song.getAlbum().getArtist() != null) {
                dto.artistId = song.getAlbum().getArtist().getId();
                dto.artistName = song.getAlbum().getArtist().getName();
            }
        }
        if (song.getOwner() != null) {
            dto.ownerUsername = song.getOwner().getUsername();
        }
        // cover and play URLs
        if (song.getCoverImage() != null && song.getCoverImage().length > 0) {
            dto.coverUrl = "/api/songs/" + song.getId() + "/cover";
        } else {
            dto.coverUrl = null;
        }
        dto.streamUrl = "/api/songs/" + song.getId() + "/play";
        return dto;
    }

    @Async("fileProcessingExecutor")
    public void processSongUpload(MultipartFile file, String title, Long albumId, String genre, String username) {
        byte[] fileBytes = null;
        try { fileBytes = file.getBytes(); } catch (IOException e) { logger.warn("Failed to copy multipart bytes", e); }
        processSongUploadBytes(fileBytes, file.getOriginalFilename(), file.getContentType(), null, null, title, albumId, genre, username);
    }

    @Async("fileProcessingExecutor")
    public void processSongUploadBytes(byte[] fileBytes, String originalFilename, String contentType, byte[] coverBytes, String coverContentType, String title, Long albumId, String genre, String username) {
        File tempFile = null;
        try {
            String suffix = ".mp3";
            if (originalFilename != null && originalFilename.contains(".")) {
                suffix = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }
            tempFile = File.createTempFile("upload_", suffix);
            if (fileBytes != null) {
                Files.write(tempFile.toPath(), fileBytes);
            }

            int durationSeconds = 0;
            try {
                AudioFile audioFile = AudioFileIO.read(tempFile);
                durationSeconds = audioFile.getAudioHeader().getTrackLength();
            } catch (Exception e) {
                logger.warn("Failed to read audio duration", e);
            }

            Song song = new Song();
            song.setTitle(title);
            song.setDurationSeconds(durationSeconds);
            // if we have bytes, use them; otherwise try reading from temp file
            if (fileBytes != null) {
                song.setAudioData(fileBytes);
            } else {
                song.setAudioData(Files.readAllBytes(tempFile.toPath()));
            }
            song.setContentType(contentType);
            song.setGenre(genre);

            if (coverBytes != null && coverBytes.length > 0) {
                song.setCoverImage(coverBytes);
                song.setImageContentType(coverContentType != null ? coverContentType : "image/png");
            }

            if (albumId != null) {
                Album album = albumRepository.findById(albumId).orElseThrow(() -> new RuntimeException("Album not found"));
                song.setAlbum(album);
            }

            if (username != null && !username.isBlank()) {
                userRepository.findByUsername(username).ifPresent(song::setOwner);
            }

            songRepository.save(song);

            logger.info("Saved song '{}' (async)", title);
        } catch (IOException e) {
            logger.error("Error processing uploaded song", e);
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
}