# ACES Translation Tool - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository (you'll need to push to GitHub first)
4. Set build command: `cd client && npm run build`
5. Set output directory: `client/build`
6. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`

#### Backend (Railway)
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   - `ANTHROPIC_API_KEY=your_api_key_here`
   - `PORT=5001`
   - `NODE_ENV=production`

### Option 2: Netlify + Render

#### Frontend (Netlify)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `client/build` folder after running `npm run build`

#### Backend (Render)
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `node index.js`

## 🔧 Local Network Sharing

If you want to share with someone on the same network:

1. Make sure your app is running:
   ```bash
   cd /Users/bobhutchins/aces-translation-tool
   ./start.sh
   ```

2. Share this URL: `http://10.0.0.204:3000`

3. Share login credentials:
   - Email: `admin@aces.org`
   - Password: `admin123`

## 📱 Mobile Testing

The app is responsive and works on mobile devices. Share the URL and they can test on their phone/tablet.

## 🔒 Security Notes

- This is a demo application with hardcoded credentials
- In production, implement proper user registration
- Use environment variables for all sensitive data
- Enable HTTPS in production

## 🐛 Troubleshooting

### If the app doesn't load:
1. Check that both frontend and backend are running
2. Verify the API URL is correct
3. Check browser console for errors

### If translations fail:
1. Verify your Anthropic API key is valid
2. Check server logs for error messages
3. Ensure you have API credits available
