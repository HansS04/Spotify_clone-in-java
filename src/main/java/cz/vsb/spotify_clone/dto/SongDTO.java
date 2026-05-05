package cz.vsb.spotify_clone.dto;

public class SongDTO {
    public Long id;
    public String title;
    public int durationSeconds;
    public String contentType;
    public String genre;
    public Long albumId;
    public String albumName;
    public Long artistId;
    public String artistName;
    public String ownerUsername;
    public String coverUrl; // relative URL to fetch song cover
    public String streamUrl; // relative URL to stream audio
}
