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
      
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'youtube-gaming-website',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
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