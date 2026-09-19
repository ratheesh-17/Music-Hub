package com.examly.springapp.controller;

import com.examly.springapp.model.Song;
import com.examly.springapp.service.SongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
@Tag(name = "Song Management", description = "Song/Track management operations")
@Slf4j
@RequiredArgsConstructor
public class SongController {
    
    private final SongService songService;

    @PostMapping("/addSong")
    @Operation(summary = "Add Song to My Collection", description = "Add a new song/track to current user's collection")
    @ApiResponse(responseCode = "201", description = "Song added successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> addSong(@Valid @RequestBody Song song, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Adding new song: {} for user: {}", song.getTitle(), userEmail);
            Song saved = songService.saveUserSong(song, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "song", saved,
                "message", "Song added to your collection successfully"
            ));
        } catch (Exception e) {
            log.error("Error adding song: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to add song",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/allSongs")
    @Operation(summary = "Get My Songs", description = "Retrieve current user's songs/tracks")
    @ApiResponse(responseCode = "200", description = "Songs retrieved successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<List<Song>> getAllSongs(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<Song> songs = songService.getUserSongs(userEmail);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("Error retrieving user songs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/byGenre")
    @Operation(summary = "Get My Songs by Genre", description = "Retrieve current user's songs filtered by genre")
    @ApiResponse(responseCode = "200", description = "Songs retrieved successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<List<Song>> getByGenre(@RequestParam String genre, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Retrieving songs by genre: {} for user: {}", genre, userEmail);
            List<Song> songs = songService.getUserSongsByGenre(userEmail, genre);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("Error retrieving songs by genre {}: {}", genre, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sortedByArtist")
    @Operation(summary = "Get My Songs Sorted by Artist", description = "Retrieve current user's songs sorted by artist name")
    @ApiResponse(responseCode = "200", description = "Songs retrieved successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<List<Song>> sortedByArtist(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<Song> songs = songService.getUserSongsSortedByArtist(userEmail);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("Error retrieving songs sorted by artist: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/artist/upload")
    @Operation(summary = "Artist Upload Song", description = "Artists upload their original songs")
    @ApiResponse(responseCode = "201", description = "Song uploaded successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> artistUploadSong(@Valid @RequestBody Song song, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Artist uploading new song: {} by user: {}", song.getTitle(), userEmail);
            Song saved = songService.saveUserSong(song, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "song", saved,
                "message", "Song uploaded successfully"
            ));
        } catch (Exception e) {
            log.error("Error uploading song: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to upload song",
                "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete My Song", description = "Delete a song from current user's collection")
    @ApiResponse(responseCode = "204", description = "Song deleted successfully")
    @ApiResponse(responseCode = "404", description = "Song not found")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteSong(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Deleting song with ID: {} for user: {}", id, userEmail);
            songService.deleteUserSong(id, userEmail);
            return ResponseEntity.noContent().build();
        } catch (com.examly.springapp.exception.SongNotFoundException e) {
            log.warn("Song not found for deletion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Song not found",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error deleting song {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to delete song",
                "message", e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }
    
    @GetMapping("/debug/user-info")
    @Operation(summary = "Debug User Info", description = "Debug endpoint to check user-specific data")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> debugUserInfo(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<Song> userSongs = songService.getUserSongs(userEmail);
            return ResponseEntity.ok(Map.of(
                "userEmail", userEmail,
                "songCount", userSongs.size(),
                "songs", userSongs.stream().map(song -> Map.of(
                    "id", song.getId(),
                    "title", song.getTitle(),
                    "userEmail", song.getUser() != null ? song.getUser().getEmail() : "NO_USER"
                )).toList(),
                "message", "Debug info retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error getting debug info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Debug failed",
                "message", e.getMessage()
            ));
        }
    }
}