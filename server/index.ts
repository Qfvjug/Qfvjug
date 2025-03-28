import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Firebase anstelle von PostgreSQL verwenden
import { initializeFirebase } from "./firebase";
import { memStorage } from "./memory-storage";
import { storage as firebaseStorage } from "./firebase-storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Flag für die Verwendung von MemStorage als Fallback
let useMemoryStorage = false;

// Wir erstellen eine globale Variable, die das storage exportiert, welches verwendet werden soll
export let activeStorage = firebaseStorage;

(async () => {
  // Firebase initialisieren oder Fallback zu MemStorage verwenden
  try {
    await initializeFirebase();
    log('Firebase initialization completed successfully', 'server');
    activeStorage = firebaseStorage;
  } catch (error) {
    log(`Firebase initialization failed, switching to memory storage: ${(error as Error).message}`, 'server');
    useMemoryStorage = true;
    activeStorage = memStorage;
    
    // Admin-Benutzer für das Memory-Storage erstellen
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
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
