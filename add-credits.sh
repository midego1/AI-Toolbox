#!/bin/bash

# Quick script to add credits to a user
# Usage: ./add-credits.sh your@email.com 10000

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./add-credits.sh <email> <amount>"
  echo "Example: ./add-credits.sh user@example.com 10000"
  exit 1
fi

EMAIL=$1
AMOUNT=$2

echo "Adding $AMOUNT credits to $EMAIL..."

cd "$(dirname "$0")"

npx convex run adminTools:addCredits --args "{\"email\":\"$EMAIL\",\"amount\":$AMOUNT}"

