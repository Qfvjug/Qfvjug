# Netlify Deployment Guide

## Overview

This document explains how to deploy the YouTube Gaming Channel Website to Netlify. The application uses a serverless architecture with Netlify Functions to handle the backend API.

## Prerequisites

- A Netlify account
- Repository connected to Netlify

## Environment Variables

The following environment variables must be set in Netlify:

- `DATABASE_URL`: PostgreSQL database connection string (required for database functionality)
- `YOUTUBE_API_KEY`: YouTube API key for fetching channel data
- `YOUTUBE_CHANNEL_ID`: Your YouTube channel ID
- `FIREBASE_PROJECT_ID`: (Optional) Firebase project ID for fallback storage
- `FIREBASE_PRIVATE_KEY`: (Optional) Firebase private key
- `FIREBASE_CLIENT_EMAIL`: (Optional) Firebase client email

## Deployment Process

### Automatic Deployment

1. Connect your repository to Netlify
2. Set the build command to: `./build-netlify.sh`
3. Set the publish directory to: `dist`
4. Add the required environment variables in the Netlify dashboard

### Manual Deployment

1. Run `npm run build` to build the frontend
2. Run `./build-netlify.sh` to build the Netlify functions
3. Deploy the `dist` directory and the `netlify` directory

## Architecture Details

### Storage System

The application uses a tiered storage system:

1. **PostgreSQL Database** (primary storage)
2. **Firebase** (fallback if PostgreSQL fails)
3. **In-Memory Storage** (final fallback)

### Netlify-Specific Implementations

Special considerations have been made for Netlify deployment:

1. **CommonJS Compatibility**: Using `esbuild` to bundle TypeScript files into CommonJS format for Netlify Functions
2. **Top-Level Await Handling**: Custom implementations to avoid top-level await in serverless functions
3. **Environment Detection**: Code dynamically imports different implementations based on the environment

### Netlify Functions

Two key Netlify Functions are used:

1. **api.js**: The main API handler for backend functionality
2. **netlify-vite.js**: A special implementation to avoid Vite dependencies in production

### Redirect Rules

The `netlify.toml` file contains redirect rules to:

1. Route API requests to the Netlify Function
2. Serve the SPA (Single Page Application) for all other routes

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Netlify build logs for errors
2. Verify that all environment variables are set correctly
3. Ensure the database is accessible from Netlify's servers
4. Check that the serverless function bundle size doesn't exceed Netlify's limits

## Local Testing

To test the Netlify functions locally:

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify dev` to start a local development server

## Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)