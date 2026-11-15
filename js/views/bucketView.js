// DAYFLOW - Bucket List View (Long-Term Life Goals)
class BucketView {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.statusFilter = 'all'; // all | pending | completed
    this.categoryFilter = 'all';
    this.searchQuery = '';
  }

  render(container) {
    this.container = container;
    const store = window.dataStore;
    const icons = window.getIcon;

    const allGoals = store.getGoals();
    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter(g => g.completed).length;
    const pendingGoals = totalGoals - completedGoals;
    const progressPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Filter goals
    let filteredGoals = allGoals.filter(g => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesDesc = (g.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (this.statusFilter === 'pending' && g.completed) return false;
      if (this.statusFilter === 'completed' && !g.completed) return false;
      if (this.categoryFilter !== 'all' && g.category !== this.categoryFilter) return false;
      return true;
    });

    // Sort: pending first, then by target date
    filteredGoals.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      return 0;
    });

    container.innerHTML = `
      <div class="view-content bucket-view">
        <!-- Header -->
        <header class="view-header">
          <div class="view-header-titles">
            <h1 class="view-title">
              Bucket List <span class="gradient-text">&amp; Long-Term Vision</span>
            </h1>
            <p class="view-subtitle">Define your biggest dreams, career milestones, and life aspirations.</p>
          </div>
          <button class="btn btn-primary btn-icon-gap" id="bucket-btn-add">
            ${icons('plus', 'icon-sm')} Add Life Goal
          </button>
        </header>

        <!-- Stats Overview Banner -->
        <section class="card bucket-stats-card">
          <div class="bucket-stats-grid">
            <div class="bstat-item">
              <span class="bstat-icon-wrap icon-purple">${icons('target', 'icon-md')}</span>
              <div>
                <span class="bstat-num">${totalGoals}</span>
                <span class="bstat-text">Total Goals</span>
              </div>
            </div>
            <div class="bstat-item">
              <span class="bstat-icon-wrap icon-emerald">${icons('check-circle-2', 'icon-md')}</span>
              <div>
                <span class="bstat-num text-emerald">${completedGoals}</span>
                <span class="bstat-text">Achieved</span>
              </div>
            </div>
            <div class="bstat-item">
              <span class="bstat-icon-wrap icon-amber">${icons('clock', 'icon-md')}</span>
              <div>
                <span class="bstat-num text-amber">${pendingGoals}</span>
                <span class="bstat-text">In Pursuit</span>
              </div>
            </div>
            <div class="bstat-item">
              <span class="bstat-icon-wrap icon-indigo">${icons('trending-up', 'icon-md')}</span>
              <div>
                <span class="bstat-num text-indigo">${progressPct}%</span>
                <span class="bstat-text">Life Progress</span>
              </div>
            </div>
          </div>

          <div class="bucket-progress-bar-wrap">
            <div class="bucket-progress-track">
              <div class="bucket-progress-fill bg-gradient-primary" style="width: ${progressPct}%;"></div>
            </div>
          </div>
        </section>

        <!-- Toolbar & Filters -->
        <section class="planner-toolbar">
          <div class="search-input-wrap">
            ${icons('search', 'search-icon')}
            <input
              type="text"
              id="bucket-search"
              placeholder="Search goals..."
              value="${this._escape(this.searchQuery)}"
            />
            ${this.searchQuery ? `<button class="clear-search-btn" id="bucket-clear-search">${icons('x', 'icon-xs')}</button>` : ''}
          </div>

          <div class="filter-controls-group">
            <div class="segmented-control">
              <button class="seg-btn ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">All (${totalGoals})</button>
              <button class="seg-btn ${this.statusFilter === 'pending' ? 'active' : ''}" data-status="pending">In Pursuit (${pendingGoals})</button>
              <button class="seg-btn ${this.statusFilter === 'completed' ? 'active' : ''}" data-status="completed">Achieved (${completedGoals})</button>
            </div>

            <select id="bucket-category-filter" class="form-select-sm">
              <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Career" ${this.categoryFilter === 'Career' ? 'selected' : ''}>Career</option>
              <option value="Education" ${this.categoryFilter === 'Education' ? 'selected' : ''}>Education</option>
              <option value="Personal Growth" ${this.categoryFilter === 'Personal Growth' ? 'selected' : ''}>Personal Growth</option>
              <option value="Health & Fitness" ${this.categoryFilter === 'Health & Fitness' ? 'selected' : ''}>Health & Fitness</option>
              <option value="Travel" ${this.categoryFilter === 'Travel' ? 'selected' : ''}>Travel</option>
              <option value="Financial" ${this.categoryFilter === 'Financial' ? 'selected' : ''}>Financial</option>
              <option value="Dreams" ${this.categoryFilter === 'Dreams' ? 'selected' : ''}>Dreams</option>
            </select>
          </div>
        </header>

        <!-- Goals Cards Grid -->
        <section class="bucket-cards-grid">
          ${this._renderGoalsGrid(filteredGoals)}
        </section>
      </div>
    `;

    this._bindEvents(container);
  }

  _renderGoalsGrid(goals) {
    if (!goals || goals.length === 0) {
      return `
        <div class="card empty-goals-box" style="grid-column: 1 / -1; padding: 48px; text-align: center;">
          <div class="empty-icon">${window.getIcon('target', 'icon-lg text-purple')}</div>
          <h3>No goals in this view</h3>
          <p>“A goal without a timeline is just a dream.” Add your long-term aspirations now!</p>
          <button class="btn btn-primary btn-sm btn-icon-gap" id="bucket-empty-add-btn" style="margin-top: 14px;">
            ${window.getIcon('plus', 'icon-sm')} Add Life Goal
          </button>
        </div>
      `;
    }

    return goals.map(goal => {
      const isAchieved = goal.completed;
      const catClass = `badge-cat-${goal.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      let targetDateFormatted = 'No target date';
      if (goal.targetDate) {
        const parts = goal.targetDate.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          targetDateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
          targetDateFormatted = goal.targetDate;
        }
      }

      return `
        <div class="card goal-card ${isAchieved ? 'achieved' : ''}" data-goal-id="${goal.id}">
          <div class="goal-card-top">
            <span class="badge badge-category ${catClass}">${goal.category}</span>
            <div class="goal-action-btns">
              <button class="btn-icon-subtle btn-edit-goal" data-id="${goal.id}" title="Edit Goal">
                ${window.getIcon('edit-3', 'icon-xs')}
              </button>
              <button class="btn-icon-subtle text-danger btn-delete-goal" data-id="${goal.id}" title="Delete Goal">
                ${window.getIcon('trash-2', 'icon-xs')}
              </button>
            </div>
          </div>

          <h3 class="goal-title">${this._escape(goal.title)}</h3>
          ${goal.description ? `<p class="goal-desc">${this._escape(goal.description)}</p>` : ''}

          <div class="goal-card-bottom">
            <div class="goal-date-indicator">
              ${window.getIcon('calendar', 'icon-xs')}
              <span>Target: ${targetDateFormatted}</span>
            </div>

            <button class="btn btn-sm ${isAchieved ? 'btn-success-soft' : 'btn-outline-primary'} btn-toggle-goal" data-id="${goal.id}">
              ${isAchieved ? `${window.getIcon('check-circle-2', 'icon-xs')} Achieved (+100 XP)` : `${window.getIcon('circle', 'icon-xs')} Mark Achieved`}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  _bindEvents(container) {
    const addBtn = container.querySelector('#bucket-btn-add');
    const emptyAddBtn = container.querySelector('#bucket-empty-add-btn');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.dayflowApp.openAddGoalModal();
      });
    }

    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => {
        window.dayflowApp.openAddGoalModal();
      });
    }

    // Search
    const searchInput = container.querySelector('#bucket-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
      });
    }

    const clearSearch = container.querySelector('#bucket-clear-search');
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
    const catSelect = container.querySelector('#bucket-category-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.render(container);
      });
    }

    // Goal item buttons (Toggle, Edit, Delete)
    const toggleBtns = container.querySelectorAll('.btn-toggle-goal');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const toggledGoal = window.dataStore.toggleGoal(id);
        if (toggledGoal) {
          window.gamificationEngine.handleGoalToggled(toggledGoal);
        }
      });
    });

    const editBtns = container.querySelectorAll('.btn-edit-goal');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.dayflowApp.openEditGoalModal(id);
      });
    });

    const deleteBtns = container.querySelectorAll('.btn-delete-goal');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.dayflowApp.confirmDeleteGoal(id);
      });
    });
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.BucketView = BucketView;

