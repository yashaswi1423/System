import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckSquare, Square, Droplets, Moon } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

const CATEGORIES = [
  { key: 'morning', label: 'Morning',  icon: '🌅', color: '#ffaa00' },
  { key: 'evening', label: 'Evening',  icon: '🌙', color: '#aa88ff' },
  { key: 'daily',   label: 'Daily',    icon: '📋', color: '#00f5ff' },
  { key: 'weekly',  label: 'Weekly',   icon: '📅', color: '#00ff88' },
];

const WATER_GOAL = 8; // glasses
const MOOD_LABELS = ['😞 Terrible', '😕 Bad', '😐 Okay', '🙂 Good', '😄 Great'];

export default function TasksModule() {
  const { tasks: rawTasks, toggleTask, addTask, removeTask,
    habits: rawHabits, updateHabitStreak, addHabit, removeHabit,
    waterLog, logWater, sleepLog, logSleep } = useSystemStore();

  const tasks = {
    morning: rawTasks?.morning || [],
    evening: rawTasks?.evening || [],
    daily:   rawTasks?.daily   || [],
    weekly:  rawTasks?.weekly  || [],
  };
  const habits = rawHabits || [];

  const [activeTab, setActiveTab] = useState('morning');
  const [newTask, setNewTask] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [activeSection, setActiveSection] = useState('tasks'); // tasks | habits | water | sleep
  const [waterGlasses, setWaterGlasses] = useState(waterLog[0]?.date === new Date().toLocaleDateString() ? waterLog[0].glasses : 0);
  const [sleepForm, setSleepForm] = useState({ hours: 7, quality: 3, note: '' });

  const cat = CATEGORIES.find((c) => c.key === activeTab);
  const list = tasks[activeTab] || [];
  const completedCount = list.filter((t) => t.completed).length;
  const today = new Date().toDateString();

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask(activeTab, newTask.trim());
    setNewTask('');
  };

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    addHabit(newHabit.trim());
    setNewHabit('');
  };

  const handleWaterLog = (glasses) => {
    setWaterGlasses(glasses);
    logWater(glasses);
  };

  const handleSleepLog = () => {
    logSleep(sleepForm);
  };

  const todaySleep = sleepLog[0]?.date === new Date().toLocaleDateString() ? sleepLog[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Section switcher */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[
          { id: 'tasks',  label: '✅ Tasks',   color: '#00f5ff' },
          { id: 'habits', label: '🔥 Habits',  color: '#ffaa00' },
          { id: 'water',  label: '💧 Water',   color: '#4488ff' },
          { id: 'sleep',  label: '😴 Sleep',   color: '#aa88ff' },
        ].map(({ id, label, color }) => (
          <button key={id} onClick={() => setActiveSection(id)} style={{
            padding: '6px 14px', background: activeSection === id ? `${color}18` : 'transparent',
            border: `1px solid ${activeSection === id ? color : 'rgba(0,245,255,0.15)'}`,
            color: activeSection === id ? color : '#7ab8d4', cursor: 'pointer',
            fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, letterSpacing: 1,
            transition: 'all 0.2s', boxShadow: activeSection === id ? `0 0 8px ${color}33` : 'none',
          }}>{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── TASKS ── */}
        {activeSection === 'tasks' && (
          <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {CATEGORIES.map((c) => {
                const done = (tasks[c.key] || []).filter((t) => t.completed).length;
                const total = (tasks[c.key] || []).length;
                return (
                  <button key={c.key} onClick={() => setActiveTab(c.key)} style={{
                    flex: 1, padding: '7px 6px',
                    background: activeTab === c.key ? `${c.color}18` : 'transparent',
                    border: `1px solid ${activeTab === c.key ? c.color : 'rgba(0,245,255,0.15)'}`,
                    color: activeTab === c.key ? c.color : '#7ab8d4', cursor: 'pointer',
                    fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                    transition: 'all 0.2s', textAlign: 'center',
                  }}>
                    <div>{c.icon}</div>
                    <div>{c.label}</div>
                    {total > 0 && <div style={{ fontSize: 9, opacity: 0.7 }}>{done}/{total}</div>}
                  </button>
                );
              })}
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#7ab8d4' }}>PROGRESS</span>
                <span className="orbitron" style={{ color: cat.color, fontSize: 10 }}>
                  {completedCount} / {list.length}
                </span>
              </div>
              <div className="xp-bar">
                <motion.div className="xp-bar-fill"
                  animate={{ width: list.length ? `${(completedCount / list.length) * 100}%` : '0%' }}
                  style={{ background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
                    boxShadow: `0 0 8px ${cat.color}` }} />
              </div>
            </div>

            {/* Task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <AnimatePresence>
                {list.map((task, i) => (
                  <motion.div key={task.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      background: task.completed ? 'rgba(0,255,136,0.05)' : 'rgba(0,245,255,0.03)',
                      border: `1px solid ${task.completed ? 'rgba(0,255,136,0.2)' : 'rgba(0,245,255,0.08)'}`,
                      cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => toggleTask(activeTab, task.id)}>
                    <motion.div whileTap={{ scale: 0.8 }}>
                      {task.completed
                        ? <CheckSquare size={17} color="#00ff88" />
                        : <Square size={17} color="#7ab8d4" />}
                    </motion.div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500,
                      color: task.completed ? '#00ff88' : '#e0f4ff',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.7 : 1 }}>
                      {task.title}
                    </span>
                    {(activeTab === 'daily' || activeTab === 'weekly') && (
                      <button className="btn-neon btn-danger" style={{ padding: '2px 6px' }}
                        onClick={(e) => { e.stopPropagation(); removeTask(activeTab, task.id); }}>
                        <Trash2 size={10} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add task */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder={`Add to ${cat.label.toLowerCase()} routine...`}
                value={newTask} onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <button className="btn-neon" onClick={handleAdd}><Plus size={14} /></button>
            </div>
          </motion.div>
        )}

        {/* ── HABITS ── */}
        {activeSection === 'habits' && (
          <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2 }}>DAILY HABIT TRACKER</div>
            {habits.map((h) => {
              const doneToday = h.lastCompleted && new Date(h.lastCompleted).toDateString() === today;
              const streakColor = h.streak >= 30 ? '#ffd700' : h.streak >= 7 ? '#ff8800' : h.streak >= 3 ? '#00ff88' : '#7ab8d4';
              return (
                <motion.div key={h.id} whileHover={{ scale: 1.01 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: doneToday ? 'rgba(0,255,136,0.06)' : 'rgba(0,245,255,0.03)',
                    border: `1px solid ${doneToday ? 'rgba(0,255,136,0.25)' : 'rgba(0,245,255,0.1)'}`,
                    cursor: doneToday ? 'default' : 'pointer' }}
                  onClick={() => !doneToday && updateHabitStreak(h.id)}>
                  <motion.div whileTap={{ scale: 0.7 }}>
                    {doneToday
                      ? <CheckSquare size={17} color="#00ff88" />
                      : <Square size={17} color="#7ab8d4" />}
                  </motion.div>
                  <span style={{ flex: 1, fontSize: 13, color: doneToday ? '#00ff88' : '#e0f4ff' }}>
                    {h.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14 }}>🔥</span>
                    <span className="orbitron" style={{ fontSize: 13, color: streakColor,
                      textShadow: h.streak >= 7 ? `0 0 6px ${streakColor}` : 'none' }}>
                      {h.streak}
                    </span>
                  </div>
                  <button className="btn-neon btn-danger" style={{ padding: '2px 6px' }}
                    onClick={(e) => { e.stopPropagation(); removeHabit(h.id); }}>
                    <Trash2 size={10} />
                  </button>
                </motion.div>
              );
            })}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input placeholder="Add new habit..." value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()} />
              <button className="btn-neon" onClick={handleAddHabit}><Plus size={14} /></button>
            </div>
          </motion.div>
        )}

        {/* ── WATER ── */}
        {activeSection === 'water' && (
          <motion.div key="water" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: '#4488ff', letterSpacing: 2 }}>DAILY WATER INTAKE</div>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(68,136,255,0.1)" strokeWidth="6" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#4488ff" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - Math.min(waterGlasses / WATER_GOAL, 1))}`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease', filter: 'drop-shadow(0 0 6px #4488ff)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={20} color="#4488ff" />
                <span className="orbitron" style={{ fontSize: 20, color: '#4488ff',
                  textShadow: '0 0 8px #4488ff' }}>{waterGlasses}</span>
                <span style={{ fontSize: 10, color: '#7ab8d4' }}>/ {WATER_GOAL}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: WATER_GOAL }, (_, i) => i + 1).map((g) => (
                <motion.button key={g} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleWaterLog(g)}
                  style={{ width: 40, height: 40, borderRadius: '50%',
                    background: waterGlasses >= g ? 'rgba(68,136,255,0.25)' : 'rgba(68,136,255,0.05)',
                    border: `2px solid ${waterGlasses >= g ? '#4488ff' : 'rgba(68,136,255,0.2)'}`,
                    color: waterGlasses >= g ? '#4488ff' : '#7ab8d4', cursor: 'pointer',
                    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: waterGlasses >= g ? '0 0 8px rgba(68,136,255,0.4)' : 'none',
                    transition: 'all 0.2s' }}>
                  💧
                </motion.button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: waterGlasses >= WATER_GOAL ? '#00ff88' : '#7ab8d4' }}>
              {waterGlasses >= WATER_GOAL ? '✓ Daily goal reached!' : `${WATER_GOAL - waterGlasses} more glasses to go`}
            </div>
            {/* Water log history */}
            {waterLog.slice(0, 5).length > 0 && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2 }}>RECENT</div>
                {waterLog.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '6px 10px', background: 'rgba(68,136,255,0.04)',
                    border: '1px solid rgba(68,136,255,0.1)', fontSize: 12 }}>
                    <span style={{ color: '#7ab8d4' }}>{w.date}</span>
                    <span style={{ color: '#4488ff', fontFamily: 'Orbitron' }}>{w.glasses} / {WATER_GOAL} glasses</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── SLEEP ── */}
        {activeSection === 'sleep' && (
          <motion.div key="sleep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 10, color: '#aa88ff', letterSpacing: 2 }}>SLEEP TRACKER</div>
            <div style={{ padding: 16, background: 'rgba(170,136,255,0.05)',
              border: '1px solid rgba(170,136,255,0.15)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Moon size={20} color="#aa88ff" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#7ab8d4' }}>Hours slept</span>
                    <span className="orbitron" style={{ color: '#aa88ff', fontSize: 13 }}>{sleepForm.hours}h</span>
                  </div>
                  <input type="range" min="3" max="12" step="0.5" value={sleepForm.hours}
                    onChange={(e) => setSleepForm({ ...sleepForm, hours: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#aa88ff' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#7ab8d4', marginBottom: 8 }}>Sleep quality</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {MOOD_LABELS.map((label, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setSleepForm({ ...sleepForm, quality: i + 1 })}
                      style={{ flex: 1, padding: '8px 4px', fontSize: 11,
                        background: sleepForm.quality === i + 1 ? 'rgba(170,136,255,0.2)' : 'transparent',
                        border: `1px solid ${sleepForm.quality === i + 1 ? '#aa88ff' : 'rgba(170,136,255,0.15)'}`,
                        color: sleepForm.quality === i + 1 ? '#aa88ff' : '#7ab8d4',
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                      {label.split(' ')[0]}
                    </motion.button>
                  ))}
                </div>
              </div>
              <input placeholder="Notes (optional)" value={sleepForm.note}
                onChange={(e) => setSleepForm({ ...sleepForm, note: e.target.value })} />
              <button className="btn-neon" onClick={handleSleepLog}
                style={{ borderColor: '#aa88ff', color: '#aa88ff',
                  display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <Moon size={13} /> LOG SLEEP
              </button>
            </div>
            {/* Sleep history */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {sleepLog.slice(0, 7).map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: 'rgba(170,136,255,0.04)',
                  border: '1px solid rgba(170,136,255,0.1)' }}>
                  <span style={{ fontSize: 12, color: '#7ab8d4' }}>{s.date}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="orbitron" style={{ color: '#aa88ff', fontSize: 13 }}>{s.hours}h</span>
                    <span style={{ fontSize: 14 }}>{MOOD_LABELS[(s.quality || 3) - 1]?.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
              {sleepLog.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: '#7ab8d4', fontSize: 12 }}>
                  No sleep data logged yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
