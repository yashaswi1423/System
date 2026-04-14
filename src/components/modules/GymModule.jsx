import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Dumbbell, Trophy, Activity, FileText, Timer } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPES = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Rest', 'Active Recovery'];
const CARDIO_TYPES = ['Running', 'Cycling', 'Swimming', 'Jump Rope', 'HIIT', 'Walking', 'Rowing', 'Elliptical'];
const TABS = [
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'cardio',  label: 'Cardio',  icon: Activity },
  { id: 'pr',      label: 'PRs',     icon: Trophy },
  { id: 'timer',   label: 'Rest',    icon: Timer },
];

function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState(90);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds((s) => {
        if (s <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
        return s - 1;
      }), 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const pct = (seconds / preset) * 100;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
      <div style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 3 }}>REST TIMER</div>
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,68,102,0.1)" strokeWidth="5" />
          <circle cx="65" cy="65" r="56" fill="none" stroke="#ff4466" strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px #ff4466)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="orbitron" style={{ fontSize: 26, color: '#ff4466', textShadow: '0 0 10px #ff4466' }}>
            {fmt(seconds)}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[30, 60, 90, 120, 180].map((s) => (
          <button key={s} className="btn-neon" style={{ padding: '4px 10px', fontSize: 11,
            borderColor: preset === s ? '#ff4466' : undefined, color: preset === s ? '#ff4466' : undefined }}
            onClick={() => { setPreset(s); setSeconds(s); setRunning(false); }}>
            {s}s
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-neon" style={{ borderColor: '#ff4466', color: '#ff4466' }}
          onClick={() => { setSeconds(preset); setRunning(true); }}>START</button>
        <button className="btn-neon" onClick={() => setRunning(false)}>PAUSE</button>
        <button className="btn-neon" onClick={() => { setRunning(false); setSeconds(preset); }}>RESET</button>
      </div>
    </div>
  );
}

