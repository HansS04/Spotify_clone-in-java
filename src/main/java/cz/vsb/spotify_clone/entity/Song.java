package cz.vsb.spotify_clone.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@DiscriminatorValue("SONG")
public class Song extends AudioContent {

    @ManyToOne
    @JoinColumn(name = "album_id")
    @JsonIgnore
    private Album album;

    @ManyToMany(mappedBy = "songs")
    @JsonIgnore
    private List<Playlist> playlists;


    @Lob
    @Column(length = 50000000)
    @JsonIgnore
    private byte[] audioData;

    @Column(name = "mime_type")
    private String contentType; // Např. "audio/mpeg"
}