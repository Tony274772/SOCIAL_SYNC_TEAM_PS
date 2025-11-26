// Notification UI Logic

document.addEventListener('DOMContentLoaded', () => {
    const bellBtn = document.getElementById('notifications-bell');
    const panel = document.getElementById('notifications-panel');
    const badge = document.getElementById('notifications-badge');
    const list = document.getElementById('notifications-list');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');

    if (!bellBtn || !panel || !list) return;

    // Toggle panel
    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            loadNotifications();
        }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !bellBtn.contains(e.target)) {
            panel.classList.add('hidden');
        }
    });

    // Mark all as read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            if (!currentUser) return;
            try {
                await fetch('/api/notifications/read-all', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.userId })
                });
                loadNotifications();
                updateUnreadCount();
            } catch (err) {
                console.error('Error marking all read:', err);
            }
        });
    }

    // Initial load
    if (currentUser) {
        updateUnreadCount();
    }
});

async function loadNotifications() {
    if (!currentUser) return;

    const list = document.getElementById('notifications-list');
    if (!list) return;

    try {
        const response = await fetch(`/api/notifications?userId=${currentUser.userId}`);
        const notifications = await response.json();

        if (notifications.length === 0) {
            list.innerHTML = '<p class="empty-state">No notifications</p>';
            return;
        }

        list.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" onclick="handleNotificationClick('${n._id}', '${n.type}', '${n.fromUserId}', '${n.postId}')">
        <div class="notification-content">
          <span class="notification-icon">${getNotificationIcon(n.type)}</span>
          <span class="notification-text">${n.message}</span>
          <div class="notification-time">${new Date(n.createdAt).toLocaleString()}</div>
        </div>
      </div>
    `).join('');

    } catch (err) {
        console.error('Error loading notifications:', err);
        list.innerHTML = '<p class="error-state">Failed to load notifications</p>';
    }
}

async function updateUnreadCount() {
    if (!currentUser) return;

    const badge = document.getElementById('notifications-badge');
    if (!badge) return;

    try {
        const response = await fetch(`/api/notifications/unread-count?userId=${currentUser.userId}`);
        const data = await response.json();

        if (data.count > 0) {
            badge.textContent = data.count > 99 ? '99+' : data.count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (err) {
        console.error('Error updating unread count:', err);
    }
}

async function handleNotificationClick(id, type, fromUserId, postId) {
    // Mark as read
    try {
        await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
        updateUnreadCount();
    } catch (err) {
        console.error('Error marking read:', err);
    }

    // Navigate based on type
    if (type === 'message') {
        // Switch to messages view and open conversation
        document.querySelector('[data-view="messages"]').click();
        // TODO: Select conversation with fromUserId
        if (typeof loadConversation === 'function') {
            loadConversation(fromUserId, null); // username unknown here, will be fetched
        }
    } else if (type === 'post' || type === 'like' || type === 'comment') {
        // Navigate to home/feed (or specific post view if we had one)
        document.querySelector('[data-view="home"]').click();
    } else if (type === 'follow') {
        document.querySelector('[data-view="profile"]').click();
    }

    // Close panel
    document.getElementById('notifications-panel').classList.add('hidden');
}

function getNotificationIcon(type) {
    switch (type) {
        case 'like': return '❤️';
        case 'comment': return '💬';
        case 'follow': return '👤';
        case 'message': return '✉️';
        case 'post': return '📝';
        default: return '🔔';
    }
}

// Expose functions globally
window.updateNotifications = () => {
    updateUnreadCount();
    const panel = document.getElementById('notifications-panel');
    if (panel && !panel.classList.contains('hidden')) {
        loadNotifications();
    }
};
