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
        echo "☁️  Cloud Deployment Setup"
        echo "========================="
        echo ""
        echo "📝 Prerequisites:"
        echo "  1. GitHub account (github.com)"
        echo "  2. Vercel account (vercel.com) - free"
        echo "  3. Railway account (railway.app) - free"
        echo "  4. Your Anthropic API key"
        echo ""
        echo "🚀 Quick Start:"
        echo "  1. Create GitHub repository"
        echo "  2. Push this code to GitHub"
        echo "  3. Deploy backend to Railway"
        echo "  4. Deploy frontend to Vercel"
        echo ""
        echo "📖 Detailed instructions:"
        echo "  See CLOUD_DEPLOYMENT.md for step-by-step guide"
        echo ""
        echo "🔗 Deployment URLs:"
        echo "  Frontend: https://vercel.com"
        echo "  Backend: https://railway.app"
        echo ""
        read -p "Do you want to open the deployment guide? (y/n): " open_guide
        if [ "$open_guide" = "y" ] || [ "$open_guide" = "Y" ]; then
            if command -v open &> /dev/null; then
                open CLOUD_DEPLOYMENT.md
            else
                echo "Please open CLOUD_DEPLOYMENT.md in your text editor"
            fi
        fi
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
