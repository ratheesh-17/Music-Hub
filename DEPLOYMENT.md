# Deployment Configuration

## Required Environment Variables

### Backend (Spring Boot)
```bash
DATABASE_URL=jdbc:mysql://your-db-host:3306/spotify_playlist_db?createDatabaseIfNotExist=true
DATABASE_USERNAME=your-db-username
DATABASE_PASSWORD=your-db-password
CORS_ALLOWED_ORIGINS=https://your-frontend-url,https://8081-*,https://3000-*
```

### Frontend (React)
```bash
REACT_APP_API_BASE=https://your-backend-url
```

## Deployment Steps

1. **Database Setup**
   - Create MySQL database on your hosting platform
   - Update DATABASE_* environment variables

2. **Backend Deployment**
   - Set environment variables in your hosting platform
   - Deploy Spring Boot application
   - Ensure port 8080 is accessible

3. **Frontend Deployment**
   - Set REACT_APP_API_BASE to your backend URL
   - Build: `npm run build`
   - Deploy build folder to static hosting

4. **CORS Configuration**
   - Update CORS_ALLOWED_ORIGINS with your actual frontend URL
   - Test cross-origin requests

## Security Notes
- Never commit database passwords to version control
- Use HTTPS in production
- Configure proper database security