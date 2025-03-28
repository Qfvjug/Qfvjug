import { db } from './firebase';
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

// Interface bleibt gleich wie in storage.ts
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

// Hilfsfunktion zum Konvertieren von Firestore-Dokumenten in unser Schema
function convertFirestoreDoc<T>(doc: FirebaseFirestore.DocumentSnapshot): T & { id: number } {
  if (!doc.exists) {
    throw new Error('Document does not exist');
  }
  
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is undefined');
  }
  
  // Konvertiere Timestamps zu Dates
  const processedData: any = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === 'object' && value.constructor.name === 'Timestamp') {
      processedData[key] = (value as FirebaseFirestore.Timestamp).toDate();
    } else {
      processedData[key] = value;
    }
  });
  
  return {
    ...processedData,
    id: parseInt(doc.id) || parseInt(String(processedData.id)) || 0
  } as T & { id: number };
}

// Hilfsfunktion für die automatische ID-Generierung
async function getNextId(collection: string): Promise<number> {
  const counterRef = db.collection('counters').doc(collection);
  const counterDoc = await counterRef.get();
  
  let nextId = 1;
  if (counterDoc.exists) {
    const data = counterDoc.data();
    nextId = (data?.current || 0) + 1;
  }
  
  await counterRef.set({ current: nextId });
  return nextId;
}

