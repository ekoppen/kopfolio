import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings moet binnen een SettingsProvider gebruikt worden');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_title: '',
    site_subtitle: '',
    subtitle_font: 'Roboto',
    subtitle_size: 14,
    subtitle_color: '#FFFFFF',
    accent_color: '#000000',
    font: 'Roboto',
    logo: null,
    logo_position: localStorage.getItem('appBarPosition') || 'top',
    logo_margin_top: 0,
    logo_margin_left: 0,
    subtitle_margin_top: 0,
    subtitle_margin_left: 0,
    footer_text: '',
    sidebar_pattern: 'none',
    pattern_opacity: 0.8,
    pattern_scale: 1,
    pattern_color: '#FCF4FF',
    logo_size: 0
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        const savedPosition = localStorage.getItem('appBarPosition');
        setSettings(prev => ({
          ...prev,
          ...response.data,
          logo_position: savedPosition || response.data.logo_position || 'top',
          subtitle_size: parseInt(response.data.subtitle_size) || 14,
          logo_margin_top: parseInt(response.data.logo_margin_top) || 0,
          logo_margin_left: parseInt(response.data.logo_margin_left) || 0,
          subtitle_margin_top: parseInt(response.data.subtitle_margin_top) || 0,
          subtitle_margin_left: parseInt(response.data.subtitle_margin_left) || 0,
          pattern_opacity: parseFloat(response.data.pattern_opacity) || 0.8,
          pattern_scale: parseFloat(response.data.pattern_scale) || 1,
          logo_size: parseInt(response.data.logo_size) || 0
        }));
      } catch (error) {
        console.error('Fout bij laden site instellingen:', error);
      }
    };

    loadSettings();

    // Luister naar settings updates van andere componenten
    const handleSettingsUpdate = (event) => {
      const newSettings = event.detail;
      setSettings(prev => ({
        ...prev,
        ...newSettings,
        subtitle_size: parseInt(newSettings.subtitle_size) || prev.subtitle_size,
        logo_margin_top: parseInt(newSettings.logo_margin_top) || prev.logo_margin_top,
        logo_margin_left: parseInt(newSettings.logo_margin_left) || prev.logo_margin_left,
        subtitle_margin_top: parseInt(newSettings.subtitle_margin_top) || prev.subtitle_margin_top,
        subtitle_margin_left: parseInt(newSettings.subtitle_margin_left) || prev.subtitle_margin_left,
        pattern_opacity: parseFloat(newSettings.pattern_opacity) || prev.pattern_opacity,
        pattern_scale: parseFloat(newSettings.pattern_scale) || prev.pattern_scale,
        logo_size: parseInt(newSettings.logo_size) || prev.logo_size
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      await api.put('/settings', newSettings);
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: newSettings
      }));
      return true;
    } catch (error) {
      console.error('Fout bij updaten instellingen:', error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 