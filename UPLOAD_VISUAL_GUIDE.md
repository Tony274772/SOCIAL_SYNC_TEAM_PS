# 📸 File Upload Feature - Visual Guide

## 🎬 User Flow

```
START
  ↓
CLICK "CREATE POST" BUTTON
  ↓
MODAL OPENS
  ├─ Write Caption: [________________]
  ├─ Upload Area:
  │  ┌─────────────────────────┐
  │  │       📸                │
  │  │   Click to select       │
  │  │   photo or video        │
  │  └─────────────────────────┘
  └─ Submit Button: [Share Post]
  ↓
USER CLICKS UPLOAD AREA
  ↓
FILE BROWSER OPENS
  ↓
USER SELECTS FILE (e.g., photo.jpg)
  ↓
PREVIEW APPEARS
  ├─ Image: [Shows thumbnail]
  ├─ OR
  └─ Video: [Shows player with controls]
  ↓
BUTTON CHANGES TO "Remove"
  ↓
USER CAN:
  ├─ Click [Remove] → Upload Different File
  └─ Click [Share Post] → Post with Media
  ↓
POST SENT TO BACKEND
  ↓
APPEARS IN FEED
  ├─ Caption: "My amazing photo!"
  ├─ Media: [Image/Video displayed]
  ├─ Likes: ♡ Like
  └─ Comments: 💬 Comment
  ↓
END
```

---

## 📱 Before & After

### **BEFORE: URL Input**
```
┌─────────────────────────────┐
│ 📝 CREATE POST              │
├─────────────────────────────┤
│ Caption:                    │
│ ┌─────────────────────────┐ │
│ │ Write something...      │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Content Type:               │
│ ┌─────────────────────────┐ │
│ │ ▼ Text only             │ │
│ │   Photo                 │ │
│ │   Video                 │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Image/Video URL:            │
│ ┌─────────────────────────┐ │
│ │ https://example.com/... │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│         [Share Post]        │
└─────────────────────────────┘
```

### **AFTER: File Upload**
```
┌─────────────────────────────┐
│ 📝 CREATE POST              │
├─────────────────────────────┤
│ Caption:                    │
│ ┌─────────────────────────┐ │
│ │ Write something...      │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Add Photo or Video:         │
│ ┌─────────────────────────┐ │
│ │         📸              │ │
│ │ Click to select         │ │
│ │ photo or video          │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Preview: ┌─────────────────┐│
│          │ [Image/Video]   ││
│          │     [Remove]    ││
│          └─────────────────┘│
├─────────────────────────────┤
│         [Share Post]        │
└─────────────────────────────┘
```

---

## 🎥 Step-by-Step Screenshots (Text)

### **Step 1: Modal Opens**
```
User clicks + button

┌─────────────────────────┐
│ × CREATE POST          │
├─────────────────────────┤
│                         │
│ Caption:  [...........]│
│                         │
│ Add Photo or Video:     │
│ ┌───────────────────┐   │
│ │      📸           │   │
│ │  Click to select  │   │
│ │ photo or video    │   │
│ └───────────────────┘   │
│                         │
│    [Share Post]         │
└─────────────────────────┘
```

### **Step 2: File Browser Opens**
```
┌──────────────────────────┐
│ Open                    │
├──────────────────────────┤
│ C:\Users\Name\Pictures │
│                          │
│ [📁] Desktop            │
│ [📁] Documents          │
│ [📁] Downloads          │
│ [📷] photo.jpg         │ ← Selected
│ [📷] vacation.png      │
│ [🎬] video.mp4         │
│                          │
│      [Open]  [Cancel]   │
└──────────────────────────┘
```

### **Step 3: Preview Appears**
```
File selected: photo.jpg

┌─────────────────────────┐
│ × CREATE POST          │
├─────────────────────────┤
│ Caption:  [...........]│
│                         │
│ Add Photo or Video:     │
│ ┌───────────────────┐   │
│ │    📸 photo.jpg   │   │
│ │   Click to select  │   │
│ └───────────────────┘   │
│                         │
│ Preview:                │
│ ┌───────────────────┐   │
│ │                   │   │
│ │   [Photo Image]   │   │
│ │                   │   │
│ │     [Remove]      │   │
│ └───────────────────┘   │
│                         │
│    [Share Post]         │
└─────────────────────────┘
```

