import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'chipaway_active_timer';

export function useTimer(goalId) {
  const [state, setState] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored && stored.goalId === goalId) return stored;
    } catch {}
    return null;
  });
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (state?.running) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - state.startTs) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [state]);

  function start() {
    const s = { goalId, running: true, startTs: Date.now(), pausedAt: 0, accumulated: 0 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setState(s);
    setElapsed(0);
  }

  function stop() {
    clearInterval(intervalRef.current);
    const totalSecs = state ? Math.floor((Date.now() - state.startTs) / 1000) + (state.accumulated || 0) : 0;
    const s = { ...state, running: false, stoppedAt: Date.now(), totalSecs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setState(s);
    setElapsed(totalSecs);
    return totalSecs;
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    setState(null);
    setElapsed(0);
  }

  const isRunning = state?.running === true;
  const isStopped = state && !state.running && state.totalSecs > 0;
  const currentElapsed = isRunning
    ? Math.floor((Date.now() - (state?.startTs || Date.now())) / 1000)
    : (state?.totalSecs || 0);

  return { isRunning, isStopped, elapsed: currentElapsed, start, stop, clear };
}

function formatElapsed(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function TimerSheet({ goal, elapsed, onLog, onDiscard }) {
  const minutes = Math.max(1, Math.round(elapsed / 60));
  const [editedMins, setEditedMins] = useState(minutes);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '20px 20px',
        paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 24px))',
        width: '100%', maxWidth: 430,
        animation: 'slideUp 0.25s ease',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bg3)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Session complete</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>How'd the {goal.name.toLowerCase()} session go?</div>

        <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>Session time</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 500, color: 'var(--text)', letterSpacing: '-2px', lineHeight: 1 }}>
            {formatElapsed(elapsed)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
            ≈ {minutes} minute{minutes !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Log as (minutes)</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setEditedMins(m => Math.max(1, m - 1))} style={{ width: 36, height: 36, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg2)', fontSize: 18, cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 500, color: 'var(--text)' }}>{editedMins}</div>
            <button onClick={() => setEditedMins(m => m + 1)} style={{ width: 36, height: 36, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg2)', fontSize: 18, cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </div>

        <button
          onClick={() => onLog(editedMins)}
          style={{ width: '100%', padding: 14, borderRadius: 12, background: '#0f172a', color: '#f8fafc', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', marginBottom: 8 }}
        >
          Log {editedMins} min to {goal.name}
        </button>
        <button
          onClick={onDiscard}
          style={{ width: '100%', padding: 12, borderRadius: 12, background: 'none', color: 'var(--text3)', border: '0.5px solid var(--border)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--sans)' }}
        >
          Discard session
        </button>
      </div>
    </div>,
    document.body
  );
}

export function TimerButton({ goal, onLog }) {
  const { isRunning, isStopped, elapsed, start, stop, clear } = useTimer(goal.id);
  const [showSheet, setShowSheet] = useState(false);
  const [stoppedElapsed, setStoppedElapsed] = useState(0);

  function handleStart() { start(); }

  function handleStop() {
    const secs = stop();
    setStoppedElapsed(secs);
    setShowSheet(true);
  }

  function handleLog(mins) {
    onLog(mins);
    clear();
    setShowSheet(false);
  }

  function handleDiscard() {
    clear();
    setShowSheet(false);
  }

  if (showSheet) {
    return <TimerSheet goal={goal} elapsed={stoppedElapsed} onLog={handleLog} onDiscard={handleDiscard} />;
  }

  if (isRunning) {
    return (
      <button
        onClick={handleStop}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 10,
          background: '#ef4444', color: '#fff',
          border: 'none', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'var(--sans)',
          minWidth: 110, justifyContent: 'center',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#fff', display: 'inline-block', flexShrink: 0 }} />
        {formatElapsed(elapsed)}
      </button>
    );
  }

  return (
    <button
      onClick={handleStart}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 10,
        background: goal.color, color: '#fff',
        border: 'none', fontSize: 13, fontWeight: 500,
        cursor: 'pointer', fontFamily: 'var(--sans)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <polygon points="2,1 11,6 2,11" fill="white"/>
      </svg>
      Start timer
    </button>
  );
}