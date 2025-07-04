// Diese Datei ist nur ein Stub, da wir Firebase als Hauptspeicher verwenden
// Wir importieren alle Typen, damit wir die Schnittstelle korrekt definieren können
import { 
  type User, type InsertUser,
  type Video, type InsertVideo,
  type Download, type InsertDownload,
  type Notification, type InsertNotification,
  type Subscriber, type InsertSubscriber,
  type SiteSetting, type InsertSiteSetting,
  type Comment, type InsertComment
} from "@shared/schema";

// Die Schnittstelle bleibt unverändert, damit der Rest der Anwendung funktioniert
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

// Eine Stub-Klasse, die Fehler wirft, wenn sie aufgerufen wird
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getVideo(id: number): Promise<Video | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async deleteVideo(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getFeaturedVideo(): Promise<Video | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async setFeaturedVideo(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  // Download operations
  async getAllDownloads(): Promise<Download[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getDownloadsByType(type: string): Promise<Download[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getDownload(id: number): Promise<Download | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async deleteDownload(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async incrementDownloadCount(id: number): Promise<number> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async deleteNotification(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  // Subscriber operations
  async getAllSubscribers(): Promise<Subscriber[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async updateLiveStreamStatus(isLive: boolean, streamId?: string): Promise<SiteSetting | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  // Comments operations
  async getCommentsByVideo(videoId: number): Promise<Comment[]> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async getComment(id: number): Promise<Comment | undefined> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async deleteComment(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }

  async approveComment(id: number): Promise<boolean> {
    throw new Error('PostgreSQL is not used anymore. Using Firebase instead.');
  }
}

// Exportiere eine Instanz der Stub-Klasse
export const storage = new DatabaseStorage();