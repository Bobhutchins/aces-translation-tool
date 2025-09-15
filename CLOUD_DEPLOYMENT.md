# 🚀 ACES Translation Tool - Cloud Deployment Guide

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (free at vercel.com)
- [ ] Railway account (free at railway.app)
- [ ] Your Anthropic API key ready

## 🎯 Deployment Steps

### Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to github.com and click "New repository"
   - Name it: `aces-translation-tool`
   - Make it **Public** (required for free hosting)
   - Don't initialize with README (we already have one)

2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/aces-translation-tool.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Railway

1. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Sign up/login with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `aces-translation-tool` repository

3. **Configure Backend:**
   - Railway will auto-detect it's a Node.js project
   - Set the **Root Directory** to: `server`
   - Add these environment variables:
     ```
     ANTHROPIC_API_KEY=your_actual_api_key_here
     PORT=5001
     NODE_ENV=production
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with GitHub

2. **Import Project:**
   - Click "New Project"
   - Import your `aces-translation-tool` repository

3. **Configure Frontend:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. **Add Environment Variable:**
   - Go to Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.railway.app`

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like `https://your-app.vercel.app`

## 🔧 Alternative: Quick Deploy Script

Run this command to get step-by-step instructions:

```bash
./deploy.sh
```

## 🎉 Sharing Your App

Once deployed, you can share:

**Frontend URL:** `https://your-app.vercel.app`

**Login Credentials:**
- Email: `admin@aces.org`
- Password: `admin123`

## 🔍 Testing Your Deployment

1. **Visit your Vercel URL**
2. **Login with the credentials above**
3. **Upload a test document**
4. **Verify translation works**

## 🛠️ Troubleshooting

### Backend Issues:
- Check Railway logs for errors
- Verify your Anthropic API key is correct
- Ensure environment variables are set

### Frontend Issues:
- Check Vercel build logs
- Verify `REACT_APP_API_URL` points to your Railway backend
- Check browser console for errors

### Translation Issues:
- Verify API key has credits
- Check Railway logs for API errors
- Test with a simple text file first

## 📱 Mobile Testing

Your deployed app works on mobile devices! Share the Vercel URL and test on phones/tablets.

## 🔒 Security Notes

- This is a demo with hardcoded credentials
- In production, implement proper user registration
- Use environment variables for all sensitive data
- Enable HTTPS (automatically provided by Vercel/Railway)

## 💰 Cost

- **Vercel:** Free tier includes 100GB bandwidth/month
- **Railway:** Free tier includes $5 credit/month
- **Anthropic API:** Pay per use (very affordable)

## 🎯 Next Steps

After successful deployment:
1. Test with real documents
2. Share with your team
3. Gather feedback
4. Consider production improvements

---

**Need help?** Check the logs in Railway and Vercel dashboards for detailed error messages.
