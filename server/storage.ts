import { 
  users, type User, type InsertUser,
  videos, type Video, type InsertVideo,
  downloads, type Download, type InsertDownload,
  notifications, type Notification, type InsertNotification,
  subscribers, type Subscriber, type InsertSubscriber,
  siteSettings, type SiteSetting, type InsertSiteSetting
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private downloads: Map<number, Download>;
  private notifications: Map<number, Notification>;
  private subscribers: Map<number, Subscriber>;
  private siteSettings: Map<number, SiteSetting>;
  
  private userCounter: number;
  private videoCounter: number;
  private downloadCounter: number;
  private notificationCounter: number;
  private subscriberCounter: number;
  private settingsCounter: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.downloads = new Map();
    this.notifications = new Map();
    this.subscribers = new Map();
    this.siteSettings = new Map();
    
    this.userCounter = 1;
    this.videoCounter = 1;
    this.downloadCounter = 1;
    this.notificationCounter = 1;
    this.subscriberCounter = 1;
    this.settingsCounter = 1;
    
    // Initialize with admin user
    this.createUser({
      username: 'admin',
      password: 'password',
      isAdmin: true
    });
    
    // Initialize site settings
    this.siteSettings.set(1, {
      id: 1,
      youtubeChannelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw', // Linus Tech Tips as default
      featuredVideoId: null,
      newsTickerItems: ['Welcome to Qfvjug\'s YouTube Channel Website!', 'Check out the latest videos and game downloads', 'Join our Discord community'],
      lastUpdated: new Date()
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const user: User = { 
      ...userData, 
      id,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Video operations
  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      (b.uploadDate?.getTime() || 0) - (a.uploadDate?.getTime() || 0)
    );
  }
  
  async getVideosByCategory(category: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.category === category)
      .sort((a, b) => (b.uploadDate?.getTime() || 0) - (a.uploadDate?.getTime() || 0));
  }
  
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }
  
  async createVideo(videoData: InsertVideo): Promise<Video> {
    const id = this.videoCounter++;
    const video: Video = {
      ...videoData,
      id,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }
  
  async updateVideo(id: number, videoData: Partial<InsertVideo>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = {
      ...video,
      ...videoData
    };
    
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }
  
  async getFeaturedVideo(): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(video => video.isFeatured);
  }
  
  async setFeaturedVideo(id: number): Promise<boolean> {
    // First, set all videos as not featured
    for (const video of this.videos.values()) {
      video.isFeatured = false;
    }
    
    // Then set the specified video as featured
    const video = this.videos.get(id);
    if (!video) return false;
    
    video.isFeatured = true;
    this.videos.set(id, video);
    return true;
  }
  
  // Download operations
  async getAllDownloads(): Promise<Download[]> {
    return Array.from(this.downloads.values()).sort((a, b) => 
      (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0)
    );
  }
  
  async getDownloadsByType(type: string): Promise<Download[]> {
    return Array.from(this.downloads.values())
      .filter(download => download.type === type)
      .sort((a, b) => (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0));
  }
  
  async getDownload(id: number): Promise<Download | undefined> {
    return this.downloads.get(id);
  }
  
  async createDownload(downloadData: InsertDownload): Promise<Download> {
    const id = this.downloadCounter++;
    const download: Download = {
      ...downloadData,
      id,
      downloadCount: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date()
    };
    this.downloads.set(id, download);
    return download;
  }
  
  async updateDownload(id: number, downloadData: Partial<InsertDownload>): Promise<Download | undefined> {
    const download = this.downloads.get(id);
    if (!download) return undefined;
    
    const updatedDownload: Download = {
      ...download,
      ...downloadData
    };
    
    this.downloads.set(id, updatedDownload);
    return updatedDownload;
  }
  
  async deleteDownload(id: number): Promise<boolean> {
    return this.downloads.delete(id);
  }
  
  async incrementDownloadCount(id: number): Promise<number> {
    const download = this.downloads.get(id);
    if (!download) return 0;
    
    download.downloadCount += 1;
    this.downloads.set(id, download);
    return download.downloadCount;
  }
  
  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort((a, b) => 
      (b.createdAt.getTime()) - (a.createdAt.getTime())
    );
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationCounter++;
    const notification: Notification = {
      ...notificationData,
      id,
      read: false,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  // Subscriber operations
  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
  
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    return this.subscribers.get(id);
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
  }
  
  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberCounter++;
    const subscriber: Subscriber = {
      ...subscriberData,
      id,
      createdAt: new Date()
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  
  async deleteSubscriber(id: number): Promise<boolean> {
    return this.subscribers.delete(id);
  }
  
  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    return this.siteSettings.get(1);
  }
  
  async updateSiteSettings(settingsData: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const settings = this.siteSettings.get(1);
    if (!settings) return undefined;
    
    const updatedSettings: SiteSetting = {
      ...settings,
      ...settingsData,
      lastUpdated: new Date()
    };
    
    this.siteSettings.set(1, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
