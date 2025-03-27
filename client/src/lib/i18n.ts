// i18n.ts - Internationalization support
export type Language = 'en' | 'de';
export type TranslationKey = keyof typeof translations.en;

// Define all translations here
export const translations = {
  en: {
    // Header
    home: 'Home',
    videos: 'Videos',
    downloads: 'Downloads',
    login: 'Login',
    logout: 'Logout',
    adminPanel: 'Admin Panel',
    
    // LivestreamBanner
    liveStream: 'LIVE STREAM',
    liveNow: 'Live now on YouTube!',
    watchNow: 'Watch Now',
    
    // Footer
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',
    
    // HomePage
    latestVideos: 'Latest Videos',
    viewMore: 'View More',
    subscriberCount: 'Subscribers',
    refreshCount: 'Refresh',
    
    // VideosPage
    videoCategories: 'Video Categories',
    allVideos: 'All Videos',
    
    // Comment Section
    comments: 'Comments',
    leaveComment: 'Leave a comment',
    yourName: 'Your Name',
    yourComment: 'Your Comment',
    submit: 'Submit',
    commentSubmitted: 'Thank you for your comment! It will be visible after approval.',
    
    // DownloadsPage
    downloadResources: 'Download Resources',
    downloadNow: 'Download Now',
    
    // Login
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    loginError: 'Invalid username or password',
    
    // Admin Panel
    generalSettings: 'General Settings',
    livestreamSettings: 'Livestream Settings',
    videoManagement: 'Video Management',
    downloadManagement: 'Download Management',
    notificationManagement: 'Notification Management',
    isLiveStreaming: 'Is Live Streaming',
    livestreamId: 'Livestream ID',
    save: 'Save',
    settingsSaved: 'Settings saved successfully',
  },
  de: {
    // Header
    home: 'Startseite',
    videos: 'Videos',
    downloads: 'Downloads',
    login: 'Anmelden',
    logout: 'Abmelden',
    adminPanel: 'Admin-Bereich',
    
    // LivestreamBanner
    liveStream: 'LIVE STREAM',
    liveNow: 'Jetzt live auf YouTube!',
    watchNow: 'Jetzt ansehen',
    
    // Footer
    followUs: 'Folge uns',
    allRightsReserved: 'Alle Rechte vorbehalten',
    
    // HomePage
    latestVideos: 'Neueste Videos',
    viewMore: 'Mehr anzeigen',
    subscriberCount: 'Abonnenten',
    refreshCount: 'Aktualisieren',
    
    // VideosPage
    videoCategories: 'Video-Kategorien',
    allVideos: 'Alle Videos',
    
    // Comment Section
    comments: 'Kommentare',
    leaveComment: 'Kommentar hinterlassen',
    yourName: 'Dein Name',
    yourComment: 'Dein Kommentar',
    submit: 'Absenden',
    commentSubmitted: 'Vielen Dank für deinen Kommentar! Er wird nach Freigabe sichtbar sein.',
    
    // DownloadsPage
    downloadResources: 'Download-Ressourcen',
    downloadNow: 'Jetzt herunterladen',
    
    // Login
    username: 'Benutzername',
    password: 'Passwort',
    loginButton: 'Anmelden',
    loginError: 'Ungültiger Benutzername oder Passwort',
    
    // Admin Panel
    generalSettings: 'Allgemeine Einstellungen',
    livestreamSettings: 'Livestream-Einstellungen',
    videoManagement: 'Video-Verwaltung',
    downloadManagement: 'Download-Verwaltung',
    notificationManagement: 'Benachrichtigungs-Verwaltung',
    isLiveStreaming: 'Ist Live-Streaming',
    livestreamId: 'Livestream-ID',
    save: 'Speichern',
    settingsSaved: 'Einstellungen erfolgreich gespeichert',
  }
};

// Get browser language
export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'de' ? 'de' : 'en';
}

// Translate function
export function t(key: TranslationKey, language: Language): string {
  return translations[language][key] || key;
}