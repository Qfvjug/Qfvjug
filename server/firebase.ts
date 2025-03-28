import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { log } from './vite';

// Firebase Admin SDK-Initialisierung
export let db: FirebaseFirestore.Firestore;

export async function initializeFirebase() {
  try {
    // Prüfen, ob Firebase bereits initialisiert wurde
    if (admin.apps.length === 0) {
      log('Initializing Firebase...', 'firebase');
      
      // Verwendung von Umgebungsvariablen für die Firebase-Konfiguration
      // Im Produktionsumfeld sollten diese Werte aus Umgebungsvariablen geladen werden
      // Für die Entwicklung verwenden wir hier eine lokale Konfiguration
      
      // Für die Produktion sollte ein Dienstkonto mit den entsprechenden Berechtigungen verwendet werden
      // und der Pfad zur JSON-Datei sollte über eine Umgebungsvariable konfiguriert werden
      
      // Für die Entwicklung können wir die Firebase Emulator Suite verwenden
      // https://firebase.google.com/docs/emulator-suite
      
      // Dummydaten für die Entwicklung als Fallback verwenden
      const dummyPrivateKey = '-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n';
      
      // Stellen Sie sicher, dass der private Schlüssel korrekt formatiert ist
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || dummyPrivateKey;
      
      // Wenn der Schlüssel Escape-Zeichen enthält (z.B. von JSON), diese entfernen
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      // Wenn der Schlüssel keine Zeilenumbrüche enthält, ist er möglicherweise falsch formatiert
      if (!privateKey.includes('\n')) {
        // Versuchen, den Schlüssel in PEM-Format zu konvertieren
        log('Private key does not contain newlines, attempting to format as PEM', 'firebase');
        
        // Grundlegende PEM-Formatierung hinzufügen, wenn sie fehlt
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }
      }
      
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'youtube-gaming-website',
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk@youtube-gaming-website.iam.gserviceaccount.com',
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        // Datenbank-URL kann hier optional angegeben werden
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      
      log('Firebase initialized successfully!', 'firebase');
    }
    
    // Firestore-Instanz abrufen
    db = getFirestore();
    
    // Optional: Firestore-Einstellungen konfigurieren
    // db.settings({...});
    
    return db;
  } catch (error) {
    log(`Firebase initialization error: ${(error as Error).message}`, 'firebase');
    throw error;
  }
}