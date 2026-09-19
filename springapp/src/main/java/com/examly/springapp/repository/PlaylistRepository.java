package com.examly.springapp.repository;

import com.examly.springapp.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    
    /**
     * Find playlists by user ID
     */
    @Query("SELECT p FROM Playlist p WHERE p.user.id = :userId ORDER BY p.updatedDate DESC")
    List<Playlist> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find playlists by user ID ordered by creation date
     */
    List<Playlist> findByUserIdOrderByCreatedDateDesc(Long userId);
    
    /**
     * Find playlist by ID and user ID (for ownership verification)
     */
    @Query("SELECT p FROM Playlist p WHERE p.id = :playlistId AND p.user.id = :userId")
    Playlist findByIdAndUserId(@Param("playlistId") Long playlistId, @Param("userId") Long userId);
    
    /**
     * Find public playlists or user's own playlists
     */
    @Query("SELECT p FROM Playlist p WHERE p.isPublic = true OR p.user.id = :userId ORDER BY p.updatedDate DESC")
    List<Playlist> findPublicOrUserPlaylists(@Param("userId") Long userId);
    
    /**
     * Find public playlists
     */
    List<Playlist> findByIsPublicTrueOrderByFollowerCountDesc();
    
    /**
     * Find collaborative playlists
     */
    List<Playlist> findByIsCollaborativeTrue();
    
    /**
     * Find playlists by title containing search term
     */
    List<Playlist> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Count playlists by user
     */
    @Query("SELECT COUNT(p) FROM Playlist p WHERE p.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}