// ESM-spezifischer Header, um Node.js 18+ zu signalisieren
// @ts-ignore
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { registerRoutes } from '../../server/routes';
import dotenv from 'dotenv';

// Markiere diese Umgebung als Netlify
process.env.NETLIFY = 'true';

// Umgebungsvariablen laden
dotenv.config();

// Express-App initialisieren
const app = express();

// Middleware konfigurieren
app.use(cors());
app.use(express.json());

// API Fehlerhandler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Ein interner Serverfehler ist aufgetreten',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Für Netlify Functions: registerRoutes ist asynchron, aber wir können es nicht mit await aufrufen
// da Top-Level-Await in CJS nicht unterstützt wird. Stattdessen verwenden wir Promise-Handling
// innerhalb der Handler-Funktion
const routesPromise = registerRoutes(app);

// Wir initialisieren den serverless-Handler erst, nachdem die Routen registriert wurden
const getHandler = async () => {
  await routesPromise;
  return serverless(app);
};

// Serverless-Handler für Netlify Functions exportieren
// Der Handler ruft unsere Hilfsfunktion auf, die auf die Routenregistrierung wartet
export const handler = async (event: any, context: any) => {
  const handlerFn = await getHandler();
  return handlerFn(event, context);
};