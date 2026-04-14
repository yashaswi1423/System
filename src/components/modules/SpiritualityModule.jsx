import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Pause, RotateCcw, Wind, Heart, BookOpen, Star } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

const MEDITATION_TYPES = ['Mindfulness', 'Breathing', 'Body Scan', 'Visualization', 'Mantra', 'Silent', 'Guided'];
const BREATHWORK_TECHNIQUES = [
  { id: 'box',    name: 'Box Breathing',     desc: '4-4-4-4',  pattern: [4,4,4,4] },
  { id: '478',    name: '4-7-8 Technique',   desc: '4-7-8',    pattern: [4,7,8,0] },
  { id: 'wim',    name: 'Wim Hof',           desc: '30 deep breaths + hold', pattern: [2,0,15,0] },
  { id: 'calm',   name: 'Calm Breath',       desc: '5-5',      pattern: [5,0,5,0] },
  { id: 'energy', name: 'Energy Breath',     desc: '6-2-6',    pattern: [6,2,6,0] },
];
const MOOD_EMOJIS = ['😞','😕','😐','🙂','😄'];
const TABS = [
  { id: 'meditate',   label: 'Meditate',   icon: '🧘' },
  { id: 'breathwork', label: 'Breathwork', icon: '🌬️' },
  { id: 'gratitude',  label: 'Gratitude',  icon: '🙏' },
  { id: 'affirmations', label: 'Affirm',   icon: '⚡' },
  { id: 'mood',       label: 'Mood',       icon: '💜' },
  { id: 'reflect',    label: 'Reflect',    icon: '📖' },
];

function MeditationTimer({ onComplete }) {
  const [duration, setDuration] = useState(10);
  const [type, setType] = useState('Mindfulness');
  const [seconds, setSeconds] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setSeconds(duration * 60);
    setDone(false);
  }, [duration]);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { clearInterval(ref.current); setRunning(false); setDone(true); return 0; }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pct = ((duration * 60 - seconds) / (duration * 60)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[5, 10, 15, 20, 30].map((m) => (
          <button key={m} className="btn-neon" style={{ padding: '4px 12px', fontSize: 11,
            borderColor: duration === m ? '#ffaa00' : undefined, color: duration === m ? '#ffaa00' : undefined }}
            onClick={() => { setDuration(m); setRunning(false); }}>
            {m}m
          </button>
        ))}
      </div>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {MEDITATION_TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        padding: 20, background: 'rgba(255,170,0,0.04)', border: '1px solid rgba(255,170,0,0.15)' }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,170,0,0.1)" strokeWidth="5" />
            <circle cx="70" cy="70" r="60" fill="none" stroke="#ffaa00" strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 8px #ffaa00)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 28 }}>🧘</span>
            <span className="orbitron" style={{ fontSize: 22, color: '#ffaa00',
              textShadow: '0 0 10px #ffaa00' }}>{fmt(seconds)}</span>
          </div>
        </div>
        {done ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ textAlign: 'center', color: '#00ff88' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>✨</div>
            <div className="orbitron" style={{ fontSize: 13 }}>SESSION COMPLETE</div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-neon" onClick={() => setRunning((r) => !r)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#ffaa00', color: '#ffaa00' }}>
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? 'PAUSE' : 'BEGIN'}
            </button>
            <button className="btn-neon" onClick={() => { setRunning(false); setSeconds(duration * 60); setDone(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={14} /> RESET
            </button>
          </div>
        )}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea placeholder="How was your session? Any insights?" value={notes} rows={3}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', resize: 'vertical', padding: '8px 12px' }} />
          <button className="btn-neon" onClick={() => { onComplete({ duration, type, notes }); setNotes(''); setDone(false); setSeconds(duration * 60); }}
            style={{ borderColor: '#ffaa00', color: '#ffaa00', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <Star size={13} /> SAVE SESSION (+15 XP)
          </button>
        </motion.div>
      )}
    </div>
  );
}

