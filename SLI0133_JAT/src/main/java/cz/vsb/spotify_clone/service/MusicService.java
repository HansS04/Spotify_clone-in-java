package cz.vsb.spotify_clone.service;

import cz.vsb.spotify_clone.entity.Album;
import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.repository.AlbumRepository;
import cz.vsb.spotify_clone.repository.ArtistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MusicService {

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AlbumRepository albumRepository;

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
}