// DAYFLOW - Settings & Data Management View
class SettingsView {
  constructor(app) {
    this.app = app;
    this.container = null;
  }

  render(container) {
    this.container = container;
    const store = window.dataStore;
    const icons = window.getIcon;

    const user = store.getUser();
    const settings = store.getSettings();
    const allTasks = store.getTasks();
    const allGoals = store.getGoals();

    container.innerHTML = `
      <div class="view-content settings-view">
        <!-- Header -->
        <header class="view-header">
          <div class="view-header-titles">
            <h1 class="view-title">
              Settings <span class="gradient-text">&amp; Preferences</span>
            </h1>
            <p class="view-subtitle">Customize your personal profile, audio preferences, and manage your local data backups.</p>
          </div>
        </header>

        <div class="settings-grid">
          <!-- Profile Card -->
          <section class="card settings-card">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Personal Profile</h3>
                <p class="card-subtitle">Personalize greetings and dashboard display</p>
              </div>
            </div>

            <form id="profile-settings-form" class="settings-form">
              <div class="form-group">
                <label for="settings-user-name" class="form-label">Your Name or Alias</label>
                <div class="input-with-icon">
                  ${icons('user', 'input-icon')}
                  <input
                    type="text"
                    id="settings-user-name"
                    class="form-control"
                    value="${this._escape(user.name || 'Ahmed')}"
                    placeholder="Enter your name"
                    maxlength="30"
                    required
                  />
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Save Profile</button>
            </form>
          </section>

          <!-- Audio & Feedback Preferences -->
          <section class="card settings-card">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Audio &amp; Sensations</h3>
                <p class="card-subtitle">Micro-feedback for task completions and milestone celebrations</p>
              </div>
            </div>

            <div class="setting-toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Sound Effects (Web Audio Synthesizer)</span>
                <span class="toggle-desc">Plays subtle pleasant chimes on task completion and celebration fanfares</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="toggle-sound" ${settings.soundEnabled ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="setting-toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Celebration Confetti</span>
                <span class="toggle-desc">Show celebratory visual particles when completing 100% of daily tasks</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="toggle-confetti" ${settings.autoCelebrate ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>
          </section>

          <!-- PWA & Offline Status -->
          <section class="card settings-card">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Progressive Web App (PWA)</h3>
                <p class="card-subtitle">Install DAYFLOW to your desktop dock or mobile home screen</p>
              </div>
            </div>

            <div class="pwa-status-box">
              <div class="pwa-status-row">
                <div class="pwa-status-dot online"></div>
                <span class="pwa-status-text">Network: <strong id="pwa-network-status">${navigator.onLine ? 'Online' : 'Offline'}</strong></span>
                <span class="badge badge-success" style="margin-left: auto;">100% Offline Ready</span>
              </div>
              <p class="pwa-status-desc">
                DAYFLOW uses Service Workers and LocalStorage to run anywhere without internet connectivity.
              </p>
              <div class="pwa-action-row" style="margin-top: 14px;">
                <button class="btn btn-primary btn-sm btn-icon-gap" id="settings-pwa-install-btn">
                  ${icons('download', 'icon-sm')} Install Application
                </button>
              </div>
            </div>
          </section>

          <!-- Data Backup & Portability -->
          <section class="card settings-card">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3>Data Portability &amp; Backups</h3>
                <p class="card-subtitle">All your data is 100% stored on your local device. Export or restore at any time.</p>
              </div>
            </div>

            <div class="data-stats-summary">
              <span><strong>${allTasks.length}</strong> Tasks saved</span> &bull;
              <span><strong>${allGoals.length}</strong> Bucket goals</span> &bull;
              <span><strong>${user.xp || 0}</strong> Total XP</span>
            </div>

            <div class="settings-actions-group">
              <button class="btn btn-secondary btn-icon-gap" id="btn-export-data">
                ${icons('download', 'icon-sm')} Export JSON Backup
              </button>

              <label class="btn btn-secondary btn-icon-gap file-upload-btn" for="input-import-json">
                ${icons('upload', 'icon-sm')} Import Backup JSON
                <input type="file" id="input-import-json" accept=".json" style="display: none;" />
              </label>
            </div>

            <div class="sample-data-section">
              <p class="text-muted-sm">Looking to test or preview with pre-populated activity and goals?</p>
              <button class="btn btn-outline-primary btn-sm btn-icon-gap" id="btn-load-sample-data">
                ${icons('sparkles', 'icon-sm')} Load Sample Data
              </button>
            </div>
          </section>

          <!-- Danger Zone: Reset Data -->
          <section class="card settings-card card-danger-zone">
            <div class="card-header-clean">
              <div class="card-title-group">
                <h3 class="text-danger">Danger Zone</h3>
                <p class="card-subtitle">Permanent data deletion cannot be undone</p>
              </div>
            </div>

            <p class="text-muted-sm">
              Erase all tasks, streak records, bucket goals, and earned XP points, resetting DAYFLOW to initial state.
            </p>

            <button class="btn btn-danger btn-sm btn-icon-gap" id="btn-reset-all-data" style="margin-top: 12px;">
              ${icons('trash-2', 'icon-sm')} Reset All Data
            </button>
          </section>
        </div>
      </div>
    `;

    this._bindEvents(container);
  }

