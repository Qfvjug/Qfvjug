import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeFirebase } from "./firebase";
import { memStorage } from "./memory-storage";
import { storage as firebaseStorage } from "./firebase-storage";

// Vite-Funktionen dynamisch importieren
// In der Produktionsumgebung (Netlify) wird netlify-vite.mjs verwendet
// In der Entwicklungsumgebung (Replit) wird vite.ts verwendet
import * as standardViteModule from './vite';

// Wir laden das Netlify-Modul nur, wenn wir in der Netlify-Umgebung sind
let netlifyViteModule: any = null;

// Eine Hilfsfunktion zum Laden des Netlify-Moduls
async function loadNetlifyModule() {
  if (process.env.NETLIFY === 'true') {
    try {
      // Dynamischer Import für Produktionsumgebung
      const importPath = '../netlify/functions/netlify-vite';
      netlifyViteModule = await import(importPath);
    } catch (error) {
      console.error('Failed to import netlify-vite module:', error);
      // Fallback auf Standard-Vite-Implementierung
    }
  }
}

// Setup-Funktionen basierend auf der Umgebung definieren
let setupVite: any, serveStatic: any, log: any;

// Wir initialisieren die Funktionen in einer asynchronen Funktion
async function initializeViteFunctions() {
  // Erst das Netlify-Modul laden, wenn nötig
  if (process.env.NETLIFY === 'true') {
    await loadNetlifyModule();
  }
  
  if (process.env.NETLIFY === 'true' && netlifyViteModule) {
    // Netlify-spezifische Implementierung verwenden
    setupVite = netlifyViteModule.setupVite;
    serveStatic = netlifyViteModule.serveStatic;
    log = netlifyViteModule.log;
  } else {
    // Standard-Vite-Implementierung verwenden
    setupVite = standardViteModule.setupVite;
    serveStatic = standardViteModule.serveStatic;
    log = standardViteModule.log;
  }
}

// Fallback für log-Funktion wird jetzt in der asynchronen IIFE nach initializeViteFunctions() gesetzt

// Express-App initialisieren
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Firebase als primäre Datenquelle verwenden, Memory Storage als Fallback
let storageType = 'firebase';
let useMemoryStorage = false;

// Globale Variable für den aktiven Speicher
export let activeStorage = firebaseStorage;

(async () => {
  // Vite-Funktionen initialisieren
  await initializeViteFunctions();
  
  // Fallback für log-Funktion nach Initialisierung
  if (!log) {
    log = (message: string, _source?: string) => console.log(message);
  }
  
  // Firebase initialisieren
  try {
    log('Initializing Firebase...', 'server');
    await initializeFirebase();
    log('Firebase initialization completed successfully', 'server');
    activeStorage = firebaseStorage;
    storageType = 'firebase';
  } catch (firebaseError) {
    log(`Firebase initialization failed, switching to memory storage: ${(firebaseError as Error).message}`, 'server');
    useMemoryStorage = true;
    activeStorage = memStorage;
    storageType = 'memory';
    
    // Admin-Benutzer für Memory Storage erstellen
    try {
      const existingUser = await memStorage.getUserByUsername('admin');
      if (!existingUser) {
        log('Creating default admin user for memory storage', 'server');
        await memStorage.createUser({
          username: 'admin',
          password: 'admin123',
          isAdmin: true
        });
      }
    } catch (e) {
      log(`Error creating default admin user: ${(e as Error).message}`, 'server');
    }
  }
  
  log(`Using storage type: ${storageType}`, 'server');
  
  // API-Routen registrieren
  const server = await registerRoutes(app);

  // Globaler Fehlerhandler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Vite in Entwicklungsumgebung einrichten oder statische Dateien in Produktion
  if (app.get("env") === "development" && server) {
    await setupVite(app, server);
  } else if (process.env.NODE_ENV !== 'production') {
    // Im Netlify-Kontext sind keine statischen Dateien erforderlich
    serveStatic(app);
  }

  // Server nur in Nicht-Produktionsumgebung starten
  if (process.env.NODE_ENV !== 'production') {
    const port = 5000;
    if (server) {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    }
  }
})();