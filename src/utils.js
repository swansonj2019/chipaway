// utils.js

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function formatTime(ts) {
  const d = new Date(ts);
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'p' : 'a';
  h = h > 12 ? h - 12 : (h || 12);
  return `${h}:${String(m).padStart(2, '0')}${ampm}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getTodayTotal(entries, goalId) {
  const today = todayStr();
  return entries
    .filter(e => e.goalId === goalId && e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getStreak(entries, goalId, target, period) {
  if (!entries.length) return 0;
  const byDate = {};
  entries.filter(e => e.goalId === goalId).forEach(e => {
    byDate[e.date] = (byDate[e.date] || 0) + e.amount;
  });
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (i === 0 && !byDate[ds]) continue; // today not done yet, skip
    if ((byDate[ds] || 0) >= target) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function getAllTimeTotal(entries, goalId) {
  return entries.filter(e => e.goalId === goalId).reduce((s, e) => s + e.amount, 0);
}

export function getConsistencyRate(entries, goalId, target, days = 30) {
  const byDate = {};
  entries.filter(e => e.goalId === goalId).forEach(e => {
    byDate[e.date] = (byDate[e.date] || 0) + e.amount;
  });
  let hit = 0;
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if ((byDate[ds] || 0) >= target) hit++;
  }
  return Math.round((hit / days) * 100);
}

export function getLast7Days(entries, goalId) {
  const result = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const total = entries.filter(e => e.goalId === goalId && e.date === ds).reduce((s, e) => s + e.amount, 0);
    result.push({ date: ds, total, label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }) });
  }
  return result;
}

export function getLast35Days(entries, goalId, target) {
  const result = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const total = entries.filter(e => e.goalId === goalId && e.date === ds).reduce((s, e) => s + e.amount, 0);
    result.push({ date: ds, total, hit: total >= target, isToday: i === 0 });
  }
  return result;
}

export function paceProjection(entries, goalId, unit, targetHours = 10000) {
  const allTime = getAllTimeTotal(entries, goalId);
  const allTimeHours = unit === 'min' ? allTime / 60 : allTime;
  const last30 = entries.filter(e => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return e.goalId === goalId && new Date(e.date) >= cutoff;
  }).reduce((s, e) => s + e.amount, 0);
  const dailyAvg = unit === 'min' ? (last30 / 60) / 30 : last30 / 30;
  const remaining = targetHours - allTimeHours;
  const daysLeft = dailyAvg > 0 ? remaining / dailyAvg : null;
  const yearsLeft = daysLeft ? (daysLeft / 365).toFixed(1) : null;
  return { allTimeHours: Math.round(allTimeHours * 10) / 10, yearsLeft };
}
