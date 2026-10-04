#!/usr/bin/env bash

set -e

echo "======================================"
echo " Customer Support Agent - Git Push"
echo "======================================"

echo ""
echo "Checking Git status..."
git status

echo ""
read -p "Enter commit message: " COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
    echo "Error: commit message cannot be empty."
    exit 1
fi

echo ""
echo "Adding changes..."
git add .

echo ""
echo "Creating commit..."
git commit -m "$COMMIT_MESSAGE"

echo ""
echo "Pushing to remote..."
git push

echo ""
echo "======================================"
echo " Push completed successfully."
echo "======================================"
