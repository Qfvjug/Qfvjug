import bcrypt from 'bcrypt';
import {
  User, InsertUser,
  Video, InsertVideo,
  Download, InsertDownload,
  Notification, InsertNotification,
  Subscriber, InsertSubscriber,
  SiteSetting, InsertSiteSetting,
  Comment, InsertComment
} from '@shared/schema';
import { IStorage } from './firebase-storage';

// MemStorage als Fallback für Firebase
export class MemStorage implements IStorage {
  private users: User[] = [];
  private videos: Video[] = [];
  private downloads: Download[] = [];
  private notifications: Notification[] = [];
  private subscribers: Subscriber[] = [];
  private siteSettings: SiteSetting | null = null;
  private comments: Comment[] = [];
  
  private nextId = {
    users: 1,
    videos: 1,
    downloads: 1,
    notifications: 1,
    subscribers: 1,
    comments: 1
  };

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    const newUser: User = {
      id: this.nextId.users++,
      username: user.username,
      password: hashedPassword,
      isAdmin: user.isAdmin ?? false,
      createdAt: new Date()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    return [...this.videos];
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return this.videos.filter(video => video.category === category);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.find(video => video.id === id);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const newVideo: Video = {
      id: this.nextId.videos++,
      youtubeId: video.youtubeId,
      title: video.title,
      description: video.description ?? null,
      thumbnailUrl: video.thumbnailUrl ?? null,
      duration: video.duration ?? null,
      viewCount: video.viewCount ?? null,
      uploadDate: video.uploadDate ?? null,
      category: video.category ?? "general",
      isFeatured: video.isFeatured ?? false,
      createdAt: new Date()
    };
    
    this.videos.push(newVideo);
    return newVideo;
  }

  async updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined> {
    const index = this.videos.findIndex(v => v.id === id);
    if (index === -1) return undefined;
    
    if (video.title) this.videos[index].title = video.title;
    if (video.description !== undefined) this.videos[index].description = video.description;
    if (video.thumbnailUrl !== undefined) this.videos[index].thumbnailUrl = video.thumbnailUrl;
    if (video.duration !== undefined) this.videos[index].duration = video.duration;
    if (video.viewCount !== undefined) this.videos[index].viewCount = video.viewCount;
    if (video.uploadDate !== undefined) this.videos[index].uploadDate = video.uploadDate;
    if (video.category !== undefined) this.videos[index].category = video.category;
    if (video.isFeatured !== undefined) this.videos[index].isFeatured = video.isFeatured;
    if (video.youtubeId !== undefined) this.videos[index].youtubeId = video.youtubeId;
    
    return this.videos[index];
  }

  async deleteVideo(id: number): Promise<boolean> {
    const index = this.videos.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    this.videos.splice(index, 1);
    return true;
  }

  async getFeaturedVideo(): Promise<Video | undefined> {
    if (!this.siteSettings || !this.siteSettings.featuredVideoId) return undefined;
    
    const featuredId = this.siteSettings.featuredVideoId;
    return this.videos.find(video => video.youtubeId === featuredId);
  }

  async setFeaturedVideo(id: number): Promise<boolean> {
    const video = this.videos.find(v => v.id === id);
    if (!video) return false;
    
    // Stelle sicher, dass siteSettings existiert
    if (!this.siteSettings) {
      this.siteSettings = {
        id: 1,
        youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || null,
        featuredVideoId: video.youtubeId,
        isLiveStreaming: false,
        liveStreamId: null,
        newsTickerItems: [],
        lastUpdated: new Date()
      };
    } else {
      this.siteSettings.featuredVideoId = video.youtubeId;
      this.siteSettings.lastUpdated = new Date();
    }
    
    return true;
  }

  // Download operations
  async getAllDownloads(): Promise<Download[]> {
    return [...this.downloads];
  }

  async getDownloadsByType(type: string): Promise<Download[]> {
    return this.downloads.filter(download => download.type === type);
  }

  async getDownload(id: number): Promise<Download | undefined> {
    return this.downloads.find(download => download.id === id);
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const newDownload: Download = {
      id: this.nextId.downloads++,
      title: download.title,
      description: download.description ?? null,
      type: download.type,
      version: download.version,
      downloadUrl: download.downloadUrl,
      thumbnailUrl: download.thumbnailUrl ?? null,
      downloadCount: 0,
      rating: null,
      ratingCount: null,
      releaseDate: download.releaseDate ?? new Date(),
      createdAt: new Date()
    };
    
    this.downloads.push(newDownload);
    return newDownload;
  }

