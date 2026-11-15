// DAYFLOW - Main Application Orchestrator & Controller
class DayflowApp {
  constructor() {
    this.currentRoute = 'dashboard';
    this.views = {};
    this.deferredInstallPrompt = null;

    // Toast queue
    this.toastTimer = null;
  }

  init() {
    // 1. Initialize Views
    this.views = {
      'dashboard': new window.DashboardView(this),
      'planner': new window.PlannerView(this),
      'bucket-list': new window.BucketView(this),
      'streaks': new window.StreakView(this),
      'analytics': new window.AnalyticsView(this),
      'settings': new window.SettingsView(this)
    };

    // 2. Setup Gamification Callbacks
    window.gamificationEngine.onCelebrationTriggered = (info) => {
      const settings = window.dataStore.getSettings();
      if (settings.autoCelebrate !== false) {
        this.openCelebrationModal(info);
      }
    };

    window.gamificationEngine.onBadgeUnlocked = (badge) => {
      this.showToast(`🏆 Badge Unlocked: ${badge.title} (+${badge.xpReward} XP)!`, 'success');
      this.updateSidebarUser();
    };

    // 3. Setup Store Change Listeners
    window.dataStore.subscribe((event, payload) => {
      this.updateSidebarUser();
      // If active view needs refresh
      if (event.startsWith('task:') || event.startsWith('goal:') || event.startsWith('data:')) {
        this.refreshCurrentView();
      }
    });

    // 4. Setup PWA Service Worker & Install Prompt
    this._initServiceWorker();
    this._initPwaInstall();

    // 5. Setup Navigation & Routing
    this._initNavigation();

    // 6. Setup Modal Containers in DOM
    this._createModalContainers();

    // 7. Initial Render
    this.handleRouteFromHash();
    this.updateSidebarUser();

    // 8. Online/Offline Listeners
    window.addEventListener('online', () => this._updateNetworkStatus(true));
    window.addEventListener('offline', () => this._updateNetworkStatus(false));

    console.log('DAYFLOW Productivity App initialized successfully!');
  }

