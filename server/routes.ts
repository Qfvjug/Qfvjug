import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
// Dynamischen Storage verwenden
import { activeStorage as storage } from "./index";
import { YouTubeService } from "./services/youtubeService";
import { QRCodeService } from "./services/qrCodeService";
import { z } from "zod";
import {
  insertUserSchema,
  insertVideoSchema,
  insertDownloadSchema,
  insertNotificationSchema,
  insertSubscriberSchema,
  insertSiteSettingsSchema,
  insertCommentSchema
} from "@shared/schema";
import { compare, hash } from "bcrypt";

// Simple middleware for handling async route handlers
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Authentication middleware
const authenticateAdmin = asyncHandler(async (req: Request, res: Response, next: Function) => {
  // Check if authentication is in the request (very simple for now)
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // In a real app, verify the token. For simplicity, we'll use a basic check
  if (token !== 'admin-token') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // --- Auth Routes ---
  app.post('/api/auth/login', asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Benutze bcrypt.compare zum Überprüfen des Passworts
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Return a token (in a real app, use JWT)
    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      token: 'admin-token' // Just a placeholder
    });
  }));

  // --- YouTube Data Routes ---
  app.get('/api/youtube/channel', asyncHandler(async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings || !settings.youtubeChannelId) {
        return res.status(404).json({ message: 'Channel ID not configured' });
      }
      
      const channelData = await YouTubeService.getChannelInfo(settings.youtubeChannelId);
      res.json(channelData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch channel data', error: (error as Error).message });
    }
  }));
  
  app.get('/api/youtube/videos', asyncHandler(async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings || !settings.youtubeChannelId) {
        return res.status(404).json({ message: 'Channel ID not configured' });
      }
      
      const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string) : 12;
      const pageToken = req.query.pageToken as string | undefined;
      
      const videos = await YouTubeService.getChannelVideos(
        settings.youtubeChannelId,
        maxResults,
        pageToken
      );
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch videos', error: (error as Error).message });
    }
  }));
  
  app.get('/api/youtube/video/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
      const videoId = req.params.id;
      const video = await YouTubeService.getVideo(videoId);
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch video', error: (error as Error).message });
    }
  }));

  // --- Videos Routes ---
  app.get('/api/videos', asyncHandler(async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      
      let videos;
      if (category) {
        videos = await storage.getVideosByCategory(category);
      } else {
        videos = await storage.getAllVideos();
      }
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch videos', error: (error as Error).message });
    }
  }));
  
  app.get('/api/videos/featured', asyncHandler(async (req: Request, res: Response) => {
    try {
      const featuredVideo = await storage.getFeaturedVideo();
      
      if (!featuredVideo) {
        return res.status(404).json({ message: 'No featured video found' });
      }
      
      res.json(featuredVideo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured video', error: (error as Error).message });
    }
  }));
  
  app.post('/api/videos', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate the input
      const validationResult = insertVideoSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid video data', errors: validationResult.error.errors });
      }
      
      const video = await storage.createVideo(validationResult.data);
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create video', error: (error as Error).message });
    }
  }));
  
  app.put('/api/videos/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if video exists
      const existingVideo = await storage.getVideo(id);
      if (!existingVideo) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      const updatedVideo = await storage.updateVideo(id, req.body);
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update video', error: (error as Error).message });
    }
  }));
  
  app.delete('/api/videos/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if video exists
      const existingVideo = await storage.getVideo(id);
      if (!existingVideo) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      await storage.deleteVideo(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete video', error: (error as Error).message });
    }
  }));
  
  app.post('/api/videos/:id/feature', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if video exists
      const existingVideo = await storage.getVideo(id);
      if (!existingVideo) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      await storage.setFeaturedVideo(id);
      res.status(200).json({ message: 'Video featured successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to feature video', error: (error as Error).message });
    }
  }));

  // --- Downloads Routes ---
  app.get('/api/downloads', asyncHandler(async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      
      let downloads;
      if (type) {
        downloads = await storage.getDownloadsByType(type);
      } else {
        downloads = await storage.getAllDownloads();
      }
      
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch downloads', error: (error as Error).message });
    }
  }));
  
  app.get('/api/downloads/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const download = await storage.getDownload(id);
      
      if (!download) {
        return res.status(404).json({ message: 'Download not found' });
      }
      
      res.json(download);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch download', error: (error as Error).message });
    }
  }));
  
  app.post('/api/downloads', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate the input
      const validationResult = insertDownloadSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid download data', errors: validationResult.error.errors });
      }
      
      const download = await storage.createDownload(validationResult.data);
      res.status(201).json(download);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create download', error: (error as Error).message });
    }
  }));
  
  app.put('/api/downloads/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if download exists
      const existingDownload = await storage.getDownload(id);
      if (!existingDownload) {
        return res.status(404).json({ message: 'Download not found' });
      }
      
      const updatedDownload = await storage.updateDownload(id, req.body);
      res.json(updatedDownload);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update download', error: (error as Error).message });
    }
  }));
  
  app.delete('/api/downloads/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if download exists
      const existingDownload = await storage.getDownload(id);
      if (!existingDownload) {
        return res.status(404).json({ message: 'Download not found' });
      }
      
      await storage.deleteDownload(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete download', error: (error as Error).message });
    }
  }));
  
  app.post('/api/downloads/:id/increment', asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if download exists
      const existingDownload = await storage.getDownload(id);
      if (!existingDownload) {
        return res.status(404).json({ message: 'Download not found' });
      }
      
      const newCount = await storage.incrementDownloadCount(id);
      res.json({ downloadCount: newCount });
    } catch (error) {
      res.status(500).json({ message: 'Failed to increment download count', error: (error as Error).message });
    }
  }));

  // --- Notifications Routes ---
  app.get('/api/notifications', asyncHandler(async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notifications', error: (error as Error).message });
    }
  }));
  
  app.post('/api/notifications', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate the input
      const validationResult = insertNotificationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid notification data', errors: validationResult.error.errors });
      }
      
      const notification = await storage.createNotification(validationResult.data);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create notification', error: (error as Error).message });
    }
  }));
  
  app.patch('/api/notifications/:id/read', asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if notification exists
      const existingNotification = await storage.getNotification(id);
      if (!existingNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      await storage.markNotificationAsRead(id);
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark notification as read', error: (error as Error).message });
    }
  }));
  
  app.delete('/api/notifications/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if notification exists
      const existingNotification = await storage.getNotification(id);
      if (!existingNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      await storage.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete notification', error: (error as Error).message });
    }
  }));

  // --- Subscribers Routes ---
  app.post('/api/subscribers', asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate the input
      const validationResult = insertSubscriberSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid subscriber data', errors: validationResult.error.errors });
      }
      
      // Check if subscriber already exists
      const existingSubscriber = await storage.getSubscriberByEmail(validationResult.data.email);
      if (existingSubscriber) {
        return res.status(409).json({ message: 'Email already subscribed' });
      }
      
      const subscriber = await storage.createSubscriber(validationResult.data);
      res.status(201).json(subscriber);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create subscriber', error: (error as Error).message });
    }
  }));
  
  app.get('/api/subscribers', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch subscribers', error: (error as Error).message });
    }
  }));
  
  app.delete('/api/subscribers/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if subscriber exists
      const existingSubscriber = await storage.getSubscriber(id);
      if (!existingSubscriber) {
        return res.status(404).json({ message: 'Subscriber not found' });
      }
      
      await storage.deleteSubscriber(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete subscriber', error: (error as Error).message });
    }
  }));

  // --- Site Settings Routes ---
  app.get('/api/settings', asyncHandler(async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      
      if (!settings) {
        return res.status(404).json({ message: 'Site settings not found' });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch site settings', error: (error as Error).message });
    }
  }));
  
  app.put('/api/settings', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Validate the input
      const validationResult = insertSiteSettingsSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid settings data', errors: validationResult.error.errors });
      }
      
      const settings = await storage.updateSiteSettings(validationResult.data);
      
      if (!settings) {
        return res.status(404).json({ message: 'Site settings not found' });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update site settings', error: (error as Error).message });
    }
  }));

  // --- Initial Data (for demo purposes) ---
  // Create sample downloads
  const sampleDownloads = [
    {
      title: 'Pixel Dungeon',
      description: 'A fun retro-style dungeon crawler with procedurally generated levels and hundreds of items to discover.',
      type: 'game',
      version: '1.2.0',
      downloadUrl: '/downloads/pixel_dungeon_v1.2.0.zip',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
      releaseDate: new Date(2023, 1, 12) // Feb 12, 2023
    },
    {
      title: 'Enhanced Biomes',
      description: 'Adds 12 new biomes to Minecraft with unique flora, fauna, and structures to explore.',
      type: 'mod',
      version: '2.4.1',
      downloadUrl: '/downloads/enhanced_biomes_v2.4.1.zip',
      thumbnailUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025',
      releaseDate: new Date(2023, 4, 5) // May 5, 2023
    },
    {
      title: 'Sprite Sheet Generator',
      description: 'Create and optimize sprite sheets for your game projects. Supports multiple formats.',
      type: 'tool',
      version: '1.0.5',
      downloadUrl: '/downloads/sprite_sheet_generator_v1.0.5.zip',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67',
      releaseDate: new Date(2023, 7, 17) // Aug 17, 2023
    }
  ];

  // Add sample downloads if none exist
  const existingDownloads = await storage.getAllDownloads();
  if (existingDownloads.length === 0) {
    for (const download of sampleDownloads) {
      await storage.createDownload(download);
    }
  }

  // --- QR Code Routes ---
  app.get('/api/qrcode/channel', asyncHandler(async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings || !settings.youtubeChannelId) {
        return res.status(404).json({ message: 'Channel ID not configured' });
      }
      
      const qrCode = await QRCodeService.generateChannelQRCode(settings.youtubeChannelId);
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate QR code', error: (error as Error).message });
    }
  }));
  
  app.get('/api/qrcode/video/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
      const videoId = req.params.id;
      const qrCode = await QRCodeService.generateVideoQRCode(videoId);
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate QR code', error: (error as Error).message });
    }
  }));

  // --- Comments Routes ---
  app.get('/api/videos/:videoId/comments', asyncHandler(async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      
      // Check if video exists
      const existingVideo = await storage.getVideo(videoId);
      if (!existingVideo) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      const comments = await storage.getCommentsByVideo(videoId);
      // Only return approved comments for non-admin users
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        const approvedComments = comments.filter(comment => comment.approved);
        return res.json(approvedComments);
      }
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch comments', error: (error as Error).message });
    }
  }));
  
  app.post('/api/videos/:videoId/comments', asyncHandler(async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      
      // Check if video exists
      const existingVideo = await storage.getVideo(videoId);
      if (!existingVideo) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      // Validate the input
      const commentData = {
        ...req.body,
        videoId: videoId,
        approved: false
      };
      
      const validationResult = insertCommentSchema.safeParse(commentData);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid comment data', errors: validationResult.error.errors });
      }
      
      const comment = await storage.createComment(validationResult.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create comment', error: (error as Error).message });
    }
  }));
  
  app.delete('/api/comments/:id', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if comment exists
      const existingComment = await storage.getComment(id);
      if (!existingComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      await storage.deleteComment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete comment', error: (error as Error).message });
    }
  }));
  
  app.post('/api/comments/:id/approve', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if comment exists
      const existingComment = await storage.getComment(id);
      if (!existingComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      await storage.approveComment(id);
      res.status(200).json({ message: 'Comment approved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve comment', error: (error as Error).message });
    }
  }));
  
  // --- Livestream Routes ---
  app.get('/api/livestream', asyncHandler(async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      
      if (!settings) {
        return res.status(404).json({ message: 'Site settings not found' });
      }
      
      res.json({
        isLiveStreaming: settings.isLiveStreaming,
        liveStreamId: settings.liveStreamId
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch livestream status', error: (error as Error).message });
    }
  }));
  
  app.post('/api/livestream', authenticateAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { isLiveStreaming, liveStreamId } = req.body;
      
      if (typeof isLiveStreaming !== 'boolean') {
        return res.status(400).json({ message: 'isLiveStreaming must be a boolean' });
      }
      
      if (isLiveStreaming && !liveStreamId) {
        return res.status(400).json({ message: 'liveStreamId is required when going live' });
      }
      
      const updatedSettings = await storage.updateLiveStreamStatus(isLiveStreaming, liveStreamId);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: 'Site settings not found' });
      }
      
      res.json({
        isLiveStreaming: updatedSettings.isLiveStreaming,
        liveStreamId: updatedSettings.liveStreamId
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update livestream status', error: (error as Error).message });
    }
  }));

  return httpServer;
}