### **Step 4: Post Created**
```
Post appears in feed:

┌─────────────────────────┐
│ 👤 john_doe            │
│ 1234567                │
├─────────────────────────┤
│ My amazing photo! 📸   │
│                         │
│ ┌───────────────────┐   │
│ │                   │   │
│ │   [Photo Image]   │   │
│ │                   │   │
│ └───────────────────┘   │
│                         │
│ ♡ 5 likes  💬 2 comments│
│ [♡ Like]  [💬 Comment] │
└─────────────────────────┘
```

---

## 🎨 UI Elements

### **Upload Area Styles**
```
Normal State:
┌─────────────────────────┐
│     📸                  │
│ Click to select         │
│ photo or video          │
└─────────────────────────┘
Border: 2px dashed gray

Hover State:
┌─────────────────────────┐
│     📸                  │
│ Click to select         │
│ photo or video          │
└─────────────────────────┘
Border: 2px dashed blue
Background: Light blue tint

After Selection:
📸 photo.jpg (shows filename)
```

### **Preview Styles**
```
IMAGE PREVIEW:
┌─────────────────┐
│                 │
│   Image shown   │ (max-height: 300px)
│                 │
│   [Remove]  ← Button overlaid
└─────────────────┘

VIDEO PREVIEW:
┌─────────────────┐
│  ▶ [━━━━━━━━] 2:15 │ (Video player)
│  [━━━━━━━━━━━]      │
│                     │
│   [Remove]          │
└─────────────────┘
```

---

## 💾 Data Format

### **What Gets Saved**

```javascript
// File selected by user
{
  name: "photo.jpg",
  type: "image/jpeg",
  size: 2048576  // 2MB
}

// Converted to Base64
{
  data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}

// Sent to Backend
{
  caption: "My photo from vacation!",
  mediaType: "image",  // Auto-detected
  mediaUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgA...",
  ownerId: "1234567",
  ownerUsername: "john_doe"
}

// Stored in Database
db.posts {
  _id: ObjectId(...),
  caption: "My photo from vacation!",
  mediaType: "image",
  mediaUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgA...",
  ownerId: "1234567",
  ownerUsername: "john_doe",
  likes: 0,
  likedBy: [],
  comments: [],
  createdAt: 2025-11-24T10:30:00.000Z,
  updatedAt: 2025-11-24T10:30:00.000Z
}

// Sent to Frontend
<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgA..." />
```

---

## 📊 Supported Formats

### **Images**
| Format | Extension | MIME Type |
|--------|-----------|-----------|
| JPEG | .jpg, .jpeg | image/jpeg |
| PNG | .png | image/png |
| GIF | .gif | image/gif |
| WebP | .webp | image/webp |

### **Videos**
| Format | Extension | MIME Type |
|--------|-----------|-----------|
| MP4 | .mp4 | video/mp4 |
| WebM | .webm | video/webm |
| Ogg | .ogg | video/ogg |

---

## ⚙️ Technical Details

### **File Conversion**
```javascript
// User selects file
const file = input.files[0];  // File object

// Convert to Base64
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onload = () => {
  const base64String = reader.result;
  // "data:image/jpeg;base64,/9j/4AAQSkZJRgA..."
};
```

### **Validation**
```javascript
// Check file type
const validTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/ogg'
];

if (!validTypes.includes(file.type)) {
  showError('Invalid file type');
}

// Check file size
if (file.size > 10 * 1024 * 1024) {  // 10MB
  showError('File too large');
}
```

---

## 🎯 User Benefits

✅ **Easier** - Click and upload vs. paste URL
✅ **Faster** - Instant preview
✅ **Safer** - Only local files, no external URLs
✅ **Flexible** - Remove and reselect
✅ **Clear** - See what you're posting
✅ **Professional** - Modern UI/UX

---

## 🚀 Ready to Use!

```
Server Status: ✅ Running
Database: ✅ Connected
File Upload: ✅ Enabled

Visit: http://localhost:3000
```
