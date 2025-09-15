#!/bin/bash

echo "🚀 ACES Translation Tool - Deployment Helper"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Choose deployment option:"
echo "1) Local Network Sharing (easiest)"
echo "2) Deploy to Vercel + Railway (cloud)"
echo "3) Build for manual deployment"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🌐 Starting local network sharing..."
        echo "Your app will be available at: http://10.0.0.204:3000"
        echo "Share these credentials:"
        echo "  Email: admin@aces.org"
        echo "  Password: admin123"
        echo ""
        echo "Starting servers..."
        ./start.sh
        ;;
    2)
        echo "☁️  Preparing for cloud deployment..."
        echo ""
        echo "📝 Before deploying, make sure you have:"
        echo "  1. GitHub repository created"
        echo "  2. Pushed your code to GitHub"
        echo "  3. Anthropic API key ready"
        echo ""
        echo "🔗 Deployment URLs:"
        echo "  Frontend: https://vercel.com"
        echo "  Backend: https://railway.app"
        echo ""
        echo "📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    3)
        echo "🔨 Building for manual deployment..."
        echo "Building frontend..."
        cd client && npm run build
        echo "✅ Frontend built in client/build/"
        echo "You can now upload this to any static hosting service"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac
