import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ThemeSelector.css';

function ThemeSelector() {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('light');

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️', free: true },
    { id: 'dark', name: 'Dark', icon: '🌙', free: true },
    { id: 'premium-pink', name: 'Premium Pink', icon: '💎', premium: true },
    { id: 'premium-gold', name: 'Premium Gold', icon: '✨', premium: true },
    { id: 'premium-purple', name: 'Premium Purple', icon: '🔮', premium: true }
  ];

  const isPremium = user?.role === 'PREMIUM_USER' || user?.role === 'ARTIST' || user?.role === 'ADMIN';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    let defaultTheme;
    
    if (savedTheme) {
      defaultTheme = savedTheme;
    } else {
      // Set default theme based on user role
      defaultTheme = isPremium ? 'dark' : 'light';
    }
    
    setCurrentTheme(defaultTheme);
    applyTheme(defaultTheme);
  }, [isPremium]);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    
    // Force re-render by updating CSS custom properties
    const root = document.documentElement;
    const themeColors = getThemeColors(theme);
    
    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };
  
  const getThemeColors = (theme) => {
    const themes = {
      light: {
        '--primary-color': '#667eea',
        '--secondary-color': '#764ba2',
        '--background-color': '#ffffff',
        '--surface-color': '#f9fafb',
        '--text-color': '#374151',
        '--text-secondary': '#6b7280',
        '--border-color': '#e5e7eb'
      },
      dark: {
        '--primary-color': '#818cf8',
        '--secondary-color': '#a78bfa',
        '--background-color': '#111827',
        '--surface-color': '#1f2937',
        '--text-color': '#f9fafb',
        '--text-secondary': '#d1d5db',
        '--border-color': '#374151'
      },
      'premium-pink': {
        '--primary-color': '#ec4899',
        '--secondary-color': '#f472b6',
        '--background-color': '#fdf2f8',
        '--surface-color': '#fce7f3',
        '--text-color': '#831843',
        '--text-secondary': '#be185d',
        '--border-color': '#f9a8d4'
      },
      'premium-gold': {
        '--primary-color': '#f59e0b',
        '--secondary-color': '#fbbf24',
        '--background-color': '#fffbeb',
        '--surface-color': '#fef3c7',
        '--text-color': '#92400e',
        '--text-secondary': '#d97706',
        '--border-color': '#fde68a'
      },
      'premium-purple': {
        '--primary-color': '#8b5cf6',
        '--secondary-color': '#a78bfa',
        '--background-color': '#f5f3ff',
        '--surface-color': '#ede9fe',
        '--text-color': '#5b21b6',
        '--text-secondary': '#7c3aed',
        '--border-color': '#c4b5fd'
      }
    };
    
    return themes[theme] || themes.light;
  };

  const handleThemeChange = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    
    if (theme.premium && !isPremium) {
      alert('🔒 Premium themes are only available for Premium users!');
      return;
    }

    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
  };

  return (
    <div className="theme-selector">
      <button className="theme-toggle-btn" title="Change Theme">
        🎨
      </button>
      
      <div className="theme-dropdown">
        <h4>🎨 Choose Theme</h4>
        <div className="theme-grid">
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''} ${theme.premium && !isPremium ? 'locked' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
              disabled={theme.premium && !isPremium}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
              {theme.premium && !isPremium && <span className="lock-icon">🔒</span>}
            </button>
          ))}
        </div>
        
        {!isPremium && (
          <div className="premium-upsell">
            <p>💎 Unlock premium themes with Premium!</p>
            <button className="upgrade-btn">Upgrade Now</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThemeSelector;