# 🚀 Quick Start Guide - Social Sync

## Prerequisites
- Node.js installed
- MongoDB (local or cloud)

## Option 1: Local MongoDB (Recommended)

### Step 1: Start MongoDB
```powershell
# Windows - Using MongoDB Service
net start MongoDB

# OR if MongoDB is installed locally, run:
mongod
```

### Step 2: Install Dependencies
```powershell
cd c:\Users\pardhu\Desktop\wind_social
npm install
```

### Step 3: Start the Server
```powershell
npm start
```

### Step 4: Open Browser
```
http://localhost:3000
```

---

## Option 2: MongoDB Atlas (Cloud - No Local Setup)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster
4. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/social-sync`)

### Step 2: Update .env File
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/social-sync
PORT=3000
NODE_ENV=development
```

### Step 3: Install & Start
```powershell
cd c:\Users\pardhu\Desktop\wind_social
npm install
npm start
```

### Step 4: Open Browser
```
http://localhost:3000
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `ECONNREFUSED localhost:27017` | Start MongoDB: `net start MongoDB` or `mongod` |
| `Port 3000 already in use` | Change `PORT=3001` in `.env` |
| `Module not found` | Run `npm install` |
| `Cannot find module dotenv` | Run `npm install dotenv` |

---

## Testing the App

1. **Register** - Create account with Gmail (@gmail.com)
2. **Create Post** - Add a post with caption
3. **Like/Comment** - Engage with posts
4. **Follow Users** - Follow suggestions
5. **View Profile** - Check your profile and stats

---

## Project Structure
```
wind_social/
├── backend/
│   ├── config/database.js      (MongoDB connection)
│   ├── models/                 (User & Post schemas)
│   ├── routes/                 (Auth & Posts endpoints)
│   └── server.js               (Main Express server)
├── frontend/
│   ├── index.html              (UI)
│   └── assets/
│       ├── css/style.css       (Styling)
│       └── js/app.js           (Frontend logic)
├── .env                        (Configuration)
└── package.json               (Dependencies)
```

---

## Environment Variables (.env)

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/social-sync

# Server Settings
PORT=3000
NODE_ENV=development
```

---

**Happy coding! 🎉**
