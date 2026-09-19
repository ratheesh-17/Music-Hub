package com.examly.springapp.repository;

import com.examly.springapp.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    
    /**
     * Find songs by genre
     */
    List<Song> findByGenre(String genre);
    
    /**
     * Find songs sorted by artist name (ascending)
     */
    List<Song> findAllByOrderByArtistAsc();
    
    /**
     * Find songs by title containing search term (case insensitive)
     */
    List<Song> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Find active songs only
     */
    List<Song> findByIsActiveTrue();
    
    /**
     * Find songs by artist name
     */
    List<Song> findByArtistContainingIgnoreCase(String artist);
    
    /**
     * Find songs by duration range
     */
    @Query("SELECT s FROM Song s WHERE s.duration BETWEEN :minDuration AND :maxDuration AND s.isActive = true")
    List<Song> findByDurationBetween(@Param("minDuration") int minDuration, @Param("maxDuration") int maxDuration);
    
    /**
     * Find most played songs
     */
    @Query("SELECT s FROM Song s WHERE s.isActive = true ORDER BY s.playCount DESC")
    List<Song> findMostPlayed();
    
    /**
     * User-specific queries
     */
    List<Song> findByUserIdOrderByUploadDateDesc(Long userId);
    List<Song> findByUserIdAndGenreOrderByUploadDateDesc(Long userId, String genre);
    List<Song> findByUserIdOrderByArtistAsc(Long userId);
    List<Song> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);
    
    @Query("SELECT COUNT(s) FROM Song s WHERE s.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(s) FROM Song s WHERE s.user IS NULL")
    long countOrphanedSongs();
    
    @Query("DELETE FROM Song s WHERE s.user IS NULL")
    @Modifying
    void deleteOrphanedSongs();
}