#!/bin/bash

# Build the frontend
echo "Building frontend with Vite..."
npm run build

# Build the Netlify functions
echo "Building Netlify functions..."
npx esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=esm --outfile=netlify/functions/api.js

echo "Build completed successfully!"