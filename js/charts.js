// DAYFLOW - Pure SVG Responsive Visualization & Chart Engine (100% Offline)
class ChartEngine {
  constructor() {
    this.CATEGORY_COLORS = {
      'Personal': '#38bdf8',
      'Study': '#a855f7',
      'Career': '#6366f1',
      'Project': '#ec4899',
      'Fitness': '#10b981',
      'Other': '#f59e0b',
      'Education': '#8b5cf6',
      'Personal Growth': '#06b6d4',
      'Health & Fitness': '#10b981',
      'Travel': '#f97316',
      'Financial': '#eab308',
      'Dreams': '#d946ef'
    };
  }

  // --- Circular Progress Indicator ---
  renderCircularProgress(container, percentage, options = {}) {
    if (!container) return;
    const size = options.size || 190;
    const strokeWidth = options.strokeWidth || 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPct = Math.min(100, Math.max(0, Math.round(percentage)));
    const offset = circumference - (clampedPct / 100) * circumference;
    const label = options.label || (clampedPct === 100 ? 'Day Conquered!' : clampedPct > 0 ? 'In Flow' : 'Ready to Start');
    const sublabel = options.sublabel || `${clampedPct}% Completed`;

    container.innerHTML = `
      <div class="circular-progress-wrap" style="width: ${size}px; height: ${size}px; position: relative; margin: 0 auto;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <defs>
            <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="50%" stop-color="#8b5cf6" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
            <filter id="circGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#8b5cf6" flood-opacity="0.4" />
            </filter>
          </defs>
          <!-- Background track -->
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            stroke-width="${strokeWidth}"
          />
          <!-- Animated Progress fill -->
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="url(#circGrad)"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 ${size / 2} ${size / 2})"
            filter="url(#circGlow)"
            style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);"
          />
        </svg>
        <div class="circ-center-content" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none;">
          <span class="circ-percentage" style="font-size: 2.1rem; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; line-height: 1;">${clampedPct}%</span>
          <span class="circ-label" style="font-size: 0.78rem; font-weight: 600; color: #a5b4fc; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em;">${label}</span>
        </div>
      </div>
    `;
  }

  // --- Activity Bar Chart (7 to 30 Days) ---
  renderActivityBarChart(container, dailyData, options = {}) {
    if (!container) return;
    if (!dailyData || dailyData.length === 0) {
      container.innerHTML = `<div class="chart-empty-msg">No activity recorded yet</div>`;
      return;
    }

    const maxVal = Math.max(4, ...dailyData.map(d => d.totalTasks || 0));
    const width = options.width || 600;
    const height = options.height || 180;
    const paddingLeft = 36;
    const paddingRight = 16;
    const paddingTop = 20;
    const paddingBottom = 32;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;
    const barWidth = Math.max(8, Math.min(32, (chartW / dailyData.length) * 0.55));
    const step = chartW / dailyData.length;

    // Y Axis grid lines (0, half, max)
    const yGridLevels = [0, Math.ceil(maxVal / 2), maxVal];
    let gridLinesSvg = '';
    yGridLevels.forEach(val => {
      const yPos = paddingTop + chartH - (val / maxVal) * chartH;
      gridLinesSvg += `
        <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
        <text x="${paddingLeft - 8}" y="${yPos + 4}" fill="#64748b" font-size="10" text-anchor="end">${val}</text>
      `;
    });

    let barsSvg = '';
    dailyData.forEach((item, idx) => {
      const x = paddingLeft + idx * step + (step - barWidth) / 2;
      const completed = item.completedTasks || 0;
      const total = item.totalTasks || 0;
      
      const barH = total > 0 ? Math.max(6, (completed / maxVal) * chartH) : 3;
      const y = paddingTop + chartH - barH;

      const isToday = item.isToday;
      const isComplete = total > 0 && completed === total;
      const fillColor = isComplete ? '#10b981' : isToday ? '#8b5cf6' : completed > 0 ? '#6366f1' : 'rgba(255,255,255,0.1)';

      barsSvg += `
        <g class="chart-bar-group" data-date="${item.date}" data-completed="${completed}" data-total="${total}" style="cursor: pointer;">
          <!-- Bar background track -->
          <rect x="${x}" y="${paddingTop}" width="${barWidth}" height="${chartH}" rx="${barWidth / 2}" fill="rgba(255,255,255,0.03)" />
          <!-- Active bar fill -->
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="${barWidth / 2}" fill="${fillColor}">
            <title>${item.date}: ${completed}/${total} tasks completed</title>
          </rect>
          <!-- X Label -->
          <text x="${x + barWidth / 2}" y="${height - 10}" fill="${isToday ? '#a5b4fc' : '#64748b'}" font-size="10" font-weight="${isToday ? '700' : '500'}" text-anchor="middle">
            ${item.label || item.date.slice(-2)}
          </text>
        </g>
      `;
    });

    container.innerHTML = `
      <div class="svg-chart-wrapper" style="width: 100%; overflow-x: auto;">
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; min-width: 320px; display: block;">
          ${gridLinesSvg}
          ${barsSvg}
        </svg>
      </div>
    `;
  }

  // --- Category Donut Breakdown Chart ---
  renderCategoryDonutChart(container, categoryCounts) {
    if (!container) return;
    const entries = Object.entries(categoryCounts).filter(([_, count]) => count > 0);
    const totalCount = entries.reduce((sum, [_, count]) => sum + count, 0);

    if (totalCount === 0) {
      container.innerHTML = `
        <div class="chart-empty-state" style="padding: 24px; text-align: center; color: #64748b; font-size: 0.88rem;">
          No task category data available yet.
        </div>
      `;
      return;
    }

    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativeOffset = 0;
    let segmentsSvg = '';

    entries.forEach(([cat, count]) => {
      const slicePct = count / totalCount;
      const strokeDash = slicePct * circumference;
      const strokeOffset = circumference - strokeDash;
      const color = this.CATEGORY_COLORS[cat] || '#8b5cf6';

      segmentsSvg += `
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          fill="none"
          stroke="${color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash} ${circumference - strokeDash}"
          stroke-dashoffset="${-cumulativeOffset}"
          transform="rotate(-90 ${size / 2} ${size / 2})"
          stroke-linecap="round"
        >
          <title>${cat}: ${count} tasks (${Math.round(slicePct * 100)}%)</title>
        </circle>
      `;
      cumulativeOffset += strokeDash;
    });

    // Build Legend HTML
    let legendHtml = '<div class="donut-legend-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 16px;">';
    entries.forEach(([cat, count]) => {
      const color = this.CATEGORY_COLORS[cat] || '#8b5cf6';
      const pct = Math.round((count / totalCount) * 100);
      legendHtml += `
        <div class="legend-item" style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></span>
          <span style="color: #cbd5e1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cat}</span>
          <span style="margin-left: auto; color: #64748b; font-weight: 600;">${pct}%</span>
        </div>
      `;
    });
    legendHtml += '</div>';

    container.innerHTML = `
      <div class="donut-chart-container" style="display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}" />
            ${segmentsSvg}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 1.4rem; font-weight: 800; color: #ffffff;">${totalCount}</span>
            <span style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Tasks</span>
          </div>
        </div>
        ${legendHtml}
      </div>
    `;
  }

  // --- Monthly Streak Calendar Grid ---
  renderStreakCalendar(container, year, month, history, tasksByDate, onDayClick) {
    if (!container) return;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 is Sun

    const todayStr = window.dataStore.getTodayString();
    const todayObj = new Date();
    const isCurrentMonth = todayObj.getFullYear() === year && todayObj.getMonth() === month;
    const todayDateNum = todayObj.getDate();

    const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let headerHtml = weekHeaders.map(d => `<div class="calendar-header-cell" style="font-size: 0.72rem; font-weight: 600; color: #64748b; text-align: center; padding: 6px 0;">${d}</div>`).join('');

    let cellsHtml = '';

    // Empty cells before first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      cellsHtml += `<div class="calendar-day-cell empty" style="opacity: 0.15; padding: 10px; border-radius: 8px;"></div>`;
    }

    // Days of month
    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const isToday = isCurrentMonth && day === todayDateNum;
      const isPast = isCurrentMonth ? day < todayDateNum : (year < todayObj.getFullYear() || (year === todayObj.getFullYear() && month < todayObj.getMonth()));
      const isFuture = isCurrentMonth ? day > todayDateNum : (year > todayObj.getFullYear() || (year === todayObj.getFullYear() && month > todayObj.getMonth()));

      const dayTasks = tasksByDate[dateKey] || [];
      const historyRecord = history[dateKey];
      const hasCompleted = historyRecord && historyRecord.completed;
      const totalTasks = dayTasks.length || (historyRecord ? historyRecord.totalTasks : 0);
      const completedTasks = dayTasks.filter(t => t.completed).length || (historyRecord ? historyRecord.completedTasks : 0);

      // Determine state style:
      // Green: Completed day
      // Red/Muted: Missed day
      // Purple: Current day (Today)
      // Grey: Future day
      let stateClass = 'future';
      let stateBadge = '';

      if (isToday) {
        stateClass = hasCompleted ? 'completed-today' : 'today';
        stateBadge = hasCompleted ? '✓ Done' : 'Today';
      } else if (isPast) {
        if (hasCompleted) {
          stateClass = 'completed';
          stateBadge = '✓';
        } else {
          stateClass = 'missed';
          stateBadge = totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '—';
        }
      } else {
        stateClass = 'future';
      }

      cellsHtml += `
        <div
          class="calendar-day-cell state-${stateClass} ${isToday ? 'is-today' : ''}"
          data-date="${dateKey}"
          style="
            position: relative;
            min-height: 54px;
            padding: 8px;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s ease;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="day-num" style="font-size: 0.84rem; font-weight: ${isToday ? '700' : '600'};">${day}</span>
            ${stateBadge ? `<span class="day-badge badge-${stateClass}" style="font-size: 0.65rem; font-weight: 600;">${stateBadge}</span>` : ''}
          </div>
          ${totalTasks > 0 ? `
            <div class="day-mini-progress" style="margin-top: 4px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.1); overflow: hidden;">
              <div style="height: 100%; width: ${(completedTasks / totalTasks) * 100}%; background: ${hasCompleted ? '#10b981' : '#6366f1'};"></div>
            </div>
          ` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="calendar-grid-wrap">
        <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
          ${headerHtml}
          ${cellsHtml}
        </div>
      </div>
    `;

    // Attach click listeners
    if (typeof onDayClick === 'function') {
      const cells = container.querySelectorAll('.calendar-day-cell:not(.empty)');
      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          const d = cell.getAttribute('data-date');
          onDayClick(d);
        });
      });
    }
  }
}

window.chartEngine = new ChartEngine();

