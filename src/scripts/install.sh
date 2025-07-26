#!/bin/bash

###############################################################################
# Nebura Project Installation Script
#
# This script automates the setup process for the Nebura project.
# It checks for required dependencies, installs npm packages, builds the project,
# and optionally runs database migrations.
#
# Usage:
#   bash install.sh
#
# Requirements:
#   - Node.js (v16+ recommended)
#   - npm
#   - git
###############################################################################

set -e

# Function to print error and exit
function error_exit {
  echo "Error: $1"
  exit 1
}

echo "=== Nebura Installation Script ==="

# Check for Node.js
if ! command -v node &> /dev/null; then
  error_exit "Node.js is not installed. Please install Node.js and try again."
fi

# Check for npm
if ! command -v npm &> /dev/null; then
  error_exit "npm is not installed. Please install npm and try again."
fi

# Check for git
if ! command -v git &> /dev/null; then
  error_exit "git is not installed. Please install git and try again."
fi

echo "-> All required dependencies are installed."

# Install npm dependencies
echo "-> Installing npm dependencies..."
npm install

# Build the project
echo "-> Building the project..."
npm run build

# Run database migrations if typeorm is present
if npm run | grep -q "typeorm"; then
  echo "-> Running database migrations..."
  npm run typeorm migration:run || echo "No migrations to run or typeorm not configured."
fi

echo "=== Installation completed successfully! ==="
echo "You can now start the project with: npm run start"
