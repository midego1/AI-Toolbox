#!/bin/bash

# Quick script to set credits for a user
# Usage: ./set-credits.sh your@email.com 10000

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./set-credits.sh <email> <amount>"
  echo "Example: ./set-credits.sh user@example.com 10000"
  exit 1
fi

EMAIL=$1
AMOUNT=$2

echo "Setting credits to $AMOUNT for $EMAIL..."

cd "$(dirname "$0")"

npx convex run adminTools:setCredits --args "{\"email\":\"$EMAIL\",\"amount\":$AMOUNT}"






