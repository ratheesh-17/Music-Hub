import React, { useState, useEffect, useRef } from 'react';
import { getMyPlaylists, createPlaylistWithImage, deletePlaylist } from '../services/playlist-api';
import PlaylistDetailView from './PlaylistDetailView';
import './PlaylistManagerEnhanced.css';

function PlaylistManagerEnhanced() {
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
    genre: '',
    mood: '',
    coverImage: null
  });

  const fileInputRef = useRef(null);

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Indie', 'Alternative'];
  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic', 'Party', 'Focus', 'Workout', 'Sleep', 'Study'];

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const userPlaylists = await getMyPlaylists();
      setPlaylists(userPlaylists);
      setFilteredPlaylists(userPlaylists);
      setError('');
    } catch (err) {
      setError('Failed to load playlists: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Playlist title is required');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isPublic', formData.isPublic);
      formDataToSend.append('isCollaborative', formData.isCollaborative);
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }
      
      await createPlaylistWithImage(formDataToSend);
      setFormData({ 
        title: '', 
        description: '', 
        isPublic: false, 
        isCollaborative: false,
        genre: '',
        mood: '',
        coverImage: null
      });
      setShowCreateForm(false);
      await loadPlaylists();
      setError('');
    } catch (err) {
      setError('Failed to create playlist: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await deletePlaylist(playlistId);
      await loadPlaylists();
    } catch (err) {
      setError('Failed to delete playlist: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlaylists.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedPlaylists.length} selected playlists?`)) {
      return;
    }

    try {
      await Promise.all(selectedPlaylists.map(id => deletePlaylist(id)));
      setSelectedPlaylists([]);
      setShowBulkActions(false);
      await loadPlaylists();
    } catch (err) {
      setError('Failed to delete playlists: ' + err.message);
    }
  };

  const handlePlaylistSelect = (playlistId) => {
    setSelectedPlaylists(prev => {
      const newSelection = prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedPlaylists.length === filteredPlaylists.length) {
      setSelectedPlaylists([]);
      setShowBulkActions(false);
    } else {
      setSelectedPlaylists(filteredPlaylists.map(p => p.id));
      setShowBulkActions(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
    }
  };

  const filterAndSortPlaylists = () => {
    let filtered = [...playlists];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(playlist =>
        playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(playlist => {
        switch (filterBy) {
          case 'public': return playlist.isPublic;
          case 'private': return !playlist.isPublic;
          case 'collaborative': return playlist.isCollaborative;
          case 'recent': return new Date(playlist.createdDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical': return a.title.localeCompare(b.title);
        case 'oldest': return new Date(a.createdDate) - new Date(b.createdDate);
        case 'tracks': return (b.trackCount || 0) - (a.trackCount || 0);
        case 'recent':
        default: return new Date(b.createdDate) - new Date(a.createdDate);
      }
    });

    setFilteredPlaylists(filtered);
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    filterAndSortPlaylists();
  }, [playlists, searchQuery, filterBy, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPlaylistStats = () => {
    const totalTracks = playlists.reduce((sum, p) => sum + (p.trackCount || 0), 0);
    const publicPlaylists = playlists.filter(p => p.isPublic).length;
    const collaborativePlaylists = playlists.filter(p => p.isCollaborative).length;
    
    return { totalTracks, publicPlaylists, collaborativePlaylists };
  };

  const stats = getPlaylistStats();

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowDetailView(true);
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedPlaylist(null);
  };

  const handlePlaylistUpdate = (updatedPlaylist) => {
    setPlaylists(prev => prev.map(p => 
      p.id === updatedPlaylist.id ? updatedPlaylist : p
    ));
    setSelectedPlaylist(updatedPlaylist);
  };

  if (showDetailView && selectedPlaylist) {
    return (
      <PlaylistDetailView 
        playlist={selectedPlaylist}
        onBack={handleBackToList}
        onUpdate={handlePlaylistUpdate}
      />
    );
  }

  return (
    <div className="playlist-manager-enhanced">
      {/* Header Section */}
      <div className="playlist-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🎵 My Music Library</h1>
            <p>Manage and organize your playlists</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{playlists.length}</span>
              <span className="stat-label">Playlists</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.totalTracks}</span>
              <span className="stat-label">Songs</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.publicPlaylists}</span>
              <span className="stat-label">Public</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="create-btn primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <span className="btn-icon">➕</span>
            Create Playlist
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Controls Section */}
      <div className="playlist-controls">
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Playlists</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="collaborative">Collaborative</option>
            <option value="recent">Recent</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Recently Created</option>
            <option value="alphabetical">A-Z</option>
            <option value="oldest">Oldest First</option>
            <option value="tracks">Most Songs</option>
          </select>
        </div>

        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
        </div>

        {filteredPlaylists.length > 0 && (
          <div className="bulk-controls">
            <button 
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              {selectedPlaylists.length === filteredPlaylists.length ? '☑️' : '☐'} 
              Select All
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bulk-actions">
          <span className="bulk-info">
            {selectedPlaylists.length} playlist{selectedPlaylists.length !== 1 ? 's' : ''} selected
          </span>
          <button 
            className="bulk-delete-btn"
            onClick={handleBulkDelete}
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="create-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✨ Create New Playlist</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="create-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Playlist Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter playlist name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your playlist..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="input-group">
                  <label>Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Mood</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                  >
                    <option value="">Select Mood</option>
                    {moods.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Cover Image</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📷 Choose Image
                    </button>
                    {formData.coverImage && (
                      <span className="file-name">{formData.coverImage.name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <span className="checkmark"></span>
                    🌍 Make playlist public
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isCollaborative}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCollaborative: e.target.checked }))}
                    />
                    <span className="checkmark"></span>
                    🤝 Allow collaboration
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? '🔄 Creating...' : '✨ Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlists Display */}
      {loading && !showCreateForm && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your playlists...</p>
        </div>
      )}

      {filteredPlaylists.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <h3>No playlists found</h3>
          <p>
            {searchQuery || filterBy !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first playlist to get started!'
            }
          </p>
          {!searchQuery && filterBy === 'all' && (
            <button 
              className="create-btn primary"
              onClick={() => setShowCreateForm(true)}
            >
              ➕ Create Your First Playlist
            </button>
          )}
        </div>
      )}

      <div className={`playlists-container ${viewMode}`}>
        {filteredPlaylists.map((playlist) => (
          <div 
            key={playlist.id} 
            className={`playlist-card ${selectedPlaylists.includes(playlist.id) ? 'selected' : ''}`}
          >
            <div className="playlist-select">
              <input
                type="checkbox"
                checked={selectedPlaylists.includes(playlist.id)}
                onChange={() => handlePlaylistSelect(playlist.id)}
              />
            </div>

            <div className="playlist-cover">
              {playlist.coverImageUrl ? (
                <img src={playlist.coverImageUrl} alt={playlist.title} className="cover-image" />
              ) : (
                <div className="cover-placeholder">
                  🎵
                </div>
              )}
              <div className="playlist-overlay">
                <button className="play-btn">▶️</button>
              </div>
            </div>

            <div className="playlist-info" onClick={() => handlePlaylistClick(playlist)}>
              <h3 className="playlist-title">{playlist.title}</h3>
              <p className="playlist-description">
                {playlist.description || 'No description'}
              </p>
              
              <div className="playlist-meta">
                <span className="track-count">🎵 {playlist.trackCount || 0} songs</span>
                <span className="visibility">
                  {playlist.isPublic ? '🌍 Public' : '🔒 Private'}
                </span>
                {playlist.isCollaborative && (
                  <span className="collaborative" title="Anyone can add/remove songs">
                    🤝 Open Collaboration
                  </span>
                )}
              </div>

              <div className="playlist-tags">
                {playlist.genre && (
                  <span className="tag genre">{playlist.genre}</span>
                )}
                {playlist.mood && (
                  <span className="tag mood">{playlist.mood}</span>
                )}
              </div>

              <div className="playlist-date">
                <small>Created {new Date(playlist.createdDate).toLocaleDateString()}</small>
              </div>
            </div>

            <div className="playlist-actions">
              <button 
                className="action-btn edit" 
                title="Edit playlist"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaylistClick(playlist);
                }}
              >
                ✏️
              </button>
              <button 
                className="action-btn share" 
                title="Share playlist"
                onClick={(e) => e.stopPropagation()}
              >
                📤
              </button>
              <button 
                className="action-btn download" 
                title="Download playlist"
                onClick={(e) => e.stopPropagation()}
              >
                💾
              </button>
              <button 
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePlaylist(playlist.id);
                }}
                title="Delete playlist"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlaylistManagerEnhanced;