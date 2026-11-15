// DAYFLOW - Robust LocalStorage State Manager
class DataStore {
  constructor() {
    this.STORAGE_KEYS = {
      TASKS: 'dayflow_tasks_v1',
      BUCKET: 'dayflow_bucket_v1',
      USER: 'dayflow_user_v1',
      HISTORY: 'dayflow_history_v1',
      XP_LOG: 'dayflow_xp_log_v1',
      SETTINGS: 'dayflow_settings_v1'
    };

    this.subscribers = [];
    this._initDefaults();
  }

  // Subscribe to changes
  subscribe(fn) {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== fn);
    };
  }

  notify(event, payload) {
    this.subscribers.forEach(fn => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error('Subscriber notification error:', err);
      }
    });
  }

  _safeGet(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      console.warn(`Failed reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  _safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Failed writing ${key} to localStorage:`, e);
      return false;
    }
  }

  _initDefaults() {
    // User profile
    if (!this._safeGet(this.STORAGE_KEYS.USER, null)) {
      this._safeSet(this.STORAGE_KEYS.USER, {
        name: 'Ahmed',
        xp: 0,
        streak: 0,
        longestStreak: 0,
        unlockedBadges: [],
        lastCelebratedDate: null,
        createdAt: new Date().toISOString()
      });
    }

    // Settings
    if (!this._safeGet(this.STORAGE_KEYS.SETTINGS, null)) {
      this._safeSet(this.STORAGE_KEYS.SETTINGS, {
        userName: 'Ahmed',
        soundEnabled: true,
        theme: 'dark-navy',
        showMotivationalQuotes: true,
        autoCelebrate: true
      });
    }

    // Arrays
    if (!this._safeGet(this.STORAGE_KEYS.TASKS, null)) {
      this._safeSet(this.STORAGE_KEYS.TASKS, []);
    }
    if (!this._safeGet(this.STORAGE_KEYS.BUCKET, null)) {
      this._safeSet(this.STORAGE_KEYS.BUCKET, []);
    }
    if (!this._safeGet(this.STORAGE_KEYS.HISTORY, null)) {
      this._safeSet(this.STORAGE_KEYS.HISTORY, {});
    }
    if (!this._safeGet(this.STORAGE_KEYS.XP_LOG, null)) {
      this._safeSet(this.STORAGE_KEYS.XP_LOG, []);
    }
  }

  // --- Date Helpers ---
  getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- Task Operations ---
  getTasks(dateStr = null) {
    const all = this._safeGet(this.STORAGE_KEYS.TASKS, []);
    if (!dateStr) return all;
    return all.filter(t => t.date === dateStr);
  }

  getTaskById(id) {
    const all = this._safeGet(this.STORAGE_KEYS.TASKS, []);
    return all.find(t => t.id === id) || null;
  }

  addTask(taskData) {
    const all = this._safeGet(this.STORAGE_KEYS.TASKS, []);
    const date = taskData.date || this.getTodayString();
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: (taskData.title || '').trim(),
      description: (taskData.description || '').trim(),
      category: taskData.category || 'Personal',
      priority: taskData.priority || 'Medium',
      dueTime: taskData.dueTime || '',
      date: date,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    all.push(newTask);
    this._safeSet(this.STORAGE_KEYS.TASKS, all);
    this.notify('task:added', newTask);
    return newTask;
  }

  updateTask(id, updates) {
    const all = this._safeGet(this.STORAGE_KEYS.TASKS, []);
    const index = all.findIndex(t => t.id === id);
    if (index === -1) return null;

    all[index] = { ...all[index], ...updates };
    this._safeSet(this.STORAGE_KEYS.TASKS, all);
    this.notify('task:updated', all[index]);
    return all[index];
  }

  deleteTask(id) {
    const all = this._safeGet(this.STORAGE_KEYS.TASKS, []);
    const taskToDelete = all.find(t => t.id === id);
    if (!taskToDelete) return false;

    const filtered = all.filter(t => t.id !== id);
    this._safeSet(this.STORAGE_KEYS.TASKS, filtered);
    this.notify('task:deleted', taskToDelete);
    return true;
  }

  toggleTask(id) {
    const all = this._safeGet(this.STORAGE_KEYS.TASKS, []);
    const task = all.find(t => t.id === id);
    if (!task) return null;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    this._safeSet(this.STORAGE_KEYS.TASKS, all);
    this.notify('task:toggled', task);
    return task;
  }

  // --- Bucket List Operations ---
  getGoals() {
    return this._safeGet(this.STORAGE_KEYS.BUCKET, []);
  }

  getGoalById(id) {
    const all = this._safeGet(this.STORAGE_KEYS.BUCKET, []);
    return all.find(g => g.id === id) || null;
  }

  addGoal(goalData) {
    const all = this._safeGet(this.STORAGE_KEYS.BUCKET, []);
    const newGoal = {
      id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: (goalData.title || '').trim(),
      description: (goalData.description || '').trim(),
      category: goalData.category || 'Career',
      targetDate: goalData.targetDate || '',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    all.push(newGoal);
    this._safeSet(this.STORAGE_KEYS.BUCKET, all);
    this.notify('goal:added', newGoal);
    return newGoal;
  }

  updateGoal(id, updates) {
    const all = this._safeGet(this.STORAGE_KEYS.BUCKET, []);
    const idx = all.findIndex(g => g.id === id);
    if (idx === -1) return null;

    all[idx] = { ...all[idx], ...updates };
    this._safeSet(this.STORAGE_KEYS.BUCKET, all);
    this.notify('goal:updated', all[idx]);
    return all[idx];
  }

  deleteGoal(id) {
    const all = this._safeGet(this.STORAGE_KEYS.BUCKET, []);
    const goalToDelete = all.find(g => g.id === id);
    if (!goalToDelete) return false;

    const filtered = all.filter(g => g.id !== id);
    this._safeSet(this.STORAGE_KEYS.BUCKET, filtered);
    this.notify('goal:deleted', goalToDelete);
    return true;
  }

  toggleGoal(id) {
    const all = this._safeGet(this.STORAGE_KEYS.BUCKET, []);
    const goal = all.find(g => g.id === id);
    if (!goal) return null;

    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date().toISOString() : null;
    this._safeSet(this.STORAGE_KEYS.BUCKET, all);
    this.notify('goal:toggled', goal);
    return goal;
  }

  // --- User Profile & XP ---
  getUser() {
    return this._safeGet(this.STORAGE_KEYS.USER, {
      name: 'Ahmed',
      xp: 0,
      streak: 0,
      longestStreak: 0,
      unlockedBadges: [],
      lastCelebratedDate: null
    });
  }

  updateUser(updates) {
    const current = this.getUser();
    const updated = { ...current, ...updates };
    this._safeSet(this.STORAGE_KEYS.USER, updated);
    this.notify('user:updated', updated);
    return updated;
  }

  // XP Management
  addXp(amount, reason, relatedId = null) {
    if (amount <= 0) return this.getUser();
    const user = this.getUser();
    const newTotal = (user.xp || 0) + amount;
    user.xp = newTotal;
    this._safeSet(this.STORAGE_KEYS.USER, user);

    const logs = this._safeGet(this.STORAGE_KEYS.XP_LOG, []);
    const logEntry = {
      id: 'xp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: this.getTodayString(),
      timestamp: new Date().toISOString(),
      reason: reason,
      amount: amount,
      newTotal: newTotal,
      relatedId: relatedId
    };
    logs.unshift(logEntry); // latest first
    // keep maximum 200 logs
    if (logs.length > 200) logs.pop();
    this._safeSet(this.STORAGE_KEYS.XP_LOG, logs);

    this.notify('xp:changed', { amount, reason, newTotal, log: logEntry });
    return user;
  }

  reverseXp(amount, reason, relatedId = null) {
    if (amount <= 0) return this.getUser();
    const user = this.getUser();
    const newTotal = Math.max(0, (user.xp || 0) - amount);
    user.xp = newTotal;
    this._safeSet(this.STORAGE_KEYS.USER, user);

    const logs = this._safeGet(this.STORAGE_KEYS.XP_LOG, []);
    const logEntry = {
      id: 'xp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: this.getTodayString(),
      timestamp: new Date().toISOString(),
      reason: reason,
      amount: -amount,
      newTotal: newTotal,
      relatedId: relatedId
    };
    logs.unshift(logEntry);
    if (logs.length > 200) logs.pop();
    this._safeSet(this.STORAGE_KEYS.XP_LOG, logs);

    this.notify('xp:changed', { amount: -amount, reason, newTotal, log: logEntry });
    return user;
  }

  getXpLogs() {
    return this._safeGet(this.STORAGE_KEYS.XP_LOG, []);
  }

  hasCelebratedDate(dateStr) {
    const user = this.getUser();
    return user.lastCelebratedDate === dateStr;
  }

  setCelebratedDate(dateStr) {
    const user = this.getUser();
    user.lastCelebratedDate = dateStr;
    this._safeSet(this.STORAGE_KEYS.USER, user);
  }

  resetCelebratedDateIf(dateStr) {
    const user = this.getUser();
    if (user.lastCelebratedDate === dateStr) {
      user.lastCelebratedDate = null;
      this._safeSet(this.STORAGE_KEYS.USER, user);
    }
  }

  // --- Day History Tracking ---
  getDayHistory(dateStr) {
    const history = this._safeGet(this.STORAGE_KEYS.HISTORY, {});
    return history[dateStr] || null;
  }

  getAllHistory() {
    return this._safeGet(this.STORAGE_KEYS.HISTORY, {});
  }

  setDayHistory(dateStr, isCompleted, totalTasks, completedTasks) {
    const history = this._safeGet(this.STORAGE_KEYS.HISTORY, {});
    history[dateStr] = {
      completed: !!isCompleted,
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      updatedAt: new Date().toISOString()
    };
    this._safeSet(this.STORAGE_KEYS.HISTORY, history);
    this.notify('history:updated', { dateStr, data: history[dateStr] });
    return history[dateStr];
  }

  // --- Settings ---
  getSettings() {
    return this._safeGet(this.STORAGE_KEYS.SETTINGS, {
      userName: 'Ahmed',
      soundEnabled: true,
      theme: 'dark-navy',
      showMotivationalQuotes: true,
      autoCelebrate: true
    });
  }

  updateSettings(updates) {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this._safeSet(this.STORAGE_KEYS.SETTINGS, updated);
    this.notify('settings:updated', updated);
    return updated;
  }

  // --- Import / Export / Reset ---
  exportAllData() {
    const exportObject = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      settings: this.getSettings(),
      tasks: this._safeGet(this.STORAGE_KEYS.TASKS, []),
      bucket: this._safeGet(this.STORAGE_KEYS.BUCKET, []),
      history: this._safeGet(this.STORAGE_KEYS.HISTORY, {}),
      xpLog: this._safeGet(this.STORAGE_KEYS.XP_LOG, [])
    };
    return JSON.stringify(exportObject, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      if (data.user) this._safeSet(this.STORAGE_KEYS.USER, data.user);
      if (data.settings) this._safeSet(this.STORAGE_KEYS.SETTINGS, data.settings);
      if (Array.isArray(data.tasks)) this._safeSet(this.STORAGE_KEYS.TASKS, data.tasks);
      if (Array.isArray(data.bucket)) this._safeSet(this.STORAGE_KEYS.BUCKET, data.bucket);
      if (data.history && typeof data.history === 'object') this._safeSet(this.STORAGE_KEYS.HISTORY, data.history);
      if (Array.isArray(data.xpLog)) this._safeSet(this.STORAGE_KEYS.XP_LOG, data.xpLog);

      this.notify('data:imported', true);
      return { success: true };
    } catch (err) {
      console.error('Import failed:', err);
      return { success: false, error: err.message };
    }
  }

  resetAllData() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      this._initDefaults();
      this.notify('data:reset', true);
      return true;
    } catch (e) {
      console.error('Reset failed:', e);
      return false;
    }
  }

  loadSampleData() {
    const today = this.getTodayString();
    
    // Create dates for past 10 days
    const pastDates = [];
    for (let i = 9; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      pastDates.push(this.formatDateKey(d));
    }

    // Sample tasks
    const sampleTasks = [
      // Today's tasks (interactive mix)
      {
        id: 'sample_t1',
        title: 'Review VLSI Digital Design Lecture 4',
        description: 'Read through static timing analysis slides and take notes on setup/hold times.',
        category: 'Study',
        priority: 'High',
        dueTime: '10:00',
        date: today,
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
      },
      {
        id: 'sample_t2',
        title: 'Complete 45-min gym workout & cardio',
        description: 'Chest & Triceps workout, 15 minutes of zone 2 cycling.',
        category: 'Fitness',
        priority: 'Medium',
        dueTime: '17:30',
        date: today,
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString()
      },
      {
        id: 'sample_t3',
        title: 'Refactor DAYFLOW PWA offline caching logic',
        description: 'Test service worker cache-first strategy on local HTTPS/localhost.',
        category: 'Project',
        priority: 'High',
        dueTime: '20:00',
        date: today,
        completed: false,
        completedAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'sample_t4',
        title: 'Read 20 pages of "Atomic Habits"',
        description: 'Chapter on building visual cue environments.',
        category: 'Personal',
        priority: 'Low',
        dueTime: '22:00',
        date: today,
        completed: false,
        completedAt: null,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];

    // Prepopulate past 5 days with 100% completion to establish a strong active streak
    const sampleHistory = {};
    pastDates.slice(-5).forEach((dateStr, idx) => {
      sampleHistory[dateStr] = {
        completed: true,
        totalTasks: 3,
        completedTasks: 3,
        updatedAt: `${dateStr}T21:00:00.000Z`
      };
      sampleTasks.push(
        {
          id: `past_t_${idx}_1`,
          title: `Daily Focus Block: Embedded C Programming`,
          description: 'Finished interrupt service routines lab.',
          category: 'Study',
          priority: 'High',
          dueTime: '11:00',
          date: dateStr,
          completed: true,
          completedAt: `${dateStr}T11:45:00.000Z`,
          createdAt: `${dateStr}T08:00:00.000Z`
        },
        {
          id: `past_t_${idx}_2`,
          title: `30-minute evening run & stretch`,
          description: 'Outdoor jog around the lake.',
          category: 'Fitness',
          priority: 'Medium',
          dueTime: '18:00',
          date: dateStr,
          completed: true,
          completedAt: `${dateStr}T18:35:00.000Z`,
          createdAt: `${dateStr}T08:00:00.000Z`
        },
        {
          id: `past_t_${idx}_3`,
          title: `Daily journal & reflection`,
          description: 'Wrote 3 wins and tomorrow goals.',
          category: 'Personal',
          priority: 'Low',
          dueTime: '21:30',
          date: dateStr,
          completed: true,
          completedAt: `${dateStr}T21:40:00.000Z`,
          createdAt: `${dateStr}T08:00:00.000Z`
        }
      );
    });

    // Sample Bucket List Goals
    const sampleGoals = [
      {
        id: 'sample_g1',
        title: 'Get my first core VLSI / Hardware Engineering Internship',
        description: 'Master Verilog/SystemVerilog, digital design concepts, and pass technical interview rounds.',
        category: 'Career',
        targetDate: '2027-04-30',
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample_g2',
        title: 'Complete comprehensive GATE preparation & score in top 1%',
        description: 'Finish all syllabus modules, solve 15 years of previous question papers.',
        category: 'Education',
        targetDate: '2027-02-15',
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample_g3',
        title: 'Build a successful IoT / Embedded hardware startup product',
        description: 'Design custom PCB, prototype firmware, and launch a beta pilot.',
        category: 'Dreams',
        targetDate: '2027-12-31',
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample_g4',
        title: 'Run a full 21km Half Marathon',
        description: 'Build weekly running base up to 35km and finish under 2 hours.',
        category: 'Health & Fitness',
        targetDate: '2027-06-20',
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sample_g5',
        title: 'Read 24 life-changing non-fiction books in one year',
        description: 'Books on mental models, behavioral psychology, and systems thinking.',
        category: 'Personal Growth',
        targetDate: '2026-12-31',
        completed: true,
        completedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString()
      }
    ];

    // Sample XP Log
    const sampleXpLogs = [
      { id: 'xp_init_1', date: today, timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), reason: 'Completed task: Review VLSI Digital Design Lecture 4', amount: 10, newTotal: 485 },
      { id: 'xp_init_2', date: today, timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), reason: 'Completed task: Complete 45-min gym workout & cardio', amount: 10, newTotal: 495 },
      { id: 'xp_init_3', date: pastDates[pastDates.length - 1], timestamp: `${pastDates[pastDates.length - 1]}T21:40:00.000Z`, reason: 'Daily Completion Bonus (All tasks done!)', amount: 50, newTotal: 475 },
      { id: 'xp_init_4', date: pastDates[pastDates.length - 2], timestamp: `${pastDates[pastDates.length - 2]}T21:40:00.000Z`, reason: '3-Day Streak Consistency Milestone', amount: 25, newTotal: 395 },
      { id: 'xp_init_5', date: pastDates[pastDates.length - 3], timestamp: `${pastDates[pastDates.length - 3]}T21:40:00.000Z`, reason: 'Completed bucket list goal: Read 24 non-fiction books', amount: 100, newTotal: 340 }
    ];

    this._safeSet(this.STORAGE_KEYS.TASKS, sampleTasks);
    this._safeSet(this.STORAGE_KEYS.BUCKET, sampleGoals);
    this._safeSet(this.STORAGE_KEYS.HISTORY, sampleHistory);
    this._safeSet(this.STORAGE_KEYS.XP_LOG, sampleXpLogs);
    this._safeSet(this.STORAGE_KEYS.USER, {
      name: 'Ahmed',
      xp: 495,
      streak: 5,
      longestStreak: 5,
      unlockedBadges: ['badge_first_step', 'badge_streak_3', 'badge_goal_1'],
      lastCelebratedDate: pastDates[pastDates.length - 1],
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
    });

    this.notify('data:sample_loaded', true);
  }
}

window.dataStore = new DataStore();

