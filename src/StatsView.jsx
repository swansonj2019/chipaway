import { useState } from 'react';
import {
  getAllTimeTotal, getStreak, getConsistencyRate,
  getLast7Days, getLast35Days, paceProjection, getTodayTotal
} from './utils';

export default function StatsView({ goals, entries }) {
  const [selectedGoal, setSelectedGoal] = useState(goals[0]?.id || null);
  const goal = goals.find(g => g.id === selectedGoal);

  if (goals.length === 0) {
    return (
      <div className="scroll-content" style={{ padding: '0 16px' }}>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No stats yet</div>
          <div className="empty-sub">Add goals and start logging to see your progress here</div>
        </div>
      </div>
    );
  }

  const allTimeTotal = goal ? getAllTimeTotal(entries, goal.id) : 0;
  const streak = goal ? getStreak(entries, goal.id, goal.target, goal.period) : 0;
  const consistency = goal ? getConsistencyRate(entries, goal.id, goal.target) : 0;
  const todayTotal = goal ? getTodayTotal(entries, goal.id) : 0;
  const last7 = goal ? getLast7Days(entries, goal.id) : [];
  const last35 = goal ? getLast35Days(entries, goal.id, goal?.target) : [];
  const mastery = goal?.masteryTracking ? paceProjection(entries, goal.id, goal.unit) : null;
  const max7 = Math.max(...last7.map(d => d.total), goal?.target || 1);

  const totalDaysLogged = goal
    ? [...new Set(entries.filter(e => e.goalId === goal.id).map(e => e.date))].length
    : 0;

  const firstEntryDate = goal
    ? entries.filter(e => e.goalId === goal.id).sort((a,b) => a.ts - b.ts)[0]?.date
    : null;

  return (
    <div className="scroll-content" style={{ padding: '0 16px' }}>
      {/* Goal selector */}
      {goals.length > 1 && (
        <div className="tab-bar" style={{ padding: '0 0 14px', background: 'transparent' }}>
          {goals.map(g => (
            <button
              key={g.id}
              className={`tab-btn${selectedGoal === g.id ? ' active' : ''}`}
              onClick={() => setSelectedGoal(g.id)}
            >
              {g.icon} {g.name}
            </button>
          ))}
        </div>
      )}

      {goal && (
        <>
          {/* Hero total */}
          <div className="stats-hero">
            <div className="hero-label">All-time {goal.unit === 'min' ? 'minutes' : goal.unit}</div>
            <div className="hero-num">{allTimeTotal.toLocaleString()}</div>
            <div className="hero-sub">
              {firstEntryDate
                ? `Since ${new Date(firstEntryDate + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${totalDaysLogged} days logged`
                : 'Start logging to build history'}
            </div>
          </div>

          {/* Stat grid */}
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-box-label">Current streak</div>
              <div className="stat-box-val">{streak}</div>
              <div className="stat-box-unit">days</div>
            </div>
            <div className="stat-box">
              <div className="stat-box-label">Consistency</div>
              <div className="stat-box-val">{consistency}%</div>
              <div className="stat-box-unit">last 30 days</div>
            </div>
            <div className="stat-box">
              <div className="stat-box-label">Today</div>
              <div className="stat-box-val">{todayTotal}</div>
              <div className="stat-box-unit">{goal.unit} so far</div>
            </div>
            <div className="stat-box">
              <div className="stat-box-label">Days logged</div>
              <div className="stat-box-val">{totalDaysLogged}</div>
              <div className="stat-box-unit">total days</div>
            </div>
          </div>

          {/* Mastery tracker */}
          {mastery && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                  {goal.icon} 10,000 hr journey
                </div>
                <div style={{ fontSize: 12, padding: '3px 10px', background: '#f0fdf4', color: '#15803d', borderRadius: 20, fontWeight: 500 }}>
                  {((mastery.allTimeHours / 10000) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="mastery-track">
                <div
                  className="mastery-fill"
                  style={{
                    width: Math.max(0.5, (mastery.allTimeHours / 10000) * 100) + '%',
                    background: goal.color
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
                <span>{mastery.allTimeHours} hrs logged</span>
                <span>{mastery.yearsLeft ? `~${mastery.yearsLeft} yrs at current pace` : 'keep going!'}</span>
              </div>

              {/* Next milestone */}
              {mastery.allTimeHours < 100 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Next milestone: 100 hrs</div>
                  <div className="mastery-track" style={{ marginBottom: 0 }}>
                    <div className="mastery-fill" style={{ width: Math.min(100, (mastery.allTimeHours / 100) * 100) + '%', background: '#f97316' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7-day bar chart */}
          <div className="section-label">Last 7 days</div>
          <div className="card">
            <div className="mini-bars" style={{ marginBottom: 6 }}>
              {last7.map((day, i) => (
                <div
                  key={i}
                  className="mini-bar"
                  style={{
                    height: Math.max(4, (day.total / max7) * 44) + 'px',
                    background: day.total >= (goal?.target || 1)
                      ? goal.color
                      : day.total > 0
                        ? goal.color + '66'
                        : 'var(--bg2)'
                  }}
                  title={`${day.label}: ${day.total} ${goal.unit}`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)' }}>
              {last7.map((d, i) => <span key={i}>{d.label}</span>)}
            </div>
          </div>

          {/* 35-day streak calendar */}
          <div className="section-label">Streak calendar</div>
          <div className="card">
            <div className="streak-cal">
              {last35.map((day, i) => (
                <div
                  key={i}
                  className={`cal-dot${day.isToday ? ' today' : day.hit ? ' hit' : day.total > 0 ? ' partial' : ''}`}
                  title={`${day.date}: ${day.total} ${goal.unit}`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, background: '#22c55e', borderRadius: 2, display: 'inline-block' }} />
                Hit target
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, background: goal.color, borderRadius: 2, display: 'inline-block' }} />
                Today
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, background: '#fde68a', borderRadius: 2, display: 'inline-block' }} />
                Partial
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
