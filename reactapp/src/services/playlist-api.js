// Playlist API Service
const API_BASE_URL = process.env.REACT_APP_API_BASE ? 
  `${process.env.REACT_APP_API_BASE.replace(/\/$/, '')}/api` : 
  'http://localhost:8080/api';

// Get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get user's playlists
export const getMyPlaylists = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists/my`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlists: ${response.status}`);
  }
  
  const data = await response.json();
  return data.playlists || [];
};

// Create new playlist
export const createPlaylist = async (playlistData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(playlistData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create playlist: ${error.message || response.status}`);
  }
  
  return await response.json();
};

// Create playlist with image upload
export const createPlaylistWithImage = async (formData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData - browser sets it automatically
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create playlist: ${error || response.status}`);
  }
  
  return await response.json();
};

// Get playlist details
export const getPlaylistDetails = async (playlistId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist details: ${response.status}`);
  }
  
  return await response.json();
};

// Delete playlist
export const deletePlaylist = async (playlistId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete playlist: ${response.status}`);
  }
  
  return true;
};

// Get playlist songs
export const getPlaylistSongs = async (playlistId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist songs: ${response.status}`);
  }
  
  const data = await response.json();
  return data.songs || [];
};

// Add song to playlist
export const addSongToPlaylist = async (playlistId, songData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(songData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to add song to playlist: ${error.message || response.status}`);
  }
  
  return await response.json();
};

// Remove song from playlist
export const removeSongFromPlaylist = async (playlistId, songId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to remove song from playlist: ${response.status}`);
  }
  
  return true;
};