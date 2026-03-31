import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { goalsDB, entriesDB } from './db';
import { uid, todayStr } from './utils';
import TodayView from './TodayView';
import StatsView from './StatsView';
import GoalsView from './GoalsView';
import GoalCreationFlow from './GoalCreationFlow';
import AuthScreen from './AuthScreen';
import { createPortal } from 'react-dom';
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

function ProfileSheet({ user, onClose, onSignOut }) {
  const initials = user.email?.slice(0, 2).toUpperCase() || 'CA';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '20px 20px',
        paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 24px))',
        width: '100%', maxWidth: 430,
        animation: 'slideUp 0.25s ease',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bg3)', margin: '0 auto 20px' }} />

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: '16px', background: 'var(--bg2)', borderRadius: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Member since {memberSince}</div>
          </div>
        </div>

        {/* Menu items */}
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Version</span>
            <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>0.2.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Data storage</span>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>Supabase cloud</span>
          </div>
        </div>

        <button
          onClick={onSignOut}
          style={{
            width: '100%', padding: 14, borderRadius: 12,
            background: '#fff0f0', color: '#c0392b',
            border: '0.5px solid #fecaca',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--sans)', marginBottom: 8,
          }}
        >
          Sign out
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: 12, borderRadius: 12,
            background: 'none', color: 'var(--text3)',
            border: '0.5px solid var(--border)',
            fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--sans)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('today');
  const [goals, setGoals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) { setGoals([]); setEntries([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

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
    const entry = { id: 'e-' + uid(), goalId: goal.id, amount, unit: goal.unit, date: todayStr(), ts: Date.now(), note: '' };
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
    setShowProfile(false);
    showToast('Signed out');
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2100);
  }

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#475569', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

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
            onClick={() => setShowProfile(true)}
            title="Account"
            style={{ cursor: 'pointer' }}
          >{initials}</div>
        </div>
      </div>

      {tab === 'today' && <TodayView goals={goals} entries={entries} onLog={handleLog} onAddGoal={() => setCreating(true)} />}
      {tab === 'stats' && <StatsView goals={goals} entries={entries} />}
      {tab === 'goals' && <GoalsView goals={goals} entries={entries} onAdd={() => setCreating(true)} onDelete={handleDeleteGoal} />}

      <div className="bottom-nav">
        {NAV.map(n => (
          <button key={n.id} className={`nav-btn${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
            {n.icon(tab === n.id)}
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      {showProfile && (
        <ProfileSheet
          user={session.user}
          onClose={() => setShowProfile(false)}
          onSignOut={handleSignOut}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}