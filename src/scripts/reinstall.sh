#!/bin/bash

###############################################################################
# Nebura Project Reinstallation Script
#
# This script removes existing dependencies and build artifacts,
# clears the npm cache, reinstalls all dependencies, rebuilds the project,
# and optionally runs database migrations.
#
# Usage:
#   bash reinstall.sh
#
# Requirements:
#   - Node.js (v16+ recommended)
#   - npm
###############################################################################

set -e

function error_exit {
  echo "Error: $1"
  exit 1
}

echo "=== Nebura Reinstallation Script ==="

# Remove node_modules and build output
echo "-> Removing node_modules and build output..."
rm -rf node_modules build dist

# Clear npm cache
echo "-> Clearing npm cache..."
npm cache clean --force

# Reinstall npm dependencies
echo "-> Reinstalling npm dependencies..."
npm install

# Build the project
echo "-> Rebuilding the project..."
npm run build

# Run database migrations if typeorm is present
if npm run | grep -q "typeorm"; then
  echo "-> Running database migrations..."
  npm run typeorm migration:run || echo "No migrations to run or typeorm not configured."
fi

echo "=== Reinstallation completed successfully! ==="
echo "You can now start the project with: npm run start"
