// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const STORAGE_KEY = 'currentUser';

let currentUser = null;
let allPosts = [];

// DOM Elements
const authOverlay = document.getElementById('auth-overlay');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const loginView = document.getElementById('auth-login-view');
const registerView = document.getElementById('auth-register-view');

const views = {
  home: document.getElementById('view-home'),
  search: document.getElementById('view-search'),
  reels: document.getElementById('view-reels'),
  explore: document.getElementById('view-explore'),
  messages: document.getElementById('view-messages'),
  profile: document.getElementById('view-profile'),
  monitoring: document.getElementById('view-monitoring'),
};

const postsContainer = document.getElementById('posts-container');
const emptyState = document.getElementById('empty-state');
const createModal = document.getElementById('create-modal');
const createForm = document.getElementById('create-post-form');

const createModalClose = document.getElementById('create-modal-close');
const createModalBackdrop = createModal?.querySelector('.modal-backdrop');
const bottomNavButtons = document.querySelectorAll('.bottom-nav-btn');
const navItems = document.querySelectorAll('.nav-item');

const profileForm = document.getElementById('profile-form');
const profileUsernameInput = document.getElementById('profile-username');
const profileEmailInput = document.getElementById('profile-email');
const profileUserIdInput = document.getElementById('profile-userid');
const profileNameInput = document.getElementById('profile-name');
const profileBioInput = document.getElementById('profile-bio');
const logoutButton = document.getElementById('logout-button');

const myPostsContainer = document.getElementById('my-posts-container');
const myPostsEmpty = document.getElementById('my-posts-empty');

const profilePostsCountEl = document.getElementById('profile-posts-count');
const profileFollowersCountEl = document.getElementById('profile-followers-count');
const profileFollowingCountEl = document.getElementById('profile-following-count');
const profileFollowersButton = document.getElementById('profile-followers-button');
const profileFollowingButton = document.getElementById('profile-following-button');

const relationsModal = document.getElementById('relations-modal');
const relationsModalClose = document.getElementById('relations-modal-close');
const relationsModalTitle = document.getElementById('relations-modal-title');
const relationsModalBackdrop = relationsModal?.querySelector('.modal-backdrop');
const relationsList = document.getElementById('relations-list');

const sidebarProfileUsername = document.querySelector('.profile-card .profile-username');
const sidebarProfileName = document.querySelector('.profile-card .profile-name');

const suggestionsList = document.getElementById('suggestions-list');

const reelsContainer = document.getElementById('reels-container');
const reelsEmpty = document.getElementById('reels-empty');

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');

// ======================== Utility Functions ========================

/**
 * Show error notification (silent)
 */
function showError(message) {
  console.error('Error:', message);
}

/**
 * Show success notification (silent)
 */
function showSuccess(message) {
  console.log('Success:', message);
}

/**
 * Build full media URL
 */
function buildMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:')) {
    return url;  // Base64 encoded data
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleaned = url.replace(/^\/+/, '');
  return `${API_BASE_URL.replace('/api', '')}/${cleaned}`;
}

/**
 * Load user from localStorage
 */
function loadCurrentUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentUser = JSON.parse(stored);
      hideAuthOverlay();
      loadProfileFromStorage();
      loadSuggestions();
      loadMyPosts();
      loadProfileStats();
      loadPosts();
      return;
    }
  } catch (err) {
    console.error('Error loading current user:', err);
  }

  showAuthOverlay();
  showAuthView('login');
}

/**
 * Set current user and save to localStorage
 */
function setCurrentUser(user) {
  if (!user) return;

  currentUser = user;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user:', err);
  }

  hideAuthOverlay();
  loadProfileFromStorage();
  loadSuggestions();
  loadMyPosts();
  loadProfileStats();
  loadPosts();
}

/**
 * Clear current user
 */
function clearCurrentUser() {
  currentUser = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing user:', err);
  }
}

// ======================== View Management ========================

/**
 * Show specific view
 */
