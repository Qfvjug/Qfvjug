import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

// Environment variables for database connection
const connectionString = process.env.DATABASE_URL || '';

// Check if connection string is provided
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create database connection
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// DB migration function - can be called during app startup
export async function runMigrations() {
  console.log("Running database migrations...");
  
  // Create tables if they don't exist
  try {
    // Use SQL queries to create tables directly
    // This is a development approach - in production we'd use drizzle-kit migrations
    
    // Try to create a default admin user if not exists
    const userCount = await db.select({ count: sql`count(*)` }).from(schema.users);
    if (Number(userCount[0].count) === 0) {
      console.log("Creating default admin user...");
      // Password will be hashed in the storage implementation
      await db.insert(schema.users).values({
        username: "admin",
        password: "admin123", // This will be hashed in storage layer
        isAdmin: true,
        createdAt: new Date()
      });
      console.log("Default admin user created");
    }
    
    // Try to create default site settings if not exists
    const settingsCount = await db.select({ count: sql`count(*)` }).from(schema.siteSettings);
    if (Number(settingsCount[0].count) === 0) {
      console.log("Creating default site settings...");
      await db.insert(schema.siteSettings).values({
        youtubeChannelId: "UCXuqSBlHAE6Xw-yeJA0Tunw", // Default example: Linus Tech Tips
        featuredVideoId: "dQw4w9WgXcQ", // Default example
        newsTickerItems: ["Welcome to my gaming channel!", "Check out the latest videos", "Don't forget to subscribe!"],
        lastUpdated: new Date()
      });
      console.log("Default site settings created");
    }
    
    console.log("Database setup complete");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}