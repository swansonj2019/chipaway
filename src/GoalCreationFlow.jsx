import { useState } from 'react';
import { uid } from './utils';

const TEMPLATES = [
  { id: 'pushups', icon: '💪', name: 'Pushups', type: 'count', unit: 'reps', defaultTarget: 100, units: ['reps'], color: '#f97316', quickAmounts: [5,10,20,25] },
  { id: 'pullups', icon: '🏋️', name: 'Pullups', type: 'count', unit: 'reps', defaultTarget: 30, units: ['reps'], color: '#ef4444', quickAmounts: [3,5,10,15] },
  { id: 'piano', icon: '🎹', name: 'Piano', type: 'duration', unit: 'min', defaultTarget: 30, units: ['min'], color: '#3b82f6', quickAmounts: [5,10,15,20], masteryTracking: true },
  { id: 'guitar', icon: '🎸', name: 'Guitar', type: 'duration', unit: 'min', defaultTarget: 30, units: ['min'], color: '#8b5cf6', quickAmounts: [5,10,15,20], masteryTracking: true },
  { id: 'run', icon: '🏃', name: 'Running', type: 'count', unit: 'miles', defaultTarget: 3, units: ['miles','km'], color: '#22c55e', quickAmounts: [1,2,3,5] },
  { id: 'meditation', icon: '🧘', name: 'Meditation', type: 'duration', unit: 'min', defaultTarget: 10, units: ['min'], color: '#14b8a6', quickAmounts: [5,10,15,20] },
  { id: 'reading', icon: '📚', name: 'Reading', type: 'count', unit: 'pages', defaultTarget: 20, units: ['pages','min'], color: '#f59e0b', quickAmounts: [5,10,15,20] },
  { id: 'water', icon: '💧', name: 'Water', type: 'count', unit: 'glasses', defaultTarget: 8, units: ['glasses'], color: '#0ea5e9', quickAmounts: [1,2,3,4] },
];

const NUDGES = [
  { id: 'smart', label: 'Smart nudges', sub: 'Learns your patterns, nudges at the right moment' },
  { id: 'interval', label: 'Every 2 hours', sub: 'Reminds you every 2 hrs during your active day' },
  { id: 'thrice', label: '3× per day', sub: 'Morning, midday, and evening reminders' },
  { id: 'once', label: 'Once a day', sub: 'A single daily check-in reminder' },
];

const STEP_TITLES = ['Choose a goal type', 'Unit & name', 'Set your target', 'Nudge settings', 'Review & save'];
const TOTAL_STEPS = 4;

export default function GoalCreationFlow({ onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState(null);
  const [unit, setUnit] = useState('reps');
  const [goalName, setGoalName] = useState('');
  const [target, setTarget] = useState(100);
  const [period, setPeriod] = useState('daily');
  const [nudge, setNudge] = useState('smart');
  const [customUnit, setCustomUnit] = useState('');
  const isCustom = template === 'custom';
  const tpl = TEMPLATES.find(t => t.id === template);

  const availableUnits = isCustom
    ? ['reps','min','miles','km','pages','glasses','sessions','sets']
    : tpl?.units || ['reps'];

  function selectTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    setTemplate(id === 'custom' ? 'custom' : id);
    if (t) {
      setUnit(t.unit);
      setGoalName(t.name);
      setTarget(t.defaultTarget);
    } else {
      setUnit('reps');
      setGoalName('');
      setTarget(10);
    }
    setStep(2);
  }

  function adjustTarget(delta) {
    setTarget(v => Math.max(1, v + delta));
  }

  function handleSave() {
    const finalUnit = isCustom && customUnit ? customUnit : unit;
    const goal = {
      id: 'goal-' + uid(),
      name: goalName || (tpl?.name || 'Custom goal'),
      icon: tpl?.icon || '🎯',
      type: tpl?.type || 'count',
      unit: finalUnit,
      target,
      period,
      nudge,
      quickAmounts: tpl?.quickAmounts || [5,10,15,20],
      color: tpl?.color || '#6366f1',
      masteryTracking: tpl?.masteryTracking || false,
      createdAt: Date.now(),
      active: true,
    };
    onSave(goal);
  }

  const stepDots = Array.from({ length: TOTAL_STEPS }, (_, i) => (
    <div
      key={i}
      className={`step-dot${i + 1 === step ? ' act' : i + 1 < step ? ' done' : ''}`}
    />
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: 'calc(var(--safe-top) + 14px) 20px 0', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button
            onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}
            style={{ width: 34, height: 34, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              {step === 1 ? 'New goal' : `Step ${step} of ${TOTAL_STEPS}`}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              {STEP_TITLES[step - 1]}
            </div>
          </div>
        </div>
        {step > 1 && <div className="step-progress">{stepDots}</div>}
      </div>

      <div className="scroll-content" style={{ padding: '14px 20px' }}>

        {/* STEP 1 — Template */}
        {step === 1 && (
          <>
            <div className="hint-text">Pick a template or start custom.</div>
            <div className="template-grid">
              {TEMPLATES.map(t => (
                <button key={t.id} className="tpl-card" onClick={() => selectTemplate(t.id)}>
                  <span className="tpl-icon">{t.icon}</span>
                  <div className="tpl-name">{t.name}</div>
                  <div className="tpl-type">{t.type === 'duration' ? 'Duration' : 'Count'}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectTemplate('custom')}
              style={{ width: '100%', padding: 16, borderRadius: 16, border: '1.5px dashed var(--border2)', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--text2)', fontFamily: 'var(--sans)' }}
            >
              + Something custom
            </button>
          </>
        )}

        {/* STEP 2 — Unit & name */}
        {step === 2 && (
          <>
            <div className="hint-text">
              {isCustom ? 'Name your goal and pick a unit.' : `Confirm the unit and name for ${goalName}.`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Unit</div>
            <div className="unit-pills">
              {availableUnits.map(u => (
                <button key={u} className={`unit-pill${unit === u ? ' sel' : ''}`} onClick={() => setUnit(u)}>{u}</button>
              ))}
              {isCustom && (
                <button className={`unit-pill${!availableUnits.includes(unit) && customUnit ? ' sel' : ''}`} onClick={() => setUnit('_custom')}>
                  custom…
                </button>
              )}
            </div>
            {(unit === '_custom' || isCustom) && (
              <input
                placeholder="e.g. cold plunges, sessions…"
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--surface)', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 12, fontFamily: 'var(--sans)' }}
              />
            )}
            <div className="field-group">
              <div className="field-row">
                <div>
                  <div className="field-lbl">Goal name</div>
                  <div className="field-lbl-sub">How it appears on your dashboard</div>
                </div>
                <input
                  className="field-val-input"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  placeholder="Name…"
                />
              </div>
            </div>
            <button className="btn-primary" onClick={() => setStep(3)}>Continue</button>
          </>
        )}

        {/* STEP 3 — Target */}
        {step === 3 && (
          <>
            <div className="hint-text">Set a target that feels achievable — you can always raise it later.</div>
            <div className="period-toggle">
              <button className={`period-btn${period === 'daily' ? ' act' : ''}`} onClick={() => setPeriod('daily')}>Daily</button>
              <button className={`period-btn${period === 'weekly' ? ' act' : ''}`} onClick={() => setPeriod('weekly')}>Weekly</button>
            </div>
            <div className="target-hero">
              <div className="target-big">{target}</div>
              <div>
                <div className="target-unit-lbl">{isCustom && customUnit ? customUnit : unit}</div>
                <div className="target-period-lbl">/ {period === 'daily' ? 'day' : 'week'}</div>
              </div>
            </div>
            <div className="stepper-row">
              <button className="step-btn" onClick={() => adjustTarget(-10)}>−10</button>
              <button className="step-btn" onClick={() => adjustTarget(-5)}>−5</button>
              <button className="step-btn" onClick={() => adjustTarget(5)}>+5</button>
              <button className="step-btn" onClick={() => adjustTarget(10)}>+10</button>
            </div>
            <input
              type="number"
              placeholder="Or type a number…"
              onChange={e => { const v = parseInt(e.target.value); if (v > 0) setTarget(v); }}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--surface)', fontSize: 14, color: 'var(--text)', outline: 'none', textAlign: 'center', fontFamily: 'var(--mono)', marginBottom: 14 }}
            />
            <button className="btn-primary" onClick={() => setStep(4)}>Continue</button>
          </>
        )}

        {/* STEP 4 — Nudges */}
        {step === 4 && (
          <>
            <div className="hint-text">Smart nudges remind you to chip away throughout the day.</div>
            {NUDGES.map(n => (
              <div
                key={n.id}
                className={`nudge-opt${nudge === n.id ? ' sel' : ''}`}
                onClick={() => setNudge(n.id)}
              >
                <div>
                  <div className="nudge-lbl">{n.label}</div>
                  <div className="nudge-sub">{n.sub}</div>
                </div>
                <div className={`radio-dot${nudge === n.id ? ' on' : ''}`} />
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setStep(5)}>Continue</button>
          </>
        )}

        {/* STEP 5 — Confirm */}
        {step === 5 && (
          <>
            <div className="hint-text">Everything look right? You can edit this later.</div>
            <div className="confirm-dark">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{tpl?.icon || '🎯'}</span>
                <div style={{ fontSize: 17, fontWeight: 500, color: '#f1f5f9' }}>{goalName || 'Custom goal'}</div>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Unit</span>
                <span className="confirm-val">{isCustom && customUnit ? customUnit : unit}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Target</span>
                <span className="confirm-val">{target} {isCustom && customUnit ? customUnit : unit} / {period === 'daily' ? 'day' : 'week'}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-key">Nudges</span>
                <span className="confirm-val">{NUDGES.find(n => n.id === nudge)?.label}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleSave}>Add to my goals</button>
            <button className="btn-ghost" onClick={() => setStep(4)}>Go back</button>
          </>
        )}
      </div>
    </div>
  );
}
