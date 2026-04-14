import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

const DEFAULT_HABITS = [
  { id: 'hg_wake',     name: 'Wake Up 5:00 AM', icon: '⏰', color: '#ffaa00' },
  { id: 'hg_gym',      name: 'Gym',              icon: '🏋️', color: '#ff4466' },
  { id: 'hg_kodtantra',name: 'KodTantra 1hr',    icon: '💻', color: '#aa88ff' },
  { id: 'hg_reading',  name: 'Reading',           icon: '📚', color: '#4488ff' },
  { id: 'hg_meditate', name: 'Meditation',        icon: '🧘', color: '#ffaa00' },
  { id: 'hg_water',    name: 'Drink 3L Water',    icon: '💧', color: '#00f5ff' },
  { id: 'hg_nojunk',   name: 'No Junk Food',      icon: '🥗', color: '#00ff88' },
  { id: 'hg_journal',  name: 'Goal Journaling',   icon: '📓', color: '#ffd700' },
  { id: 'hg_coldshower',name: 'Cold Shower',      icon: '🚿', color: '#00f5ff' },
  { id: 'hg_nosocial', name: 'Social Media Detox',icon: '🌿', color: '#00ff88' },
  { id: 'hg_sleep',    name: 'Sleep by 11 PM',    icon: '😴', color: '#aa88ff' },
  { id: 'hg_protein',  name: 'Hit Protein Goal',  icon: '🥩', color: '#ff4466' },
];

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function HabitGridTracker() {
  const { habitGridLog, toggleHabitGrid, habits: storeHabits } = useSystemStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [gridHabits, setGridHabits] = useState(DEFAULT_HABITS);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = getMonthKey(viewDate);
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  const grid = (habitGridLog || {})[monthKey] || {};

  const isChecked = (habitId, day) => !!(grid[habitId]?.[day]);

  const handleToggle = (habitId, day) => {
    toggleHabitGrid(habitId, monthKey, day);
  };

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const colors = ['#00f5ff', '#ff4466', '#aa88ff', '#ffaa00', '#00ff88', '#ffd700'];
    setGridHabits((h) => [...h, {
      id: `hg_custom_${Date.now()}`,
      name: newHabitName.trim(),
      icon: '⭐',
      color: colors[h.length % colors.length],
    }]);
    setNewHabitName('');
    setShowAdd(false);
  };

  const removeHabit = (id) => setGridHabits((h) => h.filter((x) => x.id !== id));

  // Per-habit completion % for this month
  const completionPct = (habitId) => {
    const relevantDays = isCurrentMonth ? todayDay : daysInMonth;
    const checked = Object.keys(grid[habitId] || {}).filter((d) => grid[habitId][d] && Number(d) <= relevantDays).length;
    return relevantDays > 0 ? Math.round((checked / relevantDays) * 100) : 0;
  };

  // Overall month score
  const totalCells = gridHabits.length * (isCurrentMonth ? todayDay : daysInMonth);
  const relevantDayLimit = isCurrentMonth ? todayDay : daysInMonth;
  const checkedCells = gridHabits.reduce((acc, h) => {
    return acc + Object.entries(grid[h.id] || {})
      .filter(([d, v]) => v && Number(d) <= relevantDayLimit).length;
  }, 0);
  const overallPct = totalCells > 0 ? Math.round((checkedCells / totalCells) * 100) : 0;

  // Day columns to show — on mobile show last 10 days of current view
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div style={{
      background: 'rgba(4,18,37,0.85)',
      border: '1px solid rgba(0,245,255,0.2)',
      backdropFilter: 'blur(20px)',
      padding: '20px 16px',
      position: 'relative',
    }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14,
        borderTop: '2px solid #00f5ff', borderLeft: '2px solid #00f5ff' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14,
        borderBottom: '2px solid #00f5ff', borderRight: '2px solid #00f5ff' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="orbitron neon-text" style={{ fontSize: 12, letterSpacing: 3 }}>
            HABIT GRID
          </div>
          <div style={{ fontSize: 11, color: '#7ab8d4', marginTop: 2 }}>
            Monthly tracker — tap to mark
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-neon" style={{ padding: '4px 8px' }} onClick={prevMonth}>
            <ChevronLeft size={13} />
          </button>
          <span className="orbitron" style={{ fontSize: 11, color: '#00f5ff', minWidth: 110, textAlign: 'center' }}>
            {getMonthLabel(viewDate)}
          </span>
          <button className="btn-neon" style={{ padding: '4px 8px' }} onClick={nextMonth}>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Overall progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
          <span style={{ color: '#7ab8d4', letterSpacing: 1 }}>MONTHLY SCORE</span>
          <span className="orbitron" style={{
            color: overallPct >= 80 ? '#00ff88' : overallPct >= 50 ? '#ffaa00' : '#ff4466',
            fontSize: 13,
          }}>
            {overallPct}%
          </span>
        </div>
        <div className="xp-bar">
          <motion.div
            className="xp-bar-fill"
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.8 }}
            style={{
              background: overallPct >= 80
                ? 'linear-gradient(90deg, #00ff88, #00f5ff)'
                : overallPct >= 50
                ? 'linear-gradient(90deg, #ffaa00, #ffd700)'
                : 'linear-gradient(90deg, #ff4466, #ff8800)',
              boxShadow: `0 0 8px ${overallPct >= 80 ? '#00ff88' : overallPct >= 50 ? '#ffaa00' : '#ff4466'}`,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#7ab8d4' }}>
          <span>{checkedCells} / {totalCells} cells</span>
          <span>{isCurrentMonth ? `Day ${todayDay} of ${daysInMonth}` : `${daysInMonth} days`}</span>
        </div>
      </div>

      {/* Grid table — horizontally scrollable */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr>
              {/* Habit name column */}
              <th style={{
                textAlign: 'left', padding: '6px 10px 6px 0',
                fontSize: 10, color: '#7ab8d4', letterSpacing: 1,
                fontFamily: 'Orbitron', fontWeight: 400,
                position: 'sticky', left: 0,
                background: 'rgba(4,18,37,0.95)',
                minWidth: 130, zIndex: 2,
                borderBottom: '1px solid rgba(0,245,255,0.15)',
              }}>
                MY HABITS
              </th>
              {/* Day columns */}
              {allDays.map((d) => (
                <th key={d} style={{
                  padding: '4px 2px',
                  fontSize: 9, color: isCurrentMonth && d === todayDay ? '#00f5ff' : '#7ab8d4',
                  fontFamily: 'Orbitron', fontWeight: 400,
                  minWidth: 26, textAlign: 'center',
                  borderBottom: '1px solid rgba(0,245,255,0.15)',
                  background: isCurrentMonth && d === todayDay
                    ? 'rgba(0,245,255,0.08)' : 'transparent',
                }}>
                  {d}
                </th>
              ))}
              {/* % column */}
              <th style={{
                padding: '4px 6px', fontSize: 9, color: '#7ab8d4',
                fontFamily: 'Orbitron', fontWeight: 400, textAlign: 'center',
                borderBottom: '1px solid rgba(0,245,255,0.15)',
                position: 'sticky', right: 0,
                background: 'rgba(4,18,37,0.95)', zIndex: 2,
              }}>%</th>
            </tr>
          </thead>
          <tbody>
            {gridHabits.map((habit, hi) => {
              const pct = completionPct(habit.id);
              return (
                <motion.tr
                  key={habit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: hi * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(0,245,255,0.06)' }}
                >
                  {/* Habit name — sticky left */}
                  <td style={{
                    padding: '7px 10px 7px 0',
                    position: 'sticky', left: 0,
                    background: 'rgba(4,18,37,0.95)', zIndex: 1,
                    whiteSpace: 'nowrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{habit.icon}</span>
                      <span style={{ fontSize: 12, color: '#e0f4ff', fontWeight: 500 }}>
                        {habit.name}
                      </span>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,68,68,0.3)', padding: '0 2px', fontSize: 10,
                          lineHeight: 1, marginLeft: 2 }}
                      >×</button>
                    </div>
                  </td>

                  {/* Day cells */}
                  {allDays.map((d) => {
                    const checked = isChecked(habit.id, d);
                    const isFuture = isCurrentMonth && d > todayDay;
                    const isToday = isCurrentMonth && d === todayDay;
                    return (
                      <td key={d} style={{ padding: '3px 2px', textAlign: 'center' }}>
                        <motion.button
                          whileTap={!isFuture ? { scale: 0.75 } : {}}
                          onClick={() => !isFuture && handleToggle(habit.id, d)}
                          style={{
                            width: 22, height: 22,
                            border: `1px solid ${
                              checked ? habit.color
                              : isToday ? 'rgba(0,245,255,0.5)'
                              : isFuture ? 'rgba(255,255,255,0.04)'
                              : 'rgba(0,245,255,0.15)'
                            }`,
                            background: checked
                              ? `${habit.color}33`
                              : isToday ? 'rgba(0,245,255,0.06)'
                              : 'transparent',
                            cursor: isFuture ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 3,
                            boxShadow: checked ? `0 0 6px ${habit.color}66` : 'none',
                            transition: 'all 0.15s',
                            opacity: isFuture ? 0.25 : 1,
                          }}
                        >
                          {checked && (
                            <motion.svg
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              width="12" height="12" viewBox="0 0 12 12"
                            >
                              <polyline
                                points="2,6 5,9 10,3"
                                fill="none"
                                stroke={habit.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </motion.button>
                      </td>
                    );
                  })}

                  {/* % sticky right */}
                  <td style={{
                    padding: '3px 6px', textAlign: 'center',
                    position: 'sticky', right: 0,
                    background: 'rgba(4,18,37,0.95)', zIndex: 1,
                  }}>
                    <span className="orbitron" style={{
                      fontSize: 10,
                      color: pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffaa00' : pct > 0 ? '#ff4466' : '#7ab8d4',
                    }}>
                      {pct}%
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add habit */}
      <div style={{ marginTop: 14 }}>
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: 8, marginBottom: 8, overflow: 'hidden' }}
            >
              <input
                placeholder="New habit name..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                autoFocus
              />
              <button className="btn-neon" onClick={addHabit} style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}>
                ADD
              </button>
              <button className="btn-neon btn-danger" onClick={() => setShowAdd(false)} style={{ padding: '8px 10px' }}>
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!showAdd && (
          <button
            className="btn-neon"
            onClick={() => setShowAdd(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Plus size={13} /> ADD HABIT
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: '80–100%', color: '#00ff88' },
          { label: '50–79%',  color: '#ffaa00' },
          { label: '1–49%',   color: '#ff4466' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, background: color, borderRadius: 2,
              boxShadow: `0 0 4px ${color}` }} />
            <span style={{ fontSize: 10, color: '#7ab8d4' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
