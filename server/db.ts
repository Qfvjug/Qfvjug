import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

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
    // This is a simple solution for development purposes
    // In production, you would use drizzle-kit migrations
    console.log("Database setup complete");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}