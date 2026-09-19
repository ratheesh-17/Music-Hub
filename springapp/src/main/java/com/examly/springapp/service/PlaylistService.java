package com.examly.springapp.service;

import com.examly.springapp.dto.CreatePlaylistRequest;
import com.examly.springapp.model.Playlist;
import com.examly.springapp.model.PlaylistTrack;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.PlaylistRepository;
import com.examly.springapp.repository.PlaylistTrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    
    private final PlaylistRepository playlistRepository;
    private final PlaylistTrackRepository playlistTrackRepository;
    
    public Playlist createPlaylist(User user, CreatePlaylistRequest request) {
        Playlist playlist = new Playlist();
        playlist.setUser(user);
        playlist.setTitle(request.getTitle());
        playlist.setDescription(request.getDescription());
        playlist.setPublic(request.isPublic());
        playlist.setCollaborative(request.isCollaborative());
        
        return playlistRepository.save(playlist);
    }
    
    public List<Playlist> getUserPlaylists(Long userId) {
        return playlistRepository.findByUserIdOrderByCreatedDateDesc(userId);
    }
    
    public Playlist getPlaylistDetails(Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
            
        if (!playlist.getUser().getId().equals(userId) && !playlist.isPublic()) {
            throw new RuntimeException("Access denied to private playlist");
        }
        
        return playlist;
    }
    
    public void deletePlaylist(Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
            
        if (!playlist.getUser().getId().equals(userId)) {
            throw new RuntimeException("Cannot delete playlist - not owner");
        }
        
        playlistRepository.delete(playlist);
    }
    
    public PlaylistTrack addSongToPlaylist(Long playlistId, Map<String, Object> songData, Long userId, String userEmail) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
            
        if (!playlist.getUser().getId().equals(userId) && !playlist.isCollaborative()) {
            throw new RuntimeException("Cannot add songs to this playlist");
        }
        
        PlaylistTrack track = new PlaylistTrack();
        track.setPlaylist(playlist);
        track.setTitle((String) songData.get("title"));
        track.setArtist((String) songData.get("artist"));
        track.setAlbum((String) songData.get("album"));
        track.setDuration((Integer) songData.get("duration"));
        track.setAudioUrl((String) songData.get("audioUrl"));
        track.setAddedByEmail(userEmail);
        
        return playlistTrackRepository.save(track);
    }
    
    public List<PlaylistTrack> getPlaylistTracks(Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
            
        if (!playlist.getUser().getId().equals(userId) && !playlist.isPublic()) {
            throw new RuntimeException("Access denied to private playlist");
        }
        
        return playlistTrackRepository.findByPlaylistIdOrderByPosition(playlistId);
    }
    
    public void removeSongFromPlaylist(Long playlistId, Long trackId, Long userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
            
        if (!playlist.getUser().getId().equals(userId) && !playlist.isCollaborative()) {
            throw new RuntimeException("Cannot remove songs from this playlist");
        }
        
        PlaylistTrack track = playlistTrackRepository.findById(trackId)
            .orElseThrow(() -> new RuntimeException("Track not found"));
            
        if (!track.getPlaylist().getId().equals(playlistId)) {
            throw new RuntimeException("Track does not belong to this playlist");
        }
        
        playlistTrackRepository.delete(track);
    }
}