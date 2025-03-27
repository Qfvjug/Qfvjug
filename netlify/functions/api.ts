import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';
import { runMigrations } from '../../server/db';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Ein Fehler ist aufgetreten',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Setup database
(async () => {
  try {
    console.log('Running database migrations...');
    await runMigrations();
    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
})();

// Register API routes
registerRoutes(app);

// This exports the handler function used by Netlify Functions
export const handler = serverless(app);