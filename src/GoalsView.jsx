import { getAllTimeTotal, getStreak, todayStr, getTodayTotal } from './utils';

export default function GoalsView({ goals, entries, onAdd, onDelete }) {
  return (
    <div className="scroll-content" style={{ padding: '0 16px' }}>
      <div className="hint-text" style={{ marginBottom: 16 }}>
        Each goal has its own unit and target. Mix and match however you like.
      </div>

      {goals.map(goal => {
        const allTime = getAllTimeTotal(entries, goal.id);
        const streak = getStreak(entries, goal.id, goal.target, goal.period);
        const today = getTodayTotal(entries, goal.id);

        return (
          <div key={goal.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="goal-icon" style={{ background: goal.color + '22' }}>{goal.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="goal-name">{goal.name}</div>
                <div className="goal-sub" style={{ textTransform: 'capitalize' }}>
                  {goal.type} · {goal.period}
                </div>
              </div>
              <button
                onClick={() => onDelete(goal.id)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: 'var(--text3)' }}
                title="Remove goal"
              >×</button>
            </div>

            <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '10px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Target</span>
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                  {goal.target} {goal.unit} / {goal.period === 'daily' ? 'day' : 'week'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Nudges</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>
                  {goal.nudge === 'smart' ? 'Smart' : goal.nudge === 'interval' ? 'Every 2h' : goal.nudge === 'thrice' ? '3× / day' : 'Once / day'}
                </span>
              </div>
              {goal.masteryTracking && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>10,000hr tracking</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', background: '#f0fdf4', color: '#15803d', borderRadius: 20, fontWeight: 500 }}>On</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>All time</div>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
                  {allTime.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{goal.unit}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Streak</div>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{streak}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>days</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Today</div>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--mono)', color: today >= goal.target ? '#15803d' : 'var(--text)' }}>{today}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{goal.unit}</div>
              </div>
            </div>
          </div>
        );
      })}

      <button className="btn-primary" style={{ marginTop: 4 }} onClick={onAdd}>
        + Add new goal
      </button>
    </div>
  );
}
