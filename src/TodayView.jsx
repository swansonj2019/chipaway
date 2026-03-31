import { useState } from 'react';
import LogSheet from './LogSheet';
import { getTodayTotal, formatTime, todayStr, getStreak } from './utils';

export default function TodayView({ goals, entries, onLog, onAddGoal }) {
  const [activeSheet, setActiveSheet] = useState(null);
  const [slippedGoal, setSlippedGoal] = useState(null);
  const today = todayStr();

  const activeGoals = goals.filter(g => g.type !== 'avoidance');
  const avoidanceGoals = goals.filter(g => g.type === 'avoidance');

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

  const nudgeGoal = activeGoals.find(g => {
    const { total, done } = getProgress(g);
    return !done && total > 0;
  }) || activeGoals.find(g => !getProgress(g).done);

  // 3-goal soft limit
  const showSoftLimit = activeGoals.length === 3;
  const showWarning = activeGoals.length >= 4;

  return (
    <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 16px', paddingBottom: 'max(120px, calc(env(safe-area-inset-bottom) + 100px))' }}>

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
              ? `Start your ${nudgeGoal.name.toLowerCase()} — even ${(nudgeGoal.quickAmounts || [5])[0]} counts`
              : `Time for a few more ${nudgeGoal.name.toLowerCase()} — you're on a roll`}
          </span>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">No goals yet</div>
          <div className="empty-sub">Add your first goal to start chipping away</div>
          <button className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '12px 28px' }} onClick={onAddGoal}>Add a goal</button>
        </div>
      ) : (
        <>
          {/* Active goals */}
          {activeGoals.map(goal => {
            const { total, pct, done } = getProgress(goal);
            const remaining = goal.target - total;
            return (
              <div key={goal.id} style={{
                background: 'var(--surface)',
                border: `1.5px solid ${done ? '#22c55e44' : goal.color + '33'}`,
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
                borderLeft: `4px solid ${done ? '#22c55e' : goal.color}`,
              }}>
                <div className="goal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: goal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {goal.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{goal.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                        {goal.period === 'daily' ? 'Daily' : 'Weekly'} · {goal.target} {goal.unit}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 500, color: done ? '#22c55e' : 'var(--text)', letterSpacing: '-1px', lineHeight: 1 }}>
                      {total}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>of {goal.target}</div>
                  </div>
                </div>

                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg2)', marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: pct + '%', background: done ? '#22c55e' : goal.color, transition: 'width 0.5s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {done ? (
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#15803d', background: '#f0fdf4', padding: '3px 10px', borderRadius: 20 }}>✓ Done for today!</span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{remaining} {goal.unit} to go</span>
                  )}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 10, background: done ? 'var(--bg2)' : goal.color, color: done ? 'var(--text2)' : '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                    onClick={() => setActiveSheet(goal)}
                  >
                    + Log {goal.type === 'duration' ? 'time' : 'reps'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Avoidance streaks — separate section */}
          {avoidanceGoals.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 8 }}>Streaks</div>
              {avoidanceGoals.map(goal => {
                const streak = getStreak(entries, goal.id, 1, 'daily');
                return (
                  <div key={goal.id} style={{
                    background: 'var(--surface)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: goal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {goal.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{goal.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
                        {streak === 0 ? 'Start your streak today' : `${streak} day${streak !== 1 ? 's' : ''} strong`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 500, color: streak > 0 ? '#22c55e' : 'var(--text3)', letterSpacing: '-1px' }}>{streak}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>days</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* 3-goal soft nudge */}
          {showSoftLimit && (
            <div style={{ background: '#fffbeb', border: '0.5px solid #fde68a', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                Most people find 3 goals the sweet spot for real consistency. You're in a good place — but you can always add more.
              </div>
            </div>
          )}

          {showWarning && (
            <div style={{ background: '#fff7ed', border: '0.5px solid #fed7aa', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div style={{ fontSize: 12, color: '#9a3412', lineHeight: 1.5 }}>
                You have {activeGoals.length} active goals. The more you add, the harder it gets to chip away at all of them consistently.
              </div>
            </div>
          )}

          {/* Add goal button */}
          <button
            onClick={onAddGoal}
            style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1.5px dashed var(--border2)', background: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}
          >
            + Add a goal
          </button>
        </>
      )}

      {/* Today's log */}
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
        <LogSheet goal={activeSheet} onLog={(amount) => onLog(activeSheet, amount)} onClose={() => setActiveSheet(null)} />
      )}
    </div>
  );
}