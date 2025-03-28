#!/bin/bash

# Install necessary dependencies for Netlify functions
echo "Installing dependencies for Netlify functions..."
npm install --save @babel/preset-typescript lightningcss

# Build the frontend
echo "Building frontend with Vite..."
npx vite build
# Build the server manuell
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --target=node18 --outdir=dist/server

# Build the Netlify functions - Verwende ESM Format für bessere Kompatibilität
echo "Building Netlify functions..."
npx esbuild netlify/functions/api.ts --platform=node --packages=external --bundle --format=esm --target=node18 --outfile=netlify/functions/api.mjs
npx esbuild netlify/functions/netlify-vite.ts --platform=node --packages=external --bundle --format=esm --target=node18 --outfile=netlify/functions/netlify-vite.mjs

# Füge auch noch eine ESM-Marke zu den Dateien hinzu
sed -i '1s/^/\/\/ ESM module\n/' netlify/functions/api.mjs
sed -i '1s/^/\/\/ ESM module\n/' netlify/functions/netlify-vite.mjs

# Kopiere package.json in den Funktionsordner für Netlify, um ESM zu aktivieren
echo "Creating package.json for Netlify functions..."
echo '{
  "name": "netlify-functions",
  "type": "module",
  "main": "api.esm.js",
  "engines": {
    "node": ">=18.0.0"
  }
}' > netlify/functions/package.json

# Kopiere die ESM-Wrapper-Dateien
cp netlify/functions/api.esm.js netlify/functions/api.js
cp netlify/functions/netlify-vite.esm.js netlify/functions/netlify-vite.js

# Erstelle eine .node-version Datei für Netlify, um Node.js 18 zu erzwingen
echo "18.x" > .node-version

echo "Build completed successfully!"