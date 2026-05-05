package cz.vsb.spotify_clone.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "artist")
    @JsonIgnoreProperties("artist")
    private List<Album> albums;

    @Lob
    @JsonIgnore
    private byte[] profileImage;

    @Lob
    @JsonIgnore
    private byte[] coverImage;

    private String imageContentType;
    private String coverContentType;
}