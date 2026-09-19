package com.examly.springapp.repository;

import com.examly.springapp.model.PlaylistTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistTrackRepository extends JpaRepository<PlaylistTrack, Long> {
    
    @Query("SELECT pt FROM PlaylistTrack pt WHERE pt.playlist.id = :playlistId ORDER BY pt.position ASC, pt.addedDate ASC")
    List<PlaylistTrack> findByPlaylistIdOrderByPosition(@Param("playlistId") Long playlistId);
    
    @Query("SELECT COUNT(pt) FROM PlaylistTrack pt WHERE pt.playlist.id = :playlistId")
    long countByPlaylistId(@Param("playlistId") Long playlistId);
}