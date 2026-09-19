package com.examly.springapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_tracks")
public class PlaylistTrack {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String artist;
    
    private String album;
    
    private Integer duration;
    
    @Column(name = "audio_url")
    private String audioUrl;
    
    @Column(name = "added_date")
    private LocalDateTime addedDate;
    
    @Column(name = "position_order")
    private Integer position = 0;
    
    @Column(name = "added_by_email")
    private String addedByEmail;
    
    @PrePersist
    protected void onCreate() {
        addedDate = LocalDateTime.now();
    }
    
    // Constructors
    public PlaylistTrack() {}
    
    public PlaylistTrack(Playlist playlist, String title, String artist, String album, Integer duration, String audioUrl) {
        this.playlist = playlist;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.audioUrl = audioUrl;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Playlist getPlaylist() { return playlist; }
    public void setPlaylist(Playlist playlist) { this.playlist = playlist; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }
    
    public String getAlbum() { return album; }
    public void setAlbum(String album) { this.album = album; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    
    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }
    
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    
    public String getAddedByEmail() { return addedByEmail; }
    public void setAddedByEmail(String addedByEmail) { this.addedByEmail = addedByEmail; }
}