  // --- Routing & Navigation ---
  _initNavigation() {
    window.addEventListener('hashchange', () => {
      this.handleRouteFromHash();
    });

    // Sidebar & Mobile Nav clicks
    const navLinks = document.querySelectorAll('[data-route]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
      });
    });
  }

  handleRouteFromHash() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const validRoutes = ['dashboard', 'planner', 'bucket-list', 'streaks', 'analytics', 'settings'];
    const targetRoute = validRoutes.includes(hash) ? hash : 'dashboard';
    this.renderView(targetRoute);
  }

  navigate(route, params = {}) {
    window.location.hash = route;
    if (route === 'planner' && params.date) {
      if (this.views.planner) {
        this.views.planner.setDate(params.date);
      }
    }
  }

  renderView(route) {
    this.currentRoute = route;
    const viewContainer = document.getElementById('main-view-container');
    if (!viewContainer) return;

    // Update active state in sidebar and bottom navigation
    document.querySelectorAll('[data-route]').forEach(el => {
      const elRoute = el.getAttribute('data-route');
      if (elRoute === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Animate transition
    viewContainer.style.opacity = '0';
    setTimeout(() => {
      const view = this.views[route] || this.views['dashboard'];
      view.render(viewContainer);
      viewContainer.style.opacity = '1';
      window.scrollTo(0, 0);
    }, 100);
  }

  refreshCurrentView() {
    const viewContainer = document.getElementById('main-view-container');
    if (viewContainer && this.views[this.currentRoute]) {
      this.views[this.currentRoute].render(viewContainer);
    }
  }

  // --- Sidebar Info Update ---
  updateSidebarUser() {
    const store = window.dataStore;
    const user = store.getUser();
    const gamification = window.gamificationEngine;
    const streakData = gamification.calculateStreaks();
    const levelInfo = gamification.getLevelInfo(user.xp);

    const userNameEl = document.getElementById('sidebar-user-name');
    const userLevelEl = document.getElementById('sidebar-user-level');
    const userStreakEl = document.getElementById('sidebar-streak-badge');
    const userXpEl = document.getElementById('sidebar-xp-badge');
    const userBarEl = document.getElementById('sidebar-level-bar');

    if (userNameEl) userNameEl.textContent = user.name || 'Ahmed';
    if (userLevelEl) userLevelEl.textContent = `Lvl ${levelInfo.currentLevel} ${levelInfo.title}`;
    if (userStreakEl) userStreakEl.textContent = `${streakData.currentStreak}d`;
    if (userXpEl) userXpEl.textContent = `${user.xp || 0} XP`;
    if (userBarEl) userBarEl.style.width = `${levelInfo.progressPercent}%`;
  }

  // --- Modals Setup & Management ---
  _createModalContainers() {
    let overlay = document.getElementById('dayflow-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dayflow-modal-overlay';
      overlay.className = 'modal-backdrop';
      overlay.style.display = 'none';
      overlay.innerHTML = `<div id="dayflow-modal-content" class="modal-card"></div>`;
      document.body.appendChild(overlay);

      // Close modal on click outside
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal();
        }
      });

      // Close modal on Escape
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
        }
      });
    }
  }

  openModal(htmlContent) {
    const overlay = document.getElementById('dayflow-modal-overlay');
    const content = document.getElementById('dayflow-modal-content');
    if (!overlay || !content) return;

    content.innerHTML = htmlContent;
    overlay.style.display = 'flex';
    document.body.classList.add('modal-open');

    // Auto-focus first input
    const firstInput = content.querySelector('input:not([type=hidden]), textarea');
    if (firstInput) firstInput.focus();
  }

  closeModal() {
    const overlay = document.getElementById('dayflow-modal-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
  }

  // --- Task Modals ---
  openAddTaskModal(initialDate = null) {
    const icons = window.getIcon;
    const defaultDate = initialDate || window.dataStore.getTodayString();

    const html = `
      <div class="modal-header">
        <div class="modal-title-group">
          <h3>Add New Task</h3>
          <p class="modal-subtitle">Define what you want to accomplish</p>
        </div>
        <button class="btn-icon-subtle" onclick="window.dayflowApp.closeModal()">
          ${icons('x', 'icon-sm')}
        </button>
      </div>

      <form id="form-add-task" class="modal-form">
        <div class="form-group">
          <label for="task-title" class="form-label">Task Title *</label>
          <input
            type="text"
            id="task-title"
            class="form-control"
            placeholder="e.g. Finish VLSI CMOS layout verification"
            required
            maxlength="120"
          />
        </div>

        <div class="form-group">
          <label for="task-desc" class="form-label">Description (Optional)</label>
          <textarea
            id="task-desc"
            class="form-control"
            rows="3"
            placeholder="Add key notes, steps, or reference links..."
          ></textarea>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="task-category" class="form-label">Category</label>
            <select id="task-category" class="form-control">
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Career">Career</option>
              <option value="Project">Project</option>
              <option value="Fitness">Fitness</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="task-priority" class="form-label">Priority</label>
            <select id="task-priority" class="form-control">
              <option value="Low">Low</option>
              <option value="Medium" selected>Medium</option>
              <option value="High">High Priority</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="task-date" class="form-label">Scheduled Date</label>
            <input type="date" id="task-date" class="form-control" value="${defaultDate}" required />
          </div>

          <div class="form-group">
            <label for="task-due-time" class="form-label">Due Time (Optional)</label>
            <input type="time" id="task-due-time" class="form-control" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.dayflowApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-icon-gap">
            ${icons('plus', 'icon-sm')} Create Task (+10 XP)
          </button>
        </div>
      </form>
    `;

    this.openModal(html);

    const form = document.getElementById('form-add-task');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value;
      const description = document.getElementById('task-desc').value;
      const category = document.getElementById('task-category').value;
      const priority = document.getElementById('task-priority').value;
      const date = document.getElementById('task-date').value;
      const dueTime = document.getElementById('task-due-time').value;

      window.dataStore.addTask({
        title,
        description,
        category,
        priority,
        date,
        dueTime
      });

      this.closeModal();
      this.showToast('Task created successfully!', 'success');
    });
  }

  openEditTaskModal(taskId) {
    const task = window.dataStore.getTaskById(taskId);
    if (!task) return;
    const icons = window.getIcon;

    const html = `
      <div class="modal-header">
        <div class="modal-title-group">
          <h3>Edit Task</h3>
          <p class="modal-subtitle">Modify details and schedule</p>
        </div>
        <button class="btn-icon-subtle" onclick="window.dayflowApp.closeModal()">
          ${icons('x', 'icon-sm')}
        </button>
      </div>

      <form id="form-edit-task" class="modal-form">
        <div class="form-group">
          <label for="edit-task-title" class="form-label">Task Title *</label>
          <input
            type="text"
            id="edit-task-title"
            class="form-control"
            value="${this._escape(task.title)}"
            required
            maxlength="120"
          />
        </div>

        <div class="form-group">
          <label for="edit-task-desc" class="form-label">Description</label>
          <textarea
            id="edit-task-desc"
            class="form-control"
            rows="3"
          >${this._escape(task.description || '')}</textarea>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="edit-task-category" class="form-label">Category</label>
            <select id="edit-task-category" class="form-control">
              <option value="Personal" ${task.category === 'Personal' ? 'selected' : ''}>Personal</option>
              <option value="Study" ${task.category === 'Study' ? 'selected' : ''}>Study</option>
              <option value="Career" ${task.category === 'Career' ? 'selected' : ''}>Career</option>
              <option value="Project" ${task.category === 'Project' ? 'selected' : ''}>Project</option>
              <option value="Fitness" ${task.category === 'Fitness' ? 'selected' : ''}>Fitness</option>
              <option value="Other" ${task.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-task-priority" class="form-label">Priority</label>
            <select id="edit-task-priority" class="form-control">
              <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High Priority</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="edit-task-date" class="form-label">Date</label>
            <input type="date" id="edit-task-date" class="form-control" value="${task.date}" required />
          </div>

          <div class="form-group">
            <label for="edit-task-due-time" class="form-label">Due Time</label>
            <input type="time" id="edit-task-due-time" class="form-control" value="${task.dueTime || ''}" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.dayflowApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-icon-gap">
            ${icons('check', 'icon-sm')} Save Changes
          </button>
        </div>
      </form>
    `;

    this.openModal(html);

    const form = document.getElementById('form-edit-task');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('edit-task-title').value;
      const description = document.getElementById('edit-task-desc').value;
      const category = document.getElementById('edit-task-category').value;
      const priority = document.getElementById('edit-task-priority').value;
      const date = document.getElementById('edit-task-date').value;
      const dueTime = document.getElementById('edit-task-due-time').value;

      window.dataStore.updateTask(taskId, {
        title,
        description,
        category,
        priority,
        date,
        dueTime
      });

      this.closeModal();
      this.showToast('Task updated successfully!', 'success');
    });
  }

  confirmDeleteTask(taskId) {
    const task = window.dataStore.getTaskById(taskId);
    if (!task) return;
    if (confirm(`Delete task "${task.title}"?`)) {
      window.dataStore.deleteTask(taskId);
      this.showToast('Task deleted', 'info');
    }
  }

  // --- Bucket Goal Modals ---
  openAddGoalModal() {
    const icons = window.getIcon;
    const html = `
      <div class="modal-header">
        <div class="modal-title-group">
          <h3>Add Bucket List Goal</h3>
          <p class="modal-subtitle">What big aspiration do you want to conquer?</p>
        </div>
        <button class="btn-icon-subtle" onclick="window.dayflowApp.closeModal()">
          ${icons('x', 'icon-sm')}
        </button>
      </div>

      <form id="form-add-goal" class="modal-form">
        <div class="form-group">
          <label for="goal-title" class="form-label">Goal Title *</label>
          <input
            type="text"
            id="goal-title"
            class="form-control"
            placeholder="e.g. Master Verilog & Design Custom RISC-V CPU"
            required
            maxlength="140"
          />
        </div>

        <div class="form-group">
          <label for="goal-desc" class="form-label">Why is this important? (Description)</label>
          <textarea
            id="goal-desc"
            class="form-control"
            rows="3"
            placeholder="Describe the milestone, significance, and target metrics..."
          ></textarea>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="goal-category" class="form-label">Category</label>
            <select id="goal-category" class="form-control">
              <option value="Career">Career</option>
              <option value="Education">Education</option>
              <option value="Personal Growth">Personal Growth</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Travel">Travel</option>
              <option value="Financial">Financial</option>
              <option value="Dreams">Dreams</option>
            </select>
          </div>

          <div class="form-group">
            <label for="goal-target-date" class="form-label">Target Completion Date</label>
            <input type="date" id="goal-target-date" class="form-control" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.dayflowApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-icon-gap">
            ${icons('plus', 'icon-sm')} Save Goal (+100 XP upon completion)
          </button>
        </div>
      </form>
    `;

    this.openModal(html);

    const form = document.getElementById('form-add-goal');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('goal-title').value;
      const description = document.getElementById('goal-desc').value;
      const category = document.getElementById('goal-category').value;
      const targetDate = document.getElementById('goal-target-date').value;

      window.dataStore.addGoal({
        title,
        description,
        category,
        targetDate
      });

      this.closeModal();
      this.showToast('Bucket list goal added!', 'success');
    });
  }

  openEditGoalModal(goalId) {
    const goal = window.dataStore.getGoalById(goalId);
    if (!goal) return;
    const icons = window.getIcon;

    const html = `
      <div class="modal-header">
        <div class="modal-title-group">
          <h3>Edit Life Goal</h3>
          <p class="modal-subtitle">Refine your vision and timeline</p>
        </div>
        <button class="btn-icon-subtle" onclick="window.dayflowApp.closeModal()">
          ${icons('x', 'icon-sm')}
        </button>
      </div>

      <form id="form-edit-goal" class="modal-form">
        <div class="form-group">
          <label for="edit-goal-title" class="form-label">Goal Title *</label>
          <input
            type="text"
            id="edit-goal-title"
            class="form-control"
            value="${this._escape(goal.title)}"
            required
            maxlength="140"
          />
        </div>

        <div class="form-group">
          <label for="edit-goal-desc" class="form-label">Description</label>
          <textarea
            id="edit-goal-desc"
            class="form-control"
            rows="3"
          >${this._escape(goal.description || '')}</textarea>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="edit-goal-category" class="form-label">Category</label>
            <select id="edit-goal-category" class="form-control">
              <option value="Career" ${goal.category === 'Career' ? 'selected' : ''}>Career</option>
              <option value="Education" ${goal.category === 'Education' ? 'selected' : ''}>Education</option>
              <option value="Personal Growth" ${goal.category === 'Personal Growth' ? 'selected' : ''}>Personal Growth</option>
              <option value="Health & Fitness" ${goal.category === 'Health & Fitness' ? 'selected' : ''}>Health & Fitness</option>
              <option value="Travel" ${goal.category === 'Travel' ? 'selected' : ''}>Travel</option>
              <option value="Financial" ${goal.category === 'Financial' ? 'selected' : ''}>Financial</option>
              <option value="Dreams" ${goal.category === 'Dreams' ? 'selected' : ''}>Dreams</option>
            </select>
          </div>

          <div class="form-group">
            <label for="edit-goal-target-date" class="form-label">Target Completion Date</label>
            <input type="date" id="edit-goal-target-date" class="form-control" value="${goal.targetDate || ''}" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.dayflowApp.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-icon-gap">
            ${icons('check', 'icon-sm')} Save Changes
          </button>
        </div>
      </form>
    `;

    this.openModal(html);

    const form = document.getElementById('form-edit-goal');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('edit-goal-title').value;
      const description = document.getElementById('edit-goal-desc').value;
      const category = document.getElementById('edit-goal-category').value;
      const targetDate = document.getElementById('edit-goal-target-date').value;

      window.dataStore.updateGoal(goalId, {
        title,
        description,
        category,
        targetDate
      });

      this.closeModal();
      this.showToast('Goal updated successfully!', 'success');
    });
  }

  confirmDeleteGoal(goalId) {
    const goal = window.dataStore.getGoalById(goalId);
    if (!goal) return;
    if (confirm(`Delete goal "${goal.title}"?`)) {
      window.dataStore.deleteGoal(goalId);
      this.showToast('Goal deleted', 'info');
    }
  }

  // --- DAILY COMPLETION CELEBRATION MODAL ---
  openCelebrationModal(info) {
    const icons = window.getIcon;
    const celebrationQuote = window.quoteManager.getCelebrationQuote();

    const html = `
      <div class="celebration-modal-wrap text-center animate-bounce-in">
        <div class="celebration-badge-glow">
          ${icons('trophy', 'celebration-trophy-svg')}
        </div>

        <h2 class="celebration-title gradient-text">YOU DID IT!</h2>
        <div class="celebration-pct-banner">100% COMPLETED</div>
        <p class="celebration-subtitle">You conquered everything planned for today!</p>

        <div class="celebration-rewards-grid">
          <div class="celebration-reward-card">
            <span class="rew-icon">${icons('sparkles', 'icon-sm text-purple')}</span>
            <div class="rew-info">
              <span class="rew-val text-purple">+${info.xpEarned || 50} XP</span>
              <span class="rew-lbl">Daily Bonus</span>
            </div>
          </div>

          <div class="celebration-reward-card">
            <span class="rew-icon">${icons('flame', 'icon-sm text-orange')}</span>
            <div class="rew-info">
              <span class="rew-val text-orange">${info.streak || 1} Days</span>
              <span class="rew-lbl">Active Streak</span>
            </div>
          </div>
        </div>

        <div class="celebration-quote-box">
          <p class="celebration-quote-text">“${celebrationQuote}”</p>
        </div>

        <button class="btn btn-primary btn-lg celebration-btn" onclick="window.dayflowApp.closeModal()">
          Keep the Momentum Alive ${icons('arrow-right', 'icon-sm')}
        </button>
      </div>
    `;

    this.openModal(html);
  }

  // --- Toast Notifications ---
  showToast(message, type = 'info') {
    let container = document.getElementById('dayflow-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dayflow-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} animate-slide-up`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-msg">${this._escape(message)}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- PWA Installation & Service Worker ---
  _initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
          .then(registration => {
            console.log('DAYFLOW Service Worker registered with scope:', registration.scope);

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.showToast('DAYFLOW update ready! Refresh to update.', 'info');
                }
              });
            });
          })
          .catch(err => {
            console.warn('DAYFLOW Service Worker registration failed (normal when testing over raw file://):', err);
          });
      });
    }
  }

  _initPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const installBtn = document.getElementById('sidebar-pwa-install');
      if (installBtn) {
        installBtn.style.display = 'flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const installBtn = document.getElementById('sidebar-pwa-install');
      if (installBtn) installBtn.style.display = 'none';
      this.showToast('DAYFLOW installed successfully!', 'success');
    });

    const sidebarInstallBtn = document.getElementById('sidebar-pwa-install');
    if (sidebarInstallBtn) {
      sidebarInstallBtn.addEventListener('click', () => {
        this.promptPwaInstall();
      });
    }
  }

  promptPwaInstall() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.showToast('Installing DAYFLOW...', 'success');
        }
        this.deferredInstallPrompt = null;
      });
    } else {
      // Browser doesn't support or already installed
      alert('To install DAYFLOW on your device:\n\n• On Chrome/Edge: Click the install icon (⬇️) in the address bar or Menu -> "Install DAYFLOW".\n• On Safari/iOS: Tap "Share" -> "Add to Home Screen".\n• On Android: Tap Chrome Menu -> "Install app".');
    }
  }

  _updateNetworkStatus(isOnline) {
    const el = document.getElementById('pwa-network-status');
    if (el) el.textContent = isOnline ? 'Online' : 'Offline';
    this.showToast(isOnline ? 'Back online! Syncing state...' : 'Working offline. All changes saved locally.', isOnline ? 'success' : 'info');
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// Instantiate and start on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.dayflowApp = new DayflowApp();
  window.dayflowApp.init();
});