function showView(viewName) {
  Object.values(views).forEach((view) => {
    if (view) {
      view.classList.add('hidden');
    }
  });

  const targetView = views[viewName];
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  navItems.forEach((item) => {
    const itemView = item.getAttribute('data-view');
    if (itemView === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Show authentication view (login/register)
 */
function showAuthView(viewName) {
  if (viewName === 'login') {
    loginView.classList.remove('hidden');
    registerView.classList.add('hidden');
  } else {
    registerView.classList.remove('hidden');
    loginView.classList.add('hidden');
  }

  authTabs.forEach((tab) => {
    const tabView = tab.getAttribute('data-auth-view');
    if (tabView === viewName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

/**
 * Show auth overlay
 */
function showAuthOverlay() {
  if (authOverlay) {
    authOverlay.classList.remove('hidden');
  }
}

/**
 * Hide auth overlay
 */
function hideAuthOverlay() {
  if (authOverlay) {
    authOverlay.classList.add('hidden');
  }
}

// ======================== Modal Management ========================

/**
 * Open create post modal
 */
function openCreateModal() {
  if (createModal) {
    createModal.classList.remove('hidden');
    const captionInput = document.getElementById('caption');
    if (captionInput) {
      setTimeout(() => captionInput.focus(), 100);
    }
  }
}

/**
 * Close create post modal
 */
function closeCreateModal() {
  if (createModal) {
    createModal.classList.add('hidden');
  }
}

/**
 * Open relations modal (Followers/Following)
 */
async function openRelationsModal(type) {
  if (!relationsModal || !relationsList || !relationsModalTitle) {
    return;
  }

  relationsModalTitle.textContent = type === 'followers' ? 'Followers' : 'Following';
  relationsList.innerHTML = '<div class="empty-state">Loading...</div>';
  relationsModal.classList.remove('hidden');

  // Reset and setup search
  const searchInput = document.getElementById('relations-search');
  if (searchInput) {
    searchInput.value = '';
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const items = relationsList.querySelectorAll('.relations-item');
      items.forEach(item => {
        const username = item.querySelector('.relations-main')?.textContent.toLowerCase() || '';
        item.style.display = username.includes(term) ? 'flex' : 'none';
      });
    });
  }

  if (!currentUser || !currentUser.userId) {
    relationsList.innerHTML = '<div class="empty-state">Log in to see this list.</div>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile-stats?userId=${currentUser.userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load');
    }

    const list = type === 'followers' ? (data.stats?.followers || []) : (data.stats?.following || []);

    if (!list.length) {
      relationsList.innerHTML = `<div class="empty-state">No ${type} yet.</div>`;
      return;
    }

    relationsList.innerHTML = '';
    list.forEach((user) => {
      const item = document.createElement('div');
      item.className = 'relations-item';

      const avatar = document.createElement('div');
      avatar.className = 'avatar-placeholder small';

      const info = document.createElement('div');
      info.style.flex = '1';

      const mainText = document.createElement('div');
      mainText.className = 'relations-main';
      mainText.textContent = user.username || 'User';

      const subText = document.createElement('div');
      subText.className = 'relations-sub';
      subText.textContent = user.userId || '';

      info.appendChild(mainText);
      info.appendChild(subText);
      item.appendChild(avatar);
      item.appendChild(info);

      // Add Follow Back button for followers
      if (type === 'followers' && user.userId && currentUser && currentUser.userId !== user.userId) {
        const followBackBtn = document.createElement('button');
        followBackBtn.type = 'button';
        followBackBtn.className = 'follow-back-btn';

        if (Array.isArray(currentUser.following) && currentUser.following.includes(user.userId)) {
          followBackBtn.textContent = 'Following';
          followBackBtn.classList.add('already-following');
        } else {
          followBackBtn.textContent = 'Follow Back';
        }

        followBackBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            const response = await fetch(`${API_BASE_URL}/auth/follow`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fromUserId: currentUser.userId,
                toUserId: user.userId,
              }),
            });

            const data = await response.json();
            if (!response.ok) {
              showError(data.message || 'Failed to follow');
              return;
            }

            if (data.following) {
              followBackBtn.textContent = 'Following';
              followBackBtn.classList.add('already-following');
              if (Array.isArray(currentUser.following)) {
                if (!currentUser.following.includes(user.userId)) {
                  currentUser.following.push(user.userId);
                }
              } else {
                currentUser.following = [user.userId];
              }
            } else {
              followBackBtn.textContent = 'Follow Back';
              followBackBtn.classList.remove('already-following');
              if (Array.isArray(currentUser.following)) {
                const idx = currentUser.following.indexOf(user.userId);
                if (idx !== -1) currentUser.following.splice(idx, 1);
              }
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
            loadProfileStats();
            showSuccess(data.message || 'Success');
          } catch (err) {
            console.error('Follow error:', err);
            showError('Failed to follow');
          }
        });

        item.appendChild(followBackBtn);
      }

      // Add Unfollow button for following list
      if (type === 'following') {
        const unfollowBtn = document.createElement('button');
        unfollowBtn.type = 'button';
        unfollowBtn.className = 'follow-back-btn already-following';
        unfollowBtn.textContent = 'Unfollow';
        unfollowBtn.style.backgroundColor = '#efefef';
        unfollowBtn.style.color = '#000';

        unfollowBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            const response = await fetch(`${API_BASE_URL}/auth/follow`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fromUserId: currentUser.userId,
                toUserId: user.userId,
              }),
            });

            const data = await response.json();
            if (!response.ok) {
              showError(data.message || 'Failed to unfollow');
              return;
            }

            // Remove from UI immediately
            item.remove();

            // Update local state
            if (Array.isArray(currentUser.following)) {
              const idx = currentUser.following.indexOf(user.userId);
              if (idx !== -1) currentUser.following.splice(idx, 1);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
            loadProfileStats();
            showSuccess('Unfollowed');

            if (relationsList.children.length === 0) {
              relationsList.innerHTML = `<div class="empty-state">No ${type} yet.</div>`;
            }
          } catch (err) {
            console.error('Unfollow error:', err);
            showError('Failed to unfollow');
          }
        });

        item.appendChild(unfollowBtn);
      }

      relationsList.appendChild(item);
    });
  } catch (err) {
    console.error('Error loading relations:', err);
    relationsList.innerHTML = '<div class="empty-state">Failed to load list.</div>';
  }
}

