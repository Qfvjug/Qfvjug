#!/bin/bash

# Install necessary dependencies for Netlify functions
echo "Installing dependencies for Netlify functions..."
npm install --save @babel/preset-typescript lightningcss

# Build the frontend
echo "Building frontend with Vite..."
npm run build

# Build the Netlify functions - Verwende ESM Format für bessere Kompatibilität
echo "Building Netlify functions..."
npx esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=esm --target=node16 --outfile=netlify/functions/api.mjs
npx esbuild netlify/functions/netlify-vite.ts --platform=node --packages=external --bundle --format=esm --target=node16 --outfile=netlify/functions/netlify-vite.mjs

# Kopiere package.json in den Funktionsordner für Netlify, um ESM zu aktivieren
echo "Creating package.json for Netlify functions..."
echo '{
  "type": "module"
}' > netlify/functions/package.json

echo "Build completed successfully!"