# Social Sync - Social Media Application

A modern social media application built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JavaScript, featuring an Instagram-like interface with posts, comments, likes, follows, and user profiles.

## 📁 Project Structure

```
social-sync/
├── backend/
│   ├── models/
│   │   ├── User.js        (User schema with auth & profile)
│   │   └── Post.js        (Post schema with likes & comments)
│   ├── routes/
│   │   ├── auth.js        (Authentication & user management)
│   │   └── posts.js       (Post CRUD & engagement)
│   ├── config/
│   │   └── database.js    (MongoDB connection)
│   └── server.js          (Main Express server)
├── frontend/
│   ├── index.html         (Main application UI)
│   └── assets/
│       ├── css/
│       │   └── style.css  (Complete styling)
│       └── js/
│           └── app.js     (Frontend logic & API calls)
├── .env                   (Environment variables)
├── package.json           (Dependencies & scripts)
└── README.md             (This file)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone/Extract the project:**
```bash
cd wind_social
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
   - Edit `.env` with your MongoDB URI
   - Default: `mongodb://localhost:27017/social-sync`

4. **Start the server:**
```bash
npm start
```

5. **Access the application:**
   - Open `http://localhost:3000` in your browser

## 📝 Features

### Authentication
- **Register**: Create account with Gmail email (validation enforced)
- **Login**: Login with username, email, or user ID
- **Profile**: Edit profile with bio, name, and email
- **Logout**: Securely logout with session management

### Posts
- **Create**: Post with caption and optional media (image/video)
- **Like**: Toggle likes with visual feedback
- **Comment**: Add comments to posts with author tracking
- **Delete**: Remove your own posts (authorization validated)
- **View**: Browse feed, reels, or explore posts

### Social Features
- **Follow/Unfollow**: Build your network
- **Suggestions**: Discover users to follow (5 random suggestions)
- **Profile Stats**: View followers, following, and post counts
- **Relations**: See followers and following lists

### Navigation
- **Home**: Main feed of all posts
- **Search**: Search for users (placeholder ready for enhancement)
- **Reels**: Video-only content feed
- **Explore**: Discover new content
- **Messages**: Messages page (placeholder)
- **Profile**: Your profile with your posts and stats

## 🔧 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new account
- `POST /login` - Login to account
- `POST /update-profile` - Update profile information
- `POST /follow` - Toggle follow/unfollow
- `GET /suggestions` - Get user suggestions
- `GET /profile-stats` - Get profile statistics

### Post Routes (`/api/posts`)
- `GET /` - Get all posts (optional: filter by ownerId)
- `POST /` - Create new post
- `POST /seed` - Seed sample data (for testing)
- `POST /:id/like` - Toggle like on post
- `POST /:id/comments` - Add comment to post
- `DELETE /:id` - Delete own post

## 💾 Data Models

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required, Gmail validation),
  password: String (required),
  userId: String (7-digit unique ID),
  fullName: String,
  bio: String,
  followers: [String] (array of userIds),
  following: [String] (array of userIds),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Schema
```javascript
{
  caption: String (required),
  mediaUrl: String,
  mediaType: String (enum: image, video, text),
  ownerId: String (userId of author),
  ownerUsername: String,
  likes: Number (default: 0),
  likedBy: [String] (array of userIds who liked),
  comments: [
    {
      text: String,
      author: String,
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first CSS with CSS variables
- **Modal System**: Create posts, view relations modals
- **View Switching**: Smooth navigation between different sections
- **State Management**: localStorage for user session persistence
- **Real-time Updates**: Like/comment counts update immediately
- **Form Validation**: Client-side validation on all forms

## 🐛 Bug Fixes & Improvements

### Code Organization
- ✅ Separated backend and frontend into distinct folders
- ✅ Extracted inline models into separate files
- ✅ Extracted inline routes into modular router files
- ✅ Created dedicated database configuration module
- ✅ Organized frontend assets (css, js folders)

### Logic Improvements
- ✅ Proper error handling in all routes
- ✅ Input validation on registration and profile updates
- ✅ Authorization checks for post deletion
- ✅ Unique constraint validation (username, email, userId)
- ✅ Proper HTTP status codes and error messages
- ✅ Array operations use Set-based deduplication for followers/following

### Code Quality
- ✅ Consistent formatting and naming conventions
- ✅ JSDoc comments on functions
- ✅ Modular route handlers
- ✅ Separated concerns (models, routes, config)
- ✅ CORS properly configured for frontend-backend communication

## 📌 Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017/social-sync
PORT=3000
NODE_ENV=development
```

## 🔐 Security Notes

- Passwords stored in plaintext (for demo only - use bcrypt in production)
- CORS enabled for localhost:3000 access
- User ID uniqueness enforced at database level
- Authorization checks on sensitive operations

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🧪 Testing

To seed sample data:
```bash
curl -X POST http://localhost:3000/api/posts/seed
```

## 📄 License

MIT License - Feel free to use this project as a reference or template.

## 🤝 Contributing

This project is structured for easy enhancement. Follow the modular patterns established for adding new features.

---

**Happy coding! 🚀**
