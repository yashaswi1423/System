import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Pause, RotateCcw, BookOpen, Link, Target, Clock } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

const TABS = [
  { id: 'timer',     label: 'Pomodoro', icon: Clock },
  { id: 'planner',   label: 'Planner',  icon: Target },
  { id: 'resources', label: 'Resources',icon: Link },
  { id: 'log',       label: 'Log',      icon: BookOpen },
];

export default function StudyModule() {
  const { studyPlan: rawPlan, addStudyBlock, removeStudyBlock, completeStudyBlock,
    updateStudyBlockProgress, studyResources: rawResources, addStudyResource, removeStudyResource } = useSystemStore();

  const studyPlan = rawPlan || [];
  const studyResources = rawResources || [];

  const [activeTab, setActiveTab] = useState('timer');
  const [form, setForm] = useState({ subject: '', duration: 60, timeSlot: '09:00', goal: '', priority: 'Medium' });
  const [resForm, setResForm] = useState({ subject: '', title: '', url: '', notes: '' });
  const [timer, setTimer] = useState(POMODORO_WORK);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const intervalRef = useRef(null);

  const workTime = customWork * 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (!isBreak && !isLongBreak) {
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              if (newCount % 4 === 0) { setIsLongBreak(true); setIsBreak(false); return LONG_BREAK; }
              else { setIsBreak(true); setIsLongBreak(false); return POMODORO_BREAK; }
            } else {
              setIsBreak(false); setIsLongBreak(false); return workTime;
            }
          }
          return t - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, isBreak, isLongBreak, pomodoroCount, workTime]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const maxTime = isLongBreak ? LONG_BREAK : isBreak ? POMODORO_BREAK : workTime;
  const progress = ((maxTime - timer) / maxTime) * 100;
  const timerColor = isLongBreak ? '#aa88ff' : isBreak ? '#00ff88' : '#aa88ff';
  const timerLabel = isLongBreak ? 'LONG BREAK' : isBreak ? 'SHORT BREAK' : 'DEEP FOCUS';

  const handleAdd = () => {
    if (!form.subject.trim()) return;
    addStudyBlock(form);
    setForm({ subject: '', duration: 60, timeSlot: '09:00', goal: '', priority: 'Medium' });
  };

  const handleAddRes = () => {
    if (!resForm.title.trim()) return;
    addStudyResource(resForm);
    setResForm({ subject: '', title: '', url: '', notes: '' });
  };

  const totalStudyMins = studyPlan.filter((b) => b.completed).reduce((a, b) => a + (b.duration || 0), 0);
  const completedBlocks = studyPlan.filter((b) => b.completed).length;

  const PRIORITY_COLOR = { High: '#ff4466', Medium: '#ffaa00', Low: '#00ff88' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'SESSIONS', value: completedBlocks, color: '#aa88ff' },
          { label: 'STUDY TIME', value: `${Math.floor(totalStudyMins / 60)}h ${totalStudyMins % 60}m`, color: '#aa88ff' },
          { label: 'POMODOROS', value: pomodoroCount, color: '#aa88ff' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '10px 12px', background: 'rgba(170,136,255,0.06)',
            border: '1px solid rgba(170,136,255,0.15)', textAlign: 'center' }}>
            <div className="orbitron" style={{ fontSize: 18, color, textShadow: `0 0 8px ${color}` }}>{value}</div>
            <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(170,136,255,0.15)', paddingBottom: 8 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '6px 12px', background: activeTab === id ? 'rgba(170,136,255,0.12)' : 'transparent',
            border: `1px solid ${activeTab === id ? '#aa88ff' : 'transparent'}`,
            color: activeTab === id ? '#aa88ff' : '#7ab8d4', cursor: 'pointer',
            fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, letterSpacing: 1,
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
          }}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* POMODORO */}
        {activeTab === 'timer' && (
          <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 20, background: 'rgba(170,136,255,0.05)',
              border: '1px solid rgba(170,136,255,0.15)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 10, color: timerColor, letterSpacing: 4, fontFamily: 'Orbitron' }}>
                — {timerLabel} —
              </div>
              <div style={{ position: 'relative', width: 130, height: 130 }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(170,136,255,0.1)" strokeWidth="5" />
                  <circle cx="65" cy="65" r="56" fill="none" stroke={timerColor} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px ${timerColor})` }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span className="orbitron" style={{ fontSize: 26, color: timerColor,
                    textShadow: `0 0 10px ${timerColor}` }}>{fmt(timer)}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%',
                        background: i < (pomodoroCount % 4) ? timerColor : 'rgba(170,136,255,0.2)' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-neon" onClick={() => setRunning((r) => !r)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#aa88ff', color: '#aa88ff' }}>
                  {running ? <Pause size={14} /> : <Play size={14} />}
                  {running ? 'PAUSE' : 'START'}
                </button>
                <button className="btn-neon" onClick={() => { setRunning(false); setIsBreak(false); setIsLongBreak(false); setTimer(workTime); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={14} /> RESET
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#7ab8d4' }}>Focus:</span>
                {[15, 25, 45, 60].map((m) => (
                  <button key={m} className="btn-neon" style={{ padding: '3px 8px', fontSize: 10,
                    borderColor: customWork === m ? '#aa88ff' : undefined,
                    color: customWork === m ? '#aa88ff' : undefined }}
                    onClick={() => { setCustomWork(m); setTimer(m * 60); setRunning(false); }}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PLANNER */}
        {activeTab === 'planner' && (
          <motion.div key="planner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(170,136,255,0.04)',
              border: '1px solid rgba(170,136,255,0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, color: '#aa88ff', letterSpacing: 2 }}>ADD STUDY BLOCK</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                <input placeholder="Subject / Topic" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  style={{ gridColumn: 'span 2' }} />
                <input type="time" value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} />
                <input type="number" placeholder="mins" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                <input placeholder="Goal for this session" value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })} />
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button className="btn-neon" onClick={handleAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                  borderColor: '#aa88ff', color: '#aa88ff' }}>
                <Plus size={13} /> ADD BLOCK
              </button>
            </div>

            {studyPlan.length === 0
              ? <div style={{ textAlign: 'center', padding: 24, color: '#7ab8d4' }}>
                  <BookOpen size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                  <div style={{ fontSize: 12 }}>No study blocks scheduled</div>
                </div>
              : studyPlan.map((block, i) => (
                <motion.div key={block.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ padding: '12px 14px',
                    background: block.completed ? 'rgba(0,255,136,0.05)' : 'rgba(170,136,255,0.04)',
                    border: `1px solid ${block.completed ? 'rgba(0,255,136,0.2)' : 'rgba(170,136,255,0.12)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: block.completed ? '#00ff88' : '#e0f4ff',
                          textDecoration: block.completed ? 'line-through' : 'none' }}>
                          {block.subject}
                        </span>
                        {block.priority && (
                          <span style={{ fontSize: 9, padding: '1px 6px', border: `1px solid ${PRIORITY_COLOR[block.priority]}`,
                            color: PRIORITY_COLOR[block.priority], fontFamily: 'Orbitron' }}>
                            {block.priority}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#7ab8d4' }}>
                        {block.timeSlot} · {block.duration} min{block.goal && ` · ${block.goal}`}
                      </div>
                      {/* Progress bar */}
                      {!block.completed && (
                        <div style={{ marginTop: 8 }}>
                          <input type="range" min="0" max="100" value={block.progress || 0}
                            onChange={(e) => updateStudyBlockProgress(block.id, Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#aa88ff' }} />
                          <div style={{ fontSize: 10, color: '#aa88ff', textAlign: 'right' }}>
                            {block.progress || 0}% complete
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
                      {!block.completed && (
                        <button className="btn-neon" style={{ padding: '4px 10px', fontSize: 11,
                          borderColor: '#aa88ff', color: '#aa88ff' }}
                          onClick={() => completeStudyBlock(block.id)}>DONE</button>
                      )}
                      <button className="btn-neon btn-danger" style={{ padding: '4px 8px' }}
                        onClick={() => removeStudyBlock(block.id)}><Trash2 size={11} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </motion.div>
        )}

        {/* RESOURCES */}
        {activeTab === 'resources' && (
          <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(170,136,255,0.04)',
              border: '1px solid rgba(170,136,255,0.12)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, color: '#aa88ff', letterSpacing: 2 }}>ADD RESOURCE</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="Subject" value={resForm.subject}
                  onChange={(e) => setResForm({ ...resForm, subject: e.target.value })} />
                <input placeholder="Title" value={resForm.title}
                  onChange={(e) => setResForm({ ...resForm, title: e.target.value })} />
              </div>
              <input placeholder="URL (optional)" value={resForm.url}
                onChange={(e) => setResForm({ ...resForm, url: e.target.value })} />
              <input placeholder="Notes" value={resForm.notes}
                onChange={(e) => setResForm({ ...resForm, notes: e.target.value })} />
              <button className="btn-neon" onClick={handleAddRes}
                style={{ alignSelf: 'flex-start', borderColor: '#aa88ff', color: '#aa88ff',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={13} /> ADD
              </button>
            </div>
            {(studyResources || []).map((r) => (
              <div key={r.id} style={{ padding: '10px 14px', background: 'rgba(170,136,255,0.04)',
                border: '1px solid rgba(170,136,255,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: '#e0f4ff' }}>{r.title}</span>
                    {r.subject && <span style={{ fontSize: 10, color: '#aa88ff', fontFamily: 'Orbitron' }}>{r.subject}</span>}
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: '#00f5ff', textDecoration: 'none' }}>
                      🔗 {r.url.slice(0, 40)}{r.url.length > 40 ? '...' : ''}
                    </a>
                  )}
                  {r.notes && <div style={{ fontSize: 11, color: '#7ab8d4', marginTop: 3 }}>{r.notes}</div>}
                </div>
                <button className="btn-neon btn-danger" style={{ padding: '3px 7px', flexShrink: 0 }}
                  onClick={() => removeStudyResource(r.id)}><Trash2 size={11} /></button>
              </div>
            ))}
            {(!studyResources || studyResources.length === 0) && (
              <div style={{ textAlign: 'center', padding: 24, color: '#7ab8d4', fontSize: 12 }}>
                No resources saved yet
              </div>
            )}
          </motion.div>
        )}

        {/* LOG */}
        {activeTab === 'log' && (
          <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 4 }}>COMPLETED SESSIONS</div>
            {studyPlan.filter((b) => b.completed).length === 0
              ? <div style={{ textAlign: 'center', padding: 24, color: '#7ab8d4', fontSize: 12 }}>
                  No completed sessions yet
                </div>
              : studyPlan.filter((b) => b.completed).map((b) => (
                <div key={b.id} style={{ padding: '10px 12px', background: 'rgba(0,255,136,0.04)',
                  border: '1px solid rgba(0,255,136,0.12)',
                  display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#00ff88', fontWeight: 600 }}>✓ {b.subject}</span>
                  <span style={{ color: '#7ab8d4', fontSize: 12 }}>{b.duration} min</span>
                </div>
              ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
