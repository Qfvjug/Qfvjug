// i18n.ts - Internationalization support
export type Language = 'en' | 'de';

// Rekursiver Typ für verschachtelte Übersetzungsschlüssel
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
  { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
  : '') extends infer D ? Extract<D, string> : never;

export type TranslationKey = keyof typeof translations.en | DotNestedKeys<typeof translations.en>;

// Define all translations here
export const translations = {
  en: {
    // Common
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    info: 'Information',
    
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
    
    // Link Converter
    linkConverter: {
      title: 'OneDrive Link Converter',
      description: 'Convert OneDrive sharing links to direct download links',
      enterLink: 'Enter OneDrive link here',
      convert: 'Convert Link',
      convertedLink: 'Converted Link',
      copyToClipboard: 'Copy to Clipboard',
      pleaseEnterLink: 'Please enter a link to convert',
      linkConverted: 'Link successfully converted',
      linkUnchanged: 'Link was not changed (not a convertible link type)',
      conversionError: 'Error converting link',
      linkCopied: 'Link copied to clipboard',
    },
  },
  de: {
    // Common
    loading: 'Lädt...',
    success: 'Erfolg',
    error: 'Fehler',
    info: 'Information',
    
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
    
    // Link Converter
    linkConverter: {
      title: 'OneDrive Link-Konverter',
      description: 'Konvertiere OneDrive-Freigabelinks in direkte Download-Links',
      enterLink: 'OneDrive-Link hier eingeben',
      convert: 'Link konvertieren',
      convertedLink: 'Konvertierter Link',
      copyToClipboard: 'In die Zwischenablage kopieren',
      pleaseEnterLink: 'Bitte gib einen Link zum Konvertieren ein',
      linkConverted: 'Link erfolgreich konvertiert',
      linkUnchanged: 'Link wurde nicht geändert (kein konvertierbarer Link-Typ)',
      conversionError: 'Fehler beim Konvertieren des Links',
      linkCopied: 'Link in die Zwischenablage kopiert',
    },
  }
};

// Get browser language
export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'de' ? 'de' : 'en';
}

// Translate function
export function t(key: TranslationKey, language: Language): string {
  // Überprüft, ob der Schlüssel einen Punkt enthält (verschachtelt ist)
  if (typeof key === 'string' && key.includes('.')) {
    const parts = key.split('.');
    let result: any = translations[language];
    
    // Durchlauf durch alle Teile des Schlüssels
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return key; // Schlüssel nicht gefunden
      }
    }
    
    return typeof result === 'string' ? result : key;
  }
  
  // Für nicht-verschachtelte Schlüssel
  return key in translations[language] ? 
    (translations[language] as any)[key] : 
    key;
}