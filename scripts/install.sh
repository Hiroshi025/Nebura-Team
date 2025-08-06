#!/bin/bash

echo "=========================================="
echo "   Nebura Control - Interactive Installer"
echo "=========================================="
echo ""

# Ask if user wants to install npm dependencies
read -p "Do you want to install npm dependencies? (y/n): " install_npm
if [[ "$install_npm" == "y" ]]; then
  echo "Installing npm dependencies..."
  npm install
else
  echo "Skipping npm dependencies installation."
fi

# Ask if user wants to create .env file
read -p "Do you want to create the .env configuration file? (y/n): " create_env
if [[ "$create_env" == "y" ]]; then
  ENV_PATH=".env"
  if [ -f "$ENV_PATH" ]; then
    echo "The .env file already exists. Overwrite it? (y/n): "
    read overwrite_env
    if [[ "$overwrite_env" != "y" ]]; then
      echo "Skipping .env creation."
    else
      create_env="y"
    fi
  fi
  if [[ "$create_env" == "y" ]]; then
    echo "Creating .env file..."
    cat > $ENV_PATH <<EOL
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=nebura
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
EOL
    echo ".env file created with default values."
  fi
fi

# Ask if user wants to build the project
read -p "Do you want to build the project? (y/n): " build_project
if [[ "$build_project" == "y" ]]; then
  echo "Building project..."
  npm run build
else
  echo "Skipping build."
fi

# Ask if user wants to start the project in development mode
read -p "Do you want to start the project in development mode? (y/n): " start_dev
if [[ "$start_dev" == "y" ]]; then
  echo "Starting Nebura Control in development mode..."
  npm run start:dev
else
  echo "Installation finished. You can start the project manually with 'npm run start:dev'."
fi

echo ""
echo "=========================================="
echo "   Installation completed. Ready to use!"
echo "=========================================="
