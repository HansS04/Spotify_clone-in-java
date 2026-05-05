package cz.vsb.spotify_clone.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int yearReleased;

    @ManyToOne
    @JoinColumn(name = "artist_id")
    @JsonIgnoreProperties("albums")
    private Artist artist;

    @Lob
    @JsonIgnore
    private byte[] coverImage;

    private String imageContentType;

    private String backgroundColor;

    public void setBgColor(String bgColor) {
        this.backgroundColor = bgColor;
    }
}