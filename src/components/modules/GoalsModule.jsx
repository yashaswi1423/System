import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckSquare, Square, Pin, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

const CATEGORY_OPTIONS = ['Physical', 'Coding', 'Career', 'Mindset', 'Finance', 'Education', 'Spiritual', 'Other'];
const CATEGORY_ICONS = { Physical:'💪', Coding:'💻', Career:'🚀', Mindset:'🧠', Finance:'💰', Education:'📚', Spiritual:'🧘', Other:'⭐' };
const TRANSFORMATION_DEADLINE = '2026-12-31';

function daysLeft(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DeadlineChip({ deadline, color }) {
  const days = daysLeft(deadline);
  if (days === null) return null;
  const urgent = days <= 14;
  const overdue = days < 0;
  const bg = overdue ? 'rgba(255,68,68,0.15)' : urgent ? 'rgba(255,170,0,0.12)' : `${color}12`;
  const col = overdue ? '#ff4444' : urgent ? '#ffaa00' : color;
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', border: `1px solid ${col}55`,
      color: col, background: bg, fontFamily: 'Orbitron', letterSpacing: 0.5 }}>
      {overdue ? `${Math.abs(days)}d OVERDUE` : days === 0 ? 'TODAY' : `${days}d left`}
    </span>
  );
}

