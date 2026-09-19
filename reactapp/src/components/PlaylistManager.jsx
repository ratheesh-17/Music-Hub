import React, { useState, useEffect } from 'react';
import { getMyPlaylists, createPlaylist, deletePlaylist } from '../services/playlist-api';
import './AuthPage.css';

function PlaylistManager() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    isCollaborative: false
  });

  // Load user's playlists
  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const userPlaylists = await getMyPlaylists();
      setPlaylists(userPlaylists);
      setError('');
    } catch (err) {
      setError('Failed to load playlists: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Playlist title is required');
      return;
    }

    setLoading(true);
    try {
      await createPlaylist(formData);
      setFormData({ title: '', description: '', isPublic: false, isCollaborative: false });
      setShowCreateForm(false);
      await loadPlaylists(); // Reload playlists
      setError('');
    } catch (err) {
      setError('Failed to create playlist: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete playlist
  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await deletePlaylist(playlistId);
      await loadPlaylists(); // Reload playlists
    } catch (err) {
      setError('Failed to delete playlist: ' + err.message);
    }
  };

  // Load playlists on component mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  return (
    <div className="playlist-manager">
      <div className="playlist-header">
        <h2>🎵 My Playlists</h2>
        <button 
          className="auth-submit-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Create Playlist'}
        </button>
      </div>

      {error && (
        <div className="error-message general-error">
          {error}
        </div>
      )}

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="auth-form" style={{ maxWidth: '500px', margin: '1rem auto' }}>
          <form onSubmit={handleCreatePlaylist} className="auth-form-fields">
            <div className="input-group">
              <label htmlFor="title">Playlist Title *</label>
              <div className="input-wrapper">
                <span className="input-icon">🎵</span>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter playlist title"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="description">Description</label>
              <div className="input-wrapper">
                <span className="input-icon">📝</span>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter playlist description (optional)"
                  rows="3"
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                🌍 Make playlist public
              </label>
            </div>

            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isCollaborative}
                  onChange={(e) => setFormData(prev => ({ ...prev, isCollaborative: e.target.checked }))}
                />
                🤝 Allow collaboration
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? '🔄 Creating...' : '✨ Create Playlist'}
            </button>
          </form>
        </div>
      )}

      {/* Playlists List */}
      {loading && !showCreateForm && (
        <div className="loading-message">
          🔄 Loading playlists...
        </div>
      )}

      {playlists.length === 0 && !loading && !showCreateForm && (
        <div className="no-playlists">
          <h3>📭 No Playlists Yet</h3>
          <p>Create your first playlist to get started!</p>
        </div>
      )}

      <div className="playlists-grid">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="playlist-card">
            <div className="playlist-info">
              <h3>{playlist.title}</h3>
              <p>{playlist.description || 'No description'}</p>
              <div className="playlist-meta">
                <span>🎵 {playlist.trackCount} songs</span>
                <span>{playlist.isPublic ? '🌍 Public' : '🔒 Private'}</span>
                {playlist.isCollaborative && <span>🤝 Collaborative</span>}
              </div>
              <div className="playlist-dates">
                <small>Created: {new Date(playlist.createdDate).toLocaleDateString()}</small>
              </div>
            </div>
            <div className="playlist-actions">
              <button 
                className="delete-btn"
                onClick={() => handleDeletePlaylist(playlist.id)}
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

export default PlaylistManager;