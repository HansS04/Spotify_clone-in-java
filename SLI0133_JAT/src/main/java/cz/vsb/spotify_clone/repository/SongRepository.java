package cz.vsb.spotify_clone.repository;

import cz.vsb.spotify_clone.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    List<Song> findTop10ByOrderByIdDesc();

    @Query("SELECT s FROM Song s " +
            "JOIN s.album a " +
            "JOIN a.artist ar " +
            "WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.genre) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(ar.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Song> searchComplex(@Param("query") String query);
}