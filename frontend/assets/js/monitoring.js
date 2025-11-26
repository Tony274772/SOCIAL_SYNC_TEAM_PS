// Monitoring Dashboard Module
// Handles system health, activity logs, and analytics

const monitoringModule = {
  /**
   * Initialize monitoring dashboard
   */
  init() {
    this.setupEventListeners();
    this.loadHealthStatus();
    this.loadActivityStats();
    this.loadActivityLogs();
    
    // Refresh data every 30 seconds
    setInterval(() => {
      this.loadHealthStatus();
      this.loadActivityStats();
      this.loadActivityLogs();
    }, 30000);
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const filterSelect = document.getElementById('log-filter-type');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        this.loadActivityLogs();
      });
    }
  },

  /**
   * Load system health status
   */
  async loadHealthStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/health`);
      const data = await response.json();

      const healthStatus = document.getElementById('health-status');
      if (!healthStatus) return;

      let html = '';

      if (data.status === 'healthy') {
        html += `
          <div class="health-item">
            <div class="health-item-label">Status</div>
            <div class="health-item-value" style="color: #31a24c;">✓ Healthy</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">Uptime</div>
            <div class="health-item-value">${data.uptime.formatted}</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">Heap Memory</div>
            <div class="health-item-value">${data.memory.heapUsed} / ${data.memory.heapTotal}</div>
          </div>
          <div class="health-item">
            <div class="health-item-label">External Memory</div>
            <div class="health-item-value">${data.memory.external}</div>
          </div>
        `;
      } else {
        html = `
          <div class="health-item" style="border-left-color: #e6005c;">
            <div class="health-item-label">Status</div>
            <div class="health-item-value" style="color: #e6005c;">✗ Unhealthy</div>
          </div>
        `;
      }

      healthStatus.innerHTML = html;
    } catch (err) {
      console.error('Error loading health status:', err);
      const healthStatus = document.getElementById('health-status');
      if (healthStatus) {
        healthStatus.innerHTML = '<p style="color: #e6005c;">Failed to load health status</p>';
      }
    }
  },

  /**
   * Load activity statistics
   */
  async loadActivityStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/stats?timeRange=24h`);
      const data = await response.json();

      const activityStats = document.getElementById('activity-stats');
      if (!activityStats) return;

      let html = '';

      if (data.eventStats && data.eventStats.length > 0) {
        data.eventStats.forEach((stat) => {
          html += `
            <div class="stat-box">
              <div class="stat-label">${this.formatEventType(stat._id)}</div>
              <div class="stat-value">${stat.count}</div>
            </div>
          `;
        });

        // Add error stats
        if (data.errorStats && data.errorStats.length > 0) {
          const errorCount = data.errorStats.reduce((sum, stat) => sum + stat.count, 0);
          html += `
            <div class="stat-box" style="background: linear-gradient(135deg, rgba(230, 0, 92, 0.1), rgba(255, 122, 0, 0.1));">
              <div class="stat-label">Errors</div>
              <div class="stat-value" style="color: #e6005c;">${errorCount}</div>
            </div>
          `;
        }

        // Add total events
        html += `
          <div class="stat-box" style="background: linear-gradient(135deg, rgba(49, 162, 76, 0.1), rgba(0, 149, 246, 0.1));">
            <div class="stat-label">Total Events</div>
            <div class="stat-value" style="color: #31a24c;">${data.totalEvents}</div>
          </div>
        `;
      } else {
        html = '<p>No activity data available</p>';
      }

      activityStats.innerHTML = html;
    } catch (err) {
      console.error('Error loading activity stats:', err);
      const activityStats = document.getElementById('activity-stats');
      if (activityStats) {
        activityStats.innerHTML = '<p style="color: #e6005c;">Failed to load statistics</p>';
      }
    }
  },

  /**
   * Load activity logs
   */
  async loadActivityLogs() {
    try {
      const filterSelect = document.getElementById('log-filter-type');
      const eventType = filterSelect ? filterSelect.value : '';

      const url = new URL(`${API_BASE_URL}/monitoring/logs`);
      url.searchParams.append('limit', '50');
      if (eventType) {
        url.searchParams.append('eventType', eventType);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      const activityLogs = document.getElementById('activity-logs');
      if (!activityLogs) return;

      let html = '';

      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((log) => {
          const timestamp = new Date(log.timestamp).toLocaleString();
          const severity = log.severity || 'info';
          const severityClass = severity === 'error' || severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : '';

          html += `
            <div class="log-entry ${severityClass}">
              <div class="log-timestamp">${timestamp}</div>
              <div class="log-event">${this.formatEventType(log.eventType)}</div>
              <div class="log-details">
                ${log.userId ? `User: ${log.userId} | ` : ''}
                ${log.action ? `Action: ${log.action}` : ''}
                ${log.statusCode ? ` | Status: ${log.statusCode}` : ''}
              </div>
            </div>
          `;
        });
      } else {
        html = '<p>No activity logs available</p>';
      }

      activityLogs.innerHTML = html;
    } catch (err) {
      console.error('Error loading activity logs:', err);
      const activityLogs = document.getElementById('activity-logs');
      if (activityLogs) {
        activityLogs.innerHTML = '<p style="color: #e6005c;">Failed to load activity logs</p>';
      }
    }
  },

  /**
   * Format event type for display
   */
  formatEventType(eventType) {
    const eventMap = {
      user_signup: 'User Signup',
      user_login: 'User Login',
      user_logout: 'User Logout',
      post_created: 'Post Created',
      post_deleted: 'Post Deleted',
      post_liked: 'Post Liked',
      post_unliked: 'Post Unliked',
      comment_added: 'Comment Added',
      comment_deleted: 'Comment Deleted',
      user_followed: 'User Followed',
      user_unfollowed: 'User Unfollowed',
      profile_updated: 'Profile Updated',
      api_error: 'API Error',
      system_error: 'System Error',
    };

    return eventMap[eventType] || eventType;
  },
};

// Initialize monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    monitoringModule.init();
  });
} else {
  monitoringModule.init();
}
