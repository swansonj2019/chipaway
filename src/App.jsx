import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { goalsDB, entriesDB } from './db';
import { uid, todayStr } from './utils';
import TodayView from './TodayView';
import StatsView from './StatsView';
import GoalsView from './GoalsView';
import GoalCreationFlow from './GoalCreationFlow';
import AuthScreen from './AuthScreen';
import './styles.css';

const NAV = [
  {
    id: 'today', label: 'Today',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
        <circle cx="12" cy="12" r="8"/>
        <circle cx="12" cy="12" r="3" fill={active ? 'currentColor' : 'none'}/>
      </svg>
    )
  },
  {
    id: 'stats', label: 'Stats',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
        <rect x="4" y="14" width="4" height="7" rx="1" opacity={active ? 1 : 0.5}/>
        <rect x="10" y="9" width="4" height="12" rx="1" opacity={active ? 1 : 0.7}/>
        <rect x="16" y="4" width="4" height="17" rx="1"/>
      </svg>
    )
  },
  {
    id: 'goals', label: 'Goals',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round">
        <circle cx="12" cy="12" r="9" opacity="0.4"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    )
  },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('today');
  const [goals, setGoals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setGoals([]);
        setEntries([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data when session is available
  useEffect(() => {
    if (session) loadData();
  }, [session]);

  async function loadData() {
    setLoading(true);
    try {
      const [g, e] = await Promise.all([goalsDB.getAll(), entriesDB.getAll()]);
      setGoals(g);
      setEntries(e);
    } catch (err) {
      console.error('Load error:', err);
      showToast('Error loading data');
    }
    setLoading(false);
  }

  async function handleLog(goal, amount) {
    const entry = {
      id: 'e-' + uid(),
      goalId: goal.id,
      amount,
      unit: goal.unit,
      date: todayStr(),
      ts: Date.now(),
      note: '',
    };
    setEntries(prev => [...prev, entry]);
    try {
      await entriesDB.save(entry);
      showToast(`+${amount} ${goal.unit} logged`);
    } catch (err) {
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      showToast('Failed to save — try again');
    }
  }

  async function handleSaveGoal(goal) {
    setGoals(prev => [...prev, goal]);
    try {
      await goalsDB.save(goal);
      setCreating(false);
      setTab('today');
      showToast(`${goal.name} added!`);
    } catch (err) {
      setGoals(prev => prev.filter(g => g.id !== goal.id));
      showToast('Failed to save goal — try again');
    }
  }

  async function handleDeleteGoal(id) {
    if (!window.confirm('Remove this goal? Your log history will be kept.')) return;
    const prev = goals.find(g => g.id === id);
    setGoals(gs => gs.filter(g => g.id !== id));
    try {
      await goalsDB.delete(id);
      showToast('Goal removed');
    } catch (err) {
      setGoals(gs => [...gs, prev]);
      showToast('Failed to remove — try again');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    showToast('Signed out');
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2100);
  }

  // Still checking auth
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#475569', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  // Not logged in
  if (!session) return <AuthScreen />;

  // Loading data
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading your goals…</div>
      </div>
    );
  }

  if (creating) {
    return (
      <div id="app" className="app-shell">
        <GoalCreationFlow onSave={handleSaveGoal} onCancel={() => setCreating(false)} />
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const initials = session.user.email?.slice(0, 2).toUpperCase() || 'CA';

  return (
    <div id="app" className="app-shell">
      <div className="app-header">
        <div className="header-row">
          <div>
            <div className="header-date">{dateStr}</div>
            <div className="header-title">
              {tab === 'today' ? 'Today' : tab === 'stats' ? 'Stats' : 'Goals'}
            </div>
          </div>
          <div
            className="avatar"
            onClick={handleSignOut}
            title="Tap to sign out"
            style={{ cursor: 'pointer' }}
          >{initials}</div>
        </div>
      </div>

      {tab === 'today' && (
        <TodayView goals={goals} entries={entries} onLog={handleLog} onAddGoal={() => setCreating(true)} />
      )}
      {tab === 'stats' && (
        <StatsView goals={goals} entries={entries} />
      )}
      {tab === 'goals' && (
        <GoalsView goals={goals} entries={entries} onAdd={() => setCreating(true)} onDelete={handleDeleteGoal} />
      )}

      <div className="bottom-nav">
        {NAV.map(n => (
          <button key={n.id} className={`nav-btn${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
            {n.icon(tab === n.id)}
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
