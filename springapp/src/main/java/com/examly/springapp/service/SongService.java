package com.examly.springapp.service;

import com.examly.springapp.exception.SongNotFoundException;
import com.examly.springapp.model.Song;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.SongRepository;
import com.examly.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {
    
    private static final Logger log = LoggerFactory.getLogger(SongService.class);

    private final SongRepository songRepository;
    private final UserRepository userRepository;

    @Transactional
    public Song saveSong(Song song) {
        log.warn("saveSong() called - this should not be used for user-specific data");
        throw new UnsupportedOperationException("Use saveUserSong() instead for user-specific collections");
    }

    public List<Song> getAllSongs() {
        log.warn("getAllSongs() called - this should not be used for user-specific data");
        throw new UnsupportedOperationException("Use getUserSongs() instead for user-specific collections");
    }

    public List<Song> getSongsByGenre(String genre) {
        log.warn("getSongsByGenre() called - this should not be used for user-specific data");
        throw new UnsupportedOperationException("Use getUserSongsByGenre() instead for user-specific collections");
    }

    public List<Song> getSongsSortedByArtist() {
        log.warn("getSongsSortedByArtist() called - this should not be used for user-specific data");
        throw new UnsupportedOperationException("Use getUserSongsSortedByArtist() instead for user-specific collections");
    }

    public Song getSongById(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new SongNotFoundException("Song with id " + id + " not found"));
    }

    @Transactional
    public void deleteSong(Long id) {
        log.info("Deleting song with ID: {}", id);
        if (!songRepository.existsById(id)) {
            throw new SongNotFoundException("Song with id " + id + " not found");
        }
        songRepository.deleteById(id);
    }

    public List<Song> searchSongs(String query) {
        log.info("Searching songs with query: {}", query);
        return songRepository.findByTitleContainingIgnoreCase(query);
    }
    
    @Transactional
    public Song saveUserSong(Song song, String userEmail) {
        log.info("Saving song: {} for user: {}", song.getTitle(), userEmail);
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        song.setUser(user);
        Song savedSong = songRepository.save(song);
        log.info("Song saved with ID: {} for user: {} (user ID: {})", savedSong.getId(), userEmail, user.getId());
        return savedSong;
    }
    
    public List<Song> getUserSongs(String userEmail) {
        log.info("Retrieving songs for user: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return songRepository.findByUserIdOrderByUploadDateDesc(user.getId());
    }
    
    public List<Song> getUserSongsByGenre(String userEmail, String genre) {
        log.info("Retrieving songs by genre: {} for user: {}", genre, userEmail);
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return songRepository.findByUserIdAndGenreOrderByUploadDateDesc(user.getId(), genre);
    }
    
    public List<Song> getUserSongsSortedByArtist(String userEmail) {
        log.info("Retrieving songs sorted by artist for user: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return songRepository.findByUserIdOrderByArtistAsc(user.getId());
    }
    
    @Transactional
    public void deleteUserSong(Long songId, String userEmail) {
        log.info("Deleting song {} for user: {}", songId, userEmail);
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new SongNotFoundException("Song with id " + songId + " not found"));
        
        // Check if the song belongs to the user
        if (!song.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot delete song - not owner");
        }
        
        songRepository.delete(song);
    }
}