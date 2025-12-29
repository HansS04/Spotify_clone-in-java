package cz.vsb.spotify_clone.service;

import cz.vsb.spotify_clone.entity.Album;
import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.entity.Song;
import cz.vsb.spotify_clone.repository.AlbumRepository;
import cz.vsb.spotify_clone.repository.ArtistRepository;
import cz.vsb.spotify_clone.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class MusicService {

    @Autowired
    private SongRepository songRepository;

    public Song saveSongWithFile(Song song, MultipartFile file, Long albumId) throws IOException {
        song.setAudioData(file.getBytes());
        song.setContentType(file.getContentType());

        return songRepository.save(song);

    }

    public Song getSongById(Long id){
        return songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found"));
    }

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AlbumRepository albumRepository;

    public List<Artist> getAllArtists(){
        return artistRepository.findAll();
    }

    public Album createAlbumForArtist(Long artistId, Album album){
        Artist artist = artistRepository.findById(artistId).orElseThrow(() -> new RuntimeException("Artist not found"));

        album.setArtist(artist);
        return albumRepository.save(album);
    }
}
