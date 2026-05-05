package cz.vsb.spotify_clone.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties("songs")
    private Album album;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties({"password"})
    private User owner;

    @ManyToMany(mappedBy = "songs")
    @JsonIgnore
    private List<Playlist> playlists;

    @Lob
    @Column(length = 50000000)
    @JsonIgnore
    private byte[] audioData;

    @Column(name = "mime_type")
    private String contentType;

    @Lob
    @JsonIgnore
    private byte[] coverImage;

    private String imageContentType;

    private String genre;
}