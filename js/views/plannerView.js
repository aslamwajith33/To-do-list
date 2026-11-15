// DAYFLOW - Daily Planner View
class PlannerView {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.selectedDate = window.dataStore.getTodayString();
    this.statusFilter = 'all'; // all | pending | completed
    this.categoryFilter = 'all';
    this.priorityFilter = 'all';
    this.searchQuery = '';
  }

  setDate(dateStr) {
    this.selectedDate = dateStr;
    if (this.container) {
      this.render(this.container);
    }
  }

  render(container) {
    this.container = container;
    const store = window.dataStore;
    const icons = window.getIcon;

    const todayStr = store.getTodayString();
    const isToday = this.selectedDate === todayStr;

    // Format selected date
    const dateObj = new Date(this.selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Get tasks for selected date
    const allDateTasks = store.getTasks(this.selectedDate);
    const totalCount = allDateTasks.length;
    const completedCount = allDateTasks.filter(t => t.completed).length;
    const remainingCount = totalCount - completedCount;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Filter tasks
    let filteredTasks = allDateTasks.filter(task => {
      // Search
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Status
      if (this.statusFilter === 'pending' && task.completed) return false;
      if (this.statusFilter === 'completed' && !task.completed) return false;
      // Category
      if (this.categoryFilter !== 'all' && task.category !== this.categoryFilter) return false;
      // Priority
      if (this.priorityFilter !== 'all' && task.priority !== this.priorityFilter) return false;

      return true;
    });

    // Sort: pending first, then by priority (High -> Medium -> Low), then due time
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filteredTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      if (pDiff !== 0) return pDiff;
      if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
      return 0;
    });

    container.innerHTML = `
      <div class="view-content planner-view">
        <!-- Date Header & Navigation -->
        <header class="planner-header">
          <div class="date-navigator-wrap">
            <button class="btn-icon-subtle" id="planner-prev-day" title="Previous Day">
              ${icons('chevron-left', 'icon-sm')}
            </button>
            <div class="date-display">
              <h2 class="current-planner-date">${formattedDate}</h2>
              <div class="date-tag-row">
                ${isToday ? `<span class="badge badge-primary">Today</span>` : `<button class="btn-subtle-link" id="planner-jump-today">Jump to Today</button>`}
                <input type="date" id="planner-date-picker" value="${this.selectedDate}" class="hidden-date-picker" />
                <label for="planner-date-picker" class="date-picker-label" title="Choose date">
                  ${icons('calendar', 'icon-xs')} Pick Date
                </label>
              </div>
            </div>
            <button class="btn-icon-subtle" id="planner-next-day" title="Next Day">
              ${icons('chevron-right', 'icon-sm')}
            </button>
          </div>

          <div class="planner-top-actions">
            <button class="btn btn-primary btn-icon-gap" id="planner-btn-add">
              ${icons('plus', 'icon-sm')} Add Task
            </button>
          </div>
        </header>

        <!-- Progress Summary Card -->
        <section class="card planner-progress-card">
          <div class="progress-stats-row">
            <div class="pstat-item">
              <span class="pstat-label">Total Tasks</span>
              <span class="pstat-val">${totalCount}</span>
            </div>
            <div class="pstat-divider"></div>
            <div class="pstat-item">
              <span class="pstat-label">Completed</span>
              <span class="pstat-val text-emerald">${completedCount}</span>
            </div>
            <div class="pstat-divider"></div>
            <div class="pstat-item">
              <span class="pstat-label">Remaining</span>
              <span class="pstat-val text-amber">${remainingCount}</span>
            </div>
            <div class="pstat-divider"></div>
            <div class="pstat-item">
              <span class="pstat-label">Completion</span>
              <span class="pstat-val text-indigo">${pct}%</span>
            </div>
          </div>

          <div class="planner-progress-bar-wrap">
            <div class="planner-progress-track">
              <div class="planner-progress-fill ${pct === 100 && totalCount > 0 ? 'bg-gradient-success' : 'bg-gradient-primary'}" style="width: ${pct}%;"></div>
            </div>
          </div>
        </section>

        <!-- Filter & Search Toolbar -->
        <section class="planner-toolbar">
          <div class="search-input-wrap">
            ${icons('search', 'search-icon')}
            <input
              type="text"
              id="planner-search"
              placeholder="Search tasks..."
              value="${this._escape(this.searchQuery)}"
            />
            ${this.searchQuery ? `<button class="clear-search-btn" id="planner-clear-search">${icons('x', 'icon-xs')}</button>` : ''}
          </div>

          <div class="filter-controls-group">
            <!-- Status Tabs -->
            <div class="segmented-control">
              <button class="seg-btn ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">All (${totalCount})</button>
              <button class="seg-btn ${this.statusFilter === 'pending' ? 'active' : ''}" data-status="pending">Pending (${remainingCount})</button>
              <button class="seg-btn ${this.statusFilter === 'completed' ? 'active' : ''}" data-status="completed">Done (${completedCount})</button>
            </div>

            <!-- Category Filter -->
            <select id="planner-category-filter" class="form-select-sm">
              <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Personal" ${this.categoryFilter === 'Personal' ? 'selected' : ''}>Personal</option>
              <option value="Study" ${this.categoryFilter === 'Study' ? 'selected' : ''}>Study</option>
              <option value="Career" ${this.categoryFilter === 'Career' ? 'selected' : ''}>Career</option>
              <option value="Project" ${this.categoryFilter === 'Project' ? 'selected' : ''}>Project</option>
              <option value="Fitness" ${this.categoryFilter === 'Fitness' ? 'selected' : ''}>Fitness</option>
              <option value="Other" ${this.categoryFilter === 'Other' ? 'selected' : ''}>Other</option>
            </select>

            <!-- Priority Filter -->
            <select id="planner-priority-filter" class="form-select-sm">
              <option value="all" ${this.priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
              <option value="High" ${this.priorityFilter === 'High' ? 'selected' : ''}>High Priority</option>
              <option value="Medium" ${this.priorityFilter === 'Medium' ? 'selected' : ''}>Medium Priority</option>
              <option value="Low" ${this.priorityFilter === 'Low' ? 'selected' : ''}>Low Priority</option>
            </select>
          </div>
        </section>

        <!-- Tasks List Container -->
        <section class="card planner-list-card">
          <div class="planner-task-items" id="planner-tasks-wrapper">
            ${this._renderTaskItems(filteredTasks)}
          </div>
        </section>
      </div>
    `;

    this._bindEvents(container);
  }

  _renderTaskItems(tasks) {
    if (!tasks || tasks.length === 0) {
      if (this.searchQuery || this.statusFilter !== 'all' || this.categoryFilter !== 'all' || this.priorityFilter !== 'all') {
        return `
          <div class="empty-tasks-placeholder">
            <div class="empty-icon">${window.getIcon('filter', 'icon-lg text-muted')}</div>
            <h4>No tasks match your filters</h4>
            <p>Try resetting your search query or filters to see all tasks.</p>
            <button class="btn btn-secondary btn-sm" id="btn-reset-filters">Reset Filters</button>
          </div>
        `;
      }
      return `
        <div class="empty-tasks-placeholder">
          <div class="empty-icon">${window.getIcon('sparkles', 'icon-lg text-purple')}</div>
          <h4>No tasks for this day</h4>
          <p>Plan your day to stay focused, build momentum, and earn XP points.</p>
          <button class="btn btn-primary btn-sm btn-icon-gap" onclick="window.dayflowApp.openAddTaskModal('${this.selectedDate}')">
            ${window.getIcon('plus', 'icon-sm')} Add Your First Task
          </button>
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
            <div class="task-title-row">
              <span class="task-title">${this._escape(task.title)}</span>
            </div>
            ${task.description ? `<p class="task-desc">${this._escape(task.description)}</p>` : ''}
            <div class="task-meta">
              <span class="badge badge-category badge-cat-${task.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${task.category}</span>
              <span class="badge ${priorityClass}">${task.priority}</span>
              ${task.dueTime ? `<span class="task-due-time">${window.getIcon('clock', 'icon-xs')} ${task.dueTime}</span>` : ''}
              ${task.completed && task.completedAt ? `<span class="task-completed-at">${window.getIcon('check', 'icon-xs')} Done</span>` : ''}
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

  _bindEvents(container) {
    // Prev / Next day buttons
    const prevBtn = container.querySelector('#planner-prev-day');
    const nextBtn = container.querySelector('#planner-next-day');
    const jumpTodayBtn = container.querySelector('#planner-jump-today');
    const datePicker = container.querySelector('#planner-date-picker');
    const addBtn = container.querySelector('#planner-btn-add');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.selectedDate = this._shiftDate(this.selectedDate, -1);
        this.render(container);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.selectedDate = this._shiftDate(this.selectedDate, 1);
        this.render(container);
      });
    }

    if (jumpTodayBtn) {
      jumpTodayBtn.addEventListener('click', () => {
        this.selectedDate = window.dataStore.getTodayString();
        this.render(container);
      });
    }

    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          this.selectedDate = e.target.value;
          this.render(container);
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.dayflowApp.openAddTaskModal(this.selectedDate);
      });
    }

    // Search input
    const searchInput = container.querySelector('#planner-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
      });
    }

    const clearSearch = container.querySelector('#planner-clear-search');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        this.render(container);
      });
    }

    // Status tabs
    const segBtns = container.querySelectorAll('.seg-btn');
    segBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.statusFilter = btn.getAttribute('data-status');
        this.render(container);
      });
    });

    // Category filter
    const catSelect = container.querySelector('#planner-category-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.render(container);
      });
    }

    // Priority filter
    const prioSelect = container.querySelector('#planner-priority-filter');
    if (prioSelect) {
      prioSelect.addEventListener('change', (e) => {
        this.priorityFilter = e.target.value;
        this.render(container);
      });
    }

    // Reset filters button
    const resetFiltersBtn = container.querySelector('#btn-reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.statusFilter = 'all';
        this.categoryFilter = 'all';
        this.priorityFilter = 'all';
        this.render(container);
      });
    }

    // Task Checkboxes, Edit, Delete
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

  _shiftDate(dateStr, offsetDays) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.PlannerView = PlannerView;