/**
 * Close relations modal
 */
function closeRelationsModal() {
  if (relationsModal) {
    relationsModal.classList.add('hidden');
  }
}

// ======================== Authentication ========================

/**
 * Handle login form submission
 */
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifierInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    if (!identifier || !password) {
      showError('Username/email and password are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Login failed');
        return;
      }

      setCurrentUser(data.user);
      showSuccess(`Welcome ${data.user.username}!`);
      loginForm.reset();
    } catch (err) {
      console.error('Login error:', err);
      showError('Login failed. Please try again.');
    }
  });
}

/**
 * Handle register form submission
 */
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('register-username');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
      showError('All fields are required');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      showError('Please use a Gmail address');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Registration failed');
        return;
      }

      setCurrentUser(data.user);
      showSuccess(`Welcome ${data.user.username}! Your User ID is ${data.user.userId}`);
      registerForm.reset();
    } catch (err) {
      console.error('Registration error:', err);
      showError('Registration failed. Please try again.');
    }
  });
}

/**
 * Handle auth tab switching
 */
authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const view = tab.getAttribute('data-auth-view');
    if (view) {
      showAuthView(view);
    }
  });
});

// ======================== Posts Management ========================

/**
 * Load all posts
 */
async function loadPosts() {
  try {
    // Fetch all posts first
    const response = await fetch(`${API_BASE_URL}/posts`);
    const posts = await response.json();

    // Filter posts from users being followed
    let filteredPosts = Array.isArray(posts) ? posts : [];
    if (currentUser && Array.isArray(currentUser.following) && currentUser.following.length > 0) {
      filteredPosts = filteredPosts.filter((post) => {
        return currentUser.following.some((followedId) => followedId === post.ownerId);
      });
    }

    allPosts = filteredPosts;
    postsContainer.innerHTML = '';

    if (!allPosts.length) {
      emptyState.classList.remove('hidden');
      emptyState.textContent = currentUser && currentUser.following && currentUser.following.length === 0
        ? 'Start following users to see their posts!'
        : 'No posts from users you follow yet.';
      return;
    }

    emptyState.classList.add('hidden');

    allPosts.forEach((post) => {
      const card = buildPostCard(post);
      postsContainer.appendChild(card);
    });

    renderReels();
  } catch (err) {
    console.error('Error loading posts:', err);
    emptyState.textContent = 'Failed to load posts. Please refresh.';
    emptyState.classList.remove('hidden');
  }
}

