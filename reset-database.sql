-- Reset database for user-specific collections
USE spotify_playlist_db;

-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS users;

-- The application will recreate tables with proper user relationships
-- Restart the Spring Boot application after running this script