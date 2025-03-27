// API URL für verschiedene Umgebungen
export const API_BASE_URL = 
  process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions/api'  // Netlify Functions Pfad in Produktion
    : '';  // Leerer Pfad für lokale Entwicklung