export default function GymModule() {
  const { gymSchedule: rawSchedule, updateGymDay, updateGymNotes, addExercise, removeExercise,
    completeGymDay, personalRecords: rawPRs, addPersonalRecord, cardioLog: rawCardio, logCardio } = useSystemStore();

  const gymSchedule = rawSchedule || {};
  const personalRecords = rawPRs || [];
  const cardioLog = rawCardio || [];

  const [activeDay, setActiveDay] = useState('Mon');
  const [activeTab, setActiveTab] = useState('workout');
  const [exForm, setExForm] = useState({ name: '', sets: 3, reps: 10, weight: 0 });
  const [prForm, setPrForm] = useState({ exercise: '', weight: 0, reps: 1 });
  const [cardioForm, setCardioForm] = useState({ type: 'Running', duration: 30, distance: 0, calories: 0 });
  const [showNotes, setShowNotes] = useState(false);

  const day = gymSchedule[activeDay] || { type: 'Rest', exercises: [], notes: '', completed: false };

  const handleAddEx = () => {
    if (!exForm.name.trim()) return;
    addExercise(activeDay, exForm);
    setExForm({ name: '', sets: 3, reps: 10, weight: 0 });
  };

  const handleAddPR = () => {
    if (!prForm.exercise.trim()) return;
    addPersonalRecord(prForm);
    setPrForm({ exercise: '', weight: 0, reps: 1 });
  };

  const handleLogCardio = () => {
    logCardio(cardioForm);
    setCardioForm({ type: 'Running', duration: 30, distance: 0, calories: 0 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Day Selector */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {DAYS.map((d) => {
          const done = gymSchedule[d]?.completed;
          return (
            <motion.button key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDay(d)}
              style={{
                padding: '6px 12px', fontFamily: 'Orbitron', fontSize: 11, cursor: 'pointer',
                background: activeDay === d ? 'rgba(255,68,102,0.15)' : 'transparent',
                border: `1px solid ${activeDay === d ? '#ff4466' : done ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,102,0.2)'}`,
                color: activeDay === d ? '#ff4466' : done ? '#00ff88' : '#7ab8d4',
                boxShadow: activeDay === d ? '0 0 10px rgba(255,68,102,0.3)' : 'none',
                transition: 'all 0.2s', position: 'relative',
              }}>
              {d}{done && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 8 }}>✓</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Day type + complete */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <select value={day.type} onChange={(e) => updateGymDay(activeDay, { type: e.target.value })} style={{ flex: 1 }}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn-neon" onClick={() => setShowNotes((n) => !n)}
          style={{ padding: '6px 10px', borderColor: '#7ab8d4', color: '#7ab8d4' }}>
          <FileText size={13} />
        </button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-neon" onClick={() => completeGymDay(activeDay)}
          disabled={day.completed}
          style={{ opacity: day.completed ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6,
            borderColor: '#ff4466', color: '#ff4466' }}>
          <CheckCircle size={14} />
          {day.completed ? 'DONE ✓' : 'COMPLETE'}
        </motion.button>
      </div>

      {/* Notes */}
      <AnimatePresence>
        {showNotes && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}>
            <textarea placeholder="Session notes, how you felt, PRs hit..."
              value={day.notes || ''} rows={3}
              onChange={(e) => updateGymNotes(activeDay, e.target.value)}
              style={{ width: '100%', resize: 'vertical', padding: '8px 12px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,68,102,0.15)', paddingBottom: 8 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '6px 12px', background: activeTab === id ? 'rgba(255,68,102,0.12)' : 'transparent',
            border: `1px solid ${activeTab === id ? '#ff4466' : 'transparent'}`,
            color: activeTab === id ? '#ff4466' : '#7ab8d4', cursor: 'pointer',
            fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, letterSpacing: 1,
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
          }}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'workout' && (
          <motion.div key="workout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {day.type === 'Rest' ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#7ab8d4' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>😴</div>
                <div className="orbitron" style={{ fontSize: 13 }}>REST DAY — RECOVER & RECHARGE</div>
                <div style={{ fontSize: 12, marginTop: 8, color: '#7ab8d4' }}>
                  Sleep well · Eat clean · Hydrate
                </div>
              </div>
            ) : (
              <>
                <div style={{ padding: 12, background: 'rgba(255,68,102,0.04)',
                  border: '1px solid rgba(255,68,102,0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 10, color: '#ff4466', letterSpacing: 2 }}>ADD EXERCISE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
                    <input placeholder="Exercise name" value={exForm.name}
                      onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddEx()}
                      style={{ gridColumn: 'span 2' }} />
                    <input type="number" placeholder="Sets" value={exForm.sets}
                      onChange={(e) => setExForm({ ...exForm, sets: Number(e.target.value) })} />
                    <input type="number" placeholder="Reps" value={exForm.reps}
                      onChange={(e) => setExForm({ ...exForm, reps: Number(e.target.value) })} />
                    <input type="number" placeholder="kg" value={exForm.weight}
                      onChange={(e) => setExForm({ ...exForm, weight: Number(e.target.value) })} />
                  </div>
                  <button className="btn-neon" onClick={handleAddEx}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                      borderColor: '#ff4466', color: '#ff4466' }}>
                    <Plus size={13} /> ADD
                  </button>
                </div>
                {day.exercises.length === 0
                  ? <div style={{ textAlign: 'center', padding: 24, color: '#7ab8d4' }}>
                      <Dumbbell size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                      <div style={{ fontSize: 12 }}>No exercises yet</div>
                    </div>
                  : day.exercises.map((ex, i) => (
                    <motion.div key={ex.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ padding: '10px 12px',
                        background: 'rgba(255,68,102,0.04)', border: '1px solid rgba(255,68,102,0.1)',
                        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: '#e0f4ff', flex: '1 1 120px' }}>{ex.name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#ff4466', fontFamily: 'Orbitron', fontSize: 11 }}>{ex.sets}×{ex.reps}</span>
                        <span style={{ color: '#7ab8d4', fontSize: 12 }}>{ex.weight}kg</span>
                        <button className="btn-neon btn-danger" style={{ padding: '3px 7px' }}
                          onClick={() => removeExercise(activeDay, ex.id)}><Trash2 size={11} /></button>
                      </div>
                    </motion.div>
                  ))
                }
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'cardio' && (
          <motion.div key="cardio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(255,68,102,0.04)',
              border: '1px solid rgba(255,68,102,0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, color: '#ff4466', letterSpacing: 2 }}>LOG CARDIO SESSION</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select value={cardioForm.type} onChange={(e) => setCardioForm({ ...cardioForm, type: e.target.value })}>
                  {CARDIO_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input type="number" placeholder="Duration (min)" value={cardioForm.duration}
                  onChange={(e) => setCardioForm({ ...cardioForm, duration: Number(e.target.value) })} />
                <input type="number" placeholder="Distance (km)" value={cardioForm.distance}
                  onChange={(e) => setCardioForm({ ...cardioForm, distance: Number(e.target.value) })} />
                <input type="number" placeholder="Calories" value={cardioForm.calories}
                  onChange={(e) => setCardioForm({ ...cardioForm, calories: Number(e.target.value) })} />
              </div>
              <button className="btn-neon" onClick={handleLogCardio}
                style={{ alignSelf: 'flex-start', borderColor: '#ff4466', color: '#ff4466',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={13} /> LOG SESSION
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cardioLog.slice(0, 10).map((c) => (
                <div key={c.id} style={{ padding: '10px 12px', background: 'rgba(255,68,102,0.03)',
                  border: '1px solid rgba(255,68,102,0.1)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#e0f4ff' }}>{c.type}</span>
                    <span style={{ fontSize: 11, color: '#7ab8d4', marginLeft: 8 }}>{c.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span style={{ color: '#ff4466' }}>{c.duration}min</span>
                    {c.distance > 0 && <span style={{ color: '#7ab8d4' }}>{c.distance}km</span>}
                    {c.calories > 0 && <span style={{ color: '#ffaa00' }}>{c.calories}kcal</span>}
                  </div>
                </div>
              ))}
              {cardioLog.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#7ab8d4', fontSize: 12 }}>
                  No cardio sessions logged yet
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'pr' && (
          <motion.div key="pr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(255,215,0,0.04)',
              border: '1px solid rgba(255,215,0,0.15)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2 }}>LOG PERSONAL RECORD</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                <input placeholder="Exercise" value={prForm.exercise}
                  onChange={(e) => setPrForm({ ...prForm, exercise: e.target.value })} />
                <input type="number" placeholder="Weight (kg)" value={prForm.weight}
                  onChange={(e) => setPrForm({ ...prForm, weight: Number(e.target.value) })} />
                <input type="number" placeholder="Reps" value={prForm.reps}
                  onChange={(e) => setPrForm({ ...prForm, reps: Number(e.target.value) })} />
              </div>
              <button className="btn-neon" onClick={handleAddPR}
                style={{ alignSelf: 'flex-start', borderColor: '#ffd700', color: '#ffd700',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trophy size={13} /> SAVE PR
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {personalRecords.slice(0, 15).map((pr) => (
                <div key={pr.id} style={{ padding: '10px 12px', background: 'rgba(255,215,0,0.04)',
                  border: '1px solid rgba(255,215,0,0.12)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#e0f4ff' }}>{pr.exercise}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="orbitron" style={{ color: '#ffd700', fontSize: 13 }}>{pr.weight}kg × {pr.reps}</span>
                    <span style={{ fontSize: 10, color: '#7ab8d4' }}>{pr.date}</span>
                  </div>
                </div>
              ))}
              {personalRecords.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#7ab8d4', fontSize: 12 }}>
                  <Trophy size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                  No PRs logged yet. Crush it!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'timer' && (
          <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RestTimer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