  _bindEvents(container) {
    const store = window.dataStore;

    // Profile form
    const profileForm = container.querySelector('#profile-settings-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = container.querySelector('#settings-user-name');
        const newName = (nameInput.value || '').trim() || 'Ahmed';
        store.updateUser({ name: newName });
        store.updateSettings({ userName: newName });
        window.dayflowApp.showToast('Profile updated successfully!', 'success');
        window.dayflowApp.updateSidebarUser();
      });
    }

    // Sound toggle
    const soundToggle = container.querySelector('#toggle-sound');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        store.updateSettings({ soundEnabled: e.target.checked });
        if (window.audioManager) {
          window.audioManager.enabled = e.target.checked;
          if (e.target.checked) window.audioManager.playClick();
        }
        window.dayflowApp.showToast(`Sound effects ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    // Confetti toggle
    const confettiToggle = container.querySelector('#toggle-confetti');
    if (confettiToggle) {
      confettiToggle.addEventListener('change', (e) => {
        store.updateSettings({ autoCelebrate: e.target.checked });
        window.dayflowApp.showToast(`Celebration effects ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    // PWA Install Button
    const pwaBtn = container.querySelector('#settings-pwa-install-btn');
    if (pwaBtn) {
      pwaBtn.addEventListener('click', () => {
        window.dayflowApp.promptPwaInstall();
      });
    }

    // Export Data Button
    const exportBtn = container.querySelector('#btn-export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = store.exportAllData();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const today = store.getTodayString();
        a.href = url;
        a.download = `dayflow-backup-${today}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.dayflowApp.showToast('Backup exported successfully!', 'success');
      });
    }

    // Import Data Input
    const importInput = container.querySelector('#input-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = store.importData(event.target.result);
          if (res.success) {
            window.dayflowApp.showToast('Data imported successfully!', 'success');
            window.dayflowApp.refreshCurrentView();
            window.dayflowApp.updateSidebarUser();
          } else {
            window.dayflowApp.showToast(`Import error: ${res.error}`, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Sample Data Button
    const sampleBtn = container.querySelector('#btn-load-sample-data');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        if (confirm('Load demo sample data? This will add realistic tasks, past streak history, and bucket list goals.')) {
          store.loadSampleData();
          window.dayflowApp.showToast('Sample data loaded!', 'success');
          window.dayflowApp.refreshCurrentView();
          window.dayflowApp.updateSidebarUser();
        }
      });
    }

    // Reset Data Button
    const resetBtn = container.querySelector('#btn-reset-all-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you ABSOLUTELY sure? This will delete ALL tasks, streaks, bucket goals, and XP points. This action cannot be undone!')) {
          if (confirm('Final confirmation: Click OK to completely wipe local data.')) {
            store.resetAllData();
            window.dayflowApp.showToast('All data has been reset to defaults.', 'info');
            window.dayflowApp.refreshCurrentView();
            window.dayflowApp.updateSidebarUser();
          }
        }
      });
    }
  }

  _escape(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

window.SettingsView = SettingsView;

