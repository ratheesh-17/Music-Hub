import React, { useState, useEffect } from 'react';
import { getPlaylistSongs, removeSongFromPlaylist } from '../services/playlist-api';
import './PlaylistDetailView.css';

function PlaylistDetailView({ playlist, onBack, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: playlist?.title || '',
    description: playlist?.description || '',
    isPublic: playlist?.isPublic || false,
    isCollaborative: playlist?.isCollaborative || false
  });
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  useEffect(() => {
    // Load playlist tracks from API
    const loadPlaylistTracks = async () => {
      if (!playlist?.id) return;
      
      setLoading(true);
      try {
        const playlistTracks = await getPlaylistSongs(playlist.id);
        setTracks(playlistTracks);
      } catch (error) {
        console.error('Error loading playlist tracks:', error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlaylistTracks();
  }, [playlist]);

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onUpdate({ ...playlist, ...editData });
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleRemoveTrack = async (trackId) => {
    if (!window.confirm('Remove this song from the playlist?')) return;
    
    try {
      await removeSongFromPlaylist(playlist.id, trackId);
      setTracks(prev => prev.filter(track => track.id !== trackId));
    } catch (error) {
      console.error('Error removing track:', error);
      alert('Failed to remove song from playlist');
    }
  };

  const handlePlayTrack = (track) => {
    // Stop playlist mode when manually playing a track
    setIsPlayingAll(false);
    
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingTrackId(null);
    }

    // If clicking the same track that was playing, just stop
    if (playingTrackId === track.id) {
      return;
    }

    // Check if track has audio URL
    if (!track.audioUrl) {
      alert('🚫 No audio available for this track');
      return;
    }

    try {
      const audio = new Audio(track.audioUrl);
      
      audio.addEventListener('ended', () => {
        setCurrentAudio(null);
        setPlayingTrackId(null);
      });
      
      audio.addEventListener('error', () => {
        alert('⚠️ Unable to play this track. Audio source may be unavailable.');
        setCurrentAudio(null);
        setPlayingTrackId(null);
      });
      
      audio.play().then(() => {
        setCurrentAudio(audio);
        setPlayingTrackId(track.id);
        // Update current index for potential playlist continuation
        const trackIndex = sortedTracks.findIndex(t => t.id === track.id);
        setCurrentPlaylistIndex(trackIndex);
      }).catch(() => {
        alert('⚠️ Playback failed. Please try again.');
      });
    } catch (error) {
      alert('⚠️ Error playing track');
    }
  };

  const handlePlayAllToggle = () => {
    if (isPlayingAll) {
      // Pause current playback
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setPlayingTrackId(null);
      }
      setIsPlayingAll(false);
    } else {
      // Start or resume playlist
      if (sortedTracks.length === 0) {
        alert('🎵 No songs in this playlist to play');
        return;
      }
      
      setIsPlayingAll(true);
      playTrackAtIndex(currentPlaylistIndex);
    }
  };

  const playTrackAtIndex = (index) => {
    console.log(`Attempting to play track at index ${index}`);
    
    if (index >= sortedTracks.length) {
      console.log('Playlist finished');
      setIsPlayingAll(false);
      setCurrentPlaylistIndex(0);
      setPlayingTrackId(null);
      setCurrentAudio(null);
      return;
    }

    const track = sortedTracks[index];
    console.log(`Playing: ${track.title}`);
    
    if (!track.audioUrl) {
      console.log(`No audio URL for ${track.title}, skipping`);
      playTrackAtIndex(index + 1);
      return;
    }

    // Stop current audio first
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    try {
      const audio = new Audio(track.audioUrl);
      let hasAdvanced = false; // Prevent duplicate advances
      
      const advanceToNext = (reason) => {
        if (hasAdvanced) return; // Prevent duplicate calls
        hasAdvanced = true;
        
        console.log(`${reason}: ${track.title}`);
        
        // Clean up current audio
        audio.removeEventListener('ended', handleTrackEnd);
        audio.removeEventListener('error', handleTrackError);
        setCurrentAudio(null);
        setPlayingTrackId(null);
        
        const nextIndex = index + 1;
        if (nextIndex < sortedTracks.length) {
          console.log(`Auto-advancing to track ${nextIndex}`);
          setCurrentPlaylistIndex(nextIndex);
          setTimeout(() => playTrackAtIndex(nextIndex), 100);
        } else {
          console.log('Playlist completed');
          setIsPlayingAll(false);
          setCurrentPlaylistIndex(0);
        }
      };
      
      const handleTrackEnd = () => advanceToNext('Track ended');
      const handleTrackError = () => advanceToNext('Track error');
      
      audio.addEventListener('ended', handleTrackEnd);
      audio.addEventListener('error', handleTrackError);
      
      audio.play().then(() => {
        if (!hasAdvanced) {
          console.log(`Successfully started: ${track.title}`);
          setCurrentAudio(audio);
          setPlayingTrackId(track.id);
          setCurrentPlaylistIndex(index);
        }
      }).catch((error) => {
        console.log(`Play failed for: ${track.title}`, error);
        advanceToNext('Play failed');
      });
    } catch (error) {
      console.log(`Exception with track: ${track.title}`, error);
      const nextIndex = index + 1;
      if (nextIndex < sortedTracks.length) {
        setTimeout(() => playTrackAtIndex(nextIndex), 100);
      } else {
        setIsPlayingAll(false);
        setCurrentPlaylistIndex(0);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return tracks.reduce((total, track) => total + track.duration, 0);
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title);
      case 'artist': return a.artist.localeCompare(b.artist);
      case 'duration': return b.duration - a.duration;
      case 'playCount': return b.playCount - a.playCount;
      case 'dateAdded':
      default: return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });

  if (!playlist) {
    return (
      <div className="playlist-detail-error">
        <h2>Playlist not found</h2>
        <button onClick={onBack} className="back-btn">← Back to Playlists</button>
      </div>
    );
  }

  return (
    <div className="playlist-detail-view">
      {/* Header */}
      <div className="playlist-detail-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Playlists
        </button>
        
        <div className="playlist-hero">
          <div className="playlist-cover-large">
            <div className="cover-placeholder-large">🎵</div>
            <div className="cover-overlay">
              <button 
                className={`play-all-btn ${isPlayingAll ? 'playing' : ''}`}
                onClick={handlePlayAllToggle}
              >
                {isPlayingAll ? '⏸️ Pause All' : '▶️ Play All'}
              </button>
            </div>
          </div>
          
          <div className="playlist-info-large">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="edit-title"
                  placeholder="Playlist title"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  className="edit-description"
                  placeholder="Playlist description"
                  rows="3"
                />
                <div className="edit-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editData.isPublic}
                      onChange={(e) => setEditData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    🌍 Public
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editData.isCollaborative}
                      onChange={(e) => setEditData(prev => ({ ...prev, isCollaborative: e.target.checked }))}
                    />
                    🤝 Collaborative
                  </label>
                </div>
                <div className="edit-actions">
                  <button onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="save-btn" disabled={loading}>
                    {loading ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="playlist-title-large">{playlist.title}</h1>
                <p className="playlist-description-large">
                  {playlist.description || 'No description'}
                </p>
                
                <div className="playlist-stats">
                  <span className="stat">🎵 {tracks.length} songs</span>
                  <span className="stat">⏱️ {formatDuration(getTotalDuration())}</span>
                  <span className="stat">
                    {playlist.isPublic ? '🌍 Public' : '🔒 Private'}
                  </span>
                  {playlist.isCollaborative && (
                    <span className="stat">🤝 Collaborative</span>
                  )}
                </div>
                
                <div className="playlist-actions-large">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="action-btn edit"
                  >
                    ✏️ Edit Details
                  </button>
                  <button 
                    onClick={() => setShowAddSongs(true)}
                    className="action-btn add"
                  >
                    ➕ Add Songs
                  </button>
                  <button className="action-btn share">
                    📤 Share
                  </button>
                  <button className="action-btn download">
                    💾 Download
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="playlist-controls">
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search songs in playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sort-section">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="dateAdded">Recently Added</option>
            <option value="title">Title A-Z</option>
            <option value="artist">Artist A-Z</option>
            <option value="duration">Duration</option>
            <option value="playCount">Most Played</option>
          </select>
        </div>

        <div className="view-options">
          <button className="shuffle-btn">
            🔀 Shuffle
          </button>
          <button className="repeat-btn">
            🔁 Repeat
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="track-list">
        {sortedTracks.length === 0 ? (
          <div className="empty-playlist">
            <div className="empty-icon">🎵</div>
            <h3>No songs found</h3>
            <p>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Add some songs to get started!'
              }
            </p>
            <button 
              onClick={() => setShowAddSongs(true)}
              className="add-songs-btn"
            >
              ➕ Add Songs
            </button>
          </div>
        ) : (
          <div className="track-table">
            <div className="track-header">
              <span className="track-number">#</span>
              <span className="track-title">Title</span>
              <span className="track-artist">Artist</span>
              <span className="track-album">Album</span>
              <span className="track-duration">Duration</span>
              <span className="track-plays">Plays</span>
              <span className="track-actions">Actions</span>
            </div>
            
            {sortedTracks.map((track, index) => (
              <div key={track.id} className="track-row">
                <span className="track-number">{index + 1}</span>
                <div className="track-title">
                  <div className="track-info">
                    <span className="title">{track.title}</span>
                    <span className="date-added">
                      Added {new Date(track.dateAdded).toLocaleDateString()}
                      {track.addedBy && track.addedBy !== 'Unknown' && (
                        <span className="added-by"> by {track.addedBy}</span>
                      )}
                    </span>
                  </div>
                </div>
                <span className="track-artist">{track.artist}</span>
                <span className="track-album">{track.album}</span>
                <span className="track-duration">{formatDuration(track.duration)}</span>
                <span className="track-plays">{track.playCount}</span>
                <div className="track-actions">
                  <button 
                    className={`track-action-btn play ${playingTrackId === track.id ? 'playing' : ''}`}
                    title={playingTrackId === track.id ? 'Pause' : 'Play'}
                    onClick={() => handlePlayTrack(track)}
                  >
                    {playingTrackId === track.id ? '⏸️' : '▶️'}
                  </button>
                  <button className="track-action-btn like" title="Like">
                    ❤️
                  </button>
                  <button className="track-action-btn add-to-queue" title="Add to Queue">
                    ➕
                  </button>
                  <button 
                    className="track-action-btn remove" 
                    title="Remove from Playlist"
                    onClick={() => handleRemoveTrack(track.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Songs Modal */}
      {showAddSongs && (
        <div className="modal-overlay" onClick={() => setShowAddSongs(false)}>
          <div className="add-songs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Songs to Playlist</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddSongs(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="search-songs">
                <input
                  type="text"
                  placeholder="Search for songs to add..."
                  className="song-search-input"
                />
              </div>
              
              <div className="available-songs">
                <p>🔍 Search results will appear here</p>
                <p>You can also browse your library or discover new music</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddSongs(false)}
              >
                Cancel
              </button>
              <button className="add-selected-btn">
                Add Selected Songs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistDetailView;