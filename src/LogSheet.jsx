import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function LogSheet({ goal, onLog, onClose }) {
  const [val, setVal] = useState('');
  const [selQuick, setSelQuick] = useState(null);

  const display = val ? parseInt(val) : 0;

  function pressNum(n) {
    if (val.length >= 4) return;
    const next = val + n;
    setVal(next);
    setSelQuick(null);
  }

  function pressDel() {
    setVal(v => v.slice(0, -1));
    setSelQuick(null);
  }

  function pressQuick(q) {
    setVal(String(q));
    setSelQuick(q);
  }

  function confirm() {
    const amount = parseInt(val) || 0;
    if (amount <= 0) { onClose(); return; }
    onLog(amount);
    onClose();
  }

  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const dragCurrentY = useRef(0);

  function onTouchStart(e) {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta < 0) return; // don't allow dragging up
    dragCurrentY.current = delta;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }

  function onTouchEnd() {
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.25s ease';
    }
    if (dragCurrentY.current > 100) {
      // dragged far enough — dismiss
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(100%)`;
      }
      setTimeout(onClose, 220);
    } else {
      // snap back
      if (sheetRef.current) {
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
  }

  const sheet = (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet"
        ref={sheetRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="sheet-handle" />
        <div className="sheet-title">{goal.type === 'duration' ? 'Log time' : 'Log reps'}</div>
        <div className="sheet-sub">
          {goal.type === 'duration' ? `How many minutes of ${goal.name.toLowerCase()}?` : `How many ${goal.unit} just now?`}
        </div>

        <div className="numpad-display">
          <div className="numpad-val">{display || '0'}</div>
          <div className="numpad-unit">{goal.unit}</div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Quick amounts</div>
        <div className="quick-row">
          {(goal.quickAmounts || [5, 10, 20, 25]).map(q => (
            <button
              key={q}
              className={`quick-chip${selQuick === q ? ' sel' : ''}`}
              onClick={() => pressQuick(q)}
            >+{q}</button>
          ))}
        </div>

        <div className="numpad-grid">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="num-key" onClick={() => pressNum(String(n))}>{n}</button>
          ))}
          <button className="num-key del-key" onClick={pressDel}>⌫</button>
          <button className="num-key wide" onClick={() => pressNum('0')}>0</button>
        </div>

        <button className="btn-primary" onClick={confirm}>
          {display > 0 ? `Add ${display} ${goal.unit}` : 'Add to today'}
        </button>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