/**
 * Load user's own posts
 */
async function loadMyPosts() {
  if (!myPostsContainer || !myPostsEmpty) {
    return;
  }

  myPostsContainer.innerHTML = '';

  if (!currentUser || !currentUser.userId) {
    myPostsEmpty.textContent = 'Log in to see your posts.';
    myPostsEmpty.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts?ownerId=${currentUser.userId}`);
    const posts = await response.json();

    if (!Array.isArray(posts) || !posts.length) {
      myPostsEmpty.textContent = "You haven't posted anything yet.";
      myPostsEmpty.classList.remove('hidden');
      return;
    }

    myPostsEmpty.classList.add('hidden');

    posts.forEach((post) => {
      const card = buildPostCard(post, { showDelete: true });
      myPostsContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading my posts:', err);
    myPostsEmpty.textContent = 'Failed to load your posts.';
    myPostsEmpty.classList.remove('hidden');
  }
}

/**
 * Build post card element
 */
function buildPostCard(post, options = {}) {
  const card = document.createElement('article');
  card.className = 'post-card';
  if (post._id) {
    card.dataset.postId = post._id;
  }

  const showDelete = options.showDelete || false;

  // Header
  const header = document.createElement('div');
  header.className = 'post-header';

  const avatar = document.createElement('div');
  avatar.className = 'avatar-placeholder';

  const meta = document.createElement('div');
  meta.className = 'post-meta';

  const username = document.createElement('div');
  username.className = 'post-username';
  username.textContent = post.ownerUsername || 'Unknown';

  const userId = document.createElement('div');
  userId.className = 'post-date';
  userId.textContent = post.ownerId || '';

  meta.appendChild(username);
  meta.appendChild(userId);

  header.appendChild(avatar);
  header.appendChild(meta);

  // Body
  const body = document.createElement('div');
  body.className = 'post-body';

  if (post.mediaType === 'image' && post.mediaUrl) {
    const img = document.createElement('img');
    img.className = 'post-media';
    img.src = buildMediaUrl(post.mediaUrl);
    img.alt = post.caption || 'Post image';
    body.appendChild(img);
  } else if (post.mediaType === 'video' && post.mediaUrl) {
    const video = document.createElement('video');
    video.className = 'post-media';
    video.src = buildMediaUrl(post.mediaUrl);
    video.controls = true;
    body.appendChild(video);
  }

  const caption = document.createElement('p');
  caption.className = 'post-caption';
  caption.textContent = post.caption;
  body.appendChild(caption);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'post-actions';

  const actionsLeft = document.createElement('div');
  actionsLeft.className = 'post-actions-left';

  const likeBtn = document.createElement('button');
  likeBtn.type = 'button';
  likeBtn.className = 'icon-btn like-btn';
  likeBtn.textContent = '♡';

  if (Array.isArray(post.likedBy) && currentUser && post.likedBy.includes(currentUser.userId)) {
    likeBtn.classList.add('liked');
  }

  const commentBtn = document.createElement('button');
  commentBtn.type = 'button';
  commentBtn.className = 'icon-btn comment-btn';
  commentBtn.textContent = '💬';

  actionsLeft.appendChild(likeBtn);
  actionsLeft.appendChild(commentBtn);

  const counts = document.createElement('div');
  counts.className = 'post-counts';

  const likesSpan = document.createElement('span');
  likesSpan.className = 'likes-count';
  likesSpan.textContent = post.likes || 0;

  const commentsSpan = document.createElement('span');
  commentsSpan.className = 'comments-count';
  commentsSpan.textContent = (post.comments?.length || 0);

  counts.appendChild(likesSpan);
  counts.appendChild(document.createTextNode(' likes · '));
  counts.appendChild(commentsSpan);
  counts.appendChild(document.createTextNode(' comments'));

  actions.appendChild(actionsLeft);
  actions.appendChild(counts);

  if (showDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.textContent = '🗑';
    actions.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', async () => {

      try {
        const response = await fetch(`${API_BASE_URL}/posts/${post._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.userId }),
        });

        const data = await response.json();

        if (!response.ok) {
          showError(data.message || 'Failed to delete post');
          return;
        }

        card.remove();
        const index = allPosts.findIndex((p) => p._id === post._id);
        if (index !== -1) {
          allPosts.splice(index, 1);
        }

        if (myPostsContainer.children.length === 0) {
          myPostsEmpty.classList.remove('hidden');
        }

        showSuccess('Post deleted');
      } catch (err) {
        console.error('Delete error:', err);
        showError('Failed to delete post');
      }
    });
  }

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(actions);

  // Comments Section
  const commentsSection = document.createElement('div');
  commentsSection.className = 'post-comments hidden';

  const commentList = document.createElement('div');
  commentList.className = 'comment-list';

  if (Array.isArray(post.comments)) {
    post.comments.forEach((comment) => {
      const commentItem = document.createElement('div');
      commentItem.className = 'comment-item';
      commentItem.textContent = `${comment.author}: ${comment.text}`;
      commentList.appendChild(commentItem);
    });
  }

  const commentForm = document.createElement('form');
  commentForm.className = 'comment-form';

  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.className = 'comment-input';
  commentInput.placeholder = 'Add a comment...';

  const commentSubmit = document.createElement('button');
  commentSubmit.type = 'submit';
  commentSubmit.className = 'comment-submit';
  commentSubmit.textContent = 'Post';

  commentForm.appendChild(commentInput);
  commentForm.appendChild(commentSubmit);

  commentsSection.appendChild(commentList);
  commentsSection.appendChild(commentForm);

  card.appendChild(commentsSection);

  // Event Listeners
  if (post._id) {
    likeBtn.addEventListener('click', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${post._id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser?.userId || 'anonymous' }),
        });

        const data = await response.json();

        if (!response.ok) {
          showError(data.message || 'Failed to like post');
          return;
        }

        likesSpan.textContent = data.likes;
        if (data.liked) {
          likeBtn.classList.add('liked');
        } else {
          likeBtn.classList.remove('liked');
        }

        const postIndex = allPosts.findIndex((p) => p._id === post._id);
        if (postIndex !== -1) {
          allPosts[postIndex].likes = data.likes;
        }

        // Emit real-time notification
        if (window.socketService && window.socketService.emitPostLiked && currentUser) {
          window.socketService.emitPostLiked(
            post._id,
            currentUser.userId,
            currentUser.username,
            data.likes,
            data.liked
          );
        }
      } catch (err) {
        console.error('Like error:', err);
      }
    });

    commentBtn.addEventListener('click', () => {
      const isHidden = commentsSection.classList.contains('hidden');
      if (isHidden) {
        commentsSection.classList.remove('hidden');
        commentInput.focus();
      } else {
        commentsSection.classList.add('hidden');
      }
    });

    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      try {
        const response = await fetch(`${API_BASE_URL}/posts/${post._id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            author: currentUser?.username || 'Anonymous',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          showError(data.message || 'Failed to add comment');
          return;
        }

        const newCommentItem = document.createElement('div');
        newCommentItem.className = 'comment-item';
        newCommentItem.textContent = `${currentUser?.username || 'Anonymous'}: ${text}`;
        commentList.appendChild(newCommentItem);

        commentsSpan.textContent = data.commentsCount;
        commentInput.value = '';

        const postIndex = allPosts.findIndex((p) => p._id === post._id);
        if (postIndex !== -1) {
          allPosts[postIndex].comments = allPosts[postIndex].comments || [];
          allPosts[postIndex].comments.push({ text, author: currentUser?.username });
        }

        // Emit real-time notification
        if (window.socketService && window.socketService.emitCommentAdded && currentUser) {
          window.socketService.emitCommentAdded(
            post._id,
            currentUser.userId,
            currentUser.username,
            text,
            data.commentsCount
          );
        }
      } catch (err) {
        console.error('Comment error:', err);
        showError('Failed to add comment');
      }
    });
  }

  return card;
}

/**
 * Render reels (video posts)
 */
function renderReels() {
  if (!reelsContainer || !reelsEmpty) {
    return;
  }

  reelsContainer.innerHTML = '';

  const videoPosts = allPosts.filter((post) => post.mediaType === 'video');

  if (!videoPosts.length) {
    reelsEmpty.classList.remove('hidden');
    return;
  }

  reelsEmpty.classList.add('hidden');

  videoPosts.forEach((post) => {
    const card = buildPostCard(post);
    reelsContainer.appendChild(card);
  });
}

// ======================== Form Submissions ========================

/**
 * Handle create post form with file upload
 */
if (createForm) {
  const mediaFileInput = document.getElementById('mediaFile');
  const filePreview = document.getElementById('file-preview');
  const imagePreview = document.getElementById('image-preview');
  const videoPreview = document.getElementById('video-preview');
  const uploadText = document.getElementById('upload-text');
  const removeMediaBtn = document.getElementById('remove-media');

  let selectedFile = null;

  // Handle file selection
  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      selectedFile = file;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
      if (!validTypes.includes(file.type)) {
        showError('Please select a valid image or video file');
        selectedFile = null;
        return;
      }

      // Show preview
      filePreview.classList.remove('hidden');
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.onload = (event) => {
          imagePreview.src = event.target.result;
          imagePreview.classList.remove('hidden');
          videoPreview.classList.add('hidden');
        };
        uploadText.textContent = `📸 Selected: ${file.name}`;
      } else if (file.type.startsWith('video/')) {
        reader.onload = (event) => {
          videoPreview.src = event.target.result;
          videoPreview.classList.remove('hidden');
          imagePreview.classList.add('hidden');
        };
        uploadText.textContent = `🎬 Selected: ${file.name}`;
      }

      reader.readAsDataURL(file);
    });
  }

  // Handle remove media
  if (removeMediaBtn) {
    removeMediaBtn.addEventListener('click', () => {
      selectedFile = null;
      if (mediaFileInput) mediaFileInput.value = '';
      filePreview.classList.add('hidden');
      imagePreview.classList.add('hidden');
      videoPreview.classList.add('hidden');
      uploadText.textContent = 'Click to select photo or video';
    });
  }

  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showError('You must be logged in to create a post');
      return;
    }

    const caption = document.getElementById('caption').value.trim();

    if (!caption) {
      showError('Caption is required');
      return;
    }

    try {
      let mediaBase64 = null;
      let mediaType = 'text';

      // Handle file upload
      if (selectedFile) {
        const reader = new FileReader();
        mediaBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      }

      const postData = {
        caption,
        mediaType,
        mediaUrl: mediaBase64 || undefined,
        ownerId: currentUser.userId,
        ownerUsername: currentUser.username,
      };

      console.log('📤 Submitting post:', { caption: postData.caption.substring(0, 30), mediaType: postData.mediaType, mediaSize: postData.mediaUrl ? (postData.mediaUrl.length / 1024 / 1024).toFixed(2) + 'MB' : 'none' });

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Post creation failed:', response.status, data);
        showError(data.message || `Failed to create post: ${response.status}`);
        return;
      }

      console.log('✅ Post created:', data.post._id);

      // Reset form and UI
      createForm.reset();
      selectedFile = null;
      if (mediaFileInput) mediaFileInput.value = '';
      filePreview.classList.add('hidden');
      imagePreview.classList.add('hidden');
      videoPreview.classList.add('hidden');
      uploadText.textContent = 'Click to select photo or video';

      closeCreateModal();
      emptyState.classList.add('hidden');

      const newCard = buildPostCard(data.post);
      postsContainer.prepend(newCard);
      allPosts.unshift(data.post);

      // Emit real-time notification
      if (window.socketService && window.socketService.emitPostCreated && currentUser) {
        window.socketService.emitPostCreated(
          data.post._id,
          data.post.caption,
          currentUser.userId,
          currentUser.username,
          data.post.mediaType
        );
      }

      showSuccess('Post created!');
    } catch (err) {
      console.error('Create post error:', err);
      showError('Failed to create post');
    }
  });
}

/**
 * Handle profile form
 */
if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showError('You must be logged in');
      return;
    }

    const username = profileUsernameInput.value.trim();
    const email = profileEmailInput.value.trim();
    const fullName = profileNameInput.value.trim();
    const bio = profileBioInput.value.trim();

    if (!username || !email) {
      showError('Username and email are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          username,
          email,
          fullName,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Failed to update profile');
        return;
      }

      setCurrentUser(data.user);
      showSuccess('Profile updated!');
    } catch (err) {
      console.error('Profile update error:', err);
      showError('Failed to update profile');
    }
  });
}

// ======================== Profile Management ========================

/**
 * Load profile from storage
 */
function loadProfileFromStorage() {
  if (!currentUser) {
    return;
  }

  if (profileUsernameInput) {
    profileUsernameInput.value = currentUser.username || '';
  }
  if (profileEmailInput) {
    profileEmailInput.value = currentUser.email || '';
  }
  if (profileUserIdInput) {
    profileUserIdInput.value = currentUser.userId || '';
  }
  if (profileNameInput) {
    profileNameInput.value = currentUser.fullName || '';
  }
  if (profileBioInput) {
    profileBioInput.value = currentUser.bio || '';
  }

  if (sidebarProfileUsername) {
    sidebarProfileUsername.textContent = currentUser.username || 'User';
  }
  if (sidebarProfileName) {
    sidebarProfileName.textContent = currentUser.userId || 'ID';
  }
}

/**
 * Load profile stats
 */
async function loadProfileStats() {
  if (!currentUser || !currentUser.userId) {
    if (profilePostsCountEl) profilePostsCountEl.textContent = '0 posts';
    if (profileFollowersCountEl) profileFollowersCountEl.textContent = '0';
    if (profileFollowingCountEl) profileFollowingCountEl.textContent = '0';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile-stats?userId=${currentUser.userId}`);
    const data = await response.json();

    if (response.ok) {
      const stats = data.stats || {};
      if (profilePostsCountEl) profilePostsCountEl.textContent = `${stats.postsCount || 0} posts`;
      if (profileFollowersCountEl) profileFollowersCountEl.textContent = stats.followersCount || 0;
      if (profileFollowingCountEl) profileFollowingCountEl.textContent = stats.followingCount || 0;
    }
  } catch (err) {
    console.error('Error loading profile stats:', err);
  }
}

