package com.examly.springapp.controller;

import com.examly.springapp.model.Song;
import com.examly.springapp.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
    
    private final SongService songService;
    
    @PostMapping("/add-test-song")
    public ResponseEntity<?> addTestSong(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            
            Song testSong = new Song();
            testSong.setTitle("Test Song for " + userEmail);
            testSong.setArtist("Test Artist");
            testSong.setGenre("Test");
            testSong.setDuration(180);
            testSong.setAudioUrl("http://test.com/audio.mp3");
            
            Song saved = songService.saveUserSong(testSong, userEmail);
            
            return ResponseEntity.ok(Map.of(
                "message", "Test song added for user: " + userEmail,
                "songId", saved.getId(),
                "userId", saved.getUser().getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/my-songs")
    public ResponseEntity<?> getMySongs(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<Song> songs = songService.getUserSongs(userEmail);
            
            return ResponseEntity.ok(Map.of(
                "userEmail", userEmail,
                "songCount", songs.size(),
                "songs", songs.stream().map(song -> Map.of(
                    "id", song.getId(),
                    "title", song.getTitle(),
                    "ownerEmail", song.getUser().getEmail()
                )).toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}