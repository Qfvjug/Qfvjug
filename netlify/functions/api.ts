// @ts-ignore
import type { Context, APIGatewayEvent } from 'aws-lambda';
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

// Markiere diese Umgebung als Netlify
process.env.NETLIFY = 'true';

// Express-App initialisieren
const app = express();

// Middleware konfigurieren
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Einfache API-Routen direkt hier definieren
app.get('/api/test', (req, res) => {
  res.json({ message: 'Netlify API funktioniert', timestamp: new Date().toISOString() });
});

// Basis-Routen für die wichtigsten Endpunkte
app.get('/api/notifications', (req, res) => {
  res.json([]);
});

app.get('/api/settings', (req, res) => {
  res.json({
    id: 1,
    youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "UCfvPPfsOkPkAU6cfCfnIp0A",
    siteName: "Qfvjug Gaming",
    siteDescription: "Die ultimative Gaming-Webseite",
    primaryColor: "#2682B1",
    isLiveStreaming: false,
    liveStreamId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.get('/api/livestream', (req, res) => {
  res.json({
    isLiveStreaming: false,
    liveStreamId: null
  });
});

app.get('/api/youtube/channel', async (req, res) => {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!channelId || !apiKey) {
      return res.status(500).json({ error: 'YouTube API Konfiguration fehlt' });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('YouTube Channel API Error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Kanaldaten' });
  }
});

app.get('/api/youtube/videos', async (req, res) => {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!channelId || !apiKey) {
      return res.status(500).json({ error: 'YouTube API Konfiguration fehlt' });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('YouTube Videos API Error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Videos' });
  }
});

// Fehlerbehandlung
app.use((err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Ein interner Serverfehler ist aufgetreten',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Serverless-Handler
const handler = serverless(app);

export { handler };