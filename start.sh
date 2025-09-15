#!/bin/bash

# ACES Translation Tool Startup Script

echo "🚀 Starting ACES Translation Tool..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Check if .env file exists in server directory
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server directory."
    echo "📝 Please copy server/env.example to server/.env and configure your settings."
    echo "   Don't forget to add your Anthropic API key!"
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p server/uploads
mkdir -p server/logs

echo "✅ Dependencies installed and directories created."
echo "🌐 Starting development servers..."
echo ""
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "👤 Demo credentials:"
echo "   Admin: admin@aces.org / admin123"
echo "   Translator: translator@aces.org / admin123"
echo ""

# Start the development servers
npm run dev
