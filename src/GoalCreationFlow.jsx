import { useState } from 'react';
import { uid } from './utils';

const CATEGORIES = [
  {
    id: 'fitness',
    label: 'Fitness',
    icon: '💪',
    color: '#f97316',
    templates: [
      { id: 'pushups', icon: '💪', name: 'Pushups', type: 'count', unit: 'reps', defaultTarget: 100, units: ['reps'], color: '#f97316', quickAmounts: [5,10,20,25] },
      { id: 'pullups', icon: '🏋️', name: 'Pullups', type: 'count', unit: 'reps', defaultTarget: 30, units: ['reps'], color: '#ef4444', quickAmounts: [3,5,10,15] },
      { id: 'squats', icon: '🦵', name: 'Squats', type: 'count', unit: 'reps', defaultTarget: 50, units: ['reps'], color: '#f97316', quickAmounts: [5,10,15,20] },
      { id: 'situps', icon: '🔥', name: 'Situps', type: 'count', unit: 'reps', defaultTarget: 50, units: ['reps'], color: '#fb923c', quickAmounts: [5,10,15,20] },
      { id: 'plank', icon: '⏱️', name: 'Plank', type: 'duration', unit: 'sec', defaultTarget: 120, units: ['sec','min'], color: '#f59e0b', quickAmounts: [15,30,45,60] },
      { id: 'walking', icon: '🚶', name: 'Walking', type: 'count', unit: 'miles', defaultTarget: 3, units: ['miles','km','steps'], color: '#22c55e', quickAmounts: [0.25,0.5,1,2] },
      { id: 'running', icon: '🏃', name: 'Running', type: 'count', unit: 'miles', defaultTarget: 3, units: ['miles','km'], color: '#16a34a', quickAmounts: [1,2,3,5] },
      { id: 'cycling', icon: '🚴', name: 'Cycling', type: 'count', unit: 'miles', defaultTarget: 10, units: ['miles','km'], color: '#0ea5e9', quickAmounts: [2,5,10,15] },
      { id: 'spinning', icon: '🎡', name: 'Spinning', type: 'duration', unit: 'min', defaultTarget: 30, units: ['min'], color: '#6366f1', quickAmounts: [10,15,20,30] },
      { id: 'swimming', icon: '🏊', name: 'Swimming', type: 'count', unit: 'laps', defaultTarget: 20, units: ['laps','min'], color: '#0284c7', quickAmounts: [5,10,15,20] },
      { id: 'yoga', icon: '🧘', name: 'Yoga', type: 'duration', unit: 'min', defaultTarget: 20, units: ['min'], color: '#8b5cf6', quickAmounts: [10,15,20,30] },
    ]
  },
  {
    id: 'skills',
    label: 'Skill building',
    icon: '🎹',
    color: '#3b82f6',
    templates: [
      { id: 'piano', icon: '🎹', name: 'Piano', type: 'duration', unit: 'min', defaultTarget: 30, units: ['min'], color: '#3b82f6', quickAmounts: [5,10,15,20], masteryTracking: true },
      { id: 'guitar', icon: '🎸', name: 'Guitar', type: 'duration', unit: 'min', defaultTarget: 30, units: ['min'], color: '#8b5cf6', quickAmounts: [5,10,15,20], masteryTracking: true },
      { id: 'drawing', icon: '✏️', name: 'Drawing', type: 'duration', unit: 'min', defaultTarget: 20, units: ['min'], color: '#f59e0b', quickAmounts: [5,10,15,20], masteryTracking: true },
      { id: 'writing', icon: '📝', name: 'Writing', type: 'count', unit: 'words', defaultTarget: 500, units: ['words','pages'], color: '#64748b', quickAmounts: [50,100,250,500] },
      { id: 'language', icon: '🌍', name: 'Language', type: 'duration', unit: 'min', defaultTarget: 20, units: ['min'], color: '#0ea5e9', quickAmounts: [5,10,15,20], masteryTracking: true },
      { id: 'reading', icon: '📚', name: 'Reading', type: 'count', unit: 'pages', defaultTarget: 20, units: ['pages','min'], color: '#f97316', quickAmounts: [5,10,15,20] },
      { id: 'coding', icon: '💻', name: 'Coding', type: 'duration', unit: 'min', defaultTarget: 30, units: ['min'], color: '#22c55e', quickAmounts: [15,20,30,45], masteryTracking: true },
    ]
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: '💧',
    color: '#14b8a6',
    templates: [
      { id: 'water', icon: '💧', name: 'Water', type: 'count', unit: 'glasses', defaultTarget: 8, units: ['glasses','oz','ml'], color: '#0ea5e9', quickAmounts: [1,2,3,4] },
      { id: 'meditation', icon: '🧘', name: 'Meditation', type: 'duration', unit: 'min', defaultTarget: 10, units: ['min'], color: '#14b8a6', quickAmounts: [5,10,15,20] },
      { id: 'journaling', icon: '📔', name: 'Journaling', type: 'duration', unit: 'min', defaultTarget: 10, units: ['min','entries'], color: '#f59e0b', quickAmounts: [5,10,15,20] },
      { id: 'sleep', icon: '😴', name: 'Sleep', type: 'count', unit: 'hrs', defaultTarget: 8, units: ['hrs'], color: '#6366f1', quickAmounts: [1,2,4,8] },
      { id: 'vitamins', icon: '💊', name: 'Vitamins', type: 'count', unit: 'doses', defaultTarget: 1, units: ['doses'], color: '#22c55e', quickAmounts: [1,2] },
    ]
  },
  {
    id: 'avoidance',
    label: 'Breaking habits',
    icon: '🚫',
    color: '#64748b',
    templates: [
      { id: 'smoking', icon: '🚭', name: 'Smoke-free', type: 'avoidance', unit: 'days', defaultTarget: 1, units: ['days'], color: '#64748b', quickAmounts: [] },
      { id: 'alcohol', icon: '🍷', name: 'Alcohol-free', type: 'avoidance', unit: 'days', defaultTarget: 1, units: ['days'], color: '#8b5cf6', quickAmounts: [] },
      { id: 'social', icon: '📵', name: 'Social media-free', type: 'avoidance', unit: 'days', defaultTarget: 1, units: ['days'], color: '#ef4444', quickAmounts: [] },
      { id: 'junk', icon: '🍔', name: 'Junk food-free', type: 'avoidance', unit: 'days', defaultTarget: 1, units: ['days'], color: '#f97316', quickAmounts: [] },
    ]
  },
];

