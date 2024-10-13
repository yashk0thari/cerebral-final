#!/bin/bash

APP_DIR="./shadcn-landing-page"
REPO_URL="https://github.com/leoMirandaa/shadcn-landing-page.git"

function rename_if_exists() {
    local base_name=$1
    local counter=1

    # Check if the folder exists
    while [ -d "$base_name" ]; do
        # Create a new name with a counter
        new_name="${base_name}-${counter}"
        
        # If the new name already exists, increment the counter
        if [ -d "$new_name" ]; then
            counter=$((counter + 1))
        else
            mv "$base_name" "$new_name"
            echo "Renamed $base_name to $new_name"
            base_name=$new_name
            break
        fi
    done
}

# Rename the directory if it already exists
rename_if_exists "$APP_DIR"

echo "Cloning the repository from $REPO_URL into $APP_DIR..."

# Clone the repository into the desired directory
git clone $REPO_URL $APP_DIR

# Check if the clone was successful
if [ $? -eq 0 ]; then
    echo "Repository cloned successfully!"
else
    echo "Failed to clone the repository."
    exit 1
fi

# Change directory to the app folder
cd $APP_DIR

npm install vite

echo "Installing dependencies with npm..."
npm install

if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully!"
else
    echo "Failed to install dependencies."
    exit 1
fi


# Run the development server
echo "Starting the Next.js development server..."
npm run dev

# Check if the server started successfully
if [ $? -eq 0 ]; then
    echo "Next.js server is running! Visit http://localhost:5173/ to view the app."
else
    echo "Failed to start the Next.js server."
    exit 1
fi