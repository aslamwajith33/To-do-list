// DAYFLOW - Gamification, Streaks, XP and Badge Engine
class GamificationEngine {
  constructor(store) {
    this.store = store;
    this.XP_CONFIG = {
      TASK_COMPLETE: 10,
      DAY_COMPLETE_BONUS: 50,
      BUCKET_GOAL_COMPLETE: 100,
      MILESTONES: {
        3: 25,
        7: 50,
        15: 100,
        30: 250
      }
    };

    this.LEVELS = [
      { level: 1, title: 'Novice', minXp: 0, maxXp: 99 },
      { level: 2, title: 'Apprentice', minXp: 100, maxXp: 249 },
      { level: 3, title: 'Practitioner', minXp: 250, maxXp: 499 },
      { level: 4, title: 'Achiever', minXp: 500, maxXp: 999 },
      { level: 5, title: 'Focus Master', minXp: 1000, maxXp: 1999 },
      { level: 6, title: 'Discipline Warrior', minXp: 2000, maxXp: 3499 },
      { level: 7, title: 'Flow Champion', minXp: 3500, maxXp: 5499 },
      { level: 8, title: 'Productivity Legend', minXp: 5500, maxXp: Infinity }
    ];

    this.BADGES = [
      {
        id: 'badge_first_step',
        title: 'First Step',
        description: 'Complete your first task',
        icon: 'zap',
        color: '#6366f1',
        xpReward: 25,
        check: (stats) => stats.totalTasksCompleted >= 1
      },
      {
        id: 'badge_streak_3',
        title: 'Consistency Starter',
        description: 'Complete 3 consecutive days',
        icon: 'flame',
        color: '#f59e0b',
        xpReward: 25,
        check: (stats) => stats.streak >= 3 || stats.longestStreak >= 3
      },
      {
        id: 'badge_streak_7',
        title: 'One Week Warrior',
        description: 'Complete 7 consecutive days',
        icon: 'trophy',
        color: '#ec4899',
        xpReward: 50,
        check: (stats) => stats.streak >= 7 || stats.longestStreak >= 7
      },
      {
        id: 'badge_streak_15',
        title: 'Discipline Master',
        description: 'Complete 15 consecutive days',
        icon: 'shield-check',
        color: '#8b5cf6',
        xpReward: 100,
        check: (stats) => stats.streak >= 15 || stats.longestStreak >= 15
      },
      {
        id: 'badge_streak_30',
        title: '30-Day Champion',
        description: 'Complete 30 consecutive days',
        icon: 'award',
        color: '#06b6d4',
        xpReward: 250,
        check: (stats) => stats.streak >= 30 || stats.longestStreak >= 30
      },
      {
        id: 'badge_tasks_25',
        title: 'Task Crusher',
        description: 'Complete 25 total tasks',
        icon: 'check-circle-2',
        color: '#10b981',
        xpReward: 50,
        check: (stats) => stats.totalTasksCompleted >= 25
      },
      {
        id: 'badge_tasks_100',
        title: 'Centurion',
        description: 'Complete 100 total tasks',
        icon: 'star',
        color: '#eab308',
        xpReward: 150,
        check: (stats) => stats.totalTasksCompleted >= 100
      },
      {
        id: 'badge_goal_1',
        title: 'Goal Getter',
        description: 'Complete your first bucket list goal',
        icon: 'target',
        color: '#3b82f6',
        xpReward: 50,
        check: (stats) => stats.totalGoalsCompleted >= 1
      },
      {
        id: 'badge_early_bird',
        title: 'Early Bird',
        description: 'Complete a task before 9:00 AM',
        icon: 'sparkles',
        color: '#f97316',
        xpReward: 25,
        check: (stats) => stats.hasEarlyTask
      }
    ];

    this.onCelebrationTriggered = null;
    this.onBadgeUnlocked = null;
  }

  // --- Streak Calculations ---
  calculateStreaks() {
    const history = this.store.getAllHistory();
    const today = this.store.getTodayString();

    // Check today's tasks directly from tasks store for accurate live state
    const todayTasks = this.store.getTasks(today);
    const todayCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed);

    // Build sorted array of completed dates (YYYY-MM-DD)
    const completedDatesSet = new Set();
    Object.entries(history).forEach(([dateStr, record]) => {
      if (record && record.completed) {
        completedDatesSet.add(dateStr);
      }
    });