/**
 * Load suggestions
 */
async function loadSuggestions() {
  if (!suggestionsList) return;

  suggestionsList.innerHTML = '';

  try {
    let url = `${API_BASE_URL}/auth/suggestions`;
    if (currentUser && currentUser.userId) {
      url += `?userId=${currentUser.userId}`;
    }

    const response = await fetch(url);
    const users = await response.json();

    if (!Array.isArray(users) || !users.length) {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.textContent = 'No suggestions available.';
      suggestionsList.appendChild(li);
      return;
    }

    users.forEach((user) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';

      const avatar = document.createElement('div');
      avatar.className = 'avatar-placeholder small';

      const text = document.createElement('div');
      text.className = 'suggestion-text';

      const usernameDiv = document.createElement('div');
      usernameDiv.className = 'suggestion-username';
      usernameDiv.textContent = user.username;

      const infoDiv = document.createElement('div');
      infoDiv.className = 'suggestion-info';
      infoDiv.textContent = user.fullName || 'User';

      text.appendChild(usernameDiv);
      text.appendChild(infoDiv);

      const followBtn = document.createElement('button');
      followBtn.type = 'button';
      followBtn.className = 'follow-link';
      followBtn.textContent = 'Follow';

      li.appendChild(avatar);
      li.appendChild(text);
      li.appendChild(followBtn);

      suggestionsList.appendChild(li);

      if (!user.userId || !currentUser) {
        followBtn.disabled = true;
        return;
      }

      followBtn.addEventListener('click', async () => {
        if (!currentUser || currentUser.userId === user.userId) {
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromUserId: currentUser.userId,
              toUserId: user.userId,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            showError(data.message || 'Failed to follow');
            return;
          }

          followBtn.textContent = data.following ? 'Following' : 'Follow';
          loadProfileStats();

          // Remove from suggestions list immediately
          if (data.following) {
            li.remove();
            if (suggestionsList.children.length === 0) {
              const noSuggestions = document.createElement('li');
              noSuggestions.className = 'suggestion-item';
              noSuggestions.textContent = 'No more suggestions.';
              suggestionsList.appendChild(noSuggestions);
            }
          }

          // Emit real-time notification
          if (window.socketService && window.socketService.emitUserFollowed && currentUser) {
            window.socketService.emitUserFollowed(
              currentUser.userId,
              currentUser.username,
              user.userId
            );
          }
        } catch (err) {
          console.error('Follow error:', err);
          showError('Failed to follow user');
        }
      });
    });
  } catch (err) {
    console.error('Error loading suggestions:', err);
  }
}

