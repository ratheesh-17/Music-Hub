# MusicHub Pro

A full-stack music management and streaming platform inspired by modern music apps. The project combines a Spring Boot backend with a React frontend to provide user authentication, music collection management, playlists, artist upload workflows, discovery features, and admin controls.

## Overview

This application allows users to:

- Sign up, log in, and manage profiles
- Explore and manage a personal music library
- Filter, sort, and paginate songs by genre, artist, and duration
- Create and manage playlists
- Browse discovery-style music content
- Upload songs as an artist
- View analytics and admin dashboard statistics
- Access role-based features for free, premium, artist, and admin users

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- CSS modules and custom styling
- Jest + Testing Library for frontend testing

### Backend
- Java 17
- Spring Boot 3.0.1
- Spring Security
- Spring Data JPA
- MySQL
- JWT-based authentication
- Swagger/OpenAPI

## Project Structure

```text
.
├── README.md
├── DEPLOYMENT.md
├── reset-database.sql
├── start-backend.bat
├── debug-playlist.bat
├── quick-fix.bat
├── fix-collections.bat
├── restart-app.bat
├── reactapp/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       ├── tests/
│       ├── utils/
│       ├── App.jsx
│       └── index.js
└── springapp/
    ├── mvnw
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/
        │   └── resources/
        └── test/
```

## Features

### Authentication and User Management
- User registration and login
- JWT token validation
- Profile update and password change
- Account deletion
- Role-based access control:
  - FREE_USER
  - PREMIUM_USER
  - ARTIST
  - ADMIN

### Music Library
- Add songs to personal collection
- Retrieve all songs or filter by genre
- Sort songs by artist
- Duration and artist filters
- Pagination support

### Playlists
- Create playlists
- Set public/private and collaborative settings
- View user playlists
- Add songs to playlists
- Playlist metadata and song tracking

### Discovery and Exploration
- Search and browse music content
- Explore artists and a JioSaavn-inspired interface
- Discovery feed for tracks and recommendations

### Artist Features
- Artist upload workflow
- Song management for artist-added tracks
- Role-gated upload APIs

### Admin Features
- View all users
- Manage user roles and status
- View dashboard statistics
- Review music content and platform metrics

## Prerequisites

Before running the project, make sure you have:

- Java 17 or later
- Maven
- Node.js 18+ and npm
- MySQL database server
- Git

## Environment Setup

### Backend Configuration
The backend reads database and application settings from environment variables or defaults in [springapp/src/main/resources/application.properties](springapp/src/main/resources/application.properties).

Default values:

```bash
DATABASE_URL=jdbc:mysql://localhost:3306/spotify_playlist_db?createDatabaseIfNotExist=true
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
```

You can override them in your shell before starting the backend:

```bash
export DATABASE_URL="jdbc:mysql://localhost:3306/spotify_playlist_db?createDatabaseIfNotExist=true"
export DATABASE_USERNAME="root"
export DATABASE_PASSWORD="password"
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL = "jdbc:mysql://localhost:3306/spotify_playlist_db?createDatabaseIfNotExist=true"
$env:DATABASE_USERNAME = "root"
$env:DATABASE_PASSWORD = "password"
```

### MySQL Database
Create or ensure the database exists:

```sql
CREATE DATABASE IF NOT EXISTS spotify_playlist_db;
```

## Running the Application

### 1) Start the Backend
From the project root:

```bash
cd springapp
./mvnw spring-boot:run
```

On Windows:

```powershell
cd springapp
mvnw.cmd spring-boot:run
```

The backend runs on:

- http://localhost:8080

Swagger/OpenAPI documentation is available at:

- http://localhost:8080/swagger-ui/index.html

### 2) Start the Frontend
Open a second terminal:

```bash
cd reactapp
npm install
npm start
```

The frontend runs on:

- http://localhost:8081

## Windows Helper Scripts

This project includes Windows batch utilities for convenience:

- [start-backend.bat](start-backend.bat) — starts the backend
- [debug-playlist.bat](debug-playlist.bat) — compiles and launches both backend and frontend
- [quick-fix.bat](quick-fix.bat) — quick repair workflow
- [restart-app.bat](restart-app.bat) — restarts the app
- [fix-collections.bat](fix-collections.bat) — utility for collection-related fixes

## Main API Endpoints

### Authentication
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/profile
- PUT /api/auth/profile
- POST /api/auth/change-password
- POST /api/auth/logout
- DELETE /api/auth/account
- GET /api/auth/validate-token

### Songs
- POST /api/songs/addSong
- GET /api/songs/allSongs
- GET /api/songs/byGenre
- GET /api/songs/sortedByArtist
- POST /api/songs/artist/upload
- DELETE /api/songs/{id}

### Playlists
- POST /api/playlists
- GET /api/playlists/my
- GET /api/playlists/{playlistId}
- POST /api/playlists/{playlistId}/songs
- GET /api/playlists/{playlistId}/songs

### Admin
- GET /api/admin/users
- GET /api/admin/users/{id}
- PUT /api/admin/users/{id}/status
- PUT /api/admin/users/{id}/role
- GET /api/admin/dashboard/stats

## Default Roles and Access

The project supports the following user tiers and permissions:

- FREE_USER: basic access to music collection and playlists
- PREMIUM_USER: premium analytics and enhanced access
- ARTIST: can upload songs and access artist-specific workflows
- ADMIN: manages users, dashboard, and admin features

## Frontend Usage

After login, the app provides these screens/views:

- Music Hub / discovery view
- My Collection
- My Playlists
- Analytics
- Upload Song (for artists)
- Admin Dashboard (for admins)

## Testing

Frontend tests are under [reactapp/src/tests](reactapp/src/tests).

To run frontend tests:

```bash
cd reactapp
npm test -- --watch=false
```

Backend tests are under [springapp/src/test/java](springapp/src/test/java).

To run backend tests:

```bash
cd springapp
./mvnw test
```

## Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

Key deployment notes:

- Update MySQL credentials and CORS origins
- Use HTTPS in production
- Set proper JWT and database environment variables
- Deploy the Spring Boot app on port 8080
- Deploy the React build to a static hosting provider or equivalent frontend server

## Notes

- The backend uses the default local configuration from [springapp/src/main/resources/application.properties](springapp/src/main/resources/application.properties).
- Frontend requests are proxied and configured for local development and the provided environment.
- This project is designed as a music platform prototype and can be extended with storage, media hosting, real streaming, and richer analytics.

## License

This project is for educational and portfolio/demo use unless otherwise specified by the repository owner.

## Contributing

Pull requests and improvements are welcome. For larger changes, please open an issue to discuss the approach before making substantial updates.

## Troubleshooting

### Backend fails to start
- Ensure MySQL is running
- Confirm database credentials are correct
- Check Java 17 is installed
- Verify the port 8080 is free

### Frontend cannot connect to backend
- Confirm the backend is running
- Check CORS settings in the backend configuration
- Verify the frontend is opening on port 8081

### Database errors
- Ensure the database exists
- Confirm the user has table creation rights or initialize schema as needed

## Summary

MusicHub Pro is a music-focused full-stack application that demonstrates modern full-stack architecture, authentication, role-based access, content management, and admin controls. It is a strong base for extending into a production-ready music platform.