export class FirebaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const snapshot = await db.collection('users').where('id', '==', id).get();
      if (snapshot.empty) return undefined;
      return convertFirestoreDoc<User>(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const snapshot = await db.collection('users').where('username', '==', username).get();
      if (snapshot.empty) return undefined;
      return convertFirestoreDoc<User>(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const id = await getNextId('users');
      const newUser = {
        ...user,
        id,
        password: hashedPassword,
        createdAt: new Date()
      };
      
      await db.collection('users').doc(String(id)).set(newUser);
      return newUser as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    try {
      const snapshot = await db.collection('videos').get();
      return snapshot.docs.map(doc => convertFirestoreDoc<Video>(doc));
    } catch (error) {
      console.error('Error getting all videos:', error);
      return [];
    }
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    try {
      const snapshot = await db.collection('videos').where('category', '==', category).get();
      return snapshot.docs.map(doc => convertFirestoreDoc<Video>(doc));
    } catch (error) {
      console.error('Error getting videos by category:', error);
      return [];
    }
  }

  async getVideo(id: number): Promise<Video | undefined> {
    try {
      const doc = await db.collection('videos').doc(String(id)).get();
      if (!doc.exists) return undefined;
      return convertFirestoreDoc<Video>(doc);
    } catch (error) {
      console.error('Error getting video:', error);
      return undefined;
    }
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    try {
      const id = await getNextId('videos');
      const newVideo = {
        ...video,
        id,
        createdAt: new Date()
      };
      
      await db.collection('videos').doc(String(id)).set(newVideo);
      return newVideo as Video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  async updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined> {
    try {
      const docRef = db.collection('videos').doc(String(id));
      const doc = await docRef.get();
      
      if (!doc.exists) return undefined;
      
      const updateData = {
        ...video,
        updatedAt: new Date()
      };
      
      await docRef.update(updateData);
      
      const updatedDoc = await docRef.get();
      return convertFirestoreDoc<Video>(updatedDoc);
    } catch (error) {
      console.error('Error updating video:', error);
      return undefined;
    }
  }

  async deleteVideo(id: number): Promise<boolean> {
    try {
      await db.collection('videos').doc(String(id)).delete();
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }

  async getFeaturedVideo(): Promise<Video | undefined> {
    try {
      const settingsDoc = await db.collection('site_settings').doc('settings').get();
      if (!settingsDoc.exists) return undefined;
      
      const settings = settingsDoc.data();
      if (!settings || !settings.featuredVideoId) return undefined;
      
      const videoDoc = await db.collection('videos').where('youtubeId', '==', settings.featuredVideoId).get();
      
      if (videoDoc.empty) return undefined;
      return convertFirestoreDoc<Video>(videoDoc.docs[0]);
    } catch (error) {
      console.error('Error getting featured video:', error);
      return undefined;
    }
  }

  async setFeaturedVideo(id: number): Promise<boolean> {
    try {
      const videoDoc = await db.collection('videos').doc(String(id)).get();
      if (!videoDoc.exists) return false;
      
      const video = videoDoc.data();
      if (!video) return false;
      
      await db.collection('site_settings').doc('settings').update({
        featuredVideoId: video.youtubeId,
        lastUpdated: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error setting featured video:', error);
      return false;
    }
  }

  // Download operations
  async getAllDownloads(): Promise<Download[]> {
    try {
      const snapshot = await db.collection('downloads').get();
      return snapshot.docs.map(doc => convertFirestoreDoc<Download>(doc));
    } catch (error) {
      console.error('Error getting all downloads:', error);
      return [];
    }
  }

  async getDownloadsByType(type: string): Promise<Download[]> {
    try {
      const snapshot = await db.collection('downloads').where('type', '==', type).get();
      return snapshot.docs.map(doc => convertFirestoreDoc<Download>(doc));
    } catch (error) {
      console.error('Error getting downloads by type:', error);
      return [];
    }
  }

  async getDownload(id: number): Promise<Download | undefined> {
    try {
      const doc = await db.collection('downloads').doc(String(id)).get();
      if (!doc.exists) return undefined;
      return convertFirestoreDoc<Download>(doc);
    } catch (error) {
      console.error('Error getting download:', error);
      return undefined;
    }
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    try {
      const id = await getNextId('downloads');
      const newDownload = {
        ...download,
        id,
        downloadCount: 0,
        createdAt: new Date()
      };
      
      await db.collection('downloads').doc(String(id)).set(newDownload);
      return newDownload as Download;
    } catch (error) {
      console.error('Error creating download:', error);
      throw error;
    }
  }

  async updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download | undefined> {
    try {
      const docRef = db.collection('downloads').doc(String(id));
      const doc = await docRef.get();
      
      if (!doc.exists) return undefined;
      
      const updateData = {
        ...download,
        updatedAt: new Date()
      };
      
      await docRef.update(updateData);
      
      const updatedDoc = await docRef.get();
      return convertFirestoreDoc<Download>(updatedDoc);
    } catch (error) {
      console.error('Error updating download:', error);
      return undefined;
    }
  }

  async deleteDownload(id: number): Promise<boolean> {
    try {
      await db.collection('downloads').doc(String(id)).delete();
      return true;
    } catch (error) {
      console.error('Error deleting download:', error);
      return false;
    }
  }

  async incrementDownloadCount(id: number): Promise<number> {
    try {
      const docRef = db.collection('downloads').doc(String(id));
      const doc = await docRef.get();
      
      if (!doc.exists) throw new Error('Download not found');
      
      const download = doc.data();
      if (!download) throw new Error('Download data is undefined');
      
      const newCount = (download.downloadCount || 0) + 1;
      
      await docRef.update({
        downloadCount: newCount,
        updatedAt: new Date()
      });
      
      return newCount;
    } catch (error) {
      console.error('Error incrementing download count:', error);
      throw error;
    }
  }

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const snapshot = await db.collection('notifications').get();
      return snapshot.docs.map(doc => {
        // Konvertiere isRead zu read, falls nötig
        const data = doc.data();
        if (data && 'isRead' in data && !('read' in data)) {
          data.read = data.isRead;
          delete data.isRead;
        }
        return convertFirestoreDoc<Notification>(doc);
      });
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return [];
    }
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    try {
      const doc = await db.collection('notifications').doc(String(id)).get();
      if (!doc.exists) return undefined;
      
      // Konvertiere isRead zu read, falls nötig
      const data = doc.data();
      if (data && 'isRead' in data && !('read' in data)) {
        data.read = data.isRead;
        delete data.isRead;
      }
      
      return convertFirestoreDoc<Notification>(doc);
    } catch (error) {
      console.error('Error getting notification:', error);
      return undefined;
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const id = await getNextId('notifications');
      const newNotification = {
        ...notification,
        id,
        read: false, // "read" anstelle von "isRead" für Kompatibilität mit dem Schema
        createdAt: new Date()
      };
      
      await db.collection('notifications').doc(String(id)).set(newNotification);
      return newNotification as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    try {
      const docRef = db.collection('notifications').doc(String(id));
      const doc = await docRef.get();
      
      if (!doc.exists) return false;
      
      await docRef.update({
        read: true, // "read" anstelle von "isRead" für Kompatibilität mit dem Schema
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      await db.collection('notifications').doc(String(id)).delete();
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Subscriber operations
  async getAllSubscribers(): Promise<Subscriber[]> {
    try {
      const snapshot = await db.collection('subscribers').get();
      return snapshot.docs.map(doc => convertFirestoreDoc<Subscriber>(doc));
    } catch (error) {
      console.error('Error getting all subscribers:', error);
      return [];
    }
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    try {
      const doc = await db.collection('subscribers').doc(String(id)).get();
      if (!doc.exists) return undefined;
      return convertFirestoreDoc<Subscriber>(doc);
    } catch (error) {
      console.error('Error getting subscriber:', error);
      return undefined;
    }
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    try {
      const snapshot = await db.collection('subscribers').where('email', '==', email).get();
      if (snapshot.empty) return undefined;
      return convertFirestoreDoc<Subscriber>(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting subscriber by email:', error);
      return undefined;
    }
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    try {
      const id = await getNextId('subscribers');
      const newSubscriber = {
        ...subscriber,
        id,
        createdAt: new Date()
      };
      
      await db.collection('subscribers').doc(String(id)).set(newSubscriber);
      return newSubscriber as Subscriber;
    } catch (error) {
      console.error('Error creating subscriber:', error);
      throw error;
    }
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    try {
      await db.collection('subscribers').doc(String(id)).delete();
      return true;
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      return false;
    }
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    try {
      const doc = await db.collection('site_settings').doc('settings').get();
      if (!doc.exists) return undefined;
      
      const data = doc.data();
      if (!data) return undefined;
      
      return {
        id: 1,
        youtubeChannelId: data.youtubeChannelId,
        featuredVideoId: data.featuredVideoId,
        isLiveStreaming: data.isLiveStreaming || false,
        liveStreamId: data.liveStreamId || null,
        newsTickerItems: data.newsTickerItems || [],
        lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated : new Date(data.lastUpdated)
      } as SiteSetting;
    } catch (error) {
      console.error('Error getting site settings:', error);
      return undefined;
    }
  }

  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    try {
      const docRef = db.collection('site_settings').doc('settings');
      const doc = await docRef.get();
      
      const updateData = {
        ...settings,
        lastUpdated: new Date()
      };
      
      if (doc.exists) {
        await docRef.update(updateData);
      } else {
        await docRef.set(updateData);
      }
      
      const updatedDoc = await docRef.get();
      const data = updatedDoc.data();
      
      if (!data) return undefined;
      
      return {
        id: 1,
        youtubeChannelId: data.youtubeChannelId,
        featuredVideoId: data.featuredVideoId,
        isLiveStreaming: data.isLiveStreaming || false,
        liveStreamId: data.liveStreamId || null,
        newsTickerItems: data.newsTickerItems || [],
        lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated : new Date(data.lastUpdated)
      } as SiteSetting;
    } catch (error) {
      console.error('Error updating site settings:', error);
      return undefined;
    }
  }

  async updateLiveStreamStatus(isLive: boolean, streamId?: string): Promise<SiteSetting | undefined> {
    try {
      const docRef = db.collection('site_settings').doc('settings');
      
      await docRef.update({
        isLiveStreaming: isLive,
        liveStreamId: streamId || null,
        lastUpdated: new Date()
      });
      
      return this.getSiteSettings();
    } catch (error) {
      console.error('Error updating livestream status:', error);
      return undefined;
    }
  }

  // Comments operations
  async getCommentsByVideo(videoId: number): Promise<Comment[]> {
    try {
      const snapshot = await db.collection('comments').where('videoId', '==', videoId).get();
      return snapshot.docs.map(doc => convertFirestoreDoc<Comment>(doc));
    } catch (error) {
      console.error('Error getting comments by video:', error);
      return [];
    }
  }

  async getComment(id: number): Promise<Comment | undefined> {
    try {
      const doc = await db.collection('comments').doc(String(id)).get();
      if (!doc.exists) return undefined;
      return convertFirestoreDoc<Comment>(doc);
    } catch (error) {
      console.error('Error getting comment:', error);
      return undefined;
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      const id = await getNextId('comments');
      const newComment = {
        ...comment,
        id,
        approved: false,
        createdAt: new Date()
      };
      
      await db.collection('comments').doc(String(id)).set(newComment);
      return newComment as Comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async deleteComment(id: number): Promise<boolean> {
    try {
      await db.collection('comments').doc(String(id)).delete();
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  async approveComment(id: number): Promise<boolean> {
    try {
      const docRef = db.collection('comments').doc(String(id));
      const doc = await docRef.get();
      
      if (!doc.exists) return false;
      
      await docRef.update({
        approved: true,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error approving comment:', error);
      return false;
    }
  }
}

export const storage = new FirebaseStorage();