// ======================== Search ========================

/**
 * Handle search
 */
function handleSearch() {
  if (!searchInput || !searchResults) {
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = '';

  if (!query) {
    searchResults.textContent = 'Enter a username or user ID to search.';
    return;
  }

  // For demo, show placeholder results
  searchResults.innerHTML = `<div class="search-result-item">Search for "${query}" coming soon</div>`;
}

if (searchButton) {
  searchButton.addEventListener('click', handleSearch);
}

if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });
}

// ======================== Event Listeners ========================

// Modal Controls
if (createModalClose) {
  createModalClose.addEventListener('click', closeCreateModal);
}

if (createModalBackdrop) {
  createModalBackdrop.addEventListener('click', closeCreateModal);
}

if (relationsModalClose) {
  relationsModalClose.addEventListener('click', closeRelationsModal);
}

if (relationsModalBackdrop) {
  relationsModalBackdrop.addEventListener('click', closeRelationsModal);
}

// Profile Stats Buttons
if (profileFollowersButton) {
  profileFollowersButton.addEventListener('click', () => {
    openRelationsModal('followers');
  });
}

if (profileFollowingButton) {
  profileFollowingButton.addEventListener('click', () => {
    openRelationsModal('following');
  });
}

// Logout
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    allPosts = [];
    postsContainer.innerHTML = '';
    showAuthOverlay();
    showAuthView('login');
    showSuccess('Logged out');
  });
}