function BreathworkGuide() {
  const [selected, setSelected] = useState(BREATHWORK_TECHNIQUES[0]);
  const [phase, setPhase] = useState(0); // 0=inhale 1=hold 2=exhale 3=hold2
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const { logBreathwork } = useSystemStore();
  const ref = useRef(null);
  const PHASE_LABELS = ['INHALE', 'HOLD', 'EXHALE', 'HOLD'];
  const PHASE_COLORS = ['#00f5ff', '#ffaa00', '#aa88ff', '#ffaa00'];

  useEffect(() => {
    if (!running) { clearInterval(ref.current); return; }
    // Skip all zero-duration phases in one pass to avoid re-render loops
    let currentPhase = phase;
    let skips = 0;
    while (selected.pattern[currentPhase] === 0 && skips < 4) {
      currentPhase = (currentPhase + 1) % 4;
      skips++;
    }
    if (currentPhase !== phase) { setPhase(currentPhase); return; }
    const dur = selected.pattern[phase];
    setCount(dur);
    ref.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(ref.current);
          setPhase((p) => {
            const next = (p + 1) % 4;
            if (next === 0) setCycles((cy) => cy + 1);
            return next;
          });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, phase, selected]);

  const phaseDur = selected.pattern[phase] || 1;
  const pct = count > 0 ? ((phaseDur - count) / phaseDur) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {BREATHWORK_TECHNIQUES.map((t) => (
          <button key={t.id} onClick={() => { setSelected(t); setRunning(false); setPhase(0); setCycles(0); }}
            style={{ padding: '10px 14px', background: selected.id === t.id ? 'rgba(0,245,255,0.08)' : 'transparent',
              border: `1px solid ${selected.id === t.id ? '#00f5ff' : 'rgba(0,245,255,0.1)'}`,
              color: selected.id === t.id ? '#00f5ff' : '#7ab8d4', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
            <span style={{ fontSize: 11, color: '#7ab8d4' }}>{t.desc}</span>
          </button>
        ))}
      </div>
      {running && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ padding: 20, background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 3 }}>CYCLE {cycles + 1}</div>
          <motion.div
            animate={{ scale: phase === 0 ? [1, 1.3] : phase === 2 ? [1.3, 1] : 1 }}
            transition={{ duration: phaseDur, ease: 'linear' }}
            style={{ width: 100, height: 100, borderRadius: '50%',
              background: `radial-gradient(circle, ${PHASE_COLORS[phase]}22, transparent)`,
              border: `3px solid ${PHASE_COLORS[phase]}`,
              boxShadow: `0 0 20px ${PHASE_COLORS[phase]}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="orbitron" style={{ fontSize: 28, color: PHASE_COLORS[phase] }}>{count}</span>
          </motion.div>
          <div className="orbitron" style={{ fontSize: 14, color: PHASE_COLORS[phase], letterSpacing: 3 }}>
            {PHASE_LABELS[phase]}
          </div>
        </motion.div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-neon" onClick={() => setRunning((r) => !r)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Wind size={14} /> {running ? 'PAUSE' : 'START'}
        </button>
        {cycles > 0 && (
          <button className="btn-neon" onClick={() => { setRunning(false); logBreathwork({ technique: selected.name, duration: cycles * 4, cycles }); setCycles(0); setPhase(0); }}
            style={{ borderColor: '#00ff88', color: '#00ff88' }}>
            SAVE (+10 XP)
          </button>
        )}
      </div>
    </div>
  );
}

export default function SpiritualityModule() {
  const { spirituality, logMeditation, logGratitude, logMood, logReflection,
    addAffirmation, removeAffirmation } = useSystemStore();
  const [activeTab, setActiveTab] = useState('meditate');
  const [gratitudeInputs, setGratitudeInputs] = useState(['', '', '']);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [selectedMood, setSelectedMood] = useState(3);
  const [reflectionText, setReflectionText] = useState('');
  const [affirmIdx, setAffirmIdx] = useState(0);

  const sp = spirituality || { meditationLog: [], gratitudeLog: [], affirmations: [], moodLog: [], reflectionLog: [], breathworkLog: [], meditationStreak: 0 };
  const safeAffirmations = sp.affirmations || [];

  useEffect(() => {
    const t = setInterval(() => setAffirmIdx((i) => (i + 1) % Math.max(safeAffirmations.length, 1)), 6000);
    return () => clearInterval(t);
  }, [safeAffirmations.length]);

  const handleGratitude = () => {
    const filled = gratitudeInputs.filter((g) => g.trim());
    if (filled.length === 0) return;
    logGratitude(filled);
    setGratitudeInputs(['', '', '']);
  };

  const handleMood = () => {
    logMood(selectedMood, moodNote);
    setMoodNote('');
  };

  const handleReflection = () => {
    if (!reflectionText.trim()) return;
    logReflection(reflectionText);
    setReflectionText('');
  };

  const todayMood = sp.moodLog[0]?.date === new Date().toDateString() ? sp.moodLog[0] : null;
  const moodAvg = sp.moodLog.slice(0, 7).length > 0
    ? (sp.moodLog.slice(0, 7).reduce((a, b) => a + b.mood, 0) / sp.moodLog.slice(0, 7).length).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'MED STREAK', value: `${sp.meditationStreak}🔥`, color: '#ffaa00' },
          { label: 'SESSIONS', value: sp.meditationLog.length, color: '#ffaa00' },
          { label: '7D MOOD', value: moodAvg ? `${moodAvg}/5` : '—', color: '#aa88ff' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,170,0,0.06)',
            border: '1px solid rgba(255,170,0,0.15)', textAlign: 'center' }}>
            <div className="orbitron" style={{ fontSize: 16, color, textShadow: `0 0 8px ${color}` }}>{value}</div>
            <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,170,0,0.15)', paddingBottom: 8 }}>
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '5px 10px', background: activeTab === id ? 'rgba(255,170,0,0.12)' : 'transparent',
            border: `1px solid ${activeTab === id ? '#ffaa00' : 'transparent'}`,
            color: activeTab === id ? '#ffaa00' : '#7ab8d4', cursor: 'pointer',
            fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
          }}>
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'meditate' && (
          <motion.div key="med" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MeditationTimer onComplete={logMeditation} />
            {sp.meditationLog.slice(0, 5).length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2 }}>RECENT SESSIONS</div>
                {sp.meditationLog.slice(0, 5).map((m) => (
                  <div key={m.id} style={{ padding: '8px 12px', background: 'rgba(255,170,0,0.04)',
                    border: '1px solid rgba(255,170,0,0.1)',
                    display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#e0f4ff' }}>{m.type}</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: '#ffaa00', fontFamily: 'Orbitron' }}>{m.duration}m</span>
                      <span style={{ color: '#7ab8d4' }}>{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'breathwork' && (
          <motion.div key="breath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BreathworkGuide />
            {sp.breathworkLog.slice(0, 5).length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2 }}>RECENT</div>
                {sp.breathworkLog.slice(0, 5).map((b) => (
                  <div key={b.id} style={{ padding: '8px 12px', background: 'rgba(0,245,255,0.04)',
                    border: '1px solid rgba(0,245,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#e0f4ff' }}>{b.technique}</span>
                    <span style={{ color: '#7ab8d4' }}>{b.date}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'gratitude' && (
          <motion.div key="grat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, background: 'rgba(255,170,0,0.04)',
              border: '1px solid rgba(255,170,0,0.15)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: 2 }}>TODAY'S GRATITUDE</div>
              {gratitudeInputs.map((val, i) => (
                <input key={i} placeholder={`I am grateful for... (${i + 1})`} value={val}
                  onChange={(e) => { const n = [...gratitudeInputs]; n[i] = e.target.value; setGratitudeInputs(n); }} />
              ))}
              <button className="btn-neon" onClick={handleGratitude}
                style={{ borderColor: '#ffaa00', color: '#ffaa00', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                🙏 SAVE GRATITUDE (+10 XP)
              </button>
            </div>
            {sp.gratitudeLog.slice(0, 7).map((g) => (
              <div key={g.id} style={{ padding: '10px 14px', background: 'rgba(255,170,0,0.04)',
                border: '1px solid rgba(255,170,0,0.1)' }}>
                <div style={{ fontSize: 10, color: '#ffaa00', marginBottom: 6 }}>{g.date}</div>
                {g.entries.map((e, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#e0f4ff', marginBottom: 3 }}>• {e}</div>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'affirmations' && (
          <motion.div key="affirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {safeAffirmations.length > 0 && (
              <motion.div key={affirmIdx}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '20px 24px', background: 'rgba(255,170,0,0.06)',
                  border: '1px solid rgba(255,170,0,0.2)', textAlign: 'center',
                  boxShadow: '0 0 20px rgba(255,170,0,0.1)' }}>
                <div style={{ fontSize: 10, color: '#ffaa00', letterSpacing: 3, marginBottom: 10 }}>
                  ◈ DAILY AFFIRMATION ◈
                </div>
                <div style={{ fontSize: 15, color: '#e0f4ff', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{safeAffirmations[affirmIdx % safeAffirmations.length]}"
                </div>
              </motion.div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {safeAffirmations.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: 'rgba(255,170,0,0.04)', border: '1px solid rgba(255,170,0,0.1)' }}>
                  <span style={{ fontSize: 12, color: '#ffaa00' }}>◆</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#e0f4ff' }}>{a}</span>
                  <button className="btn-neon btn-danger" style={{ padding: '2px 6px' }}
                    onClick={() => removeAffirmation(i)}><Trash2 size={10} /></button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Add affirmation..." value={newAffirmation}
                onChange={(e) => setNewAffirmation(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newAffirmation.trim()) { addAffirmation(newAffirmation.trim()); setNewAffirmation(''); } }} />
              <button className="btn-neon" onClick={() => { if (newAffirmation.trim()) { addAffirmation(newAffirmation.trim()); setNewAffirmation(''); } }}>
                <Plus size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'mood' && (
          <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 16, background: 'rgba(170,136,255,0.05)',
              border: '1px solid rgba(170,136,255,0.15)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 10, color: '#aa88ff', letterSpacing: 2 }}>HOW ARE YOU FEELING?</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {MOOD_EMOJIS.map((emoji, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMood(i + 1)}
                    style={{ width: 48, height: 48, borderRadius: '50%', fontSize: 22, cursor: 'pointer',
                      background: selectedMood === i + 1 ? 'rgba(170,136,255,0.2)' : 'transparent',
                      border: `2px solid ${selectedMood === i + 1 ? '#aa88ff' : 'rgba(170,136,255,0.15)'}`,
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
              <input placeholder="What's on your mind? (optional)" value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)} />
              <button className="btn-neon" onClick={handleMood}
                style={{ borderColor: '#aa88ff', color: '#aa88ff', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <Heart size={13} /> LOG MOOD
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {sp.moodLog.slice(0, 10).map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: 'rgba(170,136,255,0.04)',
                  border: '1px solid rgba(170,136,255,0.1)' }}>
                  <span style={{ fontSize: 20 }}>{MOOD_EMOJIS[m.mood - 1]}</span>
                  <span style={{ flex: 1, fontSize: 12, color: '#7ab8d4', marginLeft: 10 }}>{m.note || '—'}</span>
                  <span style={{ fontSize: 11, color: '#7ab8d4' }}>{m.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reflect' && (
          <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, background: 'rgba(0,245,255,0.04)',
              border: '1px solid rgba(0,245,255,0.12)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2 }}>DAILY REFLECTION</div>
              <div style={{ fontSize: 12, color: '#7ab8d4', fontStyle: 'italic' }}>
                What did you learn today? What would you do differently? What are you proud of?
              </div>
              <textarea placeholder="Write your reflection..." value={reflectionText} rows={5}
                onChange={(e) => setReflectionText(e.target.value)}
                style={{ width: '100%', resize: 'vertical', padding: '10px 12px' }} />
              <button className="btn-neon" onClick={handleReflection}
                style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <BookOpen size={13} /> SAVE REFLECTION (+8 XP)
              </button>
            </div>
            {sp.reflectionLog.slice(0, 7).map((r) => (
              <div key={r.id} style={{ padding: '12px 14px', background: 'rgba(0,245,255,0.03)',
                border: '1px solid rgba(0,245,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#00f5ff', marginBottom: 6 }}>{r.date}</div>
                <div style={{ fontSize: 13, color: '#c0d8f0', lineHeight: 1.6 }}>{r.text}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