    if (todayCompleted) {
      completedDatesSet.add(today);
    } else {
      completedDatesSet.delete(today);
    }

    // Helper: previous day string
    const getPrevDay = (dateStr) => {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = today;

    if (completedDatesSet.has(today)) {
      // Today is completed, count starting from today
      while (completedDatesSet.has(checkDate)) {
        currentStreak++;
        checkDate = getPrevDay(checkDate);
      }
    } else {
      // Today is not yet completed, but check if streak was active as of yesterday
      const yesterday = getPrevDay(today);
      checkDate = yesterday;
      while (completedDatesSet.has(checkDate)) {
        currentStreak++;
        checkDate = getPrevDay(checkDate);
      }
    }

    // Calculate longest streak across all completed dates
    const allDates = Array.from(completedDatesSet).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    for (let i = 0; i < allDates.length; i++) {
      const cur = allDates[i];
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const expectedNext = this._addDays(lastDate, 1);
        if (cur === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      lastDate = cur;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    // Ensure user profile record has the updated streak values
    const user = this.store.getUser();
    const highestStreak = Math.max(longestStreak, currentStreak, user.longestStreak || 0);

    if (user.streak !== currentStreak || user.longestStreak !== highestStreak) {
      this.store.updateUser({
        streak: currentStreak,
        longestStreak: highestStreak
      });
    }

    return {
      currentStreak,
      longestStreak: highestStreak,
      todayCompleted,
      completedDatesCount: completedDatesSet.size
    };
  }

  _addDays(dateStr, days) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // --- Task Interaction Handler ---
  handleTaskToggled(task) {
    const isCompleted = task.completed;
    const taskDate = task.date;
    const today = this.store.getTodayString();

    // 1. Task XP (+10 or -10)
    if (isCompleted) {
      this.store.addXp(this.XP_CONFIG.TASK_COMPLETE, `Completed task: "${task.title}"`, task.id);
      if (window.audioManager) window.audioManager.playTaskComplete();
    } else {
      this.store.reverseXp(this.XP_CONFIG.TASK_COMPLETE, `Unchecked task: "${task.title}"`, task.id);
      if (window.audioManager) window.audioManager.playTaskUncheck();
    }

    // 2. Evaluate Day Completion Status
    this.evaluateDayStatus(taskDate);

    // 3. Evaluate Badges
    this.evaluateBadges();
  }

  evaluateDayStatus(dateStr) {
    const tasks = this.store.getTasks(dateStr);
    const total = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const isAllDone = total > 0 && completedCount === total;
    const today = this.store.getTodayString();

    // Record in history
    this.store.setDayHistory(dateStr, isAllDone, total, completedCount);

    // Recalculate streak
    const streakInfo = this.calculateStreaks();

    if (dateStr === today) {
      const alreadyCelebrated = this.store.hasCelebratedDate(today);

      if (isAllDone && !alreadyCelebrated) {
        // Mark celebrated
        this.store.setCelebratedDate(today);

        // Award +50 Bonus XP
        this.store.addXp(this.XP_CONFIG.DAY_COMPLETE_BONUS, `Daily Completion Bonus: All tasks conquered on ${today}!`, `day_${today}`);

        // Check for streak milestones (3, 7, 15, 30 days)
        this._checkStreakMilestones(streakInfo.currentStreak);

        // Audio & Visual Fanfare
        if (window.audioManager) window.audioManager.playCelebration();
        if (window.confettiEngine) window.confettiEngine.burstFromBottom();

        // Trigger Celebration Modal
        if (typeof this.onCelebrationTriggered === 'function') {
          this.onCelebrationTriggered({
            streak: streakInfo.currentStreak,
            xpEarned: this.XP_CONFIG.DAY_COMPLETE_BONUS,
            date: today
          });
        }
      } else if (!isAllDone && alreadyCelebrated) {
        // User uncompleted a task or added a new one: day is no longer complete
        this.store.resetCelebratedDateIf(today);

        // Reverse the daily bonus XP
        this.store.reverseXp(this.XP_CONFIG.DAY_COMPLETE_BONUS, `Reversed Daily Bonus: Task became incomplete on ${today}`, `day_${today}`);
      }
    }
  }

  _checkStreakMilestones(currentStreak) {
    const user = this.store.getUser();
    const unlocked = new Set(user.unlockedBadges || []);

    const milestones = [3, 7, 15, 30];
    milestones.forEach(m => {
      if (currentStreak >= m) {
        const milestoneKey = `milestone_streak_${m}`;
        if (!unlocked.has(milestoneKey)) {
          unlocked.add(milestoneKey);
          const bonus = this.XP_CONFIG.MILESTONES[m];
          this.store.addXp(bonus, `${m}-Day Streak Consistency Milestone Achieved!`, milestoneKey);
          user.unlockedBadges = Array.from(unlocked);
          this.store.updateUser({ unlockedBadges: user.unlockedBadges });
        }
      }
    });
  }

  // --- Bucket Goal Interaction Handler ---
  handleGoalToggled(goal) {
    if (goal.completed) {
      this.store.addXp(this.XP_CONFIG.BUCKET_GOAL_COMPLETE, `Completed Bucket List Goal: "${goal.title}"`, goal.id);
      if (window.audioManager) window.audioManager.playCelebration();
      if (window.confettiEngine) window.confettiEngine.fire({ particleCount: 80 });
    } else {
      this.store.reverseXp(this.XP_CONFIG.BUCKET_GOAL_COMPLETE, `Reopened Bucket List Goal: "${goal.title}"`, goal.id);
      if (window.audioManager) window.audioManager.playTaskUncheck();
    }
    this.evaluateBadges();
  }

  // --- Level Progress ---
  getLevelInfo(xp = null) {
    if (xp === null) {
      xp = this.store.getUser().xp || 0;
    }
    let currentLevel = this.LEVELS[0];
    let nextLevel = this.LEVELS[1];

    for (let i = 0; i < this.LEVELS.length; i++) {
      if (xp >= this.LEVELS[i].minXp && xp <= this.LEVELS[i].maxXp) {
        currentLevel = this.LEVELS[i];
        nextLevel = this.LEVELS[i + 1] || null;
        break;
      }
    }

    let progress = 100;
    let xpInLevel = xp - currentLevel.minXp;
    let levelSpan = nextLevel ? nextLevel.minXp - currentLevel.minXp : 1000;

    if (nextLevel) {
      progress = Math.min(100, Math.max(0, Math.round((xpInLevel / levelSpan) * 100)));
    }

    return {
      currentLevel: currentLevel.level,
      title: currentLevel.title,
      currentXp: xp,
      nextLevelMinXp: nextLevel ? nextLevel.minXp : xp,
      progressPercent: progress,
      remainingXp: nextLevel ? Math.max(0, nextLevel.minXp - xp) : 0
    };
  }

  // --- Badge Evaluator ---
  evaluateBadges() {
    const user = this.store.getUser();
    const unlocked = new Set(user.unlockedBadges || []);
    const allTasks = this.store.getTasks();
    const allGoals = this.store.getGoals();
    const streakInfo = this.calculateStreaks();

    const completedTasks = allTasks.filter(t => t.completed);
    const completedGoals = allGoals.filter(g => g.completed);

    // Early bird check: completed a task before 9:00 AM local time
    const hasEarlyTask = completedTasks.some(t => {
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d.getHours() < 9;
    });

    const stats = {
      totalTasksCompleted: completedTasks.length,
      totalGoalsCompleted: completedGoals.length,
      streak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      hasEarlyTask: hasEarlyTask
    };

    let newlyUnlocked = [];

    this.BADGES.forEach(b => {
      if (!unlocked.has(b.id)) {
        if (b.check(stats)) {
          unlocked.add(b.id);
          newlyUnlocked.push(b);
          // Award badge XP reward
          if (b.xpReward > 0) {
            this.store.addXp(b.xpReward, `Badge Unlocked: "${b.title}"`, b.id);
          }
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      user.unlockedBadges = Array.from(unlocked);
      this.store.updateUser({ unlockedBadges: user.unlockedBadges });

      if (window.audioManager) window.audioManager.playBadgeUnlock();
      if (typeof this.onBadgeUnlocked === 'function') {
        newlyUnlocked.forEach(badge => this.onBadgeUnlocked(badge));
      }
    }
  }

  getAllBadgesWithStatus() {
    const user = this.store.getUser();
    const unlockedSet = new Set(user.unlockedBadges || []);

    return this.BADGES.map(b => {
      const isUnlocked = unlockedSet.has(b.id);
      return {
        ...b,
        unlocked: isUnlocked
      };
    });
  }
}

window.gamificationEngine = new GamificationEngine(window.dataStore);

