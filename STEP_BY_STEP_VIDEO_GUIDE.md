# 🎬 VIDEO STYLE STEP-BY-STEP GUIDE

## Complete Process to Run Your App

---

## PART 1: LOCAL SETUP (First Time Only)

### Prerequisites Check
```
Windows PowerShell as Administrator
Node.js v22+        → node --version
MongoDB installed   → Get-Service MongoDB
.env file exists    → in project root
```

### Installation Steps

#### Step 1️⃣: Install Node.js (If Not Done)
```
1. Visit https://nodejs.org
2. Click "LTS" (Long Term Support)
3. Download Windows Installer
4. Run installer
5. Check "Add to PATH"
6. Click Install
7. Restart computer
8. Verify:
   node --version    (Should show v22.x.x)
   npm --version     (Should show 10.x.x)
```

#### Step 2️⃣: Install MongoDB (If Not Done)
```
1. Visit https://www.mongodb.com/try/download/community
2. Select "Windows - MSI"
3. Download installer
4. Run installer
5. Choose "Install MongoDB as a Service"
6. Click Install
7. Verify it's running:
   Get-Service MongoDB | Select-Object Name, Status
   (Should show: Status = Running)
```

#### Step 3️⃣: Create .env File (If Not Done)
```powershell
# Open PowerShell in project folder
cd c:\Users\pardhu\Desktop\wind_social

# Create .env
echo "MONGO_URI=mongodb://127.0.0.1:27017/social-sync" > .env
echo "PORT=3000" >> .env
echo "NODE_ENV=development" >> .env

# Verify
Get-Content .env
# Should show all 3 lines
```

---

## PART 2: INSTALL DEPENDENCIES (First Time Only)

```powershell
# Open PowerShell in project folder
cd c:\Users\pardhu\Desktop\wind_social

# Install all packages
npm install

# Wait for: "added 123 packages"
# Takes 1-2 minutes
```

---

## PART 3: RUN YOUR APP (Every Time You Want to Use It)

### Step 1: Open PowerShell

**Method A: From Folder**
```
1. Open File Explorer
2. Go to: C:\Users\pardhu\Desktop\wind_social
3. Click in address bar
4. Type: powershell
5. Press Enter
6. PowerShell opens in that folder
```

**Method B: Manually**
```powershell
# Open PowerShell
# Type:
cd c:\Users\pardhu\Desktop\wind_social
```

### Step 2: Check MongoDB is Running

```powershell
# Check status
Get-Service MongoDB | Select-Object Name, Status

# If Status = "Stopped", run:
Start-Service MongoDB

# Wait 5 seconds then check again
Get-Service MongoDB | Select-Object Name, Status
# Should show: Running
```

### Step 3: START THE SERVER

```powershell
npm start
```

**WAIT FOR THIS OUTPUT:**
```
🔧 Initializing Social Sync Server...
📊 Database Configuration:
   URI: mongodb://127.0.0.1:27017/social-sync
⚙️  Configuration: PORT=3000, ENV=development
🔗 Attempting to connect to MongoDB...
✅ Connected to MongoDB successfully
🚀 Server running at http://localhost:3000
📝 API Documentation:
   - Auth endpoints: /api/auth/*
   - Post endpoints: /api/posts/*
   - Health check: /api/health
```

**When you see "✅ Connected" and "🚀 Server running" → YOUR APP IS RUNNING! ✅**

---

## PART 4: OPEN APP IN BROWSER

```
1. Open your browser (Chrome, Firefox, Edge)
2. Type in address bar: http://localhost:3000
3. Press Enter
4. Your app loads!
```

**You should see:**
```
Social Sync App
- Home | Search | Explore | Messages | Profile
- Login/Register forms on the right
- Create Post button (+)
```

---

## PART 5: TEST YOUR APP

### Test 1: Register Account
```
1. Click "Register" tab
2. Fill in:
   Username: testuser
   Email: test@email.com
   Password: test123
3. Click "Register"
4. ✅ You're logged in
5. See profile with your username
```

### Test 2: Create a Text Post
```
1. Click Create Post (+) button
2. Type caption: "My first post!"
3. Click "Share Post"
4. ✅ Post appears in Home feed
5. See: "My first post!" with like/comment buttons
```

### Test 3: Upload Image
```
1. Click Create Post (+)
2. Type: "My photo"
3. Click upload area (camera icon)
4. Select JPG or PNG image from your computer
5. See preview
6. Click "Share Post"
7. ✅ Image shows in feed
```

### Test 4: Upload Video
```
1. Click Create Post (+)
2. Type: "Check out my video!"
3. Click upload area
4. Select MP4 video (up to 50MB)
5. See video preview with player
6. Click "Share Post"
7. ✅ Video appears in feed with controls
```

### Test 5: Like a Post
```
1. Hover over ♡ button
2. ✅ Heart zooms and shows background
3. Click ♡
4. ✅ Heart turns RED
5. Count increases
```

