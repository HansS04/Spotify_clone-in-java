package cz.vsb.spotify_clone.repository;
import cz.vsb.spotify_clone.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {}