// Bottom Navigation
bottomNavButtons.forEach((btn) => {
  const viewName = btn.getAttribute('data-view');
  const action = btn.getAttribute('data-action');

  if (viewName) {
    btn.addEventListener('click', () => {
      showView(viewName);

      if (viewName === 'reels') {
        renderReels();
      }
      if (viewName === 'profile') {
        loadMyPosts();
        loadProfileStats();
      }
    });
  } else if (action === 'create') {
    btn.addEventListener('click', () => {
      if (!currentUser) {
        showError('You must log in to create a post');
        return;
      }
      openCreateModal();
    });
  }
});

// Top Navigation Links
navItems.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const viewName = link.getAttribute('data-view');
    if (viewName) {
      showView(viewName);

      if (viewName === 'reels') {
        renderReels();
      }
      if (viewName === 'profile') {
        loadMyPosts();
        loadProfileStats();
      }
    }
  });
});

// ======================== Search Functionality ========================

/**
 * Search users by username or userId
 */
async function searchUsers(query) {
  if (!searchResults) return;

  if (!query || query.trim().length === 0) {
    searchResults.innerHTML = '<p class="empty-state">Enter a username or user ID to search</p>';
    return;
  }

  searchResults.innerHTML = '<p class="empty-state">Searching...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/search?query=${encodeURIComponent(query)}`);
    const users = await response.json();

    if (!response.ok) {
      searchResults.innerHTML = `<p class="empty-state">${users.message || 'Search failed'}</p>`;
      return;
    }

    if (!users || users.length === 0) {
      searchResults.innerHTML = '<p class="empty-state">No users found</p>';
      return;
    }

    // Display results
    searchResults.innerHTML = '';
    users.forEach((user) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      resultItem.innerHTML = `
        <div class="avatar-placeholder small"></div>
        <div style="flex: 1;">
          <div style="font-weight: 600;">${user.username}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            ${user.fullName || 'No name'} • ID: ${user.userId}
          </div>
          ${user.bio ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${user.bio}</div>` : ''}
        </div>
      `;

      resultItem.style.cursor = 'pointer';
      resultItem.addEventListener('click', () => {
        showNotification(`Selected ${user.username}`, 'info');
      });

      searchResults.appendChild(resultItem);
    });
  } catch (err) {
    console.error('Search error:', err);
    searchResults.innerHTML = '<p class="empty-state">Failed to search users</p>';
  }
}

// Search button click
if (searchButton) {
  searchButton.addEventListener('click', () => {
    if (searchInput) {
      searchUsers(searchInput.value);
    }
  });
}

// Search on Enter key
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchUsers(searchInput.value);
    }
  });

  // Clear results when input is cleared
  searchInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length === 0) {
      searchResults.innerHTML = '';
    }
  });
}

// ======================== Initialization ========================

console.log('🚀 Social Sync loaded');
loadCurrentUser();
showView('home');
