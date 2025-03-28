#!/bin/bash

# Build the frontend
echo "Building frontend with Vite..."
npm run build

# Build the Netlify functions - Verwende CommonJS Format für Netlify-Kompatibilität
echo "Building Netlify functions..."
npx esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=cjs --target=node16 --outfile=netlify/functions/api.js
npx esbuild netlify/functions/netlify-vite.ts --platform=node --packages=external --bundle --format=cjs --target=node16 --outfile=netlify/functions/netlify-vite.js

echo "Build completed successfully!"