import { users, type User, type InsertUser } from "@shared/schema";
import { videos, type Video, type InsertVideo } from "@shared/schema";
import { downloads, type Download, type InsertDownload } from "@shared/schema";
import { notifications, type Notification, type InsertNotification } from "@shared/schema";
import { subscribers, type Subscriber, type InsertSubscriber } from "@shared/schema";
import { siteSettings, type SiteSetting, type InsertSiteSetting } from "@shared/schema";
import { comments, type Comment, type InsertComment } from "@shared/schema";

import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { hash } from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video operations
  getAllVideos(): Promise<Video[]>;
  getVideosByCategory(category: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  getFeaturedVideo(): Promise<Video | undefined>;
  setFeaturedVideo(id: number): Promise<boolean>;
  
  // Download operations
  getAllDownloads(): Promise<Download[]>;
  getDownloadsByType(type: string): Promise<Download[]>;
  getDownload(id: number): Promise<Download | undefined>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download | undefined>;
  deleteDownload(id: number): Promise<boolean>;
  incrementDownloadCount(id: number): Promise<number>;
  
  // Notification operations
  getAllNotifications(): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Subscriber operations
  getAllSubscribers(): Promise<Subscriber[]>;
  getSubscriber(id: number): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  deleteSubscriber(id: number): Promise<boolean>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSetting | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined>;
  updateLiveStreamStatus(isLive: boolean, streamId?: string): Promise<SiteSetting | undefined>;
  
  // Comments operations
  getCommentsByVideo(videoId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  approveComment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await hash(user.password, 10);
    
    const result = await db.insert(users).values({
      ...user,
      password: hashedPassword,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    return db.select().from(schema.videos).orderBy(desc(schema.videos.createdAt));
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return db.select().from(schema.videos)
      .where(eq(schema.videos.category, category))
      .orderBy(desc(schema.videos.createdAt));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const videos = await db.select().from(schema.videos).where(eq(schema.videos.id, id));
    return videos[0];
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    // Make sure only one video can be featured if this one is featured
    if (video.isFeatured) {
      await db.update(schema.videos)
        .set({ isFeatured: false })
        .where(eq(schema.videos.isFeatured, true));
    }
    
    const result = await db.insert(schema.videos).values({
      ...video,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }

  async updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined> {
    // Make sure only one video can be featured if this one is featured
    if (video.isFeatured) {
      await db.update(schema.videos)
        .set({ isFeatured: false })
        .where(eq(schema.videos.isFeatured, true));
    }
    
    const result = await db.update(schema.videos)
      .set(video)
      .where(eq(schema.videos.id, id))
      .returning();
    
    return result[0];
  }

  async deleteVideo(id: number): Promise<boolean> {
    const result = await db.delete(schema.videos)
      .where(eq(schema.videos.id, id))
      .returning({ id: schema.videos.id });
    
    return result.length > 0;
  }

  async getFeaturedVideo(): Promise<Video | undefined> {
    const videos = await db.select().from(schema.videos).where(eq(schema.videos.isFeatured, true));
    return videos[0];
  }

  async setFeaturedVideo(id: number): Promise<boolean> {
    // First, unfeature all videos
    await db.update(schema.videos)
      .set({ isFeatured: false })
      .where(eq(schema.videos.isFeatured, true));
    
    // Then feature the specified video
    const result = await db.update(schema.videos)
      .set({ isFeatured: true })
      .where(eq(schema.videos.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Download operations
  async getAllDownloads(): Promise<Download[]> {
    return db.select().from(schema.downloads).orderBy(desc(schema.downloads.createdAt));
  }

  async getDownloadsByType(type: string): Promise<Download[]> {
    return db.select().from(schema.downloads)
      .where(eq(schema.downloads.type, type))
      .orderBy(desc(schema.downloads.createdAt));
  }

  async getDownload(id: number): Promise<Download | undefined> {
    const downloads = await db.select().from(schema.downloads).where(eq(schema.downloads.id, id));
    return downloads[0];
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const result = await db.insert(schema.downloads).values({
      ...download,
      downloadCount: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      releaseDate: download.releaseDate || new Date()
    }).returning();
    
    return result[0];
  }

  async updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download | undefined> {
    const result = await db.update(schema.downloads)
      .set(download)
      .where(eq(schema.downloads.id, id))
      .returning();
    
    return result[0];
  }

  async deleteDownload(id: number): Promise<boolean> {
    const result = await db.delete(schema.downloads)
      .where(eq(schema.downloads.id, id))
      .returning({ id: schema.downloads.id });
    
    return result.length > 0;
  }

  async incrementDownloadCount(id: number): Promise<number> {
    const download = await this.getDownload(id);
    if (!download) return 0;
    
    const result = await db.update(schema.downloads)
      .set({ downloadCount: download.downloadCount + 1 })
      .where(eq(schema.downloads.id, id))
      .returning();
    
    return result[0].downloadCount;
  }

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    return db.select().from(schema.notifications).orderBy(desc(schema.notifications.createdAt));
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const notifications = await db.select().from(schema.notifications).where(eq(schema.notifications.id, id));
    return notifications[0];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(schema.notifications).values({
      ...notification,
      createdAt: new Date(),
      read: false
    }).returning();
    
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db.update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.id, id))
      .returning();
    
    return result.length > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(schema.notifications)
      .where(eq(schema.notifications.id, id))
      .returning({ id: schema.notifications.id });
    
    return result.length > 0;
  }

  // Subscriber operations
  async getAllSubscribers(): Promise<Subscriber[]> {
    return db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const subscribers = await db.select().from(schema.subscribers).where(eq(schema.subscribers.id, id));
    return subscribers[0];
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const subscribers = await db.select().from(schema.subscribers).where(eq(schema.subscribers.email, email));
    return subscribers[0];
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const result = await db.insert(schema.subscribers).values({
      ...subscriber,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    const result = await db.delete(schema.subscribers)
      .where(eq(schema.subscribers.id, id))
      .returning({ id: schema.subscribers.id });
    
    return result.length > 0;
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    const settings = await db.select().from(schema.siteSettings);
    return settings[0];
  }

  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const existingSettings = await this.getSiteSettings();
    
    if (existingSettings) {
      // Verwende SQL direkt für das Update
      const result = await db.update(schema.siteSettings)
        .set({
          youtubeChannelId: settings.youtubeChannelId ?? existingSettings.youtubeChannelId,
          featuredVideoId: settings.featuredVideoId ?? existingSettings.featuredVideoId,
          newsTickerItems: settings.newsTickerItems ?? existingSettings.newsTickerItems,
          isLiveStreaming: settings.isLiveStreaming ?? existingSettings.isLiveStreaming,
          liveStreamId: settings.liveStreamId ?? existingSettings.liveStreamId,
          lastUpdated: new Date()
        })
        .where(eq(schema.siteSettings.id, existingSettings.id))
        .returning();
      
      return result[0];
    } else {
      // Verwende SQL direkt für den Insert
      const defaultItems = ['Welcome to my channel!'];
      const result = await db.insert(schema.siteSettings)
        .values({
          youtubeChannelId: settings.youtubeChannelId ?? null,
          featuredVideoId: settings.featuredVideoId ?? null,
          newsTickerItems: settings.newsTickerItems ?? defaultItems,
          isLiveStreaming: settings.isLiveStreaming ?? false,
          liveStreamId: settings.liveStreamId ?? null,
          lastUpdated: new Date()
        })
        .returning();
      
      return result[0];
    }
  }
  
  async updateLiveStreamStatus(isLive: boolean, streamId?: string): Promise<SiteSetting | undefined> {
    const existingSettings = await this.getSiteSettings();
    
    if (existingSettings) {
      const result = await db.update(schema.siteSettings)
        .set({
          isLiveStreaming: isLive,
          liveStreamId: streamId ?? existingSettings.liveStreamId,
          lastUpdated: new Date()
        })
        .where(eq(schema.siteSettings.id, existingSettings.id))
        .returning();
      
      return result[0];
    }
    
    return undefined;
  }
  
  // Comments operations
  async getCommentsByVideo(videoId: number): Promise<Comment[]> {
    return db.select()
      .from(schema.comments)
      .where(eq(schema.comments.videoId, videoId))
      .orderBy(desc(schema.comments.createdAt));
  }
  
  async getComment(id: number): Promise<Comment | undefined> {
    const comments = await db.select()
      .from(schema.comments)
      .where(eq(schema.comments.id, id));
    return comments[0];
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(schema.comments)
      .values({
        ...comment,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(schema.comments)
      .where(eq(schema.comments.id, id))
      .returning({ id: schema.comments.id });
    
    return result.length > 0;
  }
  
  async approveComment(id: number): Promise<boolean> {
    const result = await db.update(schema.comments)
      .set({ approved: true })
      .where(eq(schema.comments.id, id))
      .returning();
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();