const ALL_TEMPLATES = CATEGORIES.flatMap(c => c.templates);

const NUDGES = [
  { id: 'smart', label: 'Smart nudges', sub: 'Learns your patterns, nudges at the right moment' },
  { id: 'interval', label: 'Every 2 hours', sub: 'Reminds you every 2 hrs during your active day' },
  { id: 'thrice', label: '3× per day', sub: 'Morning, midday, and evening reminders' },
  { id: 'once', label: 'Once a day', sub: 'A single daily check-in reminder' },
];

const STEP_TITLES = ['Choose a category', 'Pick a template', 'Unit & name', 'Set your target', 'Nudge settings', 'Review & save'];

export default function GoalCreationFlow({ onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [template, setTemplate] = useState(null);
  const [unit, setUnit] = useState('reps');
  const [goalName, setGoalName] = useState('');
  const [target, setTarget] = useState(100);
  const [period, setPeriod] = useState('daily');
  const [nudge, setNudge] = useState('smart');
  const [customUnit, setCustomUnit] = useState('');

  const isCustom = template === 'custom';
  const tpl = ALL_TEMPLATES.find(t => t.id === template);
  const cat = CATEGORIES.find(c => c.id === category);
  const isAvoidance = tpl?.type === 'avoidance' || category === 'avoidance';
  const availableUnits = isCustom ? ['reps','min','miles','km','pages','glasses','sessions','sets'] : tpl?.units || ['reps'];
  const totalSteps = isAvoidance ? 4 : 5;

  function selectCategory(id) {
    setCategory(id);
    setStep(2);
  }

  function selectTemplate(id) {
    const t = ALL_TEMPLATES.find(x => x.id === id);
    setTemplate(id === 'custom' ? 'custom' : id);
    if (t) { setUnit(t.unit); setGoalName(t.name); setTarget(t.defaultTarget); }
    else { setUnit('reps'); setGoalName(''); setTarget(10); }
    setStep(isAvoidance ? 3 : 3);
  }

  function adjustTarget(delta) { setTarget(v => Math.max(1, v + delta)); }

  function handleSave() {
    const finalUnit = isCustom && customUnit ? customUnit : unit;
    const goal = {
      id: 'goal-' + uid(),
      name: goalName || tpl?.name || 'Custom goal',
      icon: tpl?.icon || '🎯',
      type: tpl?.type || 'count',
      unit: finalUnit,
      target,
      period,
      nudge,
      quickAmounts: tpl?.quickAmounts || [5,10,15,20],
      color: tpl?.color || cat?.color || '#6366f1',
      masteryTracking: tpl?.masteryTracking || false,
      createdAt: Date.now(),
      active: true,
    };
    onSave(goal);
  }

  const stepDots = Array.from({ length: totalSteps }, (_, i) => (
    <div key={i} className={`step-dot${i+1 === step ? ' act' : i+1 < step ? ' done' : ''}`} />
  ));

  function goBack() {
    if (step === 1) { onCancel(); return; }
    if (step === 2) { setStep(1); setCategory(null); return; }
    setStep(s => s - 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 14px) 20px 0', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={goBack} style={{ width: 34, height: 34, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{step === 1 ? 'New goal' : `Step ${step} of ${totalSteps}`}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.3px' }}>{STEP_TITLES[step-1]}</div>
          </div>
        </div>
        {step > 1 && <div className="step-progress">{stepDots}</div>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 20px', paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 30px))' }}>

        {/* STEP 1 — Category */}
        {step === 1 && (
          <>
            <div className="hint-text">What area of your life are you working on?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => selectCategory(c.id)} style={{
                  background: 'var(--surface)', border: '0.5px solid var(--border)',
                  borderRadius: 16, padding: '16px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 14,
                  fontFamily: 'var(--sans)', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{c.templates.length} templates</div>
                  </div>
                  <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              ))}
            </div>
            <button onClick={() => { setCategory('custom'); selectTemplate('custom'); }} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px dashed var(--border2)', background: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              + Something custom
            </button>
          </>
        )}

        {/* STEP 2 — Template picker */}
        {step === 2 && cat && (
          <>
            <div className="hint-text">Pick one to get started with smart defaults.</div>
            <div className="template-grid">
              {cat.templates.map(t => (
                <button key={t.id} className="tpl-card" onClick={() => selectTemplate(t.id)}>
                  <span className="tpl-icon" style={{ fontSize: 24 }}>{t.icon}</span>
                  <div className="tpl-name">{t.name}</div>
                  <div className="tpl-type">{t.type === 'duration' ? 'Duration' : t.type === 'avoidance' ? 'Streak' : 'Count'}</div>
                </button>
              ))}
            </div>
            <button onClick={() => selectTemplate('custom')} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px dashed var(--border2)', background: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--sans)', marginTop: 4 }}>
              + Custom {cat.label.toLowerCase()} goal
            </button>
          </>
        )}

        {/* STEP 3 — Unit & name */}
        {step === 3 && !isAvoidance && (
          <>
            <div className="hint-text">{isCustom ? 'Name your goal and pick a unit.' : `Confirm the unit for ${goalName}.`}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Unit</div>
            <div className="unit-pills">
              {availableUnits.map(u => (
                <button key={u} className={`unit-pill${unit === u ? ' sel' : ''}`} onClick={() => setUnit(u)}>{u}</button>
              ))}
              {isCustom && <button className={`unit-pill${customUnit ? ' sel' : ''}`} onClick={() => setUnit('_custom')}>custom…</button>}
            </div>
            {(unit === '_custom' || isCustom) && (
              <input placeholder="e.g. cold plunges, sessions…" value={customUnit} onChange={e => setCustomUnit(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--surface)', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 12, fontFamily: 'var(--sans)' }} />
            )}
            <div className="field-group">
              <div className="field-row">
                <div><div className="field-lbl">Goal name</div><div className="field-lbl-sub">How it appears on your dashboard</div></div>
                <input className="field-val-input" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Name…" />
              </div>
            </div>
            <button className="btn-primary" onClick={() => setStep(4)}>Continue</button>
          </>
        )}

        {/* STEP 3 for avoidance — just name */}
        {step === 3 && isAvoidance && (
          <>
            <div className="hint-text">We'll track your streak automatically — no daily logging needed. Just tap "I slipped" if you need to reset.</div>
            <div className="field-group">
              <div className="field-row">
                <div><div className="field-lbl">Goal name</div><div className="field-lbl-sub">e.g. "Smoke-free" or "No alcohol"</div></div>
                <input className="field-val-input" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Name…" />
              </div>
            </div>
            <button className="btn-primary" onClick={() => setStep(4)}>Continue</button>
          </>
        )}

        {/* STEP 4 — Target (skip for avoidance) */}
        {step === 4 && !isAvoidance && (
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
            <input type="number" placeholder="Or type a number…" onChange={e => { const v = parseInt(e.target.value); if (v > 0) setTarget(v); }}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--surface)', fontSize: 14, color: 'var(--text)', outline: 'none', textAlign: 'center', fontFamily: 'var(--mono)', marginBottom: 14 }} />
            <button className="btn-primary" onClick={() => setStep(5)}>Continue</button>
          </>
        )}

        {/* STEP 4 for avoidance — nudges */}
        {step === 4 && isAvoidance && (
          <>
            <div className="hint-text">Get a daily check-in to keep the streak top of mind.</div>
            {NUDGES.filter(n => n.id === 'once' || n.id === 'smart').map(n => (
              <div key={n.id} className={`nudge-opt${nudge === n.id ? ' sel' : ''}`} onClick={() => setNudge(n.id)}>
                <div><div className="nudge-lbl">{n.label}</div><div className="nudge-sub">{n.sub}</div></div>
                <div className={`radio-dot${nudge === n.id ? ' on' : ''}`} />
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setStep(totalSteps)}>Continue</button>
          </>
        )}

        {/* STEP 5 — Nudges (non-avoidance) */}
        {step === 5 && !isAvoidance && (
          <>
            <div className="hint-text">Smart nudges remind you to chip away throughout the day.</div>
            {NUDGES.map(n => (
              <div key={n.id} className={`nudge-opt${nudge === n.id ? ' sel' : ''}`} onClick={() => setNudge(n.id)}>
                <div><div className="nudge-lbl">{n.label}</div><div className="nudge-sub">{n.sub}</div></div>
                <div className={`radio-dot${nudge === n.id ? ' on' : ''}`} />
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setStep(6)}>Continue</button>
          </>
        )}

        {/* FINAL STEP — Confirm */}
        {step === totalSteps + 1 || (step === 6 && !isAvoidance) || (step === 5 && isAvoidance && totalSteps === 4 && step > totalSteps) ? null : null}
        {((step === 6 && !isAvoidance) || (step === 5 && isAvoidance)) && (
          <>
            <div className="hint-text">Everything look right? You can edit this later.</div>
            <div className="confirm-dark">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{tpl?.icon || '🎯'}</span>
                <div style={{ fontSize: 17, fontWeight: 500, color: '#f1f5f9' }}>{goalName || 'Custom goal'}</div>
              </div>
              {!isAvoidance && (
                <>
                  <div className="confirm-row"><span className="confirm-key">Unit</span><span className="confirm-val">{isCustom && customUnit ? customUnit : unit}</span></div>
                  <div className="confirm-row"><span className="confirm-key">Target</span><span className="confirm-val">{target} {isCustom && customUnit ? customUnit : unit} / {period === 'daily' ? 'day' : 'week'}</span></div>
                </>
              )}
              {isAvoidance && (
                <div className="confirm-row"><span className="confirm-key">Type</span><span className="confirm-val">Streak tracker</span></div>
              )}
              <div className="confirm-row"><span className="confirm-key">Nudges</span><span className="confirm-val">{NUDGES.find(n => n.id === nudge)?.label}</span></div>
            </div>
            <button className="btn-primary" onClick={handleSave}>Add to my goals</button>
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>Go back</button>
          </>
        )}

      </div>
    </div>
  );
}