// DAYFLOW - Monthly Progress & Analytics View
class AnalyticsView {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.rangeDays = 14; // 7, 14, or 30 days
  }

  render(container) {
    this.container = container;
    const store = window.dataStore;
    const gamification = window.gamificationEngine;
    const icons = window.getIcon;

    const allTasks = store.getTasks();
    const allGoals = store.getGoals();
    const user = store.getUser();
    const xpLogs = store.getXpLogs();
    const streakData = gamification.calculateStreaks();
    const badges = gamification.getAllBadgesWithStatus();

    const totalTasksCompleted = allTasks.filter(t => t.completed).length;
    const totalGoalsCompleted = allGoals.filter(g => g.completed).length;

    // Build historical daily data for the selected range (7, 14, 30 days)
    const dailyData = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = this.rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = store.formatDateKey(d);
      const dayTasks = allTasks.filter(t => t.date === dateKey);
      const completed = dayTasks.filter(t => t.completed).length;

      dailyData.push({
        date: dateKey,
        label: i < 7 ? dayNames[d.getDay()] : dateKey.slice(5),
        totalTasks: dayTasks.length,
        completedTasks: completed,
        isToday: i === 0
      });
    }

    // Category breakdown
    const categoryCounts = {
      'Personal': 0,
      'Study': 0,
      'Career': 0,
      'Project': 0,
      'Fitness': 0,
      'Other': 0
    };
    allTasks.forEach(t => {
      const cat = t.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Daily average tasks completed (over past active days)
    const daysWithTasks = new Set(allTasks.map(t => t.date)).size || 1;
    const dailyAvg = (totalTasksCompleted / Math.max(1, daysWithTasks)).toFixed(1);

    container.innerHTML = `
      <div class="view-content analytics-view">
        <!-- Header -->
        <header class="view-header">
          <div class="view-header-titles">
            <h1 class="view-title">
              My Progress <span class="gradient-text">&amp; Analytics</span>
            </h1>
            <p class="view-subtitle">Detailed insights into your discipline, productivity habits, and earned achievements.</p>
          </div>
        </header>

        <!-- Main Metrics Grid -->
        <section class="stats-grid analytics-stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap icon-purple">${icons('sparkles', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Total XP Earned</span>
              <span class="stat-value text-purple">${user.xp || 0}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-emerald">${icons('check-circle-2', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Tasks Conquered</span>
              <span class="stat-value text-emerald">${totalTasksCompleted}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-orange">${icons('flame', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Best Streak</span>
              <span class="stat-value text-orange">${streakData.longestStreak} <span class="stat-unit">days</span></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-blue">${icons('target', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Goals Achieved</span>
              <span class="stat-value text-blue">${totalGoalsCompleted}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-indigo">${icons('trending-up', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Daily Average</span>
              <span class="stat-value text-indigo">${dailyAvg} <span class="stat-unit">tasks</span></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-cyan">${icons('shield-check', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Badges Unlocked</span>
              <span class="stat-value text-cyan">${badges.filter(b => b.unlocked).length} / ${badges.length}</span>
            </div>
          </div>
        </section>

        <!-- Charts Grid -->
        <section class="analytics-charts-grid">
          <!-- Daily Activity Bar Chart -->
          <div class="card chart-card">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Task Completion Velocity</h3>
                <p class="card-subtitle">Number of tasks conquered per day</p>
              </div>
              <div class="segmented-control range-selector">
                <button class="seg-btn ${this.rangeDays === 7 ? 'active' : ''}" data-range="7">7D</button>
                <button class="seg-btn ${this.rangeDays === 14 ? 'active' : ''}" data-range="14">14D</button>
                <button class="seg-btn ${this.rangeDays === 30 ? 'active' : ''}" data-range="30">30D</button>
              </div>
            </div>
            <div id="analytics-bar-chart-mount" class="chart-mount"></div>
          </div>

          <!-- Category Breakdown Donut Chart -->
          <div class="card chart-card">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Focus Category Distribution</h3>
                <p class="card-subtitle">Where your time and attention go</p>
              </div>
            </div>
            <div id="analytics-donut-chart-mount" class="chart-mount"></div>
          </div>
        </section>

        <!-- Achievement Badges Showcase -->
        <section class="card badges-showcase-card">
          <div class="card-header-clean">
            <div class="card-title-group">
              <h3>Achievement Badges</h3>
              <p class="card-subtitle">Special honors awarded for discipline milestones and habits</p>
            </div>
            <span class="badge badge-purple">${badges.filter(b => b.unlocked).length} Unlocked</span>
          </div>

          <div class="badges-grid">
            ${badges.map(b => `
              <div class="badge-item-card ${b.unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon-disc" style="--badge-color: ${b.color};">
                  ${icons(b.icon, 'badge-svg-icon')}
                </div>
                <div class="badge-info-block">
                  <span class="badge-item-title">${b.title}</span>
                  <p class="badge-item-desc">${b.description}</p>
                  <span class="badge-xp-reward">+${b.xpReward} XP</span>
                </div>
                ${b.unlocked ? `<span class="badge-unlocked-check">${icons('check-circle-2', 'icon-xs text-emerald')}</span>` : `<span class="badge-locked-pill">${icons('shield-check', 'icon-xs')} Locked</span>`}
              </div>
            `).join('')}
          </div>
        </section>

        <!-- XP History Activity Timeline -->
        <section class="card xp-history-card">
          <div class="card-header-clean">
            <div class="card-title-group">
              <h3>XP Activity Log</h3>
              <p class="card-subtitle">Transparent record of all points earned and reversed</p>
            </div>
          </div>

          <div class="xp-timeline">
            ${this._renderXpLogs(xpLogs)}
          </div>
        </section>
      </div>
    `;

    // Mount Bar Chart
    const barMount = container.querySelector('#analytics-bar-chart-mount');
    window.chartEngine.renderActivityBarChart(barMount, dailyData, { height: 180 });

    // Mount Donut Chart
    const donutMount = container.querySelector('#analytics-donut-chart-mount');
    window.chartEngine.renderCategoryDonutChart(donutMount, categoryCounts);

    // Wire Range Selector buttons
    const rangeBtns = container.querySelectorAll('.range-selector .seg-btn');
    rangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.rangeDays = parseInt(btn.getAttribute('data-range'), 10);
        this.render(container);
      });
    });
  }

  _renderXpLogs(logs) {
    if (!logs || logs.length === 0) {
      return `
        <div class="empty-tasks-placeholder" style="padding: 24px;">
          <p>No XP history recorded yet. Complete tasks or goals to earn XP!</p>
        </div>
      `;
    }

    return logs.slice(0, 30).map(log => {
      const isPositive = log.amount > 0;
      const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="xp-log-entry">
          <div class="xp-log-pill ${isPositive ? 'xp-positive' : 'xp-negative'}">
            ${isPositive ? `+${log.amount}` : log.amount} XP
          </div>
          <div class="xp-log-details">
            <span class="xp-log-reason">${this._escape(log.reason)}</span>
            <span class="xp-log-meta">${log.date} &bull; ${timeStr} &bull; Total: ${log.newTotal} XP</span>
          </div>
        </div>
      `;
    }).join('');
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.AnalyticsView = AnalyticsView;

