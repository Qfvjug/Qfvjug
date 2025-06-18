# Netlify Deployment Guide

## Overview

This document explains how to deploy the YouTube Gaming Channel Website to Netlify. The application uses a serverless architecture with Netlify Functions to handle the backend API.

## Prerequisites

- A Netlify account
- Repository connected to Netlify

## Environment Variables

The following environment variables must be set in Netlify:

- `YOUTUBE_API_KEY`: YouTube API key for fetching channel data
- `YOUTUBE_CHANNEL_ID`: Your YouTube channel ID
- `FIREBASE_PROJECT_ID`: Firebase project ID for storage
- `FIREBASE_PRIVATE_KEY`: Firebase private key (must include all newlines and special characters)
- `FIREBASE_CLIENT_EMAIL`: Firebase client email

**Note:** The DATABASE_URL environment variable is no longer needed since the application now uses Firebase exclusively.

## Deployment Process

### Automatic Deployment

1. Connect your repository to Netlify  
2. Set the build command to: `npm run build`
3. Set the publish directory to: `dist`
4. Set the functions directory to: `netlify/functions`
5. Add the required environment variables in the Netlify dashboard

### Manual Deployment

1. Run `npm run build` to build the frontend
2. The Netlify functions are ready in the `netlify/functions` directory
3. Deploy the `dist` directory and the `netlify/functions` directory

## Architecture Details

### Storage System

The application uses a tiered storage system:

1. **Firebase Firestore** (primary storage)
2. **In-Memory Storage** (fallback if Firebase fails)

### Netlify-Specific Implementations

Special considerations have been made for Netlify deployment:

1. **ESM Compatibility**: Using ESM module format for Netlify Functions with proper Node.js 18+ support
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
   - Make sure the `FIREBASE_PRIVATE_KEY` includes all newlines and special characters
   - Check that your Netlify build environment is set to Node.js 18
3. Ensure Firebase is properly configured with the right permissions
4. Check that the serverless function bundle size doesn't exceed Netlify's limits (125MB)
5. Review the ESM compatibility settings if you encounter module-related errors

## Local Testing

To test the Netlify functions locally:

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify dev` to start a local development server

## Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [Node.js ESM Modules](https://nodejs.org/api/esm.html)