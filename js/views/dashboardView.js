// DAYFLOW - Dashboard View
class DashboardView {
  constructor(app) {
    this.app = app;
    this.container = null;
  }

  render(container) {
    this.container = container;
    const store = window.dataStore;
    const gamification = window.gamificationEngine;
    const quotes = window.quoteManager;
    const icons = window.getIcon;

    const todayStr = store.getTodayString();
    const tasks = store.getTasks(todayStr);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const streakData = gamification.calculateStreaks();
    const user = store.getUser();
    const levelInfo = gamification.getLevelInfo(user.xp);

    // Determine Greeting
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17 || hour < 5) greeting = 'Good Evening';

    // Format Date: "Sunday, Nov 15, 2026"
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Get current quote
    const quote = quotes.getDailyQuote();

    container.innerHTML = `
      <div class="view-content dashboard-view">
        <!-- Top Greeting Bar -->
        <header class="dashboard-header animate-fade-in">
          <div class="header-left">
            <div class="date-badge">
              ${icons('calendar', 'icon-sm')}
              <span>${dateFormatted}</span>
            </div>
            <h1 class="greeting-title">
              ${greeting}, <span class="gradient-text">${user.name || 'Champion'}</span>
            </h1>
            <p class="greeting-subtitle">Every small step brings you closer to your goals.</p>
          </div>
          <div class="header-right">
            <div class="level-pill-card">
              <div class="level-pill-header">
                <span class="level-badge">${icons('zap', 'icon-xs')} Lvl ${levelInfo.currentLevel}</span>
                <span class="level-title">${levelInfo.title}</span>
              </div>
              <div class="level-bar-track">
                <div class="level-bar-fill" style="width: ${levelInfo.progressPercent}%;"></div>
              </div>
              <span class="level-xp-text">${levelInfo.currentXp} XP &bull; ${levelInfo.remainingXp} to next level</span>
            </div>
          </div>
        </header>

        <!-- 6 Main Stat Cards Grid -->
        <section class="stats-grid animate-fade-in">
          <div class="stat-card">
            <div class="stat-icon-wrap icon-blue">
              ${icons('list-todo', 'stat-icon')}
            </div>
            <div class="stat-info">
              <span class="stat-label">Today's Tasks</span>
              <span class="stat-value">${totalTasks}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-emerald">
              ${icons('check-circle-2', 'stat-icon')}
            </div>
            <div class="stat-info">
              <span class="stat-label">Completed</span>
              <span class="stat-value text-emerald">${completedTasks}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-amber">
              ${icons('clock', 'stat-icon')}
            </div>
            <div class="stat-info">
              <span class="stat-label">Remaining</span>
              <span class="stat-value text-amber">${remainingTasks}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap icon-indigo">
              ${icons('trending-up', 'stat-icon')}
            </div>
            <div class="stat-info">
              <span class="stat-label">Completion</span>
              <span class="stat-value text-indigo">${completionPct}%</span>
            </div>
          </div>

          <div class="stat-card stat-card-streak" onclick="window.dayflowApp.navigate('streaks')">
            <div class="stat-icon-wrap icon-orange">
              ${icons('flame', 'stat-icon fire-glow')}
            </div>
            <div class="stat-info">
              <span class="stat-label">Current Streak</span>
              <span class="stat-value text-orange">${streakData.currentStreak} <span class="stat-unit">days</span></span>
            </div>
          </div>

          <div class="stat-card" onclick="window.dayflowApp.navigate('analytics')">
            <div class="stat-icon-wrap icon-purple">
              ${icons('sparkles', 'stat-icon')}
            </div>
            <div class="stat-info">
              <span class="stat-label">Total XP</span>
              <span class="stat-value text-purple">${user.xp || 0}</span>
            </div>
          </div>
        </section>

        <!-- Middle Section: Circular Progress & Motivational Quote -->
        <section class="dashboard-middle-grid">
          <!-- Circular Progress Card -->
          <div class="card card-circular-progress">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Daily Momentum</h3>
                <p class="card-subtitle">${totalTasks > 0 ? `${completedTasks} of ${totalTasks} tasks completed` : 'No tasks scheduled yet'}</p>
              </div>
              <span class="badge ${completionPct === 100 && totalTasks > 0 ? 'badge-success' : 'badge-neutral'}">
                ${completionPct === 100 && totalTasks > 0 ? '100% Conquered' : 'In Progress'}
              </span>
            </div>
            <div id="dash-circular-progress" class="circ-progress-mount"></div>
            <div class="circ-progress-footer">
              <button class="btn btn-primary btn-sm btn-icon-gap" onclick="window.dayflowApp.openAddTaskModal('${todayStr}')">
                ${icons('plus', 'icon-sm')} Add Task
              </button>
              <button class="btn btn-secondary btn-sm btn-icon-gap" onclick="window.dayflowApp.navigate('planner')">
                ${icons('list-todo', 'icon-sm')} Open Planner
              </button>
            </div>
          </div>

          <!-- Motivational Quote Card -->
          <div class="card card-quote">
            <div class="card-header-clean">
              <div class="quote-header-title">
                ${icons('sparkles', 'icon-sm text-purple')}
                <span>Daily Inspiration</span>
              </div>
              <button id="btn-refresh-quote" class="btn-icon-subtle" title="Get another quote">
                ${icons('refresh-cw', 'icon-sm icon-spin-hover')}
              </button>
            </div>
            <div class="quote-body" id="dash-quote-body">
              <div class="quote-mark">“</div>
              <p class="quote-text" id="quote-text-element">${quote.text}</p>
              <div class="quote-footer">
                <span class="quote-author" id="quote-author-element">— ${quote.author}</span>
                <span class="badge badge-purple" id="quote-category-element">${quote.category}</span>
              </div>
            </div>
            <div class="quote-streak-reminder">
              <span class="reminder-icon">${icons('flame', 'icon-sm text-orange')}</span>
              <span class="reminder-text">
                ${streakData.currentStreak > 0
                  ? `You're on a ${streakData.currentStreak}-day winning streak! Complete today to keep the fire burning.`
                  : `Start your daily streak today. Complete all tasks to earn +50 bonus XP!`}
              </span>
            </div>
          </div>
        </section>

        <!-- Today's Tasks Overview & Bucket List Preview -->
        <section class="dashboard-tasks-section">
          <div class="card card-today-tasks">
            <div class="card-header-clean">
              <div class="tasks-heading-wrap">
                <h3>Today's Task Focus</h3>
                <span class="badge badge-subtle">${completedTasks}/${totalTasks} Done</span>
              </div>
              <button class="btn btn-primary btn-sm btn-icon-gap" onclick="window.dayflowApp.openAddTaskModal('${todayStr}')">
                ${icons('plus', 'icon-sm')} Add Task
              </button>
            </div>

            <!-- Quick Add Bar -->
            <form id="dash-quick-add-form" class="quick-add-bar">
              <div class="quick-add-input-wrap">
                ${icons('plus', 'quick-add-icon')}
                <input
                  type="text"
                  id="dash-quick-task-input"
                  placeholder="Quick add a task for today (Press Enter)..."
                  autocomplete="off"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Add</button>
            </form>

            <!-- Tasks List -->
            <div class="tasks-list-container" id="dash-tasks-list">
              ${this._renderTasksListHtml(tasks)}
            </div>

            ${tasks.length > 0 ? `
              <div class="tasks-card-footer">
                <button class="btn-link" onclick="window.dayflowApp.navigate('planner')">
                  View and organize all tasks in Planner ${icons('arrow-right', 'icon-xs')}
                </button>
              </div>
            ` : ''}
          </div>
        </section>
      </div>
    `;

    // Mount circular progress
    const circContainer = container.querySelector('#dash-circular-progress');
    window.chartEngine.renderCircularProgress(circContainer, completionPct, {
      size: 175,
      strokeWidth: 14,
      label: completionPct === 100 && totalTasks > 0 ? 'Conquered!' : completionPct > 0 ? 'In Flow' : 'Pending'
    });

    // Wire refresh quote button
    const refreshBtn = container.querySelector('#btn-refresh-quote');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playClick();
        refreshBtn.classList.add('rotating');
        setTimeout(() => refreshBtn.classList.remove('rotating'), 600);
        
        const newQuote = window.quoteManager.getRandomQuote();
        const textEl = container.querySelector('#quote-text-element');
        const authorEl = container.querySelector('#quote-author-element');
        const catEl = container.querySelector('#quote-category-element');
        if (textEl) textEl.textContent = newQuote.text;
        if (authorEl) authorEl.textContent = `— ${newQuote.author}`;
        if (catEl) catEl.textContent = newQuote.category;
      });
    }

    // Wire quick add form
    const quickAddForm = container.querySelector('#dash-quick-add-form');
    if (quickAddForm) {
      quickAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = container.querySelector('#dash-quick-task-input');
        const title = (input.value || '').trim();
        if (!title) return;

        window.dataStore.addTask({
          title,
          category: 'Personal',
          priority: 'Medium',
          date: todayStr
        });

        input.value = '';
        window.dayflowApp.showToast('Task added for today', 'success');
      });
    }

    // Wire task checkbox toggles
    this._wireTaskCheckboxes(container);
  }

  _renderTasksListHtml(tasks) {
    if (!tasks || tasks.length === 0) {
      return `
        <div class="empty-tasks-placeholder">
          <div class="empty-icon">${window.getIcon('sparkles', 'icon-lg text-purple')}</div>
          <h4>No tasks for today yet</h4>
          <p>Every productive day begins with a clear intention. Add your first goal above!</p>
        </div>
      `;
    }

    return tasks.map(task => {
      const priorityClass = `priority-${(task.priority || 'medium').toLowerCase()}`;
      return `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
          <label class="custom-checkbox">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
            <span class="checkmark"></span>
          </label>
          <div class="task-details">
            <span class="task-title">${this._escape(task.title)}</span>
            <div class="task-meta">
              <span class="badge badge-category badge-cat-${task.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${task.category}</span>
              <span class="badge ${priorityClass}">${task.priority}</span>
              ${task.dueTime ? `<span class="task-due-time">${window.getIcon('clock', 'icon-xs')} ${task.dueTime}</span>` : ''}
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-icon-subtle btn-edit-task" data-id="${task.id}" title="Edit Task">
              ${window.getIcon('edit-3', 'icon-xs')}
            </button>
            <button class="btn-icon-subtle text-danger btn-delete-task" data-id="${task.id}" title="Delete Task">
              ${window.getIcon('trash-2', 'icon-xs')}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  _wireTaskCheckboxes(container) {
    const items = container.querySelectorAll('.task-item');
    items.forEach(item => {
      const id = item.getAttribute('data-task-id');
      const checkbox = item.querySelector('.task-checkbox');
      const editBtn = item.querySelector('.btn-edit-task');
      const deleteBtn = item.querySelector('.btn-delete-task');

      if (checkbox) {
        checkbox.addEventListener('change', () => {
          const toggledTask = window.dataStore.toggleTask(id);
          if (toggledTask) {
            window.gamificationEngine.handleTaskToggled(toggledTask);
          }
        });
      }

      if (editBtn) {
        editBtn.addEventListener('click', () => {
          window.dayflowApp.openEditTaskModal(id);
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          window.dayflowApp.confirmDeleteTask(id);
        });
      }
    });
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.DashboardView = DashboardView;

