# DAYFLOW – Personal Productivity & Daily Life Tracker

🌐 **Live URL**: [https://todolist-lilac-alpha-32.vercel.app/](https://todolist-lilac-alpha-32.vercel.app/)

A complete, fully functional, responsive Progressive Web Application (PWA) designed to organize everyday tasks, track long-term bucket list aspirations, maintain daily discipline, earn XP points, build streaks, and conquer goals.

Built with **HTML5, CSS3, Vanilla JavaScript, LocalStorage, and Service Workers** — zero paid backends, zero external tracking, 100% private to your local device, and 100% offline-ready.

---

## 🌟 Key Features

### 1. Personalized Modern Dashboard
- **Dynamic Header**: Intelligent greeting based on your local time ("Good Morning", "Good Afternoon", "Good Evening") with your customizable display name.
- **Level & XP Progress Bar**: Real-time level titles (*Novice*, *Apprentice*, *Practitioner*, *Achiever*, *Focus Master*, etc.) and XP progress towards your next level.
- **6 Key Metrics**: Today's Tasks, Completed, Remaining, Completion %, Current Streak (days), and Total XP points.
- **Circular Daily Momentum Ring**: High-precision SVG animated circular progress indicator showing your live completion percentage.
- **Motivational Quote of the Day**: Curated collection of 50+ quotes on discipline, consistency, and hard work with a one-click shuffle button that prevents immediate repetitions.
- **Quick-Add Bar**: Add today's tasks directly from your home dashboard without leaving your flow.

### 2. Daily To-Do List (Planner)
- **Comprehensive Task Management**: Title, optional detailed description, category, priority (High, Medium, Low), scheduled date, and optional due time.
- **Categories**: Personal, Study, Career, Project, Fitness, Other.
- **Filtering & Search**: Instant full-text search, status filters (All, Pending, Completed), category dropdown, and priority dropdown.
- **Date Navigation**: Jump between days with previous/next controls, jump directly to "Today", or use the native date picker to plan upcoming days.
- **Visual Clarity**: Completed tasks are strikethrough-muted with green checkmarks; high-priority tasks are highlighted with rose badges.

### 3. Daily Completion Celebration
- **100% Conquered Modal**: When you finish all scheduled tasks for today (with at least 1 task), DAYFLOW triggers a celebration modal.
- **Confetti Explosion**: Pure HTML5 Canvas physics-based confetti particles (works completely offline).
- **Celebration Fanfare**: Harmonious Web Audio API chime.
- **Rewards**: +50 Daily Bonus XP and an active streak increment.
- **Bulletproof Logic**:
  - Triggers only once per day.
  - Does not duplicate rewards on page refresh.
  - Automatically reverses the +50 bonus XP if a task is unchecked or if a new task is added after completion.
  - Does not count an empty task list as a completed day.

### 4. Gamification & XP Reward System
- **Points Breakdown**:
  - Complete 1 task: **+10 XP** (reversing unchecks -10 XP)
  - Complete all daily tasks: **+50 bonus XP** (reversing resets -50 XP)
  - Reach 3-day streak: **+25 bonus XP**
  - Reach 7-day streak: **+50 bonus XP**
  - Reach 15-day streak: **+100 bonus XP**
  - Reach 30-day streak: **+250 bonus XP**
  - Complete a Bucket List Goal: **+100 XP**
- **Milestone Rewards**: Evaluated and awarded once per milestone.
- **Transparent XP History**: A chronological log of every XP change with date, time, reason, amount, and running total.
- **Achievement Badges**:
  - ⚡ *First Step*: Complete your first task (+25 XP)
  - 🔥 *Consistency Starter*: Complete 3 consecutive days (+25 XP)
  - 🏆 *One Week Warrior*: Complete 7 consecutive days (+50 XP)
  - 🛡️ *Discipline Master*: Complete 15 consecutive days (+100 XP)
  - 👑 *30-Day Champion*: Complete 30 consecutive days (+250 XP)
  - 🎯 *Goal Getter*: Complete your first bucket list goal (+50 XP)
  - 🌟 *Task Crusher*: Complete 25 total tasks (+50 XP)
  - 💫 *Centurion*: Complete 100 total tasks (+150 XP)
  - 🌅 *Early Bird*: Complete a task before 9:00 AM (+25 XP)

### 5. 30-Day Streak Tracker & Monthly Calendar
- **Streak Hero Display**: Visual burning flame banner with current streak and longest streak records.
- **Monthly Matrix Calendar**:
  - 🟢 **Green**: Completed day (all tasks completed, >0 tasks)
  - 🔴/Muted **Grey**: Missed day (past day with incomplete tasks)
  - 🟣 **Purple**: Today (active day in progress)
  - ⚪ **Subtle**: Future day
- **Interactive**: Click any day in the monthly calendar to jump directly to its tasks in the planner.
- **Milestones Strip**: Progress indicators toward 3, 7, 15, and 30-day streak milestones.

### 6. Bucket List – Long-Term Life Goals
- Distinct from everyday to-dos: designed for major aspirations (e.g., *"Master VLSI & Digital IC Design"*, *"Run a Half Marathon"*, *"Build My Own Tech Startup"*).
- Target completion dates, category tags (Career, Education, Personal Growth, Health & Fitness, Travel, Financial, Dreams).
- Marking a goal achieved triggers +100 XP and celebration particles!

### 7. Monthly Progress & Visual Analytics
- **Task Velocity Bar Chart**: Responsive SVG bar chart displaying completed tasks across 7, 14, or 30 days with interactive tooltips.
- **Category Donut Chart**: Pure SVG donut visualization showing your focus distribution across life categories.
- **Badges Showcase**: Displays all unlocked badges with glowing borders and locked badges with requirements.

### 8. PWA Functionality & Offline Support
- **PWA Manifest (`manifest.json`)**: Standalone display mode, dark navy theme (`#080c16`), multi-size PNG & SVG icons (72px to 512px, including maskable).
- **Service Worker (`service-worker.js`)**: Caches all HTML, CSS, JS, and image assets for instant offline loading and offline task editing.
- **One-Click Install**: Supports Chrome/Edge desktop install prompts and mobile "Add to Home Screen".
- **Zero External CDNs**: Fonts, Lucide-style vector SVG icons, sound effects (Web Audio API), and confetti (HTML5 Canvas) are all bundled locally.

### 9. Data Management & Portability
- **LocalStorage Persistence**: Auto-saves every task, goal, streak, badge, and XP record instantly.
- **Export Backup**: Download all your data as a clean, structured JSON file (`dayflow-backup-YYYY-MM-DD.json`).
- **Import Backup**: Restore previously exported backups with schema validation.
- **Demo Sample Data**: One-click "Load Sample Data" button to preview populated metrics, past streaks, and bucket goals.
- **Reset All Data**: Clean double-confirmation safety barrier before wiping local storage.

---

## 🚀 How to Launch Locally

### Option A: Using Python (Recommended)
In this directory, run:
```bash
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your web browser.

### Option B: Using Node.js
```bash
npx serve . -p 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your web browser.

---

## 📱 How to Install as a PWA

- **Google Chrome / Microsoft Edge (Desktop)**:
  1. Open [http://localhost:8080](http://localhost:8080).
  2. Click the **Install** icon in the browser address bar (or click "Install App" in the left sidebar or Settings).
  3. DAYFLOW will now open as an independent, standalone desktop window with its own icon in your dock/taskbar!

- **Android (Chrome)**:
  1. Open the URL in Chrome on your phone.
  2. Tap the three-dot menu `⋮` and select **"Add to Home screen"** or **"Install app"**.

- **iOS Safari (iPhone / iPad)**:
  1. Open the URL in Safari.
  2. Tap the **Share** button (box with an arrow pointing up).
  3. Scroll down and tap **"Add to Home Screen"**.

---

## 📁 Project Architecture

```
DAYFLOW/
├── index.html               # Main single-page application shell
├── manifest.json            # PWA Web App Manifest
├── service-worker.js        # Offline caching Service Worker
├── favicon.svg              # Vector brand favicon
├── README.md                # Documentation and user guide
├── css/
│   ├── main.css             # Theme variables, typography, layout & animations
│   ├── components.css       # Cards, buttons, modals, badges, form controls
│   └── views.css            # Styles for Dashboard, Planner, Streaks, Analytics, Bucket, Settings
├── js/
│   ├── app.js               # Application orchestrator, router, modals, PWA installer
│   ├── store.js             # LocalStorage state management, models, export/import
│   ├── gamification.js      # Streaks engine, XP points, badge evaluations
│   ├── quotes.js            # 50+ curated motivational quotes library & shuffle logic
│   ├── icons.js             # Lucide-style pure SVG vector icon definitions
│   ├── audio.js             # Web Audio API synthesizers for chimes & fanfares
│   ├── confetti.js          # Pure HTML5 Canvas confetti particle engine
│   ├── charts.js            # Pure SVG responsive charts (circular progress, bar, donut)
│   └── views/
│       ├── dashboardView.js # Home dashboard rendering & interactions
│       ├── plannerView.js   # Daily to-do list, task CRUD, filters, quick actions
│       ├── bucketView.js    # Long-term bucket list goals CRUD
│       ├── streakView.js    # 30-day streak calendar, milestones, stats
│       ├── analyticsView.js # Monthly progress, completion trends, category breakdown, XP history
│       └── settingsView.js  # Backup/restore, reset, sound/confetti toggles, profile
└── assets/
    └── icons/
        ├── icon-72.png
        ├── icon-96.png
        ├── icon-128.png
        ├── icon-144.png
        ├── icon-152.png
        ├── icon-192.png
        ├── icon-384.png
        ├── icon-512.png
        └── icon-maskable-512.png
```

---

## 🔒 Privacy & Freedom
- **No external servers, trackers, or telemetries.**
- **No subscription fees.**
- All your personal goals, daily habits, and achievements remain stored on your device.