### Test 6: Comment on Post
```
1. Click 💬 button
2. Type: "Nice post!"
3. Press Enter
4. ✅ Comment shows below post
```

### Test 7: Follow a User
```
1. Go to Explore
2. Click "Follow" on any user
3. Go to Home
4. ✅ Only see posts from followed users
5. No more posts from non-followed users
```

---

## PART 6: STOP YOUR APP

```powershell
# In the PowerShell window with the running server
# Press: Ctrl + C

# You'll see: SIGINT received, shutting down gracefully
# ✅ Server stopped
# You can close PowerShell
```

---

## PART 7: DEPLOY TO CLOUD (Go Live!)

### Option A: Deploy to Render.com (Easiest & Free)

#### Step 1: Push to GitHub
```powershell
# Initialize git repo
git init

# Add all files
git add .

# Commit
git commit -m "Social Sync App - Ready to deploy"

# Push to GitHub (create repo first)
git push -u origin main
```

#### Step 2: Deploy on Render
```
1. Go to https://render.com
2. Click "Get Started"
3. Sign in with GitHub
4. Click "New Web Service"
5. Select your repository
6. Settings:
   - Name: wind-social
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
7. Click "Create Web Service"
8. Wait 2-3 minutes for deploy
9. Get URL like: https://wind-social-xxxxx.onrender.com
10. ✅ APP IS LIVE!
```

#### Step 3: Connect Cloud MongoDB (Optional)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create database cluster
4. Add database user (username/password)
5. Get connection string:
   mongodb+srv://user:pass@cluster.mongodb.net/social-sync
6. Go to Render Dashboard
7. Add Environment Variable:
   MONGO_URI = (paste connection string)
8. Redeploy
9. ✅ Using cloud database!
```

### Option B: Deploy to Heroku (Traditional)

```powershell
# Install Heroku CLI
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Push code
git push heroku main

# Open live app
heroku open
```

### Option C: Deploy to Railway.app (Recommended)

```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to project
cd c:\Users\pardhu\Desktop\wind_social

# Link project
railway link

# Deploy
railway up

# View dashboard
railway open
```

---

## PART 8: SHARE YOUR APP

Once deployed:

```
1. Get your live URL from deployment platform
2. Send to friends:
   https://your-app-name.onrender.com
3. They can:
   - Register account
   - Create posts
   - Upload photos/videos
   - Follow each other
   - Like and comment
4. 🎉 Social network is LIVE!
```

---

## Complete Commands Cheat Sheet

```powershell
# Navigate to project
cd c:\Users\pardhu\Desktop\wind_social

# CHECK REQUIREMENTS
node --version              # Check Node.js
npm --version               # Check NPM
Get-Service MongoDB         # Check MongoDB

# FIRST TIME
npm install                 # Install packages

# EVERY TIME YOU WANT TO USE
npm start                   # Start server
# Then open: http://localhost:3000

# STOP
Ctrl + C                    # Stop server

# DEPLOYMENT
git init                    # Initialize git
git add .                   # Add files
git commit -m "message"     # Commit
git push origin main        # Push to GitHub

# THEN DEPLOY on:
# - Render.com (easiest)
# - Heroku.com
# - Railway.app
# - Others...
```

---

## Troubleshooting Table

| Problem | Solution |
|---------|----------|
| "npm: command not found" | Install Node.js from nodejs.org, restart |
| MongoDB "connection refused" | Run: `Start-Service MongoDB` |
| Port 3000 "already in use" | Kill process: `netstat -ano \| findstr :3000` then `taskkill /PID [num] /F` |
| ".env file not found" | Create: `echo "MONGO_URI=..." > .env` |
| "Cannot find module" | Run: `npm install` |
| App won't start | Check MongoDB is running: `Get-Service MongoDB` |
| Deployment fails | Check logs in platform dashboard |

---

## Visual Flow Chart

```
┌─────────────────────┐
│  1. Open PowerShell │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  2. cd to project   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  3. Check MongoDB   │
│  running?           │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  4. npm install     │
│  (first time only)  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  5. npm start       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  6. Open browser    │
│  localhost:3000     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  7. Test your app   │
│  Register/Post/Like │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  8. Deploy to cloud │
│  (Render/Railway)   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  9. Share live URL  │
│  with friends! 🎉   │
└─────────────────────┘
```

---

## Summary

### LOCAL (Every Day)
```
1. Open PowerShell
2. cd c:\Users\pardhu\Desktop\wind_social
3. npm start
4. Open http://localhost:3000
5. Use app
6. When done: Ctrl + C
```

### DEPLOY (Once)
```
1. Push to GitHub
2. Deploy on Render/Railway/Heroku
3. Get live URL
4. Share with everyone!
```

---

**NOW YOU'RE READY! 🚀 Start with:** `npm start`
