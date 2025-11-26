# 🎯 SOCIAL SYNC - QUICK REFERENCE

## ⚡ Get Started in 3 Steps

### Step 1: Start MongoDB
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# If not running, start it
net start MongoDB
```

### Step 2: Start the Server
```powershell
cd c:\Users\pardhu\Desktop\wind_social
npm start
```

### Step 3: Open Browser
```
http://localhost:3000
```

---

## 📁 Where Everything Is

```
backend/              ← All server code
├── server.js         ← Main entry point (runs on :3000)
├── config/           ← Database configuration
├── models/           ← User and Post schemas
└── routes/           ← API endpoints

frontend/             ← All client code
├── index.html        ← Application UI
└── assets/           ← CSS and JavaScript
    ├── css/style.css
    └── js/app.js

.env                  ← Configuration file
package.json          ← Dependencies & scripts
```

---

## 🌐 Access Points

| What | URL | Purpose |
|------|-----|---------|
| **Application** | `http://localhost:3000` | Main app interface |
| **Health Check** | `http://localhost:3000/api/health` | Server status |
| **Auth API** | `http://localhost:3000/api/auth/*` | Login, register, etc |
| **Posts API** | `http://localhost:3000/api/posts/*` | Create, like, comment |

---

## 🔑 Key Commands

```powershell
# Start server
npm start

# Verify setup
node verify-setup.js

# Check MongoDB
Get-Service MongoDB

# Stop server
# Press Ctrl+C in terminal

# Kill all Node processes (if stuck)
Get-Process node | Stop-Process -Force
```

---

## 📝 User Credentials Format

### Register
- **Email**: Must use Gmail (@gmail.com)
- **Username**: Any unique name
- **Password**: Any password
- **User ID**: Auto-generated (7 digits)

### Login
- Use **username**, **email**, or **user ID**

---

## 🎨 Application Features

- ✅ User Registration & Login
- ✅ Create Posts
- ✅ Like & Comment
- ✅ Follow Users
- ✅ View Profile & Stats
- ✅ Explore Feed
- ✅ Search Users

---

## 🗄️ Database Info

- **Database Name**: `social-sync`
- **Collections**: `users`, `posts`
- **Connection**: `mongodb://127.0.0.1:27017`

---

## 📞 Files to Know

| File | What | Edit When |
|------|------|-----------|
| `.env` | Configuration | Change PORT or MongoDB URI |
| `backend/server.js` | Main server | Modify routes/middleware |
| `frontend/index.html` | UI structure | Change interface layout |
| `frontend/assets/js/app.js` | Frontend logic | Add new features |
| `package.json` | Dependencies | Add packages (npm install) |

---

## ✨ What Was Changed

✅ **Separated** backend and frontend into folders
✅ **Fixed** MongoDB connection (IPv4 instead of IPv6)
✅ **Removed** unwanted files (.vscode, public, old server.js)
✅ **Updated** all configurations
✅ **Added** comprehensive documentation
✅ **Improved** server logging

---

## 🎓 Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Communication**: REST APIs
- **Server Port**: 3000

---

## 🆘 Quick Fix for Common Issues

### Server won't start?
1. Check MongoDB is running: `Get-Service MongoDB`
2. Check port isn't in use: Change PORT in `.env`
3. Reinstall dependencies: `npm install`

### MongoDB won't connect?
1. Use `127.0.0.1` not `localhost` (in .env)
2. Start MongoDB service: `net start MongoDB`
3. Check MongoDB is installed

### Frontend shows error?
1. Press F12 to open console
2. Check for error messages
3. Verify server is running

---

## 📊 Current Configuration

```env
MONGO_URI=mongodb://127.0.0.1:27017/social-sync
PORT=3000
NODE_ENV=development
```

**Why 127.0.0.1?**
- `localhost` resolves to IPv6 (::1)
- MongoDB listens on IPv4 (127.0.0.1)
- Using IP directly avoids DNS issues

---

## ✅ Pre-Launch Checklist

- [ ] MongoDB service running
- [ ] npm install completed
- [ ] .env file configured
- [ ] No errors in console
- [ ] App loads at localhost:3000
- [ ] Can register account
- [ ] Can create posts

---

## 🚀 You're All Set!

**Your project is ready to use!**

Start building! 🎉

---

**Questions?** Check the other docs:
- `PROJECT_READY.md` - Detailed setup
- `SETUP_GUIDE.md` - Complete guide
- `STATUS.md` - Current status
- `CHANGES_MADE.md` - What changed
