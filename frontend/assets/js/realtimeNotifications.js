// Real-time Notifications System
// Handles Socket.IO connections and updates for live feed

let socket;
const notificationsContainer = document.getElementById('notifications-container');

/**
 * Initialize Socket.IO connection
 */
function initializeSocket() {
  socket = io();

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to server');

    // Notify server that user is online
    if (currentUser && currentUser.userId) {
      socket.emit('user-online', currentUser.userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    showNotification('Connection lost. Reconnecting...', 'warning');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  // Real-time post liked notification
  socket.on('post-liked', (data) => {
    console.log('Post liked:', data);

    // Update UI
    updatePostLikes(data.postId, data.totalLikes, data.liked);

    showNotification(
      `Someone liked a post! (${data.totalLikes} likes)`,
      'like'
    );
  });

  // Real-time comment added notification
  socket.on('comment-added', (data) => {
    console.log('Comment added:', data);

    // Update UI
    updatePostComments(data.postId, data.totalComments);

    showNotification(
      `${data.commentedBy} commented: "${data.commentText.substring(0, 30)}..."`,
      'comment'
    );
  });

  // New post from following users
  socket.on('new-post', (data) => {
    console.log('New post:', data);

    showNotification(
      `${data.createdByUsername} posted: "${data.caption.substring(0, 50)}..."`,
      'post'
    );

    // Reload feed to show new post
    setTimeout(() => {
      loadPosts();
    }, 1000);
  });

  // User follow notification
  socket.on('user-followed', (data) => {
    console.log('User followed:', data);

    // Only show notification if you are the one being followed
    if (currentUser && currentUser.userId === data.followedUser) {
      showNotification(
        `${data.followedByUsername} started following you!`,
        'follow'
      );

      // Update stats
      loadProfileStats();
    }
  });

  // User online/offline status
  socket.on('user-status', (data) => {
    console.log(`User ${data.userId} is ${data.status}`);
  });

  // Redis events
  socket.on('redis-post-event', (data) => {
    console.log('Post event from Redis:', data);
  });

  socket.on('redis-user-event', (data) => {
    console.log('User event from Redis:', data);
  });
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
  if (!notificationsContainer) return;

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  const icon = getNotificationIcon(type);
  const content = document.createElement('div');
  content.className = 'notification-content';
  content.innerHTML = `
    <span class="notification-icon">${icon}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close" type="button">×</button>
  `;

  notification.appendChild(content);

  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });

  notificationsContainer.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

/**
 * Get notification icon
 */
function getNotificationIcon(type) {
  const icons = {
    like: '❤️',
    comment: '💬',
    post: '📝',
    follow: '👥',
    warning: '⚠️',
    info: 'ℹ️',
  };
  return icons[type] || icons.info;
}

/**
 * Update post likes in DOM
 */
function updatePostLikes(postId, totalLikes, liked) {
  const postCard = document.querySelector(`[data-post-id="${postId}"]`);
  if (postCard) {
    const likesSpan = postCard.querySelector('.likes-count');
    if (likesSpan) {
      likesSpan.textContent = totalLikes;
    }

    const likeBtn = postCard.querySelector('.like-btn');
    if (likeBtn) {
      if (liked) {
        likeBtn.classList.add('liked');
      } else {
        likeBtn.classList.remove('liked');
      }
    }
  }
}

/**
 * Update post comments in DOM
 */
function updatePostComments(postId, totalComments) {
  const postCard = document.querySelector(`[data-post-id="${postId}"]`);
  if (postCard) {
    const commentsSpan = postCard.querySelector('.comments-count');
    if (commentsSpan) {
      commentsSpan.textContent = totalComments;
    }
  }
}

/**
 * Emit post like event through Socket.IO
 */
function emitPostLiked(postId, userId, username, totalLikes, liked) {
  if (socket && socket.connected) {
    socket.emit('post-liked', {
      postId,
      likedBy: userId,
      likedByUsername: username,
      totalLikes,
      liked,
    });
  }
}

/**
 * Emit comment added event through Socket.IO
 */
function emitCommentAdded(postId, userId, username, commentText, totalComments) {
  if (socket && socket.connected) {
    socket.emit('comment-added', {
      postId,
      commentedBy: userId,
      commentedByUsername: username,
      commentText,
      totalComments,
    });
  }
}

/**
 * Emit new post event through Socket.IO
 */
function emitPostCreated(postId, caption, userId, username, mediaType) {
  if (socket && socket.connected) {
    socket.emit('post-created', {
      postId,
      caption,
      createdBy: userId,
      createdByUsername: username,
      mediaType,
    });
  }
}

/**
 * Emit follow event through Socket.IO
 */
function emitUserFollowed(followedBy, followedByUsername, followedUser) {
  if (socket && socket.connected) {
    socket.emit('user-followed', {
      followedBy,
      followedByUsername,
      followedUser,
    });
  }
}

/**
 * Get socket connection status
 */
function isSocketConnected() {
  return socket && socket.connected;
}

/**
 * Initialize socket when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      initializeSocket();
    }, 500);
  });
} else {
  setTimeout(() => {
    initializeSocket();
  }, 500);
}

// Export functions for use in app.js
window.socketService = {
  initializeSocket,
  showNotification,
  emitPostLiked,
  emitCommentAdded,
  emitPostCreated,
  emitUserFollowed,
  isSocketConnected,
};
