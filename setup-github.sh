#!/bin/bash

echo "🐙 GitHub Repository Setup"
echo "========================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Run 'git init' first."
    exit 1
fi

echo "📋 This script will help you push your code to GitHub"
echo ""

# Get repository name
read -p "Enter your GitHub username: " username
read -p "Enter repository name (default: aces-translation-tool): " repo_name

if [ -z "$repo_name" ]; then
    repo_name="aces-translation-tool"
fi

echo ""
echo "🔗 Repository URL will be: https://github.com/$username/$repo_name"
echo ""

read -p "Is this correct? (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo ""
echo "🚀 Setting up GitHub repository..."

# Add remote origin
git remote add origin "https://github.com/$username/$repo_name.git" 2>/dev/null || {
    echo "⚠️  Remote origin already exists, updating..."
    git remote set-url origin "https://github.com/$username/$repo_name.git"
}

# Set main branch
git branch -M main

echo ""
echo "✅ Git configuration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create the repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: $repo_name"
echo "   - Make it PUBLIC (required for free hosting)"
echo "   - Don't initialize with README"
echo ""
echo "2. Push your code:"
echo "   git push -u origin main"
echo ""
echo "3. Then follow the deployment guide in CLOUD_DEPLOYMENT.md"
echo ""

read -p "Do you want to push now? (y/n): " push_now
if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🔗 Your repository: https://github.com/$username/$repo_name"
        echo ""
        echo "🎯 Next: Follow CLOUD_DEPLOYMENT.md to deploy to Vercel + Railway"
    else
        echo ""
        echo "❌ Push failed. Make sure you've created the repository on GitHub first."
        echo "   Go to: https://github.com/new"
    fi
else
    echo ""
    echo "📝 When ready, run: git push -u origin main"
fi
