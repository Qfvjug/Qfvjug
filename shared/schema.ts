import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  youtubeId: text("youtube_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  viewCount: integer("view_count"),
  uploadDate: timestamp("upload_date"),
  category: text("category").default("general").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // game, mod, tool
  version: text("version").notNull(),
  downloadUrl: text("download_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  downloadCount: integer("download_count").default(0).notNull(),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  releaseDate: timestamp("release_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // video, download, announcement
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  notificationType: text("notification_type").default("all").notNull(), // all, videos, downloads, announcements
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  youtubeChannelId: text("youtube_channel_id"),
  featuredVideoId: text("featured_video_id"),
  newsTickerItems: jsonb("news_ticker_items").$type<string[]>(),
  isLiveStreaming: boolean("is_live_streaming").default(false).notNull(),
  liveStreamId: text("live_stream_id"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  author: text("author").notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const videoRelations = relations(videos, ({ many }) => ({
  comments: many(comments),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
    relationName: "userComments",
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  comments: many(comments, { relationName: "userComments" }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  youtubeId: true,
  title: true,
  description: true,
  thumbnailUrl: true,
  duration: true,
  viewCount: true,
  uploadDate: true,
  category: true,
  isFeatured: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  title: true,
  description: true,
  type: true,
  version: true,
  downloadUrl: true,
  thumbnailUrl: true,
  releaseDate: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  message: true,
  type: true,
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
  notificationType: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).pick({
  youtubeChannelId: true,
  featuredVideoId: true,
  newsTickerItems: true,
  isLiveStreaming: true,
  liveStreamId: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  videoId: true,
  userId: true,
  author: true,
  content: true,
  approved: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
