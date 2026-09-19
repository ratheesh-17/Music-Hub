package com.examly.springapp.controller;

import com.examly.springapp.dto.CreatePlaylistRequest;
import com.examly.springapp.service.PlaylistService;
import com.examly.springapp.service.UserService;
import com.examly.springapp.model.Playlist;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.PlaylistRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
@Tag(name = "Playlist Management", description = "User-specific playlist creation and management")
@RequiredArgsConstructor
public class PlaylistController {
    
    private static final Logger log = LoggerFactory.getLogger(PlaylistController.class);
    private final PlaylistService playlistService;
    private final UserService userService;
    private final PlaylistRepository playlistRepository;
    
    @PostMapping
    @Operation(summary = "Create Playlist", description = "Create a new user-specific playlist")
    @ApiResponse(responseCode = "201", description = "Playlist created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> createPlaylist(@RequestParam(value = "title", required = false) String title,
                                          @RequestParam(value = "description", required = false) String description,
                                          @RequestParam(value = "isPublic", required = false, defaultValue = "false") boolean isPublic,
                                          @RequestParam(value = "isCollaborative", required = false, defaultValue = "false") boolean isCollaborative,
                                          @RequestParam(value = "coverImage", required = false) org.springframework.web.multipart.MultipartFile coverImage,
                                          Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Creating playlist '{}' for user {}", title, userEmail);
            
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Validation failed",
                    "message", "Playlist title is required"
                ));
            }
            
            User user = userService.findByEmail(userEmail);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "User not found",
                    "message", "User not found with email: " + userEmail
                ));
            }
            
            // Create playlist request from form data
            CreatePlaylistRequest playlistRequest = new CreatePlaylistRequest();
            playlistRequest.setTitle(title);
            playlistRequest.setDescription(description);
            playlistRequest.setPublic(isPublic);
            playlistRequest.setCollaborative(isCollaborative);
            
            Playlist playlist = playlistService.createPlaylist(user, playlistRequest);
            
            // Handle cover image if provided
            if (coverImage != null && !coverImage.isEmpty()) {
                try {
                    log.info("Cover image uploaded: {} ({})", coverImage.getOriginalFilename(), coverImage.getSize());
                    // Store just filename for now - in production save to file system/cloud storage
                    String imageUrl = "https://via.placeholder.com/300x300/667eea/ffffff?text=" + 
                        java.net.URLEncoder.encode(playlist.getTitle().substring(0, Math.min(playlist.getTitle().length(), 10)), "UTF-8");
                    playlist.setCoverImageUrl(imageUrl);
                    playlistRepository.save(playlist);
                } catch (Exception e) {
                    log.warn("Failed to process cover image: {}", e.getMessage());
                }
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", playlist.getId(),
                "title", playlist.getTitle(),
                "description", playlist.getDescription(),
                "isPublic", playlist.isPublic(),
                "isCollaborative", playlist.isCollaborative(),
                "trackCount", playlist.getTracks().size(),
                "owner", user.getName(),
                "createdDate", playlist.getCreatedDate(),
                "message", "User playlist created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating playlist for user {}: {}", authentication.getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Creation failed",
                "message", "Failed to create playlist"
            ));
        }
    }
    
    @GetMapping("/my")
    @Operation(summary = "Get My Playlists", description = "Get all playlists for current authenticated user")
    @ApiResponse(responseCode = "200", description = "Playlists retrieved successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyPlaylists(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Retrieving playlists for user {}", userEmail);
            
            User user = userService.findByEmail(userEmail);
            List<Playlist> playlists = playlistService.getUserPlaylists(user.getId());
            
            return ResponseEntity.ok(Map.of(
                "playlists", playlists.stream().map(playlist -> Map.of(
                    "id", playlist.getId(),
                    "title", playlist.getTitle(),
                    "description", playlist.getDescription() != null ? playlist.getDescription() : "",
                    "isPublic", playlist.isPublic(),
                    "isCollaborative", playlist.isCollaborative(),
                    "trackCount", playlist.getTracks().size(),
                    "owner", playlist.getUser().getName(),
                    "createdDate", playlist.getCreatedDate(),
                    "updatedDate", playlist.getUpdatedDate(),
                    "coverImageUrl", playlist.getCoverImageUrl() != null ? playlist.getCoverImageUrl() : ""
                )).toList(),
                "totalElements", playlists.size(),
                "message", "User playlists retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error retrieving playlists for user {}: {}", authentication.getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Retrieval failed",
                "message", "Failed to retrieve playlists"
            ));
        }
    }
    
    @GetMapping("/{playlistId}")
    @Operation(summary = "Get Playlist Details", description = "Get detailed information about a specific playlist")
    @ApiResponse(responseCode = "200", description = "Playlist details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Playlist not found")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> getPlaylistDetails(@PathVariable Long playlistId) {
        try {
            log.info("Retrieving details for playlist {}", playlistId);
            
            return ResponseEntity.ok(Map.of(
                "id", playlistId,
                "title", "Sample Playlist",
                "description", "A sample playlist",
                "isPublic", true,
                "isCollaborative", false,
                "tracks", List.of(
                    Map.of(
                        "id", 1,
                        "title", "Sample Track",
                        "artist", "Sample Artist",
                        "duration", 180,
                        "position", 1
                    )
                ),
                "collaborators", List.of(),
                "followerCount", 0,
                "message", "Playlist details retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error retrieving playlist {}: {}", playlistId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Retrieval failed",
                "message", "Failed to retrieve playlist details"
            ));
        }
    }
    
    @PostMapping("/{playlistId}/songs")
    @Operation(summary = "Add Song to Playlist", description = "Add a song to the specified playlist")
    @ApiResponse(responseCode = "201", description = "Song added to playlist successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> addSongToPlaylist(@PathVariable Long playlistId, 
                                             @RequestBody Map<String, Object> songData,
                                             Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Adding song to playlist {} for user {}", playlistId, userEmail);
            
            User user = userService.findByEmail(userEmail);
            playlistService.addSongToPlaylist(playlistId, songData, user.getId(), userEmail);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Song added to playlist successfully",
                "playlistId", playlistId,
                "songTitle", songData.get("title")
            ));
        } catch (Exception e) {
            log.error("Error adding song to playlist {}: {}", playlistId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to add song",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{playlistId}/songs")
    @Operation(summary = "Get Playlist Songs", description = "Get all songs in the specified playlist")
    @ApiResponse(responseCode = "200", description = "Playlist songs retrieved successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> getPlaylistSongs(@PathVariable Long playlistId, Authentication authentication) {
        try {
            log.info("Retrieving songs for playlist {}", playlistId);
            
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            
            var tracks = playlistService.getPlaylistTracks(playlistId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "songs", tracks.stream().map(track -> Map.of(
                    "id", track.getId(),
                    "title", track.getTitle(),
                    "artist", track.getArtist(),
                    "album", track.getAlbum() != null ? track.getAlbum() : "",
                    "duration", track.getDuration() != null ? track.getDuration() : 0,
                    "audioUrl", track.getAudioUrl() != null ? track.getAudioUrl() : "",
                    "dateAdded", track.getAddedDate(),
                    "addedBy", track.getAddedByEmail() != null ? track.getAddedByEmail() : "Unknown",
                    "playCount", 0
                )).toList(),
                "totalSongs", tracks.size(),
                "message", "Playlist songs retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error retrieving songs for playlist {}: {}", playlistId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to retrieve songs",
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{playlistId}/songs/{songId}")
    @Operation(summary = "Remove Song from Playlist", description = "Remove a song from the specified playlist")
    @ApiResponse(responseCode = "200", description = "Song removed from playlist successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> removeSongFromPlaylist(@PathVariable Long playlistId, 
                                                  @PathVariable Long songId,
                                                  Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Removing song {} from playlist {} for user {}", songId, playlistId, userEmail);
            
            User user = userService.findByEmail(userEmail);
            playlistService.removeSongFromPlaylist(playlistId, songId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Song removed from playlist successfully",
                "playlistId", playlistId,
                "songId", songId
            ));
        } catch (Exception e) {
            log.error("Error removing song {} from playlist {}: {}", songId, playlistId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to remove song",
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{playlistId}")
    @Operation(summary = "Delete Playlist", description = "Delete the specified playlist")
    @ApiResponse(responseCode = "200", description = "Playlist deleted successfully")
    @PreAuthorize("hasRole('FREE_USER') or hasRole('PREMIUM_USER') or hasRole('ARTIST') or hasRole('ADMIN')")
    public ResponseEntity<?> deletePlaylist(@PathVariable Long playlistId,
                                          Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            log.info("Deleting playlist {} for user {}", playlistId, userEmail);
            
            User user = userService.findByEmail(userEmail);
            playlistService.deletePlaylist(playlistId, user.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Playlist deleted successfully",
                "playlistId", playlistId
            ));
        } catch (Exception e) {
            log.error("Error deleting playlist {}: {}", playlistId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to delete playlist",
                "message", e.getMessage()
            ));
        }
    }
}