  async updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download | undefined> {
    const index = this.downloads.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    
    if (download.title) this.downloads[index].title = download.title;
    if (download.description !== undefined) this.downloads[index].description = download.description;
    if (download.type) this.downloads[index].type = download.type;
    if (download.version) this.downloads[index].version = download.version;
    if (download.downloadUrl) this.downloads[index].downloadUrl = download.downloadUrl;
    if (download.thumbnailUrl !== undefined) this.downloads[index].thumbnailUrl = download.thumbnailUrl;
    if (download.releaseDate) this.downloads[index].releaseDate = download.releaseDate;
    
    return this.downloads[index];
  }

  async deleteDownload(id: number): Promise<boolean> {
    const index = this.downloads.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.downloads.splice(index, 1);
    return true;
  }

  async incrementDownloadCount(id: number): Promise<number> {
    const index = this.downloads.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Download not found');
    
    this.downloads[index].downloadCount = (this.downloads[index].downloadCount || 0) + 1;
    
    return this.downloads[index].downloadCount;
  }

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.find(notification => notification.id === id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.nextId.notifications++,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
      createdAt: new Date()
    };
    
    this.notifications.push(newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.notifications[index].read = true;
    
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.notifications.splice(index, 1);
    return true;
  }

  // Subscriber operations
  async getAllSubscribers(): Promise<Subscriber[]> {
    return [...this.subscribers];
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    return this.subscribers.find(subscriber => subscriber.id === id);
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return this.subscribers.find(subscriber => subscriber.email === email);
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const newSubscriber: Subscriber = {
      id: this.nextId.subscribers++,
      email: subscriber.email,
      notificationType: subscriber.notificationType || "all",
      createdAt: new Date()
    };
    
    this.subscribers.push(newSubscriber);
    return newSubscriber;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    const index = this.subscribers.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.subscribers.splice(index, 1);
    return true;
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    if (!this.siteSettings) {
      // Erstelle Standardeinstellungen, falls keine existieren
      this.siteSettings = {
        id: 1,
        youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || null,
        featuredVideoId: null,
        isLiveStreaming: false,
        liveStreamId: null,
        newsTickerItems: [],
        lastUpdated: new Date()
      };
    }
    
    return this.siteSettings;
  }

  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    if (!this.siteSettings) {
      this.siteSettings = {
        id: 1,
        youtubeChannelId: settings.youtubeChannelId ?? process.env.YOUTUBE_CHANNEL_ID ?? null,
        featuredVideoId: settings.featuredVideoId ?? null,
        isLiveStreaming: settings.isLiveStreaming ?? false,
        liveStreamId: settings.liveStreamId ?? null,
        newsTickerItems: settings.newsTickerItems ?? [],
        lastUpdated: new Date()
      };
    } else {
      if (settings.youtubeChannelId !== undefined) this.siteSettings.youtubeChannelId = settings.youtubeChannelId;
      if (settings.featuredVideoId !== undefined) this.siteSettings.featuredVideoId = settings.featuredVideoId;
      if (settings.isLiveStreaming !== undefined) this.siteSettings.isLiveStreaming = settings.isLiveStreaming;
      if (settings.liveStreamId !== undefined) this.siteSettings.liveStreamId = settings.liveStreamId;
      if (settings.newsTickerItems !== undefined) this.siteSettings.newsTickerItems = settings.newsTickerItems;
      this.siteSettings.lastUpdated = new Date();
    }
    
    return this.siteSettings;
  }

  async updateLiveStreamStatus(isLive: boolean, streamId?: string): Promise<SiteSetting | undefined> {
    if (!this.siteSettings) {
      this.siteSettings = {
        id: 1,
        youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || null,
        featuredVideoId: null,
        isLiveStreaming: isLive,
        liveStreamId: streamId || null,
        newsTickerItems: [],
        lastUpdated: new Date()
      };
    } else {
      this.siteSettings.isLiveStreaming = isLive;
      this.siteSettings.liveStreamId = streamId || null;
      this.siteSettings.lastUpdated = new Date();
    }
    
    return this.siteSettings;
  }

  // Comments operations
  async getCommentsByVideo(videoId: number): Promise<Comment[]> {
    return this.comments.filter(comment => comment.videoId === videoId);
  }

  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.find(comment => comment.id === id);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: this.nextId.comments++,
      videoId: comment.videoId,
      userId: comment.userId ?? null,
      author: comment.author,
      content: comment.content,
      approved: comment.approved ?? false,
      createdAt: new Date()
    };
    
    this.comments.push(newComment);
    return newComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.comments.splice(index, 1);
    return true;
  }

  async approveComment(id: number): Promise<boolean> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.comments[index].approved = true;
    
    return true;
  }
}

// Erstelle eine Singleton-Instanz
export const memStorage = new MemStorage();