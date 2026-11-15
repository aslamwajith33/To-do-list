// DAYFLOW - Streak Tracker & 30-Day Calendar View
class StreakView {
  constructor(app) {
    this.app = app;
    this.container = null;
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
  }

  render(container) {
    this.container = container;
    const store = window.dataStore;
    const gamification = window.gamificationEngine;
    const icons = window.getIcon;

    const streakData = gamification.calculateStreaks();
    const history = store.getAllHistory();
    const allTasks = store.getTasks();

    // Map tasks by date
    const tasksByDate = {};
    allTasks.forEach(t => {
      if (!tasksByDate[t.date]) tasksByDate[t.date] = [];
      tasksByDate[t.date].push(t);
    });

    // Month calculations
    const now = new Date();
    const isCurrentMonth = this.viewYear === now.getFullYear() && this.viewMonth === now.getMonth();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const daysElapsed = isCurrentMonth ? now.getDate() : (this.viewYear < now.getFullYear() || this.viewMonth < now.getMonth() ? daysInMonth : 0);

    let monthCompletedDays = 0;
    let monthMissedDays = 0;

    for (let d = 1; d <= daysElapsed; d++) {
      const monthStr = String(this.viewMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const key = `${this.viewYear}-${monthStr}-${dayStr}`;

      const rec = history[key];
      const dayTasks = tasksByDate[key] || [];
      const isAllDone = dayTasks.length > 0 ? dayTasks.every(t => t.completed) : (rec && rec.completed);

      if (isAllDone) {
        monthCompletedDays++;
      } else if (d < (isCurrentMonth ? now.getDate() : daysElapsed + 1)) {
        monthMissedDays++;
      }
    }

    const monthCompletionRate = daysElapsed > 0 ? Math.round((monthCompletedDays / daysElapsed) * 100) : 0;

    // Month name
    const monthName = new Date(this.viewYear, this.viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Milestones (3, 7, 15, 30 days)
    const milestones = [
      { days: 3, label: '3-Day Starter', bonusXp: 25, icon: 'zap' },
      { days: 7, label: '7-Day Warrior', bonusXp: 50, icon: 'trophy' },
      { days: 15, label: '15-Day Master', bonusXp: 100, icon: 'shield-check' },
      { days: 30, label: '30-Day Champion', bonusXp: 250, icon: 'award' }
    ];

    container.innerHTML = `
      <div class="view-content streak-view">
        <!-- Header -->
        <header class="view-header">
          <div class="view-header-titles">
            <h1 class="view-title">
              Streak Tracker <span class="gradient-text">&amp; Consistency Matrix</span>
            </h1>
            <p class="view-subtitle">Your consistency is your superpower. Build unbreakable momentum one day at a time.</p>
          </div>
        </header>

        <!-- Big Streak Hero Banner -->
        <section class="card streak-hero-banner">
          <div class="streak-hero-content">
            <div class="streak-flame-wrapper">
              ${icons('flame', 'hero-flame-icon fire-glow-intense')}
              <div class="flame-radial-glow"></div>
            </div>
            <div class="streak-hero-text">
              <span class="streak-hero-eyebrow">ACTIVE DISCIPLINE STREAK</span>
              <div class="streak-counter-number">
                ${streakData.currentStreak} <span class="streak-counter-unit">${streakData.currentStreak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <p class="streak-hero-desc">
                ${streakData.todayCompleted
                  ? 'Awesome work! You completed all scheduled tasks for today and kept your streak alive!'
                  : streakData.currentStreak > 0
                    ? `Finish all of today\'s tasks before midnight to extend your streak to ${streakData.currentStreak + 1} days!`
                    : 'Complete all of today\'s tasks to ignite a brand-new daily streak.'}
              </p>
            </div>
          </div>
        </section>

        <!-- 4 Streak Stats Cards -->
        <section class="stats-grid streak-stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap icon-orange">${icons('flame', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Current Streak</span>
              <span class="stat-value text-orange">${streakData.currentStreak} <span class="stat-unit">days</span></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-purple">${icons('trophy', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Longest Streak</span>
              <span class="stat-value text-purple">${streakData.longestStreak} <span class="stat-unit">days</span></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-emerald">${icons('check-circle-2', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Completed Days</span>
              <span class="stat-value text-emerald">${monthCompletedDays} <span class="stat-unit">this mo.</span></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-indigo">${icons('trending-up', 'stat-icon')}</div>
            <div class="stat-info">
              <span class="stat-label">Monthly Consistency</span>
              <span class="stat-value text-indigo">${monthCompletionRate}%</span>
            </div>
          </div>
        </section>

        <!-- Milestones Section (3, 7, 15, 30 days) -->
        <section class="card streak-milestones-card">
          <div class="card-header-clean">
            <div class="card-title-group">
              <h3>Streak Milestones</h3>
              <p class="card-subtitle">Unlock bonus XP and exclusive badges for sustained discipline</p>
            </div>
          </div>

          <div class="milestones-grid">
            ${milestones.map(m => {
              const isUnlocked = streakData.currentStreak >= m.days || streakData.longestStreak >= m.days;
              const progressPct = Math.min(100, Math.round((streakData.currentStreak / m.days) * 100));
              return `
                <div class="milestone-box ${isUnlocked ? 'unlocked' : 'in-progress'}">
                  <div class="milestone-top">
                    <span class="milestone-icon-wrap">${icons(m.icon, 'icon-sm')}</span>
                    <span class="badge ${isUnlocked ? 'badge-success' : 'badge-subtle'}">+${m.bonusXp} XP</span>
                  </div>
                  <div class="milestone-title">${m.label}</div>
                  <div class="milestone-bar-track">
                    <div class="milestone-bar-fill" style="width: ${progressPct}%;"></div>
                  </div>
                  <div class="milestone-footer">
                    <span>${isUnlocked ? 'Unlocked ✓' : `${streakData.currentStreak} / ${m.days} days`}</span>
                    <span>${progressPct}%</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Monthly Calendar Matrix -->
        <section class="card streak-calendar-card">
          <div class="card-header-clean">
            <div class="calendar-nav-wrap">
              <button class="btn-icon-subtle" id="calendar-prev-month" title="Previous Month">
                ${icons('chevron-left', 'icon-sm')}
              </button>
              <h3 class="calendar-month-title">${monthName}</h3>
              <button class="btn-icon-subtle" id="calendar-next-month" title="Next Month">
                ${icons('chevron-right', 'icon-sm')}
              </button>
            </div>
            <div class="calendar-legend">
              <span class="legend-dot dot-completed"></span> <span>Completed</span>
              <span class="legend-dot dot-today"></span> <span>Today</span>
              <span class="legend-dot dot-missed"></span> <span>Missed</span>
              <span class="legend-dot dot-future"></span> <span>Future</span>
            </div>
          </div>

          <div id="streak-calendar-mount"></div>
        </section>
      </div>
    `;

    // Mount calendar
    const calMount = container.querySelector('#streak-calendar-mount');
    window.chartEngine.renderStreakCalendar(calMount, this.viewYear, this.viewMonth, history, tasksByDate, (clickedDate) => {
      // Navigate to planner with this date
      window.dayflowApp.navigate('planner', { date: clickedDate });
    });

    // Month Navigation
    const prevMonthBtn = container.querySelector('#calendar-prev-month');
    const nextMonthBtn = container.querySelector('#calendar-next-month');

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        if (this.viewMonth === 0) {
          this.viewMonth = 11;
          this.viewYear--;
        } else {
          this.viewMonth--;
        }
        this.render(container);
      });
    }

    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        if (this.viewMonth === 11) {
          this.viewMonth = 0;
          this.viewYear++;
        } else {
          this.viewMonth++;
        }
        this.render(container);
      });
    }
  }
}

window.StreakView = StreakView;

