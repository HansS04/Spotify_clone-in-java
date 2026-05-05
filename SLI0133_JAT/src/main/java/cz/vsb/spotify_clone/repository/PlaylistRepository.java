package cz.vsb.spotify_clone.repository;

import cz.vsb.spotify_clone.entity.Playlist;
import cz.vsb.spotify_clone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByOwner(User owner);
}