function GoalCard({ goal, onToggleMilestone, onAddMilestone, onRemove, onPin }) {
  const [expanded, setExpanded] = useState(goal.pinned);
  const [newMs, setNewMs] = useState('');
  const milestones = goal.milestones || [];
  const done = milestones.filter((m) => m.done).length;
  const total = milestones.length;

  const handleAddMs = () => {
    if (!newMs.trim()) return;
    onAddMilestone(goal.id, newMs.trim());
    setNewMs('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `linear-gradient(135deg, rgba(2,11,24,0.9), ${goal.color}08)`,
        border: `1px solid ${goal.color}33`,
        overflow: 'hidden',
        boxShadow: goal.pinned ? `0 0 16px ${goal.color}22` : 'none',
      }}
    >
      {/* Header */}
      <div
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
        onClick={() => setExpanded((e) => !e)}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{goal.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#e0f4ff' }}>{goal.title}</span>
            {goal.pinned && <span style={{ fontSize: 10, color: goal.color }}>📌</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, padding: '1px 7px', border: `1px solid ${goal.color}44`,
              color: goal.color, fontFamily: 'Orbitron' }}>{goal.category}</span>
            <DeadlineChip deadline={goal.deadline} color={goal.color} />
          </div>
          {/* Progress bar */}
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${goal.color}88, ${goal.color})`,
                    boxShadow: `0 0 6px ${goal.color}`, borderRadius: 2 }}
                />
              </div>
              <span className="orbitron" style={{ fontSize: 10, color: goal.color, flexShrink: 0 }}>
                {done}/{total}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn-neon" style={{ padding: '3px 7px', borderColor: goal.color, color: goal.color }}
            onClick={(e) => { e.stopPropagation(); onPin(goal.id); }}>
            <Pin size={11} />
          </button>
          {expanded ? <ChevronUp size={16} color="#7ab8d4" /> : <ChevronDown size={16} color="#7ab8d4" />}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goal.description && (
                <p style={{ fontSize: 12, color: '#7ab8d4', lineHeight: 1.5, fontStyle: 'italic',
                  borderLeft: `2px solid ${goal.color}44`, paddingLeft: 10 }}>
                  {goal.description}
                </p>
              )}

              {/* Milestones */}
              <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 2 }}>MILESTONES</div>
              {milestones.map((ms) => (
                <motion.div key={ms.id} whileTap={{ scale: 0.98 }}
                  onClick={() => onToggleMilestone(goal.id, ms.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    background: ms.done ? `${goal.color}0a` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${ms.done ? goal.color + '33' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', transition: 'all 0.2s' }}>
                  <motion.div whileTap={{ scale: 0.7 }}>
                    {ms.done
                      ? <CheckSquare size={16} color={goal.color} />
                      : <Square size={16} color="#7ab8d4" />}
                  </motion.div>
                  <span style={{ fontSize: 13, flex: 1,
                    color: ms.done ? goal.color : '#e0f4ff',
                    textDecoration: ms.done ? 'line-through' : 'none',
                    opacity: ms.done ? 0.7 : 1 }}>
                    {ms.text}
                  </span>
                  {ms.done && <span style={{ fontSize: 11, color: goal.color }}>+20 XP</span>}
                </motion.div>
              ))}

              {/* Add milestone */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Add milestone..." value={newMs}
                  onChange={(e) => setNewMs(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMs()}
                  style={{ fontSize: '14px' }} />
                <button className="btn-neon" onClick={handleAddMs}
                  style={{ borderColor: goal.color, color: goal.color, padding: '6px 10px' }}>
                  <Plus size={13} />
                </button>
              </div>

              {/* Delete goal */}
              <button className="btn-neon btn-danger" onClick={() => onRemove(goal.id)}
                style={{ alignSelf: 'flex-end', padding: '4px 12px', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 5 }}>
                <Trash2 size={11} /> REMOVE GOAL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GoalsModule() {
  const { goals: rawGoals, addGoal, removeGoal, toggleMilestone, addMilestone, pinGoal } = useSystemStore();
  const goals = rawGoals || [];
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Physical', icon: '⭐',
    deadline: '', color: '#00f5ff',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addGoal({ ...form, icon: CATEGORY_ICONS[form.category] || '⭐' });
    setForm({ title: '', description: '', category: 'Physical', icon: '⭐', deadline: '', color: '#00f5ff' });
    setShowAdd(false);
  };

  const categories = ['All', ...new Set(goals.map((g) => g.category))];
  const filtered = filter === 'All' ? goals : goals.filter((g) => g.category === filter);
  const pinned = filtered.filter((g) => g.pinned);
  const unpinned = filtered.filter((g) => !g.pinned);
  const sorted = [...pinned, ...unpinned];

  // Overall stats
  const totalMilestones = goals.reduce((a, g) => a + (g.milestones?.length || 0), 0);
  const doneMilestones = goals.reduce((a, g) => a + (g.milestones?.filter((m) => m.done).length || 0), 0);
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((a, g) => a + (g.progress || 0), 0) / goals.length)
    : 0;

  // Transformation countdown
  const transformDays = daysLeft(TRANSFORMATION_DEADLINE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Transformation countdown banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(255,68,102,0.1), rgba(255,170,0,0.08))',
          border: '1px solid rgba(255,68,102,0.3)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10,
          borderTop: '2px solid #ff4466', borderLeft: '2px solid #ff4466' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
          borderBottom: '2px solid #ffaa00', borderRight: '2px solid #ffaa00' }} />
        <div>
          <div style={{ fontSize: 10, color: '#ff4466', letterSpacing: 3, fontFamily: 'Orbitron', marginBottom: 4 }}>
            🎯 TRANSFORMATION DEADLINE
          </div>
          <div style={{ fontSize: 12, color: '#7ab8d4' }}>October 8, 2025 — Lean Aesthetic Body</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="orbitron" style={{
            fontSize: 28, fontWeight: 900,
            color: transformDays <= 30 ? '#ff4466' : transformDays <= 60 ? '#ffaa00' : '#00f5ff',
            textShadow: `0 0 12px ${transformDays <= 30 ? '#ff4466' : '#ffaa00'}`,
          }}>
            {transformDays}
          </div>
          <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1 }}>DAYS LEFT</div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'GOALS',      value: goals.length,    color: '#00f5ff' },
          { label: 'MILESTONES', value: `${doneMilestones}/${totalMilestones}`, color: '#00ff88' },
          { label: 'AVG PROGRESS', value: `${avgProgress}%`, color: '#ffaa00' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '10px 8px', background: `${color}08`,
            border: `1px solid ${color}22`, textAlign: 'center' }}>
            <div className="orbitron" style={{ fontSize: 16, color, textShadow: `0 0 6px ${color}` }}>{value}</div>
            <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '4px 12px', background: filter === cat ? 'rgba(0,245,255,0.12)' : 'transparent',
            border: `1px solid ${filter === cat ? '#00f5ff' : 'rgba(0,245,255,0.15)'}`,
            color: filter === cat ? '#00f5ff' : '#7ab8d4', cursor: 'pointer',
            fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
          }}>{cat}</button>
        ))}
      </div>

      {/* Goal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {sorted.map((goal) => (
            <GoalCard key={goal.id} goal={goal}
              onToggleMilestone={toggleMilestone}
              onAddMilestone={addMilestone}
              onRemove={removeGoal}
              onPin={pinGoal} />
          ))}
        </AnimatePresence>
      </div>

      {/* Add goal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: 14, background: 'rgba(0,245,255,0.04)',
              border: '1px solid rgba(0,245,255,0.15)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2 }}>NEW GOAL</div>
            <input placeholder="Goal title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Description (optional)" value={form.description} rows={2}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-neon" onClick={handleAdd}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Target size={13} /> ADD GOAL
              </button>
              <button className="btn-neon btn-danger" onClick={() => setShowAdd(false)}
                style={{ padding: '8px 14px' }}>CANCEL</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAdd && (
        <button className="btn-neon" onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={14} /> ADD NEW GOAL
        </button>
      )}
    </div>
  );
}
