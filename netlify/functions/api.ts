import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { registerRoutes } from '../../server/routes';
import dotenv from 'dotenv';

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

// Routen registrieren (ohne Websocket-Server in Netlify Functions)
registerRoutes(app);

// Serverless-Handler für Netlify Functions exportieren
export const handler = serverless(app);