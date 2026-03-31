import { useState } from 'react';
import LogSheet from './LogSheet';
import { getTodayTotal, formatTime, todayStr, getStreak } from './utils';

export default function TodayView({ goals, entries, onLog, onAddGoal }) {
  const [activeSheet, setActiveSheet] = useState(null);
  const today = todayStr();

  const todayEntries = entries
    .filter(e => e.date === today)
    .sort((a, b) => b.ts - a.ts);

  function getProgress(goal) {
    const total = getTodayTotal(entries, goal.id);
    const pct = Math.min(100, Math.round((total / goal.target) * 100));
    return { total, pct, done: total >= goal.target };
  }

  function getBestStreak() {
    if (!goals.length) return 0;
    return Math.max(...goals.map(g => getStreak(entries, g.id, g.target, g.period)));
  }

  const streakVal = getBestStreak();

  const nudgeGoal = goals.find(g => {
    const { total, done } = getProgress(g);
    return !done && total > 0;
  }) || goals.find(g => !getProgress(g).done);

  return (
    <div className="scroll-content" style={{ padding: '0 16px' }}>
      {streakVal > 0 && (
        <div className="streak-pill">
          <span className="streak-dot" />
          Day {streakVal} streak · keep it going
        </div>
      )}

      {nudgeGoal && (
        <div className="notif-chip">
          <span className="notif-chip-icon">🔔</span>
          <span>
            {getTodayTotal(entries, nudgeGoal.id) === 0
              ? `Start your ${nudgeGoal.name.toLowerCase()} — even just ${(nudgeGoal.quickAmounts || [5])[0]} counts`
              : `Time for a few more ${nudgeGoal.name.toLowerCase()} — you're on a roll`}
          </span>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">No goals yet</div>
          <div className="empty-sub">Add your first goal to start chipping away</div>
          <button className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '12px 28px' }} onClick={onAddGoal}>
            Add a goal
          </button>
        </div>
      ) : (
        goals.map(goal => {
          const { total, pct, done } = getProgress(goal);
          const remaining = goal.target - total;
          return (
            <div key={goal.id} className="card">
              <div className="goal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="goal-icon" style={{ background: goal.color + '22' }}>
                    {goal.icon}
                  </div>
                  <div>
                    <div className="goal-name">{goal.name}</div>
                    <div className="goal-sub">
                      {goal.period === 'daily' ? 'Daily' : 'Weekly'} · {goal.target} {goal.unit}
                    </div>
                  </div>
                </div>
                <div className="goal-tally">
                  {total}<span>/{goal.target}{goal.unit === 'min' ? 'm' : ''}</span>
                </div>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: pct + '%', background: goal.color }}
                />
              </div>

              <div className="goal-footer">
                {done ? (
                  <span className="goal-done-badge">✓ Done for today!</span>
                ) : (
                  <span className="goal-remain">
                    {remaining} {goal.unit} remaining
                  </span>
                )}
                {!done && (
                  <button className="log-btn primary" onClick={() => setActiveSheet(goal)}>
                    + Log {goal.type === 'duration' ? 'time' : 'reps'}
                  </button>
                )}
                {done && (
                  <button
                    className="log-btn"
                    style={{ background: 'var(--bg2)', color: 'var(--text2)', border: '0.5px solid var(--border)' }}
                    onClick={() => setActiveSheet(goal)}
                  >
                    + Log more
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {todayEntries.length > 0 && (
        <>
          <div className="section-label">Today's log</div>
          <div className="card" style={{ padding: '4px 16px' }}>
            {todayEntries.map(entry => {
              const goal = goals.find(g => g.id === entry.goalId);
              return (
                <div key={entry.id} className="log-entry">
                  <span className="log-time">{formatTime(entry.ts)}</span>
                  <span className="log-dot" style={{ background: goal?.color || '#94a3b8' }} />
                  <span className="log-label">{goal?.name || 'Unknown'}</span>
                  <span className="log-amount">+{entry.amount}{entry.unit === 'min' ? 'm' : ''}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeSheet && (
        <LogSheet
          goal={activeSheet}
          onLog={(amount) => onLog(activeSheet, amount)}
          onClose={() => setActiveSheet(null)}
        />
      )}
    </div>